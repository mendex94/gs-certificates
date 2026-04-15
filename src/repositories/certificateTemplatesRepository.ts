import { and, desc, eq, ne, sql } from 'drizzle-orm';
import { db, type DB } from '@/lib/db';
import {
  CERTIFICATE_MANAGEMENT_STATUS,
  type TCertificateManagementStatus,
  type TTemplateStorageMode,
} from '@/constants/certificate-management';
import { certificateTemplates, certificateTypes } from '@/lib/db/schema';
import { CertificateTemplateDTO } from '@/dtos/certificate-template';
import type { ICertificateTemplatesRepository } from './';
import type { TokenType } from './userRepository';

type TCertificateTemplateRow = typeof certificateTemplates.$inferSelect;

const toDto = (row: TCertificateTemplateRow) =>
  CertificateTemplateDTO.fromDb({
    id: row.id,
    certificateTypeId: row.certificateTypeId,
    version: row.version,
    originalFileName: row.originalFileName,
    storagePath: row.storagePath,
    storageMode: row.storageMode,
    mimeType: row.mimeType,
    fileSizeBytes: row.fileSizeBytes,
    status: row.status,
    createdByAdminId: row.createdByAdminId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    archivedAt: row.archivedAt,
    deletedAt: row.deletedAt,
  });

export class CertificateTemplatesRepository
  implements ICertificateTemplatesRepository
{
  private db: DB;

  constructor(database?: DB) {
    this.db = database || db;
  }

  async listByTypeId(certificateTypeId: string) {
    const rows = await this.db
      .select()
      .from(certificateTemplates)
      .where(eq(certificateTemplates.certificateTypeId, certificateTypeId))
      .orderBy(desc(certificateTemplates.version));

    return rows.map(toDto);
  }

  async findById(id: string) {
    const [row] = await this.db
      .select()
      .from(certificateTemplates)
      .where(eq(certificateTemplates.id, id))
      .limit(1);

    return row ? toDto(row) : null;
  }

  async findActiveByTypeId(certificateTypeId: string) {
    const [row] = await this.db
      .select()
      .from(certificateTemplates)
      .where(
        and(
          eq(certificateTemplates.certificateTypeId, certificateTypeId),
          eq(certificateTemplates.status, CERTIFICATE_MANAGEMENT_STATUS.ACTIVE),
        ),
      )
      .orderBy(desc(certificateTemplates.version))
      .limit(1);

    return row ? toDto(row) : null;
  }

  async findLatestActiveByLegacyTokenType(legacyTokenType: TokenType) {
    const [row] = await this.db
      .select({ template: certificateTemplates })
      .from(certificateTemplates)
      .innerJoin(
        certificateTypes,
        eq(certificateTypes.id, certificateTemplates.certificateTypeId),
      )
      .where(
        and(
          eq(certificateTypes.legacyTokenType, legacyTokenType),
          eq(certificateTemplates.status, CERTIFICATE_MANAGEMENT_STATUS.ACTIVE),
        ),
      )
      .orderBy(desc(certificateTemplates.updatedAt))
      .limit(1);

    return row ? toDto(row.template) : null;
  }

  async getNextVersion(certificateTypeId: string) {
    const [row] = await this.db
      .select({
        maxVersion: sql<number>`coalesce(max(${certificateTemplates.version}), 0)`,
      })
      .from(certificateTemplates)
      .where(eq(certificateTemplates.certificateTypeId, certificateTypeId));

    return Number(row?.maxVersion || 0) + 1;
  }

  async create(input: {
    certificateTypeId: string;
    version: number;
    originalFileName: string;
    storagePath: string;
    storageMode: TTemplateStorageMode;
    mimeType: string;
    fileSizeBytes: number;
    status?: TCertificateManagementStatus;
    createdByAdminId: number;
  }) {
    const [row] = await this.db
      .insert(certificateTemplates)
      .values({
        certificateTypeId: input.certificateTypeId,
        version: input.version,
        originalFileName: input.originalFileName,
        storagePath: input.storagePath,
        storageMode: input.storageMode,
        mimeType: input.mimeType,
        fileSizeBytes: input.fileSizeBytes,
        status: input.status,
        createdByAdminId: input.createdByAdminId,
      })
      .returning();

    return toDto(row);
  }

  async setStatus(
    templateId: string,
    status: TCertificateManagementStatus,
    optionalDates?: {
      archivedAt?: Date | null;
      deletedAt?: Date | null;
    },
  ) {
    const [row] = await this.db
      .update(certificateTemplates)
      .set({
        status,
        archivedAt: optionalDates?.archivedAt,
        deletedAt: optionalDates?.deletedAt,
        updatedAt: new Date(),
      })
      .where(eq(certificateTemplates.id, templateId))
      .returning();

    return row ? toDto(row) : null;
  }

  async setInactiveForTypeExcept(
    certificateTypeId: string,
    exceptTemplateId: string,
  ) {
    await this.db
      .update(certificateTemplates)
      .set({
        status: CERTIFICATE_MANAGEMENT_STATUS.INACTIVE,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(certificateTemplates.certificateTypeId, certificateTypeId),
          ne(certificateTemplates.id, exceptTemplateId),
          eq(certificateTemplates.status, CERTIFICATE_MANAGEMENT_STATUS.ACTIVE),
        ),
      );
  }

  async hardDelete(templateId: string) {
    const [deleted] = await this.db
      .delete(certificateTemplates)
      .where(eq(certificateTemplates.id, templateId))
      .returning({ id: certificateTemplates.id });

    return !!deleted;
  }
}
