import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { onboardingConsentSchema } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = onboardingConsentSchema.parse(body);
    
    const supabase = createAdminClient();
    
    const { data, error } = await supabase
      .from('contributors')
      .insert({
        consent_status: validated.consent ? 'granted' : 'declined',
      })
      .select('id, consent_status, created_at')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      contributor_id: data.id,
      consent_status: data.consent_status,
      created_at: data.created_at,
    });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
