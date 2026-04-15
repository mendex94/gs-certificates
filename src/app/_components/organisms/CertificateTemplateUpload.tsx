'use client';

/* eslint-disable no-unused-vars */

import { ChangeEvent, useState } from 'react';
import { Button } from '@components/ui/button';
import { Label } from '@components/ui/label';
import { TEMPLATE_STORAGE_MODE } from '@/constants/certificate-management';

interface TCertificateTemplateUploadProps {
  certificateTypeId?: string;
  isPending: boolean;
  storageMode?: string;
  onUpload(input: { certificateTypeId: string; file: File }): Promise<void>;
}

export function CertificateTemplateUpload({
  certificateTypeId,
  isPending,
  storageMode,
  onUpload,
}: TCertificateTemplateUploadProps) {
  const [file, setFile] = useState<File | null>(null);

  const isManualMode = storageMode === TEMPLATE_STORAGE_MODE.MANUAL_PUBLISH;
  const isDisabled = !certificateTypeId || isPending || isManualMode;

  const handleSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!certificateTypeId || !file) {
      return;
    }

    await onUpload({
      certificateTypeId,
      file,
    });

    setFile(null);
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div>
        <h3 className="text-base font-semibold">
          Upload / substituicao de template
        </h3>
        <p className="text-sm text-slate-600">
          Apenas PDF com tamanho maximo de 10 MB.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="certificate-template-upload">Arquivo PDF</Label>
        <input
          id="certificate-template-upload"
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleSelect}
          disabled={isDisabled}
          className="block w-full text-sm"
        />
        {file ? (
          <p className="text-xs text-slate-600">
            Selecionado: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)}{' '}
            MB)
          </p>
        ) : null}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          onClick={handleUpload}
          disabled={isDisabled || !file}
        >
          {isPending ? 'Enviando...' : 'Enviar template'}
        </Button>
        {isManualMode ? (
          <p className="text-sm text-amber-700">
            Upload direto bloqueado no modo manual_publish.
          </p>
        ) : null}
      </div>
    </div>
  );
}
