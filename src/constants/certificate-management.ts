export const CERTIFICATE_MANAGEMENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived',
  DELETED: 'deleted',
} as const;

export type TCertificateManagementStatus =
  (typeof CERTIFICATE_MANAGEMENT_STATUS)[keyof typeof CERTIFICATE_MANAGEMENT_STATUS];

export const TEMPLATE_STORAGE_MODE = {
  DIRECT_UPLOAD: 'direct_upload',
  MANUAL_PUBLISH: 'manual_publish',
} as const;

export type TTemplateStorageMode =
  (typeof TEMPLATE_STORAGE_MODE)[keyof typeof TEMPLATE_STORAGE_MODE];

export const TEMPLATE_MIGRATION_STATE = {
  LEGACY_FALLBACK: 'legacy_fallback',
  BACKFILLED: 'backfilled',
} as const;

export type TTemplateMigrationState =
  (typeof TEMPLATE_MIGRATION_STATE)[keyof typeof TEMPLATE_MIGRATION_STATE];

export const TEMPLATE_REFERENCE_REQUEST_STATUS = {
  PENDING: 'pending',
  PROCESSED: 'processed',
  CANCELED: 'canceled',
} as const;

export type TTemplateReferenceRequestStatus =
  (typeof TEMPLATE_REFERENCE_REQUEST_STATUS)[keyof typeof TEMPLATE_REFERENCE_REQUEST_STATUS];

export const CERTIFICATE_MANAGEMENT_ERRORS = {
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  DUPLICATE_TYPE_NAME: 'DUPLICATE_TYPE_NAME',
  DUPLICATE_TYPE_SLUG: 'DUPLICATE_TYPE_SLUG',
  UNAUTHORIZED_ADMIN_REQUIRED: 'UNAUTHORIZED_ADMIN_REQUIRED',
  PUBLIC_STORAGE_NOT_WRITABLE: 'PUBLIC_STORAGE_NOT_WRITABLE',
  TYPE_NOT_FOUND: 'TYPE_NOT_FOUND',
  TEMPLATE_NOT_FOUND: 'TEMPLATE_NOT_FOUND',
  ACTIVE_REFERENCES_PRESENT: 'ACTIVE_REFERENCES_PRESENT',
  LEGACY_FALLBACK_CUTOFF_REACHED: 'LEGACY_FALLBACK_CUTOFF_REACHED',
  BACKFILL_INCOMPLETE_AT_CUTOFF: 'BACKFILL_INCOMPLETE_AT_CUTOFF',
} as const;

export const TEMPLATE_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const TEMPLATE_ALLOWED_MIME_TYPE = 'application/pdf';

export const TEMPLATE_ALLOWED_EXTENSION = '.pdf';

export const TEMPLATE_STORAGE_ROOT_SEGMENT = 'pdf-templates';

export const MANUAL_PUBLICATION_CHECKLIST = [
  'Gerar o arquivo PDF localmente com nome UUID.',
  'Publicar via deploy ou FTP para /public/pdf-templates/{typeId}/{uuid}.pdf.',
  'Confirmar permissao de leitura publica do arquivo no host.',
  'Atualizar metadados do template no painel administrativo.',
] as const;

export const TELEMETRY_EVENT = {
  TEMPLATE_UPLOAD_ATTEMPT: 'template_upload_attempt',
  TEMPLATE_UPLOAD_SUCCESS: 'template_upload_success',
  TEMPLATE_UPLOAD_FAILURE: 'template_upload_failure',
} as const;
