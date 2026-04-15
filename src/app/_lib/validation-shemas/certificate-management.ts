import { z } from 'zod';
import {
  CERTIFICATE_MANAGEMENT_STATUS,
  TEMPLATE_MAX_FILE_SIZE_BYTES,
} from '@/constants/certificate-management';

const certificateTypeIdSchema = z.string().uuid();
const templateIdSchema = z.string().uuid();

const managedStatusSchema = z.enum([
  CERTIFICATE_MANAGEMENT_STATUS.ACTIVE,
  CERTIFICATE_MANAGEMENT_STATUS.INACTIVE,
  CERTIFICATE_MANAGEMENT_STATUS.ARCHIVED,
]);

const fileSchema = z.custom<{
  name: string;
  size: number;
  type: string;
  arrayBuffer: () => Promise<ArrayBuffer>;
}>((value) => {
  const candidate = value as {
    name?: string;
    size?: number;
    type?: string;
    arrayBuffer?: unknown;
  };

  return (
    !!candidate &&
    typeof candidate.name === 'string' &&
    typeof candidate.size === 'number' &&
    typeof candidate.type === 'string' &&
    typeof candidate.arrayBuffer === 'function'
  );
}, 'Arquivo invalido');

export const listCertificateTypesInputSchema = z
  .object({
    status: managedStatusSchema.optional(),
    query: z.string().trim().min(1).max(150).optional(),
  })
  .optional();

export const createCertificateTypeInputSchema = z.object({
  name: z.string().trim().min(1).max(150),
  slug: z.string().trim().min(1).max(150).optional(),
  description: z.string().trim().max(500).optional(),
  legacyTokenType: z.enum(['higienizacao', 'impermeabilizacao']).optional(),
});

export const updateCertificateTypeInputSchema = z.object({
  id: certificateTypeIdSchema,
  name: z.string().trim().min(1).max(150).optional(),
  slug: z.string().trim().min(1).max(150).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  legacyTokenType: z
    .union([z.enum(['higienizacao', 'impermeabilizacao']), z.null()])
    .optional(),
  status: managedStatusSchema.optional(),
});

export const deleteCertificateTypeInputSchema = z.object({
  id: certificateTypeIdSchema,
});

export const listCertificateTemplatesInputSchema = z.object({
  certificateTypeId: certificateTypeIdSchema,
});

export const uploadCertificateTemplateInputSchema = z.object({
  certificateTypeId: certificateTypeIdSchema,
  file: fileSchema,
});

export const replaceActiveTemplateInputSchema = z.object({
  certificateTypeId: certificateTypeIdSchema,
  templateId: templateIdSchema,
});

export const deleteCertificateTemplateInputSchema = z.object({
  templateId: templateIdSchema,
});

export const runLegacyBackfillBatchInputSchema = z.object({
  batchSize: z
    .number()
    .int()
    .positive()
    .max(TEMPLATE_MAX_FILE_SIZE_BYTES)
    .optional(),
});
