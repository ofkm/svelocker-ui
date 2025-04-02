import { z } from 'zod';

export const loginSchema = z.object({
	username: z.string().min(1, { message: 'Username is required' }),
	password: z.string().min(1, { message: 'Password is required' })
});

export type LoginFormData = z.infer<typeof loginSchema>;
