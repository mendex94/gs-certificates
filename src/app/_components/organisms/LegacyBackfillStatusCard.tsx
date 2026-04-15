'use client';

import { Button } from '@components/ui/button';
import { Skeleton } from '@components/ui/skeleton';

type TLegacyBackfillStatus = {
  fallbackEnabled: boolean;
  cutoffAt: string | null;
  backfillProgressPercent: number;
  remainingItems: number;
};

type TLegacyBackfillStatusCardProps = {
  status?: TLegacyBackfillStatus;
  isLoading: boolean;
  isRunningBatch: boolean;
  onRunBatch: () => Promise<void>;
};

export function LegacyBackfillStatusCard({
  status,
  isLoading,
  isRunningBatch,
  onRunBatch,
}: TLegacyBackfillStatusCardProps) {
  return (
    <section className="space-y-3 rounded-lg border p-4">
      <h3 className="text-base font-semibold">Status de backfill legado</h3>

      {isLoading ? <Skeleton className="h-12 w-full" /> : null}

      {!isLoading && status ? (
        <div className="space-y-2 text-sm">
          <p>
            Fallback legado:{' '}
            {status.fallbackEnabled ? 'habilitado' : 'desabilitado'}
          </p>
          <p>Progresso: {status.backfillProgressPercent}%</p>
          <p>Itens restantes: {status.remainingItems}</p>
          <p>
            Cutoff:{' '}
            {status.cutoffAt
              ? new Date(status.cutoffAt).toLocaleString('pt-BR')
              : 'nao configurado'}
          </p>
          <Button
            type="button"
            disabled={isRunningBatch || status.remainingItems === 0}
            onClick={onRunBatch}
          >
            {isRunningBatch ? 'Executando...' : 'Executar lote de backfill'}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
