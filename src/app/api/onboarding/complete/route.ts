import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { extractPersona } from '@/lib/claude';
import { ONBOARDING_QUESTIONS } from '@/lib/constants';
import { z } from 'zod';

// Extend Vercel serverless timeout (free tier: 60s, pro: 300s)
export const maxDuration = 60;

// Accept answers directly from the frontend — Supabase is optional
const completeSchema = z.object({
  contributor_id: z.string().optional(),
  answers: z.record(z.string(), z.string()).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = completeSchema.parse(body);

    let enrichedResponses: Array<{ question_number: number; question: string; response_text: string }> = [];

    // Strategy 1: Use answers passed directly from the frontend
    if (validated.answers && Object.keys(validated.answers).length > 0) {
      enrichedResponses = Object.entries(validated.answers).map(([qIdx, text]) => {
        const qNum = Number(qIdx) + 1; // frontend uses 0-indexed, DB uses 1-indexed
        return {
          question_number: qNum,
          question: ONBOARDING_QUESTIONS[Number(qIdx)]?.question || `Question ${qNum}`,
          response_text: text,
        };
      });
    }

    // Strategy 2: Try fetching from Supabase if we have a contributor_id and no direct answers
    if (enrichedResponses.length === 0 && validated.contributor_id) {
      try {
        const supabase = createAdminClient();
        const { data: responses } = await supabase
          .from('raw_responses')
          .select('question_number, response_text')
          .eq('contributor_id', validated.contributor_id)
          .order('question_number');

        if (responses && responses.length > 0) {
          enrichedResponses = responses.map((r) => ({
            question_number: r.question_number,
            question: ONBOARDING_QUESTIONS[r.question_number - 1]?.question || `Question ${r.question_number}`,
            response_text: r.response_text,
          }));
        }
      } catch (dbErr) {
        console.warn('Supabase fetch failed (tables may not exist yet):', dbErr);
      }
    }

    if (enrichedResponses.length === 0) {
      return NextResponse.json({ error: 'No responses found — please answer at least one question' }, { status: 400 });
    }

    // Extract persona via Claude API (with one retry)
    let extraction;
    try {
      extraction = await extractPersona(enrichedResponses);
    } catch (firstError: any) {
      console.error('LLM extraction failed (attempt 1):', firstError?.message || firstError);
      // Retry once
      try {
        extraction = await extractPersona(enrichedResponses);
      } catch (retryError: any) {
        console.error('LLM extraction failed (attempt 2):', retryError?.message || retryError);
        const msg = retryError?.message || firstError?.message || 'Unknown error';
        return NextResponse.json({
          error: `Persona extraction failed: ${msg}`,
        }, { status: 500 });
      }
    }

    // Save to Supabase and auto-publish so it appears in the library
    let personaId = null;
    try {
      const supabase = createAdminClient();
      const { data: persona } = await supabase
        .from('persona_profiles')
        .insert({
          contributor_id: validated.contributor_id || null,
          narrative: extraction.narrative,
          attributes_json: extraction.attributes,
          confidence_scores: extraction.confidence_scores,
          published: true,
          version: 1,
        })
        .select('id')
        .single();
      if (persona) personaId = persona.id;
    } catch (dbErr) {
      console.warn('Supabase save failed (non-critical):', dbErr);
    }

    return NextResponse.json({
      persona_id: personaId,
      narrative: extraction.narrative,
      attributes: extraction.attributes,
      confidence_scores: extraction.confidence_scores,
      responses_analyzed: enrichedResponses.length,
    });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input', details: err.errors }, { status: 400 });
    }
    console.error('Onboarding complete error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
