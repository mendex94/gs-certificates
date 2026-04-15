import { and, desc, eq, ilike, sql } from 'drizzle-orm';
import { db, type DB } from '@/lib/db';
import { certificateTypes } from '@/lib/db/schema';
import { CertificateTypeDTO } from '@/dtos/certificate-type';
import type { ICertificateTypesRepository } from './index';
import type {
  TCertificateManagementStatus,
  TTemplateMigrationState,
} from '@/constants/certificate-management';
import type { TokenType } from './userRepository';

type TCertificateTypeRow = typeof certificateTypes.$inferSelect;

const toDto = (row: TCertificateTypeRow) =>
  CertificateTypeDTO.fromDb({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    legacyTokenType: row.legacyTokenType,
    status: row.status,
    currentTemplateId: row.currentTemplateId,
    migrationState: row.migrationState,
    createdByAdminId: row.createdByAdminId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    archivedAt: row.archivedAt,
    deletedAt: row.deletedAt,
  });

export class CertificateTypesRepository implements ICertificateTypesRepository {
  private db: DB;

  constructor(database?: DB) {
    this.db = database || db;
  }

  async list(input?: {
    status?: TCertificateManagementStatus;
    query?: string;
  }) {
    const queryFilters = [];

    input?.status
      ? queryFilters.push(eq(certificateTypes.status, input.status))
      : null;

    input?.query
      ? queryFilters.push(
          ilike(certificateTypes.name, `%${input.query.trim()}%`),
        )
      : null;

    const rows = await this.db
      .select()
      .from(certificateTypes)
      .where(queryFilters.length ? and(...queryFilters) : undefined)
      .orderBy(desc(certificateTypes.updatedAt));

    return rows.map(toDto);
  }

  async findById(id: string) {
    const [row] = await this.db
      .select()
      .from(certificateTypes)
      .where(eq(certificateTypes.id, id))
      .limit(1);

    return row ? toDto(row) : null;
  }

  async findByNameInsensitive(name: string) {
    const [row] = await this.db
      .select()
      .from(certificateTypes)
      .where(sql`lower(${certificateTypes.name}) = lower(${name})`)
      .limit(1);

    return row ? toDto(row) : null;
  }

  async findBySlug(slug: string) {
    const [row] = await this.db
      .select()
      .from(certificateTypes)
      .where(eq(certificateTypes.slug, slug))
      .limit(1);

    return row ? toDto(row) : null;
  }

  async create(input: {
    name: string;
    slug: string;
    description?: string;
    legacyTokenType?: TokenType;
    createdByAdminId: number;
    migrationState?: TTemplateMigrationState;
  }) {
    const [row] = await this.db
      .insert(certificateTypes)
      .values({
        name: input.name,
        slug: input.slug,
        description: input.description,
        legacyTokenType: input.legacyTokenType,
        createdByAdminId: input.createdByAdminId,
        migrationState: input.migrationState,
      })
      .returning();

    return toDto(row);
  }

  async updateById(
    id: string,
    input: {
      name?: string;
      slug?: string;
      description?: string | null;
      legacyTokenType?: TokenType | null;
      status?: TCertificateManagementStatus;
      migrationState?: TTemplateMigrationState;
      currentTemplateId?: string | null;
      archivedAt?: Date | null;
      deletedAt?: Date | null;
      backfillCompletedAt?: Date | null;
    },
  ) {
    const [row] = await this.db
      .update(certificateTypes)
      .set({
        name: input.name,
        slug: input.slug,
        description: input.description,
        legacyTokenType: input.legacyTokenType,
        status: input.status,
        migrationState: input.migrationState,
        currentTemplateId: input.currentTemplateId,
        archivedAt: input.archivedAt,
        deletedAt: input.deletedAt,
        backfillCompletedAt: input.backfillCompletedAt,
        updatedAt: new Date(),
      })
      .where(eq(certificateTypes.id, id))
      .returning();

    return row ? toDto(row) : null;
  }

  async hardDelete(id: string) {
    const [deleted] = await this.db
      .delete(certificateTypes)
      .where(eq(certificateTypes.id, id))
      .returning({ id: certificateTypes.id });

    return !!deleted;
  }

  async countByMigrationState(state: TTemplateMigrationState) {
    const [row] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(certificateTypes)
      .where(eq(certificateTypes.migrationState, state));

    return Number(row?.count || 0);
  }

  async listByMigrationState(state: TTemplateMigrationState, limit: number) {
    const rows = await this.db
      .select()
      .from(certificateTypes)
      .where(eq(certificateTypes.migrationState, state))
      .orderBy(desc(certificateTypes.updatedAt))
      .limit(limit);

    return rows.map(toDto);
  }
}
