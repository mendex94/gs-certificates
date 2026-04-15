import {
  CERTIFICATE_MANAGEMENT_ERRORS,
  CERTIFICATE_MANAGEMENT_STATUS,
  TEMPLATE_MIGRATION_STATE,
} from '@/constants/certificate-management';
import type {
  ICertificatesRepository,
  ICertificateTemplatesRepository,
  ICertificateTypesRepository,
} from '@/repositories';
import { CertificatesRepository } from '@/repositories/certificatesRepository';
import { CertificateTemplatesRepository } from '@/repositories/certificateTemplatesRepository';
import { CertificateTypesRepository } from '@/repositories/certificateTypesRepository';
import {
  TemplateStorageService,
  type TTemplateUploadFile,
} from './templateStorageService';

const normalizeSlug = (value: string) => {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

const hasActiveReferences = (input: {
  referencedCertificateCountAnyStatus: number;
  pendingRequestCount: number;
}) => {
  return (
    input.referencedCertificateCountAnyStatus + input.pendingRequestCount > 0
  );
};

export class CertificateTypeAdminService {
  private certificateTypesRepository: ICertificateTypesRepository;
  private certificateTemplatesRepository: ICertificateTemplatesRepository;
  private certificatesRepository: ICertificatesRepository;
  private templateStorageService: TemplateStorageService;

  constructor() {
    this.certificateTypesRepository = new CertificateTypesRepository();
    this.certificateTemplatesRepository = new CertificateTemplatesRepository();
    this.certificatesRepository = new CertificatesRepository();
    this.templateStorageService = new TemplateStorageService();
  }

  async listCertificateTypes(input?: {
    status?:
      | typeof CERTIFICATE_MANAGEMENT_STATUS.ACTIVE
      | typeof CERTIFICATE_MANAGEMENT_STATUS.INACTIVE
      | typeof CERTIFICATE_MANAGEMENT_STATUS.ARCHIVED
      | typeof CERTIFICATE_MANAGEMENT_STATUS.DELETED;
    query?: string;
  }) {
    const items = await this.certificateTypesRepository.list(input);

    return {
      items: await Promise.all(
        items.map(async (item) => {
          const activeTemplate = item.currentTemplateId
            ? await this.certificateTemplatesRepository.findById(
                item.currentTemplateId,
              )
            : await this.certificateTemplatesRepository.findActiveByTypeId(
                item.id,
              );

          return {
            ...item.toJSON(),
            currentTemplate: activeTemplate ? activeTemplate.toJSON() : null,
          };
        }),
      ),
      total: items.length,
    };
  }

  async listTemplatesByTypeId(certificateTypeId: string) {
    const templates =
      await this.certificateTemplatesRepository.listByTypeId(certificateTypeId);

    return templates.map((template) => template.toJSON());
  }

  async findCertificateTypeById(certificateTypeId: string) {
    return this.certificateTypesRepository.findById(certificateTypeId);
  }

  async createCertificateType(input: {
    name: string;
    slug?: string;
    description?: string;
    legacyTokenType?: 'higienizacao' | 'impermeabilizacao';
    createdByAdminId: number;
  }) {
    const duplicatedByName =
      await this.certificateTypesRepository.findByNameInsensitive(input.name);

    if (
      duplicatedByName &&
      duplicatedByName.status !== CERTIFICATE_MANAGEMENT_STATUS.DELETED
    ) {
      throw new Error(CERTIFICATE_MANAGEMENT_ERRORS.DUPLICATE_TYPE_NAME);
    }

    const resolvedSlug = normalizeSlug(input.slug || input.name);
    const duplicatedBySlug =
      await this.certificateTypesRepository.findBySlug(resolvedSlug);

    if (
      duplicatedBySlug &&
      duplicatedBySlug.status !== CERTIFICATE_MANAGEMENT_STATUS.DELETED
    ) {
      throw new Error(CERTIFICATE_MANAGEMENT_ERRORS.DUPLICATE_TYPE_SLUG);
    }

    const created = await this.certificateTypesRepository.create({
      name: input.name.trim(),
      slug: resolvedSlug,
      description: input.description?.trim(),
      legacyTokenType: input.legacyTokenType,
      createdByAdminId: input.createdByAdminId,
      migrationState: TEMPLATE_MIGRATION_STATE.LEGACY_FALLBACK,
    });

    return created.toJSON();
  }

  async updateCertificateType(input: {
    id: string;
    name?: string;
    slug?: string;
    description?: string | null;
    legacyTokenType?: 'higienizacao' | 'impermeabilizacao' | null;
    status?:
      | typeof CERTIFICATE_MANAGEMENT_STATUS.ACTIVE
      | typeof CERTIFICATE_MANAGEMENT_STATUS.INACTIVE
      | typeof CERTIFICATE_MANAGEMENT_STATUS.ARCHIVED;
  }) {
    const existingType = await this.certificateTypesRepository.findById(
      input.id,
    );

    if (!existingType) {
      throw new Error(CERTIFICATE_MANAGEMENT_ERRORS.TYPE_NOT_FOUND);
    }

    if (input.name) {
      const duplicatedByName =
        await this.certificateTypesRepository.findByNameInsensitive(input.name);

      if (duplicatedByName && duplicatedByName.id !== input.id) {
        throw new Error(CERTIFICATE_MANAGEMENT_ERRORS.DUPLICATE_TYPE_NAME);
      }
    }

    const resolvedSlug = input.slug
      ? normalizeSlug(input.slug)
      : input.name
        ? normalizeSlug(input.name)
        : undefined;

    if (resolvedSlug) {
      const duplicatedBySlug =
        await this.certificateTypesRepository.findBySlug(resolvedSlug);

      if (duplicatedBySlug && duplicatedBySlug.id !== input.id) {
        throw new Error(CERTIFICATE_MANAGEMENT_ERRORS.DUPLICATE_TYPE_SLUG);
      }
    }

    const updated = await this.certificateTypesRepository.updateById(input.id, {
      name: input.name?.trim(),
      slug: resolvedSlug,
      description: input.description
        ? input.description.trim()
        : input.description,
      legacyTokenType: input.legacyTokenType,
      status: input.status,
    });

    return updated ? updated.toJSON() : null;
  }

  async deleteCertificateType(certificateTypeId: string) {
    const existingType =
      await this.certificateTypesRepository.findById(certificateTypeId);

    if (!existingType) {
      throw new Error(CERTIFICATE_MANAGEMENT_ERRORS.TYPE_NOT_FOUND);
    }

    const referenceSummary =
      await this.certificatesRepository.getActiveReferenceSummary({
        certificateTypeId,
      });

    if (hasActiveReferences(referenceSummary)) {
      await this.certificateTypesRepository.updateById(certificateTypeId, {
        status: CERTIFICATE_MANAGEMENT_STATUS.ARCHIVED,
        archivedAt: new Date(),
      });

      return {
        result: CERTIFICATE_MANAGEMENT_STATUS.ARCHIVED,
        referenceSummary,
      };
    }

    const templates =
      await this.certificateTemplatesRepository.listByTypeId(certificateTypeId);

    await Promise.all(
      templates.map(async (template) => {
        await this.templateStorageService.removeTemplateFile(
          template.storagePath,
        );
        await this.certificateTemplatesRepository.hardDelete(template.id);
      }),
    );

    await this.certificateTypesRepository.hardDelete(certificateTypeId);

    return {
      result: CERTIFICATE_MANAGEMENT_STATUS.DELETED,
      referenceSummary,
    };
  }

  async getTemplateStorageCompatibility() {
    return this.templateStorageService.getTemplateStorageCompatibility();
  }

  async classifyValidUploadAttempt(input: {
    isAuthenticated: boolean;
    certificateTypeId: string;
    file: TTemplateUploadFile | null;
  }) {
    const [storageCompatibility, certificateType] = await Promise.all([
      this.templateStorageService.getTemplateStorageCompatibility(),
      this.certificateTypesRepository.findById(input.certificateTypeId),
    ]);

    return this.templateStorageService.classifyValidTemplateUploadAttempt({
      isAuthenticated: input.isAuthenticated,
      mode: storageCompatibility.mode,
      certificateTypeExists: !!certificateType,
      file: input.file,
    });
  }

  async uploadCertificateTemplate(input: {
    certificateTypeId: string;
    file: TTemplateUploadFile;
    createdByAdminId: number;
  }) {
    const certificateType = await this.certificateTypesRepository.findById(
      input.certificateTypeId,
    );

    if (!certificateType) {
      throw new Error(CERTIFICATE_MANAGEMENT_ERRORS.TYPE_NOT_FOUND);
    }

    const persistedFile = await this.templateStorageService.persistTemplateFile(
      {
        certificateTypeId: input.certificateTypeId,
        file: input.file,
      },
    );

    const nextVersion =
      await this.certificateTemplatesRepository.getNextVersion(
        input.certificateTypeId,
      );

    const createdTemplate = await this.certificateTemplatesRepository.create({
      certificateTypeId: input.certificateTypeId,
      version: nextVersion,
      originalFileName: input.file.name,
      storagePath: persistedFile.storagePath,
      storageMode: persistedFile.storageMode,
      mimeType: persistedFile.mimeType,
      fileSizeBytes: persistedFile.fileSizeBytes,
      status: CERTIFICATE_MANAGEMENT_STATUS.INACTIVE,
      createdByAdminId: input.createdByAdminId,
    });

    const replacement = await this.replaceActiveTemplate(
      input.certificateTypeId,
      createdTemplate.id,
    );

    return {
      template: createdTemplate.toJSON(),
      replacement,
    };
  }

  async replaceActiveTemplate(certificateTypeId: string, templateId: string) {
    const template =
      await this.certificateTemplatesRepository.findById(templateId);

    if (!template || template.certificateTypeId !== certificateTypeId) {
      throw new Error(CERTIFICATE_MANAGEMENT_ERRORS.TEMPLATE_NOT_FOUND);
    }

    const previousActive =
      await this.certificateTemplatesRepository.findActiveByTypeId(
        certificateTypeId,
      );

    await this.certificateTemplatesRepository.setInactiveForTypeExcept(
      certificateTypeId,
      templateId,
    );

    await this.certificateTemplatesRepository.setStatus(
      templateId,
      CERTIFICATE_MANAGEMENT_STATUS.ACTIVE,
      {
        archivedAt: null,
        deletedAt: null,
      },
    );

    await this.certificateTypesRepository.updateById(certificateTypeId, {
      currentTemplateId: templateId,
      status: CERTIFICATE_MANAGEMENT_STATUS.ACTIVE,
    });

    return {
      activeTemplateId: templateId,
      previousTemplateId: previousActive?.id || null,
    };
  }

  async deleteCertificateTemplate(templateId: string) {
    const template =
      await this.certificateTemplatesRepository.findById(templateId);

    if (!template) {
      throw new Error(CERTIFICATE_MANAGEMENT_ERRORS.TEMPLATE_NOT_FOUND);
    }

    const referenceSummary =
      await this.certificatesRepository.getActiveReferenceSummary({
        certificateTypeId: template.certificateTypeId,
        templateId: template.id,
      });

    if (hasActiveReferences(referenceSummary)) {
      const archived = await this.certificateTemplatesRepository.setStatus(
        templateId,
        CERTIFICATE_MANAGEMENT_STATUS.ARCHIVED,
        {
          archivedAt: new Date(),
        },
      );

      return {
        result: CERTIFICATE_MANAGEMENT_STATUS.ARCHIVED,
        template: archived?.toJSON() || null,
        referenceSummary,
      };
    }

    await this.templateStorageService.removeTemplateFile(template.storagePath);
    await this.certificateTemplatesRepository.hardDelete(template.id);

    const certificateType = await this.certificateTypesRepository.findById(
      template.certificateTypeId,
    );

    if (certificateType?.currentTemplateId === template.id) {
      await this.certificateTypesRepository.updateById(
        template.certificateTypeId,
        {
          currentTemplateId: null,
        },
      );
    }

    return {
      result: CERTIFICATE_MANAGEMENT_STATUS.DELETED,
      template: template.toJSON(),
      referenceSummary,
    };
  }
}
