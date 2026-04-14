# Contract: Admin Certificate Type and Template Management

## Interface Style

- Interface type: authenticated server actions (`zsa`) in dashboard module.
- Consumer: admin dashboard UI.
- Authorization: admin-only via existing dashboard auth context.

## Action: getTemplateStorageCompatibility

- Purpose: Return current host capability for direct writes in `/public/pdf-templates`.
- Input: none.
- Output:
  - `isWritable` (boolean)
  - `mode` (`direct_upload` | `manual_publish`)
  - `checkedAt` (ISO datetime)
  - `reason` (string, optional)

## Action: listCertificateTypes

- Purpose: List types with lifecycle and current template summary.
- Input:
  - `status` (optional filter)
  - `query` (optional search)
- Output:
  - `items[]` with `id`, `name`, `slug`, `status`, `currentTemplate`, `updatedAt`
  - `total`

## Action: createCertificateType

- Purpose: Create a new certificate type.
- Input:
  - `name` (string, required)
  - `slug` (string, optional; generated if omitted)
  - `description` (string, optional)
  - `legacyTokenType` (optional)
- Output:
  - `id`, `name`, `slug`, `status`, `createdAt`
- Validation:
  - `name` unique (case-insensitive)
  - `slug` unique after normalization

## Action: updateCertificateType

- Purpose: Update editable metadata of a type.
- Input:
  - `id` (uuid)
  - `name` (optional)
  - `description` (optional)
  - `status` (optional, excluding `deleted`)
- Output:
  - updated type summary

## Action: deleteCertificateType

- Purpose: Delete-type operation with lifecycle-aware behavior.
- Input:
  - `id` (uuid)
- Output:
  - `result` (`archived` | `deleted`)
  - `reason` (optional)
  - `referenceCounts`
- Rules:
  - Archive/inactivate when references exist.
  - Hard delete only when no active references exist.
  - Last-write-wins for concurrent requests.

## Action: uploadCertificateTemplate

- Purpose: Upload and link a new template to a type.
- Input:
  - `certificateTypeId` (uuid)
  - `file` (PDF, max 10 MB)
- Output:
  - `templateId`, `certificateTypeId`, `version`, `storagePath`, `status`
- Rules:
  - Accept only PDF.
  - Enforce max size 10 MB.
  - Direct upload allowed only when storage mode is `direct_upload`.
  - Persist path as `/public/pdf-templates/{typeId}/{uuid}.pdf` in writable mode.

## Action: replaceActiveTemplate

- Purpose: Set a newly uploaded template as active for the type.
- Input:
  - `certificateTypeId` (uuid)
  - `templateId` (uuid)
- Output:
  - `activeTemplateId`, `previousTemplateId`
- Rules:
  - Exactly one active template per type.
  - Previous active template becomes inactive.

## Action: deleteCertificateTemplate

- Purpose: Delete-template operation with lifecycle-aware behavior.
- Input:
  - `templateId` (uuid)
- Output:
  - `result` (`archived` | `deleted`)
  - `reason` (optional)
  - `referenceCounts`
- Rules:
  - Archive/inactivate when active references exist.
  - Hard delete only when no active references exist.
  - Last-write-wins for concurrent requests.

## Error Contract

- Validation errors:
  - `INVALID_FILE_TYPE`
  - `FILE_TOO_LARGE`
  - `DUPLICATE_TYPE_NAME`
  - `DUPLICATE_TYPE_SLUG`
- Authorization errors:
  - `UNAUTHORIZED_ADMIN_REQUIRED`
- Environment errors:
  - `PUBLIC_STORAGE_NOT_WRITABLE`
- Domain errors:
  - `TYPE_NOT_FOUND`
  - `TEMPLATE_NOT_FOUND`
  - `ACTIVE_REFERENCES_PRESENT`
