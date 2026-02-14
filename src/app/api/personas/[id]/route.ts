import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

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
