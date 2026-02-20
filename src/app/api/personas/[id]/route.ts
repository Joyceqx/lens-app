import { NextResponse } from 'next/server';
import { createAdminClient, getAuthUser } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Persona ID required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: persona, error } = await supabase
      .from('persona_profiles')
      .select('id, narrative, attributes_json, confidence_scores, published, version, created_at')
      .eq('id', id)
      .eq('published', true)
      .single();

    if (error || !persona) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: persona.id,
      narrative: persona.narrative,
      attributes: persona.attributes_json,
      confidence: persona.confidence_scores,
      version: persona.version,
      created_at: persona.created_at,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();

    // Verify ownership
    const { data: existing } = await supabase
      .from('persona_profiles')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };

    if (body.narrative !== undefined) updates.narrative = body.narrative;
    if (body.attributes_json !== undefined) updates.attributes_json = body.attributes_json;
    if (body.published !== undefined) updates.published = body.published;

    const { data: updated, error } = await supabase
      .from('persona_profiles')
      .update(updates)
      .eq('id', id)
      .select('id, narrative, attributes_json, confidence_scores, published, version, created_at, updated_at')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      id: updated.id,
      narrative: updated.narrative,
      attributes: updated.attributes_json,
      confidence: updated.confidence_scores,
      published: updated.published,
      version: updated.version,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();

    // Verify ownership
    const { data: existing } = await supabase
      .from('persona_profiles')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
