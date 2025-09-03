import { z } from 'zod';

export const createChatSchema = z.object({
  userName: z.string().min(1, {
    message: 'Name must contain at least 1 character',
  }),
  personName: z.string(),
});

export type CreateChatSchema = z.infer<typeof createChatSchema>;
