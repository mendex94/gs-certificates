# Data Model: Admin Certificate Type and Template Management

## Entity: CertificateType

- Purpose: Admin-managed certificate category used to organize templates and issuance behavior.
- Fields:
  - `id` (uuid, primary key)
  - `name` (string, required, unique within tenant scope, case-insensitive)
  - `slug` (string, required, unique, normalized)
  - `description` (string, optional)
  - `legacyTokenType` (string, optional, maps to existing enum values when applicable)
  - `status` (enum: `active`, `inactive`, `archived`, `deleted`)
  - `currentTemplateId` (uuid, nullable, FK -> CertificateTemplate.id)
  - `createdByAdminId` (number, required)
  - `createdAt` (timestamp, required)
  - `updatedAt` (timestamp, required)
  - `archivedAt` (timestamp, nullable)
  - `deletedAt` (timestamp, nullable)
- Validation rules:
  - `name` cannot be blank.
  - `name` uniqueness is case-insensitive.
  - `slug` must be normalized and unique.
  - Hard delete allowed only when active references count is zero.
- Relationships:
  - One-to-many with CertificateTemplate.
  - Optional current active template via `currentTemplateId`.

## Entity: CertificateTemplate

- Purpose: Versioned template asset linked to a certificate type.
- Fields:
  - `id` (uuid, primary key)
  - `certificateTypeId` (uuid, required, FK -> CertificateType.id)
  - `version` (integer, required, incremental per type)
  - `originalFileName` (string, required)
  - `storagePath` (string, required, pattern `/public/pdf-templates/{typeId}/{uuid}.pdf` in writable mode)
  - `storageMode` (enum: `public_write`, `manual_publish`)
  - `mimeType` (string, required, must be `application/pdf`)
  - `fileSizeBytes` (integer, required, <= 10485760)
  - `status` (enum: `active`, `inactive`, `archived`, `deleted`)
  - `createdByAdminId` (number, required)
  - `createdAt` (timestamp, required)
  - `updatedAt` (timestamp, required)
  - `archivedAt` (timestamp, nullable)
  - `deletedAt` (timestamp, nullable)
- Validation rules:
  - Only PDF uploads are accepted.
  - Max size is 10 MB.
  - Exactly one active template per certificate type.
  - Hard delete allowed only when active references count is zero.
- Relationships:
  - Many-to-one with CertificateType.

## Value Object: StorageCompatibilityStatus

- Purpose: Runtime compatibility report for template persistence in host environment.
- Fields:
  - `isWritable` (boolean)
  - `mode` (enum: `direct_upload`, `manual_publish`)
  - `checkedAt` (timestamp)
  - `reason` (string, optional)
- Validation rules:
  - `mode=direct_upload` only when `isWritable=true`.
  - `mode=manual_publish` must include actionable guidance reference.

## Reference Model: ActiveReferenceSummary

- Purpose: Aggregated counts to decide archive vs hard delete behavior.
- Fields:
  - `certificateTypeId` (uuid)
  - `templateId` (uuid, optional)
  - `activeCertificateCount` (integer)
  - `activeTemplateUsageCount` (integer)
- Validation rules:
  - Hard delete allowed only when all counts are zero.

## State Transitions

### CertificateType

- `active -> inactive`: admin explicitly disables type.
- `active|inactive -> archived`: delete requested while references exist.
- `inactive|archived -> deleted`: hard delete requested with zero references.
- `archived -> active|inactive`: optional restore flow if enabled.

### CertificateTemplate

- `active -> inactive`: replaced by newer template.
- `active|inactive -> archived`: delete requested while references exist.
- `inactive|archived -> deleted`: hard delete with zero references.
- `inactive -> active`: promoted to current template (demote previous active).
