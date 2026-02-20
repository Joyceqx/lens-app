import { NextResponse } from 'next/server';
import { createAdminClient, getAuthUser } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin';

// GET: List all personas (admin only)
export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createAdminClient();

    const { data: personas, error } = await supabase
      .from('persona_profiles')
      .select('id, user_id, narrative, attributes_json, confidence_scores, published, version, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const result = (personas || []).map((p) => ({
      id: p.id,
      user_id: p.user_id,
      narrative: p.narrative,
      attributes: p.attributes_json,
      confidence: p.confidence_scores,
      published: p.published,
      version: p.version,
      created_at: p.created_at,
    }));

    return NextResponse.json({ personas: result, total: result.length });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete a persona by ID (admin only)
export async function DELETE(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Persona ID required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from('persona_profiles')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
