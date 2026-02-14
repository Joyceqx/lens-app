import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { ONBOARDING_QUESTIONS } from '@/lib/constants';
import { z } from 'zod';

export const maxDuration = 30;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const schema = z.object({
  question_index: z.number().min(0).max(8),
  answer: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = schema.parse(body);

    const question = ONBOARDING_QUESTIONS[validated.question_index];
    if (!question) {
      return NextResponse.json({ error: 'Invalid question index' }, { status: 400 });
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: `You are scoring someone's interview answer for a persona-building platform. Score it 1-10 as an integer.

QUESTION: "${question.question}"

ANSWER: "${validated.answer}"

Holistic scoring criteria — consider the answer as a whole:
- Does it reveal something real about this person? (personality, preferences, experiences)
- Is there any personal specificity? (names, places, brands, real examples > generic statements)
- Does it go beyond surface level? (explaining why, not just what)

Scoring guide — be fair and encouraging:
- 1-3: Nearly empty, off-topic, or completely generic with zero personal detail
- 4-5: A real answer but quite brief or surface-level, mostly general statements
- 6-7: A solid answer with some personal detail or reasoning — this is the typical "good enough" range
- 8-9: A rich answer with specific examples, personal stories, or clear self-reflection
- 10: Exceptionally vivid and detailed — reads like a genuine conversation

Important: Most reasonable answers that show any personal thought should land in the 5-7 range. Don't be stingy — if someone shared something real, give them credit. Only score below 4 for truly empty or irrelevant responses.

Return ONLY a JSON object, no markdown:
{"score": <integer 1-10>, "feedback": "<one encouraging sentence>"}`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      return NextResponse.json({ score: 6, max_score: 10, feedback: 'Answer recorded' });
    }

    let cleaned = content.text.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);

    const result = JSON.parse(cleaned.trim());
    const score = Math.max(1, Math.min(10, Math.round(Number(result.score))));

    return NextResponse.json({
      score,
      max_score: 10,
      feedback: result.feedback || 'Answer recorded',
    });
  } catch (err: any) {
    console.error('Evaluation error:', err);
    // Fallback: balanced word-count heuristic
    try {
      const body = await request.clone().json();
      const words = body.answer?.split(/\s+/).filter(Boolean).length || 0;
      let fallbackScore: number;
      if (words < 3) fallbackScore = 2;
      else if (words < 8) fallbackScore = 4;
      else if (words < 20) fallbackScore = 6;
      else if (words < 40) fallbackScore = 7;
      else fallbackScore = 8;
      return NextResponse.json({ score: fallbackScore, max_score: 10, feedback: 'Scored locally' });
    } catch {
      return NextResponse.json({ score: 5, max_score: 10, feedback: 'Could not evaluate' });
    }
  }
}
