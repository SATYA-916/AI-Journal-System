import { z } from 'zod';

export const createEntrySchema = z.object({
  body: z.object({
    ambience: z.enum(['forest', 'ocean', 'mountain']),
    text: z.string().min(1).max(5000),
  }),
});

export const analyzeSchema = z.object({
  body: z.object({
    text: z.string().min(1).max(5000),
  }),
});
