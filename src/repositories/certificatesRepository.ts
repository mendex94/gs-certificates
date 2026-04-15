import { and, eq, or, sql } from 'drizzle-orm';
import type { DB } from '@/lib/db';
import { db } from '@/lib/db';
import {
  certificates,
  certificatePendingRequests,
  certificateTypes,
} from '@/lib/db/schema';
import { CertificateDTO } from '@/dtos/certificate';
import { ICertificatesRepository } from '.';
import { TEMPLATE_REFERENCE_REQUEST_STATUS } from '@/constants/certificate-management';

export class CertificatesRepository implements ICertificatesRepository {
  private db: DB;

  constructor(database?: DB) {
    this.db = database || db;
  }

  async createCertificate(certificate: CertificateDTO) {
    const {
      tokenHash,
      encryptedData,
      issuedAt,
      generatedAt,
      tokenConsumed,
      userId,
      type,
      product,
    } = certificate;

    const [newCertificate] = await this.db
      .insert(certificates)
      .values({
        tokenHash,
        encryptedData,
        issuedAt,
        generatedAt,
        tokenConsumed,
        userId,
        type,
        product,
      })
      .returning();

    return CertificateDTO.fromDb(newCertificate);
  }

  async retrieveCertificateById(tokenHash: string) {
    const [certificate] = await this.db
      .select()
      .from(certificates)
      .where(eq(certificates.tokenHash, tokenHash))
      .limit(1);

    if (!certificate) {
      return null;
    }

    return CertificateDTO.fromDb({
      tokenHash: certificate.tokenHash,
      encryptedData: certificate.encryptedData,
      issuedAt: certificate.issuedAt,
      generatedAt: certificate.generatedAt,
      tokenConsumed: certificate.tokenConsumed,
      userId: certificate.userId,
      type: certificate.type,
      product: certificate.product,
    });
  }

  async consumeGenerationToken(certificateId: string, userId: number) {
    const [updatedCertificate] = await this.db
      .update(certificates)
      .set({
        tokenConsumed: true,
        generatedAt: new Date(),
      })
      .where(
        and(
          eq(certificates.tokenHash, certificateId),
          eq(certificates.userId, userId),
          eq(certificates.tokenConsumed, false),
        ),
      )
      .returning({
        tokenHash: certificates.tokenHash,
      });

    return !!updatedCertificate;
  }

  async getActiveReferenceSummary(input: {
    certificateTypeId: string;
    templateId?: string;
  }) {
    const [certificateTypeRow] = await this.db
      .select({ legacyTokenType: certificateTypes.legacyTokenType })
      .from(certificateTypes)
      .where(eq(certificateTypes.id, input.certificateTypeId))
      .limit(1);

    const certificateReferenceFilters = [
      eq(certificates.certificateTypeId, input.certificateTypeId),
    ];

    certificateTypeRow?.legacyTokenType
      ? certificateReferenceFilters.push(
          eq(certificates.type, certificateTypeRow.legacyTokenType),
        )
      : null;

    input.templateId
      ? certificateReferenceFilters.push(
          eq(certificates.templateId, input.templateId),
        )
      : null;

    const [certificateCountRow] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(certificates)
      .where(or(...certificateReferenceFilters));

    const pendingReferenceFilters = [
      eq(certificatePendingRequests.certificateTypeId, input.certificateTypeId),
    ];

    input.templateId
      ? pendingReferenceFilters.push(
          eq(certificatePendingRequests.templateId, input.templateId),
        )
      : null;

    const [pendingCountRow] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(certificatePendingRequests)
      .where(
        and(
          eq(
            certificatePendingRequests.status,
            TEMPLATE_REFERENCE_REQUEST_STATUS.PENDING,
          ),
          or(...pendingReferenceFilters),
        ),
      );

    return {
      referencedCertificateCountAnyStatus: Number(
        certificateCountRow?.count || 0,
      ),
      pendingRequestCount: Number(pendingCountRow?.count || 0),
    };
  }
}
