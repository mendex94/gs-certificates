import { and, eq } from 'drizzle-orm';
import type { DB } from '@/lib/db';
import { db } from '@/lib/db';
import { certificates } from '@/lib/db/schema';
import { CertificateDTO } from '@/dtos/certificate';
import { ICertificatesRepository } from '.';

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
}
