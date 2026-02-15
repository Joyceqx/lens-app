import { NextResponse } from 'next/server';
import { createAdminClient, getAuthUser } from '@/lib/supabase/server';

// Always fetch fresh stats, never cache
export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createAdminClient();
  const user = await getAuthUser();

  // Each query wrapped individually so one failure doesn't break all stats
  let personaCount = 0;
  let sessionCount = 0;
  let messageCount = 0;
  let avgLatency = 0;

  try {
    let query = supabase
      .from('persona_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('published', true);
    if (user) query = query.eq('user_id', user.id);
    const { count } = await query;
    personaCount = count || 0;
  } catch { /* table may not exist */ }

  try {
    const { count } = await supabase
      .from('chat_sessions')
      .select('*', { count: 'exact', head: true });
    sessionCount = count || 0;
  } catch { /* table may not exist */ }

  try {
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true });
    messageCount = count || 0;
  } catch { /* table may not exist */ }

  try {
    const { data: queryStats } = await supabase
      .from('query_logs')
      .select('latency_ms');
    if (queryStats && queryStats.length > 0) {
      avgLatency = Math.round(queryStats.reduce((sum, q) => sum + (q.latency_ms || 0), 0) / queryStats.length);
    }
  } catch { /* table may not exist */ }

  return NextResponse.json({
    total_personas: personaCount,
    total_sessions: sessionCount,
    total_messages: messageCount,
    avg_latency_ms: avgLatency,
  });
}
