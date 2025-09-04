import { z } from 'zod';

export const AuthLoginRequest = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});
export type AuthLoginDTO = z.infer<typeof AuthLoginRequest>;

export const AuthLoginResponse = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email()
  })
});