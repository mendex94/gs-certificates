'use client';

import { useEffect, useMemo, useState } from 'react';
import { useServerAction } from 'zsa-react';
import { useToast } from '@components/ui/use-toast';
import {
  CertificateTypeForm,
  type TCertificateTypeFormValue,
} from '@components/organisms/CertificateTypeForm';
import { CertificateTypeTable } from '@components/organisms/CertificateTypeTable';
import { CertificateTemplateList } from '@components/organisms/CertificateTemplateList';
import { CertificateTemplateUpload } from '@components/organisms/CertificateTemplateUpload';
import { TemplateStorageCompatibilityCard } from '@components/organisms/TemplateStorageCompatibilityCard';
import { LegacyBackfillStatusCard } from '@components/organisms/LegacyBackfillStatusCard';
import {
  createCertificateType,
  deleteCertificateTemplate,
  deleteCertificateType,
  getLegacyBackfillStatus,
  getTemplateStorageCompatibility,
  listCertificateTemplates,
  listCertificateTypes,
  replaceActiveTemplate,
  runLegacyBackfillBatch,
  updateCertificateType,
  uploadCertificateTemplate,
} from './action';

type TCertificateTypeRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  legacyTokenType: string | null;
  status: string;
  updatedAt: string | Date;
  currentTemplate?: {
    id: string;
    version: number;
  } | null;
};

type TTemplateRow = {
  id: string;
  version: number;
  status: string;
  storagePath: string;
  originalFileName: string;
  createdAt: string | Date;
};

type TStorageCompatibility = {
  isWritable: boolean;
  mode: string;
  checkedAt: string;
  reason?: string;
};

type TBackfillStatus = {
  fallbackEnabled: boolean;
  cutoffAt: string | null;
  backfillProgressPercent: number;
  remainingItems: number;
};

export default function CertificateTypesPage() {
  const { toast } = useToast();
  const [types, setTypes] = useState<TCertificateTypeRow[]>([]);
  const [templates, setTemplates] = useState<TTemplateRow[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<string | undefined>();
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [typesError, setTypesError] = useState<string | undefined>();
  const [templatesError, setTemplatesError] = useState<string | undefined>();
  const [storageCompatibility, setStorageCompatibility] =
    useState<TStorageCompatibility>();
  const [backfillStatus, setBackfillStatus] = useState<TBackfillStatus>();
  const [feedback, setFeedback] = useState<{
    variant: 'success' | 'error';
    message: string;
  } | null>(null);

  const { execute: executeListTypes, isPending: isLoadingTypes } =
    useServerAction(listCertificateTypes, {
      onSuccess: ({ data }) => {
        setTypes(data.items as unknown as TCertificateTypeRow[]);
        setTypesError(undefined);
        setSelectedTypeId((prevSelectedTypeId) => {
          if (prevSelectedTypeId) {
            const stillExists = data.items.some(
              (item) => item.id === prevSelectedTypeId,
            );

            return stillExists
              ? prevSelectedTypeId
              : data.items[0]?.id || undefined;
          }

          return data.items[0]?.id || undefined;
        });
      },
      onError: ({ err }) => {
        setTypesError(err.message);
      },
    });

  const { execute: executeListTemplates, isPending: isLoadingTemplates } =
    useServerAction(listCertificateTemplates, {
      onSuccess: ({ data }) => {
        setTemplates(data as unknown as TTemplateRow[]);
        setTemplatesError(undefined);
      },
      onError: ({ err }) => {
        setTemplatesError(err.message);
      },
    });

  const {
    execute: executeGetTemplateStorageCompatibility,
    isPending: isLoadingStorageCompatibility,
  } = useServerAction(getTemplateStorageCompatibility, {
    onSuccess: ({ data }) => {
      setStorageCompatibility(data as TStorageCompatibility);
    },
  });

  const {
    execute: executeGetLegacyBackfillStatus,
    isPending: isLoadingBackfill,
  } = useServerAction(getLegacyBackfillStatus, {
    onSuccess: ({ data }) => {
      setBackfillStatus(data as TBackfillStatus);
    },
  });

  const { execute: executeCreateType, isPending: isCreatingType } =
    useServerAction(createCertificateType, {
      onSuccess: () => {
        setFeedback({
          variant: 'success',
          message: 'Tipo de certificado criado com sucesso.',
        });
        executeListTypes({});
      },
      onError: ({ err }) => {
        setFeedback({
          variant: 'error',
          message: err.message,
        });
      },
    });

  const { execute: executeUpdateType, isPending: isUpdatingType } =
    useServerAction(updateCertificateType, {
      onSuccess: () => {
        setFeedback({
          variant: 'success',
          message: 'Tipo de certificado atualizado com sucesso.',
        });
        setEditingTypeId(null);
        executeListTypes({});
      },
      onError: ({ err }) => {
        setFeedback({
          variant: 'error',
          message: err.message,
        });
      },
    });

  const { execute: executeDeleteType } = useServerAction(
    deleteCertificateType,
    {
      onSuccess: ({ data }) => {
        setFeedback({
          variant: 'success',
          message:
            data.result === 'archived'
              ? 'Tipo arquivado por possuir referencias ativas.'
              : 'Tipo removido com sucesso.',
        });
        setEditingTypeId(null);
        executeListTypes({});
      },
      onError: ({ err }) => {
        setFeedback({
          variant: 'error',
          message: err.message,
        });
      },
    },
  );

  const { execute: executeUploadTemplate, isPending: isUploadingTemplate } =
    useServerAction(uploadCertificateTemplate, {
      onSuccess: () => {
        setFeedback({
          variant: 'success',
          message: 'Template enviado e ativado com sucesso.',
        });
        selectedTypeId
          ? executeListTemplates({ certificateTypeId: selectedTypeId })
          : null;
        executeListTypes({});
        executeGetTemplateStorageCompatibility();
      },
      onError: ({ err }) => {
        setFeedback({
          variant: 'error',
          message: err.message,
        });
      },
    });

  const { execute: executeReplaceTemplate } = useServerAction(
    replaceActiveTemplate,
    {
      onSuccess: () => {
        setFeedback({
          variant: 'success',
          message: 'Template ativo atualizado com sucesso.',
        });
        selectedTypeId
          ? executeListTemplates({ certificateTypeId: selectedTypeId })
          : null;
        executeListTypes({});
      },
      onError: ({ err }) => {
        setFeedback({
          variant: 'error',
          message: err.message,
        });
      },
    },
  );

  const { execute: executeDeleteTemplate } = useServerAction(
    deleteCertificateTemplate,
    {
      onSuccess: ({ data }) => {
        setFeedback({
          variant: 'success',
          message:
            data.result === 'archived'
              ? 'Template arquivado por possuir referencias ativas.'
              : 'Template removido com sucesso.',
        });
        selectedTypeId
          ? executeListTemplates({ certificateTypeId: selectedTypeId })
          : null;
        executeListTypes({});
      },
      onError: ({ err }) => {
        setFeedback({
          variant: 'error',
          message: err.message,
        });
      },
    },
  );

  const {
    execute: executeRunBackfillBatch,
    isPending: isRunningBackfillBatch,
  } = useServerAction(runLegacyBackfillBatch, {
    onSuccess: () => {
      setFeedback({
        variant: 'success',
        message: 'Lote de backfill executado com sucesso.',
      });
      executeGetLegacyBackfillStatus();
    },
    onError: ({ err }) => {
      setFeedback({
        variant: 'error',
        message: err.message,
      });
    },
  });

  useEffect(() => {
    executeListTypes({});
    executeGetTemplateStorageCompatibility();
    executeGetLegacyBackfillStatus();
  }, [
    executeListTypes,
    executeGetTemplateStorageCompatibility,
    executeGetLegacyBackfillStatus,
  ]);

  useEffect(() => {
    selectedTypeId
      ? executeListTemplates({ certificateTypeId: selectedTypeId })
      : setTemplates([]);
  }, [selectedTypeId, executeListTemplates]);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    toast({
      title: feedback.variant === 'success' ? 'Sucesso' : 'Erro',
      description: feedback.message,
      variant: feedback.variant === 'error' ? 'destructive' : 'default',
    });
  }, [feedback, toast]);

  const editingType = useMemo(() => {
    return types.find((item) => item.id === editingTypeId) || null;
  }, [types, editingTypeId]);

  const resolveLegacyTokenType = (
    value: string | null | undefined,
  ): 'higienizacao' | 'impermeabilizacao' | undefined => {
    return value === 'higienizacao' || value === 'impermeabilizacao'
      ? value
      : undefined;
  };

  const submitTypeForm = async (value: TCertificateTypeFormValue) => {
    if (value.id) {
      await executeUpdateType({
        id: value.id,
        name: value.name,
        slug: value.slug,
        description: value.description || null,
        legacyTokenType: value.legacyTokenType || null,
      });

      return;
    }

    await executeCreateType({
      name: value.name,
      slug: value.slug,
      description: value.description,
      legacyTokenType: value.legacyTokenType,
    });
  };

  return (
    <div className="container mx-auto space-y-6 px-4 py-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Gestao de tipos e templates</h1>
        <p className="text-sm text-slate-600">
          Area administrativa para CRUD de certificate types, templates e
          migracao legado.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <TemplateStorageCompatibilityCard
          status={storageCompatibility}
          isLoading={isLoadingStorageCompatibility}
          onRefresh={() => {
            executeGetTemplateStorageCompatibility();
          }}
        />

        <LegacyBackfillStatusCard
          status={backfillStatus}
          isLoading={isLoadingBackfill}
          isRunningBatch={isRunningBackfillBatch}
          onRunBatch={async () => {
            await executeRunBackfillBatch({});
          }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <CertificateTypeForm
            value={
              editingType
                ? {
                    id: editingType.id,
                    name: editingType.name,
                    slug: editingType.slug,
                    description: editingType.description || undefined,
                    legacyTokenType: resolveLegacyTokenType(
                      editingType.legacyTokenType,
                    ),
                  }
                : undefined
            }
            isPending={isCreatingType || isUpdatingType}
            onSubmit={submitTypeForm}
            onCancelEdit={() => {
              setEditingTypeId(null);
            }}
          />

          <CertificateTypeTable
            items={types}
            isLoading={isLoadingTypes}
            errorMessage={typesError}
            selectedTypeId={selectedTypeId}
            onSelect={setSelectedTypeId}
            onEdit={setEditingTypeId}
            onDelete={(id) => {
              executeDeleteType({ id });
            }}
          />
        </div>

        <div className="space-y-4">
          <CertificateTemplateUpload
            certificateTypeId={selectedTypeId}
            isPending={isUploadingTemplate}
            storageMode={storageCompatibility?.mode}
            onUpload={async ({ certificateTypeId, file }) => {
              const formData = new FormData();

              formData.append('certificateTypeId', certificateTypeId);
              formData.append('file', file);

              await executeUploadTemplate(formData);
            }}
          />

          <CertificateTemplateList
            items={templates}
            isLoading={isLoadingTemplates}
            errorMessage={templatesError}
            onActivate={(templateId) => {
              selectedTypeId
                ? executeReplaceTemplate({
                    certificateTypeId: selectedTypeId,
                    templateId,
                  })
                : null;
            }}
            onDelete={(templateId) => {
              executeDeleteTemplate({ templateId });
            }}
          />
        </div>
      </div>
    </div>
  );
}
