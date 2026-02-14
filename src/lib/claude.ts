import Anthropic from '@anthropic-ai/sdk';
import { EXTRACTION_SYSTEM_PROMPT, buildChatPrompt, buildMultiPanelPrompt } from './prompts';
import type { PersonaAttributes, ConfidenceScores } from '@/types/database';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const MODEL = 'claude-sonnet-4-5-20250929';
const MAX_TOKENS = 4096;

export interface ExtractionResult {
  narrative: string;
  attributes: PersonaAttributes;
  confidence_scores: ConfidenceScores;
}

export interface ChatResult {
  response: string;
  confidence: 'high' | 'medium' | 'low';
  explanation: string;
}

export interface ConsensusResult {
  consensus: {
    agreement_level: 'strong' | 'moderate' | 'weak' | 'none';
    common_themes: string[];
    key_differences: string[];
    summary: string;
  };
  insights: Array<{
    insight: string;
    supported_by: string[];
    confidence: 'high' | 'medium' | 'low';
  }>;
}

function safeJsonParse<T>(text: string): T {
  // Strip markdown code fences if present
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return JSON.parse(cleaned.trim()) as T;
}

/**
 * Extract a structured persona profile from raw interview responses
 */
export async function extractPersona(
  responses: Array<{ question_number: number; question: string; response_text: string }>
): Promise<ExtractionResult> {
  const formattedResponses = responses
    .sort((a, b) => a.question_number - b.question_number)
    .map((r) => `Q${r.question_number}: ${r.question}\nA: ${r.response_text}`)
    .join('\n\n');

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: EXTRACTION_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Please analyze these interview responses and generate a structured persona profile:\n\n${formattedResponses}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  return safeJsonParse<ExtractionResult>(content.text);
}

/**
 * Chat with a persona — returns a grounded response with confidence
 */
export async function chatWithPersona(
  persona: {
    name: string;
    narrative: string;
    attributes: Record<string, any>;
  },
  userMessage: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<ChatResult> {
  const systemPrompt = buildChatPrompt(persona);

  const messages = [
    ...history.map((h) => ({
      role: h.role as 'user' | 'assistant',
      content: h.content,
    })),
    { role: 'user' as const, content: userMessage },
  ];

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages,
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  try {
    return safeJsonParse<ChatResult>(content.text);
  } catch {
    // If JSON parsing fails, wrap the raw text
    return {
      response: content.text,
      confidence: 'medium',
      explanation: 'Response generated from persona profile',
    };
  }
}

/**
 * Query multiple personas with the same question, then analyze consensus
 */
export async function multiPersonaChat(
  personas: Array<{
    id: string;
    name: string;
    narrative: string;
    attributes: Record<string, any>;
  }>,
  question: string
): Promise<{
  individual: Array<{ persona_id: string; persona_name: string } & ChatResult>;
  consensus: ConsensusResult;
}> {
  // Query all personas in parallel
  const individualResults = await Promise.all(
    personas.map(async (persona) => {
      const result = await chatWithPersona(persona, question);
      return {
        persona_id: persona.id,
        persona_name: persona.name,
        ...result,
      };
    })
  );

  // Generate consensus analysis
  const personaResponses = individualResults.map((r) => ({
    name: r.persona_name,
    response: r.response,
  }));

  const consensusPrompt = buildMultiPanelPrompt(personaResponses);

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: consensusPrompt,
    messages: [
      {
        role: 'user',
        content: `Analyze the consensus across these ${personas.length} personas for the question: "${question}"`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  let consensus: ConsensusResult;
  try {
    consensus = safeJsonParse<ConsensusResult>(content.text);
  } catch {
    consensus = {
      consensus: {
        agreement_level: 'moderate',
        common_themes: [],
        key_differences: [],
        summary: content.text,
      },
      insights: [],
    };
  }

  return { individual: individualResults, consensus };
}
