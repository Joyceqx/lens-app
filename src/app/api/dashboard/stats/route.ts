import { NextResponse } from 'next/server';
import { createAdminClient, getAuthUser } from '@/lib/supabase/server';

// Always fetch fresh stats, never cache
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const user = await getAuthUser();

    // Get persona count (filtered to user if logged in)
    let personaQuery = supabase
      .from('persona_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('published', true);
    if (user) personaQuery = personaQuery.eq('user_id', user.id);
    const { count: personaCount } = await personaQuery;

    // Get total chat sessions
    const { count: sessionCount } = await supabase
      .from('chat_sessions')
      .select('*', { count: 'exact', head: true });

    // Get total messages
    const { count: messageCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true });

    // Get avg confidence from query logs
    const { data: queryStats } = await supabase
      .from('query_logs')
      .select('latency_ms');

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
