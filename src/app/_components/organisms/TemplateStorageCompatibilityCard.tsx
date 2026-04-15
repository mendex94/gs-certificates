'use client';

import { Button } from '@components/ui/button';
import { Skeleton } from '@components/ui/skeleton';
import { MANUAL_PUBLICATION_CHECKLIST } from '@/constants/certificate-management';

type TTemplateStorageCompatibilityCardProps = {
  status?: {
    isWritable: boolean;
    mode: string;
    checkedAt: string;
    reason?: string;
  };
  isLoading: boolean;
  onRefresh: () => void;
};

export function TemplateStorageCompatibilityCard({
  status,
  isLoading,
  onRefresh,
}: TTemplateStorageCompatibilityCardProps) {
  return (
    <section className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold">
          Compatibilidade de armazenamento
        </h3>
        <Button
          type="button"
          variant="outline"
          className="h-8"
          onClick={onRefresh}
        >
          Atualizar status
        </Button>
      </div>

      {isLoading ? <Skeleton className="h-12 w-full" /> : null}

      {!isLoading && status ? (
        <div className="space-y-3 text-sm">
          <p>
            Modo atual: <strong>{status.mode}</strong>
          </p>
          <p>Diretorio gravavel: {status.isWritable ? 'sim' : 'nao'}</p>
          <p>
            Ultima verificacao:{' '}
            {new Date(status.checkedAt).toLocaleString('pt-BR')}
          </p>
          {status.reason ? <p>Motivo: {status.reason}</p> : null}
          {!status.isWritable ? (
            <div className="space-y-1 rounded-md border border-amber-200 bg-amber-50 p-3">
              <p className="font-medium text-amber-700">
                Checklist manual deploy/FTP
              </p>
              <ul className="list-disc pl-5 text-amber-800">
                {MANUAL_PUBLICATION_CHECKLIST.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
