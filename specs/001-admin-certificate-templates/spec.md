# Feature Specification: Admin Certificate Type and Template Management

**Feature Branch**: `[001-create-feature-branch]`  
**Created**: 2026-04-14  
**Status**: Draft  
**Input**: User description: "In the /dashboard route which is used by admins, we need to add an feature so admins can add new certificate types, add templates, delete, etc... Added templates will be stored in the /public folder when added, verify if cpanel supports that if not present some alternatives."

## Clarifications

### Session 2026-04-14

- Q: Qual estrategia de fallback para ambientes sem escrita em /public? → A: Bloquear upload e exigir publicacao manual por deploy/FTP.
- Q: Qual regra de exclusao para tipos/templates com referencias ativas? → A: Arquivar ou inativar quando houver referencias ativas; exclusao permanente apenas sem referencias.
- Q: Quais formatos e limite de tamanho devem ser aceitos no upload de template? → A: Apenas PDF com tamanho maximo de 10 MB.
- Q: Como tratar edicoes/delecoes concorrentes entre admins? → A: Last-write-wins sem aviso, onde a ultima gravacao bem-sucedida prevalece.
- Q: Qual padrao de nome e caminho deve ser usado para salvar templates? → A: Usar UUID em pasta por tipo, no padrao /public/pdf-templates/{typeId}/{uuid}.pdf.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Manage certificate types (Priority: P1)

As an admin, I can create, edit, archive, and permanently remove certificate types from the dashboard so the catalog of available certificate offerings stays current.

**Why this priority**: Certificate type management is the foundation for any template assignment and certificate issuance flow.

**Independent Test**: Can be fully tested by creating a new type, updating it, requesting deletion with active references (archive/inactivate), and requesting permanent deletion without references.

**Acceptance Scenarios**:

1. **Given** an authenticated admin is on the dashboard, **When** they create a new certificate type with valid data, **Then** the new type appears in the list and is selectable for future template assignment.
2. **Given** an existing certificate type, **When** the admin edits its details and saves, **Then** the updated values are shown consistently in the management list.
3. **Given** a certificate type currently used by existing certificates, **When** the admin requests deletion, **Then** the system archives or inactivates the type and preserves existing certificate references.
4. **Given** a certificate type without active references, **When** the admin confirms deletion, **Then** the system permanently removes the type.
5. **Given** two admins update the same certificate type nearly at the same time, **When** both save successfully, **Then** the latest successful save becomes the persisted state.

---

### User Story 2 - Manage templates for certificate types (Priority: P1)

As an admin, I can upload, replace, archive, and permanently remove templates associated with certificate types so certificate generation always uses the correct visual model.

**Why this priority**: Without template lifecycle management, certificate types cannot be operationally used for generation.

**Independent Test**: Can be fully tested by uploading a valid template to a type, replacing it, requesting deletion with active references (archive/inactivate), and permanently deleting a template without references.

**Acceptance Scenarios**:

1. **Given** a certificate type exists, **When** the admin uploads a valid PDF template up to 10 MB, **Then** the template is stored as `/public/pdf-templates/{typeId}/{uuid}.pdf` and linked to that type.
2. **Given** a type with an active template, **When** the admin uploads a replacement template, **Then** the new template becomes available for future generation and the old one is no longer active.
3. **Given** a template with active references, **When** the admin requests deletion, **Then** the system archives or inactivates the template and keeps historical references intact.
4. **Given** a template without active references, **When** the admin confirms deletion, **Then** the template is permanently removed.

---

### User Story 3 - Handle hosting compatibility for template storage (Priority: P2)

As an admin, I can see whether the hosting environment (including cPanel-based deployments) supports writing templates to the public folder and, if not, I receive clear manual publication guidance via deploy/FTP.

**Why this priority**: Environment compatibility prevents failed uploads in production and reduces operational uncertainty.

**Independent Test**: Can be fully tested by simulating a writable environment and a non-writable environment, confirming status detection and fallback guidance, and by validating that concurrent saves follow last-write-wins behavior.

**Acceptance Scenarios**:

1. **Given** the hosting environment allows writing to the configured public template path, **When** the admin opens template settings, **Then** the system displays that direct upload is supported.
2. **Given** the hosting environment does not allow direct writes, **When** the admin attempts to add a template, **Then** the system blocks direct upload and instructs manual publication via deploy or FTP.
3. **Given** direct upload is blocked, **When** the admin opens compatibility guidance, **Then** the system displays a clear manual publication checklist for deploy/FTP flow.

### Edge Cases

- What happens when an admin tries to create a certificate type with a duplicate name that differs only by letter casing?
- How does the system behave when an uploaded template is invalid, corrupted, non-PDF, or exceeds 10 MB?
- What happens when deletion is requested for a type or template that is currently referenced by active certificates?
- How does the system handle missing write permission, storage quota exhaustion, or path unavailability in cPanel environments?
- Concurrent updates or deletions by multiple admins follow last-write-wins; the latest successful operation defines the final state.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST provide an admin-only management area in the dashboard for certificate type and template operations.
- **FR-002**: The system MUST allow admins to create certificate types with required identifying information.
- **FR-003**: The system MUST prevent duplicate certificate type names within the same organization scope.
- **FR-004**: The system MUST allow admins to edit certificate type information.
- **FR-005**: The system MUST archive or inactivate certificate types with active references and allow permanent deletion only when there are no active references.
- **FR-006**: The system MUST allow admins to upload templates and associate each template with a certificate type.
- **FR-007**: The system MUST store uploaded templates in the configured public template location when direct write support is available.
- **FR-008**: The system MUST validate uploaded templates before saving and provide actionable error messages when validation fails.
- **FR-009**: The system MUST allow admins to replace an existing template linked to a certificate type.
- **FR-010**: The system MUST archive or inactivate templates with active references and allow permanent deletion only when there are no active references.
- **FR-011**: The system MUST assess and display whether the deployment environment supports writing templates to the public folder (including cPanel-hosted deployments).
- **FR-012**: The system MUST block in-dashboard template upload and provide manual publication guidance via deploy/FTP when direct writes to the public folder are not supported.
- **FR-013**: The system MUST restrict all certificate type and template management actions to authorized admins.
- **FR-014**: The system MUST present clear success and failure feedback for every management action.
- **FR-015**: The system MUST accept template uploads only in PDF format with a maximum file size of 10 MB and reject any other file with actionable validation feedback.
- **FR-016**: The system MUST apply last-write-wins for concurrent update or delete operations on the same certificate type or template, without conflict prompts.
- **FR-017**: The system MUST store each uploaded template using a generated UUID in a per-type directory following the path pattern `/public/pdf-templates/{typeId}/{uuid}.pdf`.

### Non-Functional Requirements _(mandatory)_

- **NFR-001 (Code Quality)**: Every change for this feature MUST pass defined quality gates before merge.
- **NFR-002 (UX Consistency)**: Management flows MUST provide loading, empty, success, validation-error, and failure states.
- **NFR-003 (Usability Performance)**: For 95% of operations, list refresh and form submission feedback MUST be visible within 2 seconds under normal operating conditions.
- **NFR-004 (Upload Responsiveness)**: For 95% of valid template files within the supported size limit, validation and completion feedback MUST be provided within 5 seconds.
- **NFR-005 (Operational Evidence)**: Release evidence MUST include results of admin permission checks, template lifecycle acceptance tests, and hosting compatibility validation (including cPanel scenario coverage).

### Key Entities _(include if feature involves data)_

- **Certificate Type**: Represents an admin-managed category of certificate, including name, lifecycle status (active, inactive, archived, deleted), and template linkage rules.
- **Template Asset**: Represents an uploaded certificate template with identity, association to a certificate type, lifecycle status (active, inactive, archived, deleted), reference usage, storage location mode, file format, file size, and deterministic storage path.
- **Storage Compatibility Status**: Represents the evaluated capability of the current hosting environment to support direct writes to the public template location.
- **Fallback Option**: Represents an approved alternative path used when direct public-folder writes are unavailable.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: At least 95% of admins can create a new certificate type and attach its first template in under 3 minutes on first attempt.
- **SC-002**: 100% of unauthorized users are prevented from performing certificate type or template management actions.
- **SC-003**: At least 99% of valid template upload attempts complete successfully in environments that support direct writes.
- **SC-004**: In environments without direct public-folder write support, 100% of blocked upload attempts show deploy/FTP manual publication guidance before the workflow ends.
- **SC-005**: Within the first month after release, support requests related to "cannot manage certificate templates" decrease by at least 40% compared with the previous month.
- **SC-006**: For 100% of deletion requests involving active references, the target is archived or inactivated without breaking historical certificate integrity.
- **SC-007**: In controlled concurrent-operation tests, 100% of simultaneous update/delete cases resolve to the latest successful write as the persisted final state.

## Assumptions

- Admin authentication and authorization for the dashboard already exist and remain unchanged.
- Existing certificate generation flows can consume templates from the configured storage mode without changing end-user interaction.
- Initial rollout supports one active template per certificate type at a time, with replacement supported.
- cPanel deployments may vary in filesystem permissions and quota policies; compatibility checks reflect the current deployment configuration.
- Template upload policy for v1 accepts only PDF files up to 10 MB.
- For v1 fallback, manual template publication via deploy/FTP is the only supported path when /public is not writable.
- For writable environments, template files are persisted only using UUID-based filenames inside per-type folders.
