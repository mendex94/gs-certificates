'use client';

/* eslint-disable no-unused-vars */

import { Button } from '@components/ui/button';
import { Skeleton } from '@components/ui/skeleton';

type TCertificateTemplateListItem = {
  id: string;
  version: number;
  status: string;
  storagePath: string;
  originalFileName: string;
  createdAt: string | Date;
};

interface TCertificateTemplateListProps {
  items: TCertificateTemplateListItem[];
  isLoading: boolean;
  errorMessage?: string;
  onActivate(templateId: string): void;
  onDelete(templateId: string): void;
}

export function CertificateTemplateList({
  items,
  isLoading,
  errorMessage,
  onActivate,
  onDelete,
}: TCertificateTemplateListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 rounded-lg border p-4">
        <Skeleton className="h-6 w-52" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      >
        {errorMessage}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-sm text-slate-600">
        Nenhum template cadastrado para este tipo.
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <h3 className="text-base font-semibold">Templates cadastrados</h3>
      <ul className="space-y-3">
        {items.map((template) => (
          <li
            key={template.id}
            className="flex flex-col gap-3 rounded-md border border-slate-200 p-3 md:flex-row md:items-center md:justify-between"
          >
            <div className="space-y-1">
              <p className="font-medium text-slate-900">v{template.version}</p>
              <p className="text-xs text-slate-600">
                {template.originalFileName}
              </p>
              <p className="text-xs text-slate-600">{template.storagePath}</p>
              <p className="text-xs text-slate-600">
                Status: {template.status}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-8"
                onClick={() => {
                  onActivate(template.id);
                }}
              >
                Ativar
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="h-8"
                onClick={() => {
                  onDelete(template.id);
                }}
              >
                Excluir
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
