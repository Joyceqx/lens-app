import { NextResponse } from 'next/server';
import { createAdminClient, getAuthUser } from '@/lib/supabase/server';

// Always fetch fresh stats, never cache
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const user = await getAuthUser();

    // Total personas in the database (shared library, not filtered by user)
    const { count: personaCount } = await supabase
      .from('persona_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('published', true);

    // Chat sessions — personalized to logged-in user
    let sessionQuery = supabase
      .from('chat_sessions')
      .select('id', { count: 'exact', head: true });
    if (user) sessionQuery = sessionQuery.eq('user_id', user.id);
    const { count: sessionCount } = await sessionQuery;

    // Messages — personalized via user's chat sessions
    let messageCount = 0;
    if (user) {
      // Get user's session IDs first, then count messages in those sessions
      const { data: userSessions } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('user_id', user.id);

      if (userSessions && userSessions.length > 0) {
        const sessionIds = userSessions.map(s => s.id);
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .in('session_id', sessionIds);
        messageCount = count || 0;
      }
    } else {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });
      messageCount = count || 0;
    }

    // Avg latency — personalized via user's chat sessions
    let queryStats: { latency_ms: number | null }[] | null = null;
    if (user) {
      const { data: userSessions } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('user_id', user.id);

      if (userSessions && userSessions.length > 0) {
        const sessionIds = userSessions.map(s => s.id);
        const { data } = await supabase
          .from('query_logs')
          .select('latency_ms')
          .in('session_id', sessionIds);
        queryStats = data;
      }
    } else {
      const { data } = await supabase
        .from('query_logs')
        .select('latency_ms');
      queryStats = data;
    }

    const avgLatency = queryStats && queryStats.length > 0
      ? Math.round(queryStats.reduce((sum, q) => sum + (q.latency_ms || 0), 0) / queryStats.length)
      : 0;

    return NextResponse.json({
      total_personas: personaCount || 0,
      total_sessions: sessionCount || 0,
      total_messages: messageCount || 0,
      avg_latency_ms: avgLatency,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
