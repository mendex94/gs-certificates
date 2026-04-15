'use client';

/* eslint-disable no-unused-vars */

import { Button } from '@components/ui/button';
import { Skeleton } from '@components/ui/skeleton';

type TCertificateTypeTableItem = {
  id: string;
  name: string;
  slug: string;
  status: string;
  updatedAt: string | Date;
  currentTemplate?: {
    id: string;
    version: number;
  } | null;
};

interface TCertificateTypeTableProps {
  items: TCertificateTypeTableItem[];
  isLoading: boolean;
  errorMessage?: string;
  selectedTypeId?: string;
  onSelect(id: string): void;
  onEdit(id: string): void;
  onDelete(id: string): void;
}

export function CertificateTypeTable({
  items,
  isLoading,
  errorMessage,
  selectedTypeId,
  onSelect,
  onEdit,
  onDelete,
}: TCertificateTypeTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 rounded-lg border p-4">
        <Skeleton className="h-6 w-60" />
        <Skeleton className="h-12 w-full" />
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
        Nenhum tipo de certificado cadastrado.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left">
          <tr>
            <th className="px-3 py-2 font-medium text-slate-700">Nome</th>
            <th className="px-3 py-2 font-medium text-slate-700">Slug</th>
            <th className="px-3 py-2 font-medium text-slate-700">Status</th>
            <th className="px-3 py-2 font-medium text-slate-700">Template</th>
            <th className="px-3 py-2 font-medium text-slate-700">Acoes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => (
            <tr
              key={item.id}
              className={selectedTypeId === item.id ? 'bg-blue-50' : ''}
            >
              <td className="px-3 py-2">
                <button
                  type="button"
                  className="text-left font-medium text-slate-900 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
                  onClick={() => {
                    onSelect(item.id);
                  }}
                >
                  {item.name}
                </button>
              </td>
              <td className="px-3 py-2 text-slate-600">{item.slug}</td>
              <td className="px-3 py-2 text-slate-600">{item.status}</td>
              <td className="px-3 py-2 text-slate-600">
                {item.currentTemplate
                  ? `v${item.currentTemplate.version}`
                  : 'Sem template ativo'}
              </td>
              <td className="px-3 py-2">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8"
                    onClick={() => {
                      onEdit(item.id);
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    className="h-8"
                    onClick={() => {
                      onDelete(item.id);
                    }}
                  >
                    Excluir
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
