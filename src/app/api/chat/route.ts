import { NextResponse } from 'next/server';
import { createAdminClient, getAuthUser } from '@/lib/supabase/server';
import { chatWithPersona } from '@/lib/claude';

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Manual validation (more flexible than Zod for MVP)
    const personaId = body.persona_id;
    const message = body.message;
    const incomingSessionId = body.session_id || null;
    const history = body.history || []; // frontend can send history directly

    if (!personaId || typeof personaId !== 'string') {
      return NextResponse.json({ error: 'persona_id is required' }, { status: 400 });
    }
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const user = await getAuthUser();

    // Fetch persona profile
    const { data: persona, error: personaError } = await supabase
      .from('persona_profiles')
      .select('id, narrative, attributes_json')
      .eq('id', personaId)
      .eq('published', true)
      .single();

    if (personaError || !persona) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }

    // Try to get/create chat session and save messages (non-critical)
    let sessionId = incomingSessionId;
    let dbHistory: { role: string; content: string }[] = [];

    try {
      if (!sessionId) {
        const { data: session } = await supabase
          .from('chat_sessions')
          .insert({
            persona_id: personaId,
            user_id: user?.id || null,
            title: message.slice(0, 100),
          })
          .select('id')
          .single();
        if (session) sessionId = session.id;
      }

      if (sessionId) {
        // Save user message
        await supabase.from('messages').insert({
          session_id: sessionId,
          role: 'user',
          content: message.trim(),
        });

        // Fetch conversation history
        const { data: msgs } = await supabase
          .from('messages')
          .select('role, content')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true })
          .limit(20);

        if (msgs) dbHistory = msgs;
      }
    } catch (dbErr) {
      console.warn('Chat DB operations failed (non-critical):', dbErr);
    }

    // Use DB history if available, otherwise use frontend-provided history
    const conversationHistory = dbHistory.length > 0
      ? dbHistory.slice(0, -1).map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))
      : history.map((m: any) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    // Generate persona response via Claude
    const startTime = Date.now();
    const attrs = persona.attributes_json as Record<string, any>;
    const personaName = attrs?.display_name || attrs?.demographics?.life_stage || 'Persona';

    const result = await chatWithPersona(
      {
        name: personaName,
        narrative: persona.narrative || '',
        attributes: attrs || {},
      },
      message.trim(),
      conversationHistory
    );

    const latencyMs = Date.now() - startTime;

    // Try to save assistant message (non-critical)
    try {
      if (sessionId) {
        const { data: assistantMsg } = await supabase
          .from('messages')
          .insert({
            session_id: sessionId,
            role: 'assistant',
            content: result.response,
            confidence: result.confidence,
            explanation: result.explanation,
          })
          .select('id')
          .single();

        if (assistantMsg) {
          await supabase.from('query_logs').insert({
            session_id: sessionId,
            message_id: assistantMsg.id,
            model_used: 'claude-sonnet-4-5-20250929',
            latency_ms: latencyMs,
            tokens: 0,
          });
        }
      }
    } catch (logErr) {
      console.warn('Chat logging failed (non-critical):', logErr);
    }

    return NextResponse.json({
      session_id: sessionId,
      response: result.response,
      confidence: result.confidence,
      explanation: result.explanation,
      latency_ms: latencyMs,
    });
  } catch (err: any) {
    console.error('Chat error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
