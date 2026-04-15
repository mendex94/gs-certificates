'use client';

/* eslint-disable no-unused-vars */

import { FormEvent, useEffect, useState } from 'react';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';

export type TCertificateTypeFormValue = {
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  legacyTokenType?: 'higienizacao' | 'impermeabilizacao';
};

interface TCertificateTypeFormProps {
  value?: TCertificateTypeFormValue;
  isPending: boolean;
  onSubmit(value: TCertificateTypeFormValue): Promise<void>;
  onCancelEdit?: () => void;
}

export function CertificateTypeForm({
  value,
  isPending,
  onSubmit,
  onCancelEdit,
}: TCertificateTypeFormProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [legacyTokenType, setLegacyTokenType] = useState<
    'higienizacao' | 'impermeabilizacao' | ''
  >('');

  useEffect(() => {
    setName(value?.name || '');
    setSlug(value?.slug || '');
    setDescription(value?.description || '');
    setLegacyTokenType(value?.legacyTokenType || '');
  }, [value]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await onSubmit({
      id: value?.id,
      name,
      slug,
      description,
      legacyTokenType: legacyTokenType || undefined,
    });

    value
      ? null
      : (() => {
          setName('');
          setSlug('');
          setDescription('');
          setLegacyTokenType('');
        })();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-4">
      <div className="space-y-2">
        <Label htmlFor="certificate-type-name">Nome</Label>
        <Input
          id="certificate-type-name"
          required
          placeholder="Ex.: Certificado Premium"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
          }}
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="certificate-type-slug">Slug (opcional)</Label>
        <Input
          id="certificate-type-slug"
          placeholder="certificado-premium"
          value={slug}
          onChange={(event) => {
            setSlug(event.target.value);
          }}
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="certificate-type-description">
          Descricao (opcional)
        </Label>
        <textarea
          id="certificate-type-description"
          className="flex min-h-24 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
          placeholder="Descricao para uso interno"
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
          }}
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="certificate-type-legacy">
          Legacy token type (opcional)
        </Label>
        <select
          id="certificate-type-legacy"
          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
          value={legacyTokenType}
          onChange={(event) => {
            const valueFromSelect = event.target.value as
              | 'higienizacao'
              | 'impermeabilizacao'
              | '';

            setLegacyTokenType(valueFromSelect);
          }}
          disabled={isPending}
        >
          <option value="">Sem vinculo legado</option>
          <option value="higienizacao">higienizacao</option>
          <option value="impermeabilizacao">impermeabilizacao</option>
        </select>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {value ? 'Salvar alteracoes' : 'Criar tipo'}
        </Button>
        {value && onCancelEdit ? (
          <Button type="button" variant="outline" onClick={onCancelEdit}>
            Cancelar edicao
          </Button>
        ) : null}
      </div>
    </form>
  );
}
