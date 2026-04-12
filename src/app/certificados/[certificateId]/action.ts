/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { createServerAction } from 'zsa';
import { z } from 'zod';
import { CertificatesService } from '@/services/certificatesService';
import { authenticatedProcedure } from '@/lib/zsa-procedures';
import { logError, logInfo } from '@/utils/logger';

export const retrieveCertificateById = createServerAction()
  .input(
    z.object({
      certificateId: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    const certificateService = new CertificatesService();
    const certificate = await certificateService.retrieveCertificateById(
      input.certificateId,
    );

    return {
      message: 'Certificate retrieved successfully',
      certificate,
    };
  });

export const generateCertificatePDF = authenticatedProcedure
  .createServerAction()
  .input(
    z.object({
      certificateId: z.string(),
    }),
  )
  .handler(async ({ input, ctx }) => {
    const correlationId = crypto.randomUUID();
    const { certificateId } = input;

    if (!ctx.userId) {
      throw new Error('Nao autorizado!');
    }

    try {
      logInfo('certificate_pdf_generation_started', correlationId, {
        certificateId,
        userId: ctx.userId,
      });

      const certificateService = new CertificatesService();
      const pdfBuffer = await certificateService.generateCertificatePdf(
        certificateId,
        ctx.userId,
      );

      logInfo('certificate_pdf_generation_finished', correlationId, {
        certificateId,
        userId: ctx.userId,
        bytes: pdfBuffer.length,
      });

      return {
        mimeType: 'application/pdf',
        fileName: `${certificateId}-certificado.pdf`,
        pdf: Array.from(pdfBuffer),
      };
    } catch (error) {
      logError('certificate_pdf_generation_failed', correlationId, error, {
        certificateId,
        userId: ctx.userId,
      });
      throw error;
    }
  });
