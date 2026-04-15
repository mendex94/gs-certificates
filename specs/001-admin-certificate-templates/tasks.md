# Tasks: Admin Certificate Type and Template Management

**Input**: Design documents from `/specs/001-admin-certificate-templates/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No explicit request for automated test creation was made in the feature spec. This task list includes mandatory quality, UX consistency, security, and performance validation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare feature module structure and shared constants for implementation

- [x] T001 Create dashboard feature placeholders in `src/app/dashboard/certificate-types/page.tsx` and `src/app/dashboard/certificate-types/action.ts`
- [x] T002 Create shared constants for lifecycle, storage mode, and domain errors in `src/constants/certificate-management.ts`
- [x] T003 [P] Add environment accessors for fallback cutoff/backfill configuration in `src/utils/env.ts`
- [x] T004 [P] Add repository/service export placeholders for admin feature modules in `src/repositories/index.ts` and `src/services/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build core metadata, persistence, and action plumbing required by all user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Extend relational schema for `certificate_types`, `certificate_templates`, and migration policy fields in `src/lib/db/schema.ts`
- [x] T006 Create migration for certificate type/template metadata and indexes in `drizzle/migrations/0007_admin_certificate_templates.sql`
- [x] T007 [P] Create admin DTOs for certificate types and templates in `src/dtos/certificate-type.ts` and `src/dtos/certificate-template.ts`
- [x] T008 [P] Implement certificate type repository lifecycle queries in `src/repositories/certificateTypesRepository.ts`
- [x] T009 [P] Implement certificate template repository version/reference queries in `src/repositories/certificateTemplatesRepository.ts`
- [x] T010 Implement active-reference aggregation (any-status certificates + pending requests) in `src/repositories/certificatesRepository.ts`
- [x] T011 Implement storage compatibility probe and UUID path helper in `src/services/templateStorageService.ts`
- [x] T012 Implement incremental backfill and cutoff enforcement in `src/services/templateBackfillService.ts`
- [x] T013 Implement orchestration rules (archive/inactivate/delete + last-write-wins) in `src/services/certificateTypeAdminService.ts`
- [x] T014 Add zod schemas for all admin certificate management actions in `src/app/_lib/validation-shemas/certificate-management.ts`
- [x] T015 Add authenticated server actions for type/template lifecycle operations in `src/app/dashboard/certificate-types/action.ts`
- [x] T016 Add `getLegacyBackfillStatus` and `runLegacyBackfillBatch` actions in `src/app/dashboard/certificate-types/action.ts`
- [x] T017 Implement valid upload-attempt classification helper for SC-003 denominator in `src/services/templateStorageService.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Manage certificate types (Priority: P1) 🎯 MVP

**Goal**: Allow admins to list, create, update, archive, and hard-delete certificate types with reference-aware lifecycle behavior

**Independent Test**: Create a new type, edit it, attempt delete with active references (archive/inactivate expected), and hard-delete a type without active references

### Implementation for User Story 1

- [x] T018 [US1] Implement `listCertificateTypes` and `createCertificateType` handlers in `src/app/dashboard/certificate-types/action.ts`
- [x] T019 [US1] Implement `updateCertificateType` handler with slug normalization/edit-before-save rules in `src/app/dashboard/certificate-types/action.ts`
- [x] T020 [US1] Implement `deleteCertificateType` handler returning `archived|deleted` with reference summary in `src/app/dashboard/certificate-types/action.ts`
- [x] T021 [P] [US1] Create certificate type table UI with loading/empty/error/success states in `src/app/_components/organisms/CertificateTypeTable.tsx`
- [x] T022 [P] [US1] Create certificate type create/edit form with required/optional fields in `src/app/_components/organisms/CertificateTypeForm.tsx`
- [x] T023 [US1] Compose certificate type management page and data-refresh flow in `src/app/dashboard/certificate-types/page.tsx`
- [x] T024 [US1] Add navigation entry from admin dashboard in `src/app/dashboard/page.tsx`
- [x] T025 [US1] Add action feedback mapping (success/validation/failure) in `src/app/dashboard/certificate-types/page.tsx`
- [x] T026 [US1] Update independent validation steps for type lifecycle and SC-006 evidence in `specs/001-admin-certificate-templates/quickstart.md`

**Checkpoint**: User Story 1 is independently functional and testable

---

## Phase 4: User Story 2 - Manage templates for certificate types (Priority: P1)

**Goal**: Allow admins to upload, replace, archive, and hard-delete templates per type with PDF/size validation and UUID path persistence

**Independent Test**: Upload a valid PDF <=10 MB, replace active template, attempt delete with references (archive/inactivate), hard-delete template without references

### Implementation for User Story 2

- [x] T027 [US2] Implement `uploadCertificateTemplate` action preconditions for direct upload and valid file in `src/app/dashboard/certificate-types/action.ts`
- [x] T028 [US2] Implement UUID-per-type file persistence (`/public/pdf-templates/{typeId}/{uuid}.pdf`) in `src/services/templateStorageService.ts`
- [x] T029 [US2] Implement `replaceActiveTemplate` lifecycle rule (single active template per type) in `src/services/certificateTypeAdminService.ts`
- [x] T030 [US2] Implement `deleteCertificateTemplate` lifecycle with active-reference checks in `src/services/certificateTypeAdminService.ts`
- [x] T031 [US2] Update certificate PDF resolution to metadata path with temporary legacy fallback in `src/services/certificatePdfService.ts`
- [x] T032 [P] [US2] Create template upload/replace component with validation feedback in `src/app/_components/organisms/CertificateTemplateUpload.tsx`
- [x] T033 [P] [US2] Create template list/history component with archive/delete actions in `src/app/_components/organisms/CertificateTemplateList.tsx`
- [x] T034 [US2] Integrate template management section into certificate type page in `src/app/dashboard/certificate-types/page.tsx`
- [x] T035 [US2] Emit telemetry markers for SC-003 valid-attempt denominator in `src/app/dashboard/certificate-types/action.ts` and `src/utils/logger.ts`
- [x] T036 [US2] Update independent validation for upload/replace/delete and SC-003 evidence in `specs/001-admin-certificate-templates/quickstart.md`

**Checkpoint**: User Story 2 is independently functional and testable

---

## Phase 5: User Story 3 - Handle hosting compatibility for template storage (Priority: P2)

**Goal**: Detect runtime write capability for `/public/pdf-templates`, block direct upload in non-writable hosts, and show deploy/FTP manual guidance

**Independent Test**: Simulate writable and non-writable environments; verify mode status, blocked upload behavior, and guidance display

### Implementation for User Story 3

- [x] T037 [US3] Implement `getTemplateStorageCompatibility` runtime check flow in `src/services/templateStorageService.ts`
- [x] T038 [US3] Enforce upload blocking and deploy/FTP guidance for `manual_publish` mode in `src/app/dashboard/certificate-types/action.ts`
- [x] T039 [P] [US3] Create compatibility status and manual publication guidance card in `src/app/_components/organisms/TemplateStorageCompatibilityCard.tsx`
- [x] T040 [P] [US3] Create legacy backfill status card with cutoff indicators in `src/app/_components/organisms/LegacyBackfillStatusCard.tsx`
- [x] T041 [US3] Integrate compatibility/backfill cards and blocked-upload UX in `src/app/dashboard/certificate-types/page.tsx`
- [x] T042 [US3] Expose manual publication checklist copy and fallback state in `src/app/dashboard/certificate-types/page.tsx`
- [x] T043 [US3] Update independent validation for writable/non-writable host and manual publication evidence in `specs/001-admin-certificate-templates/quickstart.md`

**Checkpoint**: User Story 3 is independently functional and testable

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality, consistency, security, and performance checks across all stories

- [x] T044 [P] Align contract details and error codes with implemented actions in `specs/001-admin-certificate-templates/contracts/admin-certificate-management.md`
- [x] T045 Validate loading/empty/error/success and keyboard/focus behavior across `src/app/dashboard/certificate-types/page.tsx`, `src/app/_components/organisms/CertificateTypeForm.tsx`, `src/app/_components/organisms/CertificateTypeTable.tsx`, `src/app/_components/organisms/CertificateTemplateUpload.tsx`, and `src/app/_components/organisms/CertificateTemplateList.tsx`
- [x] T046 Harden upload security checks (file signature, path sanitization, server-side size enforcement) in `src/services/templateStorageService.ts` and `src/app/dashboard/certificate-types/action.ts`
- [x] T047 Validate last-write-wins behavior with reproducible concurrent-operation evidence in `specs/001-admin-certificate-templates/quickstart.md`
- [x] T048 Run quality gates (`pnpm lint` and `pnpm build`) and record outcomes in `specs/001-admin-certificate-templates/quickstart.md`
- [x] T049 Record SC-001, SC-003, SC-007, and SC-008 evidence mapping in `specs/001-admin-certificate-templates/quickstart.md`
- [x] T050 Document migration cutoff runbook (pre-cutoff checks, cutoff-day checks, remediation path) in `specs/001-admin-certificate-templates/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - can start immediately
- **Phase 2 (Foundational)**: Depends on Setup completion - blocks all user stories
- **Phase 3 (US1)**: Depends on Foundational completion
- **Phase 4 (US2)**: Depends on Foundational completion (can start with seeded/existing type data)
- **Phase 5 (US3)**: Depends on Foundational completion (can run in parallel with US1/US2)
- **Phase 6 (Polish)**: Depends on completion of all target user stories

### User Story Dependencies

- **US1 (P1)**: No dependency on other user stories after Foundational phase
- **US2 (P1)**: No strict dependency on US1 implementation; requires certificate type records from seed or existing data
- **US3 (P2)**: No strict dependency on US1/US2 implementation after Foundational phase

### Within Each User Story

- Action/service rules before page composition
- UI components before page integration
- Page integration before scenario validation updates

### Parallel Opportunities

- Setup: T003, T004
- Foundational: T007, T008, T009
- US1: T021, T022
- US2: T032, T033
- US3: T039, T040
- Polish: T044

---

## Parallel Example: User Story 1

```bash
# Run in parallel after T020 is in progress:
T021 [P] [US1] src/app/_components/organisms/CertificateTypeTable.tsx
T022 [P] [US1] src/app/_components/organisms/CertificateTypeForm.tsx
```

## Parallel Example: User Story 2

```bash
# Run in parallel after T031 is in progress:
T032 [P] [US2] src/app/_components/organisms/CertificateTemplateUpload.tsx
T033 [P] [US2] src/app/_components/organisms/CertificateTemplateList.tsx
```

## Parallel Example: User Story 3

```bash
# Run in parallel after T038 is in progress:
T039 [P] [US3] src/app/_components/organisms/TemplateStorageCompatibilityCard.tsx
T040 [P] [US3] src/app/_components/organisms/LegacyBackfillStatusCard.tsx
```

---

## Implementation Strategy

### MVP First (US1)

1. Complete Phase 1 and Phase 2
2. Deliver Phase 3 (US1)
3. Validate US1 independent scenarios before moving on

### Incremental Delivery

1. Foundation ready (Phases 1-2)
2. Deliver US1 (MVP)
3. Deliver US2
4. Deliver US3
5. Execute Phase 6 polish tasks before final merge

### Parallel Team Strategy

1. Team completes Phases 1-2 together
2. After foundation:
   - Developer A: US1 tasks
   - Developer B: US2 tasks
   - Developer C: US3 tasks
3. Converge for Phase 6 cross-cutting validation

---

## Notes

- All tasks use the required checklist format with sequential IDs
- [P] tasks are limited to independent files with no incomplete-task dependency
- Story labels are applied only to user story phases
- Quality, UX consistency, performance, migration cutoff governance, and security validation are explicitly included
