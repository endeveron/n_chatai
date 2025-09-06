import { z } from 'zod';

const email = z.string().email({
  message: 'Please provide a valid email',
});

export const inviteSchema = z.object({
  code: z
    .string()
    .min(1, {
      message: 'Code is required',
    })
    .max(10, {
      message: 'Invalid code',
    })
    .regex(/^[a-zA-Z0-9]+$/, {
      message: 'Invalid code',
    }),
});

export const signUpSchema = z.object({
  email,
});

export const signInSchema = z.object({
  email,
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters',
  }),
});

export const googleSignInSchema = z.object({
  email: z
    .string()
    .nonempty({
      message: 'Email is required',
    })
    .email({
      message: 'Invalid email',
    }),
  // .refine((val) => val.endsWith('@gmail.com'), {
  //   message: 'Email must be a gmail.com address',
  // }),
  password: z
    .string()
    .nonempty({
      message: 'Password is required',
    })
    .min(6, {
      message: 'Password is too short.',
    }),
});

export const onboardingSchema = z
  .object({
    name: z.string().min(2, {
      message: 'Name must be at least 2 characters',
    }),
    password: z.string().min(6, {
      message: 'Password must be at least 6 characters',
    }),
    confirmPassword: z.string().min(6, {
      message: 'Password must be at least 6 characters',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords does not match',
  });

export type InviteSchema = z.infer<typeof inviteSchema>;
export type SignInSchema = z.infer<typeof signInSchema>;
export type SignUpSchema = z.infer<typeof signUpSchema>;
export type OnboardingSchema = z.infer<typeof onboardingSchema>;
export type GoogleSignInSchema = z.infer<typeof googleSignInSchema>;
