import { z } from 'zod';

export const createChatSchema = z.object({
  personName: z.string(),
  title: z.string(),
});

export type CreateChatSchema = z.infer<typeof createChatSchema>;
