import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { COMPARISON_QUESTIONS, ONBOARDING_QUESTIONS } from '@/lib/constants';
import { z } from 'zod';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const schema = z.object({
  answers: z.record(z.string(), z.string()),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = schema.parse(body);

    // Build context from user's actual answers
    const answerContext = Object.entries(validated.answers)
      .map(([qIdx, text]) => {
        const q = ONBOARDING_QUESTIONS[Number(qIdx)];
        return q ? `Q: ${q.question}\nA: ${text}` : null;
      })
      .filter(Boolean)
      .join('\n\n');

    const questionsFormatted = COMPARISON_QUESTIONS
      .map((q, i) => `${i + 1}. "${q}"`)
      .join('\n');

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Based on this person's interview responses, generate short personalized answers (1-2 sentences each) for these comparison questions. The answers should genuinely reflect their values, personality, and communication style — not generic platitudes.

THEIR INTERVIEW RESPONSES:
${answerContext}

COMPARISON QUESTIONS:
${questionsFormatted}

Return ONLY a JSON array of ${COMPARISON_QUESTIONS.length} strings, one answer per comparison question, in order. Each answer should be in first person, conversational, and clearly grounded in what this specific person said. Return ONLY the JSON array, no markdown.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response' }, { status: 500 });
    }

    let cleaned = content.text.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);

    const responses = JSON.parse(cleaned.trim());

    return NextResponse.json({ responses });
  } catch (err: any) {
    console.error('Compare generation error:', err);
    return NextResponse.json({ error: err.message || 'Failed to generate comparison' }, { status: 500 });
  }
}
