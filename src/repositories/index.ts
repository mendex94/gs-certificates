/* eslint-disable no-unused-vars */
import { CertificateDTO } from '@/dtos/certificate';
import { CertificateTemplateDTO } from '@/dtos/certificate-template';
import { CertificateTypeDTO } from '@/dtos/certificate-type';
import type {
  TCertificateManagementStatus,
  TTemplateMigrationState,
  TTemplateStorageMode,
} from '@/constants/certificate-management';

export type TActiveReferenceSummary = {
  referencedCertificateCountAnyStatus: number;
  pendingRequestCount: number;
};

export interface ICertificatesRepository {
  createCertificate(certificate: CertificateDTO): Promise<CertificateDTO>;
  retrieveCertificateById(
    certificateId: string,
  ): Promise<CertificateDTO | null>;
  consumeGenerationToken(
    certificateId: string,
    userId: number,
  ): Promise<boolean>;
  getActiveReferenceSummary(input: {
    certificateTypeId: string;
    templateId?: string;
  }): Promise<TActiveReferenceSummary>;
}

export interface ICertificateTypesRepository {
  list(input?: {
    status?: TCertificateManagementStatus;
    query?: string;
  }): Promise<CertificateTypeDTO[]>;
  findById(id: string): Promise<CertificateTypeDTO | null>;
  findByNameInsensitive(name: string): Promise<CertificateTypeDTO | null>;
  findBySlug(slug: string): Promise<CertificateTypeDTO | null>;
  create(input: {
    name: string;
    slug: string;
    description?: string;
    legacyTokenType?: string;
    createdByAdminId: number;
    migrationState?: TTemplateMigrationState;
  }): Promise<CertificateTypeDTO>;
  updateById(
    id: string,
    input: {
      name?: string;
      slug?: string;
      description?: string | null;
      legacyTokenType?: string | null;
      status?: TCertificateManagementStatus;
      migrationState?: TTemplateMigrationState;
      currentTemplateId?: string | null;
      archivedAt?: Date | null;
      deletedAt?: Date | null;
      backfillCompletedAt?: Date | null;
    },
  ): Promise<CertificateTypeDTO | null>;
  hardDelete(id: string): Promise<boolean>;
  countByMigrationState(state: TTemplateMigrationState): Promise<number>;
  listByMigrationState(
    state: TTemplateMigrationState,
    limit: number,
  ): Promise<CertificateTypeDTO[]>;
}

export interface ICertificateTemplatesRepository {
  listByTypeId(certificateTypeId: string): Promise<CertificateTemplateDTO[]>;
  findById(id: string): Promise<CertificateTemplateDTO | null>;
  findActiveByTypeId(
    certificateTypeId: string,
  ): Promise<CertificateTemplateDTO | null>;
  findLatestActiveByLegacyTokenType(
    legacyTokenType: string,
  ): Promise<CertificateTemplateDTO | null>;
  getNextVersion(certificateTypeId: string): Promise<number>;
  create(input: {
    certificateTypeId: string;
    version: number;
    originalFileName: string;
    storagePath: string;
    storageMode: TTemplateStorageMode;
    mimeType: string;
    fileSizeBytes: number;
    status?: TCertificateManagementStatus;
    createdByAdminId: number;
  }): Promise<CertificateTemplateDTO>;
  setStatus(
    templateId: string,
    status: TCertificateManagementStatus,
    optionalDates?: {
      archivedAt?: Date | null;
      deletedAt?: Date | null;
    },
  ): Promise<CertificateTemplateDTO | null>;
  setInactiveForTypeExcept(
    certificateTypeId: string,
    exceptTemplateId: string,
  ): Promise<void>;
  hardDelete(templateId: string): Promise<boolean>;
}

export interface IUsersRepository {
  createUser(userId: number): Promise<{ id: number }>;
  findById(userId: number): Promise<{ id: number }>;
  findTokenBalancesByUserId(
    userId: number,
  ): Promise<{ type: string; balance: number }[]>;
  findTokenBalance(
    userId: number,
    type: string,
  ): Promise<{ userId: number; type: string; balance: number }>;
  createTokenBalance(
    userId: number,
    type: string,
    balance: number,
  ): Promise<void>;
  updateTokenBalance(
    userId: number,
    type: string,
    balance: number,
  ): Promise<void>;
}

export interface IDashboardRepository {
  getTotalCertificates(): Promise<number>;
  getUniqueUsersWithCertificates(): Promise<number>;
  getTotalUsers(): Promise<number>;
}

export { CertificatesRepository } from './certificatesRepository';
export { UsersRepository } from './userRepository';
export { DashboardRepository } from './dashboardRepository';
export { CertificateTypesRepository } from './certificateTypesRepository';
export { CertificateTemplatesRepository } from './certificateTemplatesRepository';
