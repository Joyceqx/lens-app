import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { multiChatSchema } from '@/lib/validation';
import { multiPersonaChat } from '@/lib/claude';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = multiChatSchema.parse(body);

    const supabase = createAdminClient();

    // Fetch all requested personas
    const { data: personas, error } = await supabase
      .from('persona_profiles')
      .select('id, narrative, attributes_json')
      .in('id', validated.persona_ids)
      .eq('published', true);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!personas || personas.length === 0) {
      return NextResponse.json({ error: 'No personas found' }, { status: 404 });
    }

    const startTime = Date.now();

    // Call multi-persona chat
    const result = await multiPersonaChat(
      personas.map((p) => {
        const attrs = p.attributes_json as Record<string, any>;
        return {
          id: p.id,
          name: attrs?.display_name || attrs?.demographics?.life_stage || 'Persona',
          narrative: p.narrative || '',
          attributes: attrs || {},
        };
      }),
      validated.message
    );

    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      question: validated.message,
      responses: result.individual,
      consensus: result.consensus,
      persona_count: personas.length,
      latency_ms: latencyMs,
    });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input', details: err.errors }, { status: 400 });
    }
    console.error('Multi-chat error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
