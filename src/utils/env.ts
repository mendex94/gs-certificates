import z from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  ADMIN_USER_ID: z.coerce.number().int().positive(),
});

export const env = envSchema.parse(process.env);
