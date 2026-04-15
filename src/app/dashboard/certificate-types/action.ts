'use server';

import { randomUUID } from 'node:crypto';
import { createServerAction } from 'zsa';
import {
  CERTIFICATE_MANAGEMENT_ERRORS,
  TEMPLATE_STORAGE_MODE,
  TELEMETRY_EVENT,
} from '@/constants/certificate-management';
import {
  createCertificateTypeInputSchema,
  deleteCertificateTemplateInputSchema,
  deleteCertificateTypeInputSchema,
  listCertificateTemplatesInputSchema,
  listCertificateTypesInputSchema,
  replaceActiveTemplateInputSchema,
  runLegacyBackfillBatchInputSchema,
  updateCertificateTypeInputSchema,
  uploadCertificateTemplateInputSchema,
} from '@/app/_lib/validation-shemas/certificate-management';
import { resolveDashboardAdminContext } from '../_admin-auth';
import { CertificateTypeAdminService } from '@/services/certificateTypeAdminService';
import { TemplateBackfillService } from '@/services/templateBackfillService';
import { logError, logInfo } from '@/utils/logger';

const resolveAdminOrThrow = async () => {
  const adminContext = await resolveDashboardAdminContext();

  if (!adminContext) {
    throw new Error(CERTIFICATE_MANAGEMENT_ERRORS.UNAUTHORIZED_ADMIN_REQUIRED);
  }

  return adminContext;
};

export const getTemplateStorageCompatibility = createServerAction().handler(
  async () => {
    await resolveAdminOrThrow();

    const service = new CertificateTypeAdminService();

    return service.getTemplateStorageCompatibility();
  },
);

export const listCertificateTypes = createServerAction()
  .input(listCertificateTypesInputSchema)
  .handler(async ({ input }) => {
    await resolveAdminOrThrow();

    const service = new CertificateTypeAdminService();

    return service.listCertificateTypes(input);
  });

export const createCertificateType = createServerAction()
  .input(createCertificateTypeInputSchema)
  .handler(async ({ input }) => {
    const adminContext = await resolveAdminOrThrow();
    const service = new CertificateTypeAdminService();

    return service.createCertificateType({
      ...input,
      createdByAdminId: adminContext.userId,
    });
  });

export const updateCertificateType = createServerAction()
  .input(updateCertificateTypeInputSchema)
  .handler(async ({ input }) => {
    await resolveAdminOrThrow();

    const service = new CertificateTypeAdminService();

    return service.updateCertificateType(input);
  });

export const deleteCertificateType = createServerAction()
  .input(deleteCertificateTypeInputSchema)
  .handler(async ({ input }) => {
    await resolveAdminOrThrow();

    const service = new CertificateTypeAdminService();

    return service.deleteCertificateType(input.id);
  });

export const listCertificateTemplates = createServerAction()
  .input(listCertificateTemplatesInputSchema)
  .handler(async ({ input }) => {
    await resolveAdminOrThrow();

    const service = new CertificateTypeAdminService();

    return service.listTemplatesByTypeId(input.certificateTypeId);
  });

export const uploadCertificateTemplate = createServerAction()
  .input(uploadCertificateTemplateInputSchema, { type: 'formData' })
  .handler(async ({ input }) => {
    const adminContext = await resolveAdminOrThrow();
    const service = new CertificateTypeAdminService();
    const correlationId = randomUUID();
    const compatibility = await service.getTemplateStorageCompatibility();
    const denominatorEligible = await service.classifyValidUploadAttempt({
      isAuthenticated: true,
      certificateTypeId: input.certificateTypeId,
      file: input.file,
    });

    logInfo(TELEMETRY_EVENT.TEMPLATE_UPLOAD_ATTEMPT, correlationId, {
      certificateTypeId: input.certificateTypeId,
      mode: compatibility.mode,
      denominatorEligible,
    });

    if (compatibility.mode !== TEMPLATE_STORAGE_MODE.DIRECT_UPLOAD) {
      const storageError = new Error(
        CERTIFICATE_MANAGEMENT_ERRORS.PUBLIC_STORAGE_NOT_WRITABLE,
      );

      logError(
        TELEMETRY_EVENT.TEMPLATE_UPLOAD_FAILURE,
        correlationId,
        storageError,
        {
          certificateTypeId: input.certificateTypeId,
          denominatorEligible,
        },
      );

      throw storageError;
    }

    try {
      const uploadResult = await service.uploadCertificateTemplate({
        certificateTypeId: input.certificateTypeId,
        file: input.file,
        createdByAdminId: adminContext.userId,
      });

      logInfo(TELEMETRY_EVENT.TEMPLATE_UPLOAD_SUCCESS, correlationId, {
        certificateTypeId: input.certificateTypeId,
        denominatorEligible,
      });

      return {
        ...uploadResult,
        denominatorEligible,
      };
    } catch (error) {
      logError(TELEMETRY_EVENT.TEMPLATE_UPLOAD_FAILURE, correlationId, error, {
        certificateTypeId: input.certificateTypeId,
        denominatorEligible,
      });

      throw error;
    }
  });

export const replaceActiveTemplate = createServerAction()
  .input(replaceActiveTemplateInputSchema)
  .handler(async ({ input }) => {
    await resolveAdminOrThrow();

    const service = new CertificateTypeAdminService();

    return service.replaceActiveTemplate(
      input.certificateTypeId,
      input.templateId,
    );
  });

export const deleteCertificateTemplate = createServerAction()
  .input(deleteCertificateTemplateInputSchema)
  .handler(async ({ input }) => {
    await resolveAdminOrThrow();

    const service = new CertificateTypeAdminService();

    return service.deleteCertificateTemplate(input.templateId);
  });

export const getLegacyBackfillStatus = createServerAction().handler(
  async () => {
    await resolveAdminOrThrow();

    const service = new TemplateBackfillService();

    return service.getLegacyBackfillStatus();
  },
);

export const runLegacyBackfillBatch = createServerAction()
  .input(runLegacyBackfillBatchInputSchema)
  .handler(async ({ input }) => {
    await resolveAdminOrThrow();

    const service = new TemplateBackfillService();

    return service.runLegacyBackfillBatch(input.batchSize);
  });
