import { z } from 'zod';

export const onboardingConsentSchema = z.object({
  consent: z.boolean(),
});

export const onboardingResponseSchema = z.object({
  contributor_id: z.string().uuid(),
  question_number: z.number().min(1).max(9),
  response_text: z.string().min(1).max(5000),
});

export const onboardingCompleteSchema = z.object({
  contributor_id: z.string().uuid(),
});

export const chatMessageSchema = z.object({
  persona_id: z.string().uuid(),
  message: z.string().min(1).max(2000),
  session_id: z.string().uuid().optional(),
});

export const multiChatSchema = z.object({
  persona_ids: z.array(z.string().uuid()).min(2).max(5),
  message: z.string().min(1).max(2000),
});

export const personaFilterSchema = z.object({
  age_range: z.string().optional(),
  values: z.string().optional(),
  life_context: z.string().optional(),
  decision_style: z.string().optional(),
  search: z.string().optional(),
});
