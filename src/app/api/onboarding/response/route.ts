import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { onboardingResponseSchema } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = onboardingResponseSchema.parse(body);

    const supabase = createAdminClient();

    // Verify contributor exists and has consent
    const { data: contributor, error: contribError } = await supabase
      .from('contributors')
      .select('id, consent_status')
      .eq('id', validated.contributor_id)
      .single();

    if (contribError || !contributor) {
      return NextResponse.json({ error: 'Contributor not found' }, { status: 404 });
    }

    if (contributor.consent_status !== 'granted') {
      return NextResponse.json({ error: 'Consent not granted' }, { status: 403 });
    }

    // Upsert the response (allows updating answers)
    const { data, error } = await supabase
      .from('raw_responses')
      .upsert(
        {
          contributor_id: validated.contributor_id,
          question_number: validated.question_number,
          response_text: validated.response_text,
        },
        { onConflict: 'contributor_id,question_number' }
      )
      .select('id, question_number, response_text, created_at')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      response_id: data.id,
      question_number: data.question_number,
      saved: true,
    });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
