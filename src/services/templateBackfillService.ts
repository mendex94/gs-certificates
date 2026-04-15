import {
  CERTIFICATE_MANAGEMENT_ERRORS,
  TEMPLATE_MIGRATION_STATE,
} from '@/constants/certificate-management';
import {
  getLegacyFallbackCutoffAt,
  isLegacyFallbackCutoffReached,
  resolveBackfillBatchSize,
} from '@/utils/env';
import type { ICertificateTypesRepository } from '@/repositories';
import { CertificateTypesRepository } from '@/repositories/certificateTypesRepository';

export type TLegacyBackfillStatus = {
  fallbackEnabled: boolean;
  cutoffAt: string | null;
  backfillProgressPercent: number;
  remainingItems: number;
};

export class TemplateBackfillService {
  private certificateTypesRepository: ICertificateTypesRepository;

  constructor() {
    this.certificateTypesRepository = new CertificateTypesRepository();
  }

  async getLegacyBackfillStatus(): Promise<TLegacyBackfillStatus> {
    const [legacyCount, backfilledCount] = await Promise.all([
      this.certificateTypesRepository.countByMigrationState(
        TEMPLATE_MIGRATION_STATE.LEGACY_FALLBACK,
      ),
      this.certificateTypesRepository.countByMigrationState(
        TEMPLATE_MIGRATION_STATE.BACKFILLED,
      ),
    ]);

    const totalCount = legacyCount + backfilledCount;
    const progressPercent =
      totalCount > 0 ? Math.round((backfilledCount / totalCount) * 100) : 100;
    const cutoffAt = getLegacyFallbackCutoffAt();

    return {
      fallbackEnabled: !isLegacyFallbackCutoffReached(),
      cutoffAt: cutoffAt ? cutoffAt.toISOString() : null,
      backfillProgressPercent: progressPercent,
      remainingItems: legacyCount,
    };
  }

  async runLegacyBackfillBatch(batchSize?: number) {
    const resolvedBatchSize = resolveBackfillBatchSize(batchSize);
    const currentStatus = await this.getLegacyBackfillStatus();

    if (!currentStatus.fallbackEnabled && currentStatus.remainingItems > 0) {
      throw new Error(
        CERTIFICATE_MANAGEMENT_ERRORS.BACKFILL_INCOMPLETE_AT_CUTOFF,
      );
    }

    const legacyRows =
      await this.certificateTypesRepository.listByMigrationState(
        TEMPLATE_MIGRATION_STATE.LEGACY_FALLBACK,
        resolvedBatchSize,
      );

    for (const row of legacyRows) {
      await this.certificateTypesRepository.updateById(row.id, {
        migrationState: TEMPLATE_MIGRATION_STATE.BACKFILLED,
      });
    }

    const statusAfterBatch = await this.getLegacyBackfillStatus();

    if (
      statusAfterBatch.remainingItems === 0 &&
      legacyRows.length > 0 &&
      !isLegacyFallbackCutoffReached()
    ) {
      const now = new Date();

      for (const row of legacyRows) {
        await this.certificateTypesRepository.updateById(row.id, {
          backfillCompletedAt: now,
        });
      }
    }

    return {
      processedCount: legacyRows.length,
      remainingItems: statusAfterBatch.remainingItems,
      fallbackEnabled: statusAfterBatch.fallbackEnabled,
    };
  }
}
