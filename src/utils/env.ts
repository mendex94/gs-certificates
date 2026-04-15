import z from 'zod';
import { TEMPLATE_STORAGE_MODE } from '@/constants/certificate-management';

const storageModeOverrideSchema = z
  .enum([
    TEMPLATE_STORAGE_MODE.DIRECT_UPLOAD,
    TEMPLATE_STORAGE_MODE.MANUAL_PUBLISH,
  ])
  .optional();

const envSchema = z.object({
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  ADMIN_USER_ID: z.coerce.number().int().positive(),
  LEGACY_FALLBACK_CUTOFF_AT: z.string().optional(),
  LEGACY_BACKFILL_BATCH_SIZE: z.coerce.number().int().positive().default(100),
  TEMPLATE_STORAGE_MODE_OVERRIDE: z.string().optional(),
});

export const env = envSchema.parse(process.env);

export const getLegacyFallbackCutoffAt = () => {
  const rawCutoff = env.LEGACY_FALLBACK_CUTOFF_AT;

  if (!rawCutoff) {
    return null;
  }

  const parsedDate = new Date(rawCutoff);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

export const isLegacyFallbackCutoffReached = (referenceDate = new Date()) => {
  const cutoffAt = getLegacyFallbackCutoffAt();

  return cutoffAt ? referenceDate >= cutoffAt : false;
};

export const resolveBackfillBatchSize = (requestedBatchSize?: number) => {
  return requestedBatchSize && requestedBatchSize > 0
    ? requestedBatchSize
    : env.LEGACY_BACKFILL_BATCH_SIZE;
};

export const getTemplateStorageModeOverride = () => {
  return storageModeOverrideSchema.safeParse(env.TEMPLATE_STORAGE_MODE_OVERRIDE)
    .success
    ? (env.TEMPLATE_STORAGE_MODE_OVERRIDE as
        | (typeof TEMPLATE_STORAGE_MODE)[keyof typeof TEMPLATE_STORAGE_MODE]
        | undefined)
    : undefined;
};
