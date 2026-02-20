import { NextResponse } from 'next/server';
import { createAdminClient, getAuthUser } from '@/lib/supabase/server';

export async function GET() {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();

    const { data: personas, error } = await supabase
      .from('persona_profiles')
      .select('id, narrative, attributes_json, confidence_scores, published, version, created_at, updated_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const result = (personas || []).map((p) => ({
      id: p.id,
      narrative: p.narrative,
      attributes: p.attributes_json,
      confidence: p.confidence_scores,
      published: p.published,
      version: p.version,
      created_at: p.created_at,
      updated_at: p.updated_at,
    }));

    return NextResponse.json({ personas: result, total: result.length });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
