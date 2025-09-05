import { z } from 'zod';

export const createChatSchema = z.object({
  userName: z
    .string()
    .min(2, { message: 'Name must contain at least 2 characters' })
    .max(20, { message: 'Name must not exceed 20 characters' })
    .regex(/^[\p{L}]+([ '-][\p{L}]+)*$/u, {
      message:
        'Name must start and end with letters, and can contain spaces, hyphens, or apostrophes between words',
    })
    .trim(),
  personName: z.string(),
});

export type CreateChatSchema = z.infer<typeof createChatSchema>;
