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

- [ ] T001 Create admin feature module folders in `src/app/dashboard/certificate-types/` and `src/app/_components/organisms/`
- [ ] T002 Create shared domain constants and status enums in `src/constants/certificate-management.ts`
- [ ] T003 [P] Add repository/service export placeholders for new admin feature modules in `src/repositories/index.ts` and `src/services/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build core metadata, persistence, and action plumbing required by all user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Extend relational schema for `certificate_types` and `certificate_templates` in `src/lib/db/schema.ts`
- [ ] T005 Create migration for certificate type/template metadata in `drizzle/migrations/0007_admin_certificate_templates.sql`
- [ ] T006 [P] Create DTOs for certificate type and template entities in `src/dtos/certificate-type.ts` and `src/dtos/certificate-template.ts`
- [ ] T007 [P] Implement certificate type repository with lifecycle-aware operations in `src/repositories/certificateTypesRepository.ts`
- [ ] T008 [P] Implement certificate template repository with version and reference queries in `src/repositories/certificateTemplatesRepository.ts`
- [ ] T009 Implement storage compatibility and UUID-path helper service in `src/services/templateStorageService.ts`
- [ ] T010 Implement admin orchestration service for type/template lifecycle rules in `src/services/certificateTypeAdminService.ts`
- [ ] T011 Add zod schemas for admin certificate type/template actions in `src/app/_lib/validation-shemas/certificate-management.ts`
- [ ] T012 Add authenticated server action scaffold for certificate management in `src/app/dashboard/certificate-types/action.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Manage certificate types (Priority: P1) 🎯 MVP

**Goal**: Allow admins to list, create, update, archive, and hard-delete certificate types with reference-aware lifecycle behavior

**Independent Test**: Create a new type, edit it, attempt delete with active references (archive/inactivate expected), and hard-delete a type without active references

### Implementation for User Story 1

- [ ] T013 [US1] Implement list and create certificate type actions in `src/app/dashboard/certificate-types/action.ts`
- [ ] T014 [US1] Implement update and status transition actions for certificate types in `src/app/dashboard/certificate-types/action.ts`
- [ ] T015 [US1] Implement archive-or-delete decision logic for types with active references in `src/services/certificateTypeAdminService.ts`
- [ ] T016 [P] [US1] Create certificate type table UI with loading/empty/error/success states in `src/app/_components/organisms/CertificateTypeTable.tsx`
- [ ] T017 [P] [US1] Create certificate type create/edit form UI in `src/app/_components/organisms/CertificateTypeForm.tsx`
- [ ] T018 [US1] Compose dashboard type management page and wire actions/hooks in `src/app/dashboard/certificate-types/page.tsx`
- [ ] T019 [US1] Add navigation entry from admin dashboard to certificate type management in `src/app/dashboard/page.tsx`
- [ ] T020 [US1] Update independent validation steps for type lifecycle in `specs/001-admin-certificate-templates/quickstart.md`

**Checkpoint**: User Story 1 is independently functional and testable

---

## Phase 4: User Story 2 - Manage templates for certificate types (Priority: P1)

**Goal**: Allow admins to upload, replace, archive, and hard-delete templates per type with PDF/size validation and UUID path persistence

**Independent Test**: Upload a valid PDF <=10 MB, replace active template, attempt delete with references (archive/inactivate), hard-delete template without references

### Implementation for User Story 2

- [ ] T021 [US2] Implement template upload action with PDF/MIME/size validation in `src/app/dashboard/certificate-types/action.ts`
- [ ] T022 [US2] Implement UUID-per-type file persistence (`/public/pdf-templates/{typeId}/{uuid}.pdf`) in `src/services/templateStorageService.ts`
- [ ] T023 [US2] Implement replace-active-template flow (single active template rule) in `src/services/certificateTypeAdminService.ts`
- [ ] T024 [US2] Implement archive-or-delete template lifecycle with active reference checks in `src/services/certificateTypeAdminService.ts`
- [ ] T025 [P] [US2] Create template upload and replace UI component in `src/app/_components/organisms/CertificateTemplateUpload.tsx`
- [ ] T026 [P] [US2] Create template list/history actions UI component in `src/app/_components/organisms/CertificateTemplateList.tsx`
- [ ] T027 [US2] Integrate template management section into certificate types page in `src/app/dashboard/certificate-types/page.tsx`
- [ ] T028 [US2] Update PDF generation to resolve active template from metadata path in `src/services/certificatePdfService.ts`
- [ ] T029 [US2] Add independent validation steps for upload/replace/delete template flows in `specs/001-admin-certificate-templates/quickstart.md`

**Checkpoint**: User Story 2 is independently functional and testable

---

## Phase 5: User Story 3 - Handle hosting compatibility for template storage (Priority: P2)

**Goal**: Detect runtime write capability for `/public/pdf-templates`, block direct upload in non-writable hosts, and show deploy/FTP manual guidance

**Independent Test**: Simulate writable and non-writable environments; verify mode status, blocked upload behavior, and guidance display

### Implementation for User Story 3

- [ ] T030 [US3] Implement runtime compatibility probe for public template storage in `src/services/templateStorageService.ts`
- [ ] T031 [US3] Implement storage compatibility action and upload-blocking behavior for `manual_publish` mode in `src/app/dashboard/certificate-types/action.ts`
- [ ] T032 [P] [US3] Create compatibility status and deploy/FTP guidance card in `src/app/_components/organisms/TemplateStorageCompatibilityCard.tsx`
- [ ] T033 [US3] Integrate compatibility status and blocked-upload UX messaging in `src/app/dashboard/certificate-types/page.tsx`
- [ ] T034 [US3] Add independent validation steps for writable/non-writable host scenarios in `specs/001-admin-certificate-templates/quickstart.md`

**Checkpoint**: User Story 3 is independently functional and testable

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality, consistency, security, and performance checks across all stories

- [ ] T035 [P] Align contract details with implemented actions and error codes in `specs/001-admin-certificate-templates/contracts/admin-certificate-management.md`
- [ ] T036 Validate loading/empty/error/success states and keyboard/focus accessibility across admin screens in `src/app/dashboard/certificate-types/page.tsx`
- [ ] T037 Harden upload security checks (content validation and path sanitization) in `src/services/templateStorageService.ts` and `src/app/dashboard/certificate-types/action.ts`
- [ ] T038 Run quality gates (`pnpm lint` and `pnpm build`) and record evidence in `specs/001-admin-certificate-templates/quickstart.md`
- [ ] T039 Measure and record admin action latency/upload feedback evidence for NFR targets in `specs/001-admin-certificate-templates/quickstart.md`

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

- Actions and service rules before page composition
- Page composition before scenario validation updates
- Security/consistency/performance checks after core implementation

### Parallel Opportunities

- Setup: T003
- Foundational: T006, T007, T008
- US1: T016, T017
- US2: T025, T026
- US3: T032
- Polish: T035

---

## Parallel Example: User Story 1

```bash
# Run in parallel after T015 is in progress:
T016 [P] [US1] src/app/_components/organisms/CertificateTypeTable.tsx
T017 [P] [US1] src/app/_components/organisms/CertificateTypeForm.tsx
```

## Parallel Example: User Story 2

```bash
# Run in parallel after T024 is in progress:
T025 [P] [US2] src/app/_components/organisms/CertificateTemplateUpload.tsx
T026 [P] [US2] src/app/_components/organisms/CertificateTemplateList.tsx
```

## Parallel Example: User Story 3

```bash
# Run in parallel after T031 is in progress:
T032 [P] [US3] src/app/_components/organisms/TemplateStorageCompatibilityCard.tsx
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
- Quality, UX consistency, performance, and security validation are explicitly included
