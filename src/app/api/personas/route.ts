import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { personaFilterSchema } from '@/lib/validation';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = personaFilterSchema.parse({
      age_range: searchParams.get('age_range') || undefined,
      values: searchParams.get('values') || undefined,
      life_context: searchParams.get('life_context') || undefined,
      decision_style: searchParams.get('decision_style') || undefined,
      search: searchParams.get('search') || undefined,
    });

    const supabase = createAdminClient();

    const query = supabase
      .from('persona_profiles')
      .select('id, contributor_id, narrative, attributes_json, confidence_scores, created_at')
      .eq('published', true)
      .order('created_at', { ascending: false });

    const { data: personas, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Apply client-side filters on JSON attributes
    let filtered = personas || [];

    if (filters.values) {
      const filterValues = filters.values.toLowerCase().split(',').map((v) => v.trim());
      filtered = filtered.filter((p) => {
        const personaValues = (p.attributes_json as any)?.values || [];
        return filterValues.some((fv) =>
          personaValues.some((pv: string) => pv.toLowerCase().includes(fv))
        );
      });
    }

    if (filters.life_context) {
      const filterCtx = filters.life_context.toLowerCase();
      filtered = filtered.filter((p) => {
        const ctx = (p.attributes_json as any)?.life_context || [];
        return ctx.some((c: string) => c.toLowerCase().includes(filterCtx));
      });
    }

    if (filters.decision_style) {
      filtered = filtered.filter((p) => {
        return (p.attributes_json as any)?.decision_style === filters.decision_style;
      });
    }

    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.narrative?.toLowerCase().includes(term) ||
          JSON.stringify(p.attributes_json).toLowerCase().includes(term)
      );
    }

    // Map to API response shape
    const result = filtered.map((p) => ({
      id: p.id,
      narrative: p.narrative,
      attributes: p.attributes_json,
      confidence: p.confidence_scores,
      created_at: p.created_at,
    }));

    return NextResponse.json({ personas: result, total: result.length });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid filters', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
