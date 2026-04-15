# Quickstart: Admin Certificate Type and Template Management

## 1) Prepare environment

1. Install dependencies.
2. Ensure database is reachable.
3. Ensure `public/pdf-templates` exists for writable-mode testing.
4. Run pending database migrations.

## 2) Apply migration

1. Run migration:
   - `pnpm drizzle:migrate`
2. Confirm new metadata structures:
   - `certificate_types`
   - `certificate_templates`
   - `certificate_pending_requests`
   - `certificate_management_status`
   - `template_storage_mode`
   - `template_migration_state`
   - `template_reference_request_status`

## 3) Run application

1. Start dev server:
   - `pnpm dev`
2. Access dashboard as admin user.

## 4) Validate US1 (certificate type lifecycle)

1. Create certificate type:
   - Open dashboard certificate type management.
   - Create a new type with unique name.
   - Confirm type appears in list.
2. Update certificate type:
   - Edit `name`, optional `slug`, optional `description`.
   - Confirm updated values are persisted.
3. Delete with references:
   - Trigger delete on a type with active references.
   - Confirm result is `archived`.
4. Delete without references:
   - Trigger delete on a type without references.
   - Confirm hard delete succeeds.

## 5) Validate US2 (template lifecycle)

1. Upload template (writable mode):
   - Upload a PDF <= 10 MB.
   - Confirm stored path follows `/public/pdf-templates/{typeId}/{uuid}.pdf`.
   - Confirm type shows active template.
2. Replace template:
   - Upload replacement template for same type.
   - Confirm new template is active and previous template is inactive.
3. Delete with references:
   - Trigger delete on template with active references.
   - Confirm result is archive/inactivate, not hard delete.
4. Delete without references:
   - Trigger delete on template without references.
   - Confirm hard delete succeeds.

## 6) Validate US3 (hosting compatibility and fallback)

1. Simulate no write permission for `public/pdf-templates`.
2. Open storage compatibility status.
3. Confirm mode is `manual_publish`.
4. Try upload and confirm operation is blocked with deploy/FTP guidance.

## 7) Validate concurrency behavior (SC-007)

1. Open same type in two admin sessions.
2. Submit conflicting updates near-simultaneously.
3. Confirm persisted state follows last-write-wins.
4. Repeat for template update/delete races.

## 8) Validate legacy migration behavior (SC-008)

1. Enable temporary legacy fallback with configured cutoff date.
2. Run incremental backfill batches.
3. Confirm legacy records are progressively mapped to metadata entities.
4. Confirm fallback remains enabled only until cutoff.
5. Confirm behavior when cutoff is reached with pending items.

## 9) Security and UX validations

1. Unauthorized checks (SC-002/NFR-005):
   - Call each admin action without admin context.
   - Confirm `UNAUTHORIZED_ADMIN_REQUIRED`.
2. Upload hardening:
   - Invalid mime type -> `INVALID_FILE_TYPE`.
   - Oversized file -> `FILE_TOO_LARGE`.
   - Invalid PDF signature -> `INVALID_FILE_TYPE`.
3. UX consistency (NFR-002):
   - Validate loading/empty/success/validation-error/failure states.
   - Validate visible focus and keyboard navigation.

## 10) Quality gates before PR

1. Run lint:
   - `pnpm lint`
2. Run build:
   - `pnpm build`
3. Attach evidence in PR:
   - Admin flow logs for loading/empty/error/success states.
   - Storage compatibility validation evidence.
   - Upload validation evidence (invalid type, oversize, invalid signature).
   - Performance spot-check evidence for critical admin actions.

## 11) SC evidence mapping

- SC-001: End-to-end timing for create type + first template attach.
- SC-003: Success ratio over denominator where `denominatorEligible=true`.
- SC-007: Concurrent runs proving final persisted winner.
- SC-008: Backfill reaches 100% before cutoff.

## 12) Cutoff runbook (T050)

### Pre-cutoff checks

1. Verify `remainingItems` trend to zero.
2. Validate manual fallback guidance.
3. Confirm upload telemetry ingestion.

### Cutoff-day checks

1. Confirm `LEGACY_FALLBACK_CUTOFF_AT` reached.
2. Validate fallback disabled.
3. Ensure no pending legacy items remain.

### Remediation path

1. If pending items remain, return `BACKFILL_INCOMPLETE_AT_CUTOFF`.
2. Run emergency backfill batches with approval.
3. Re-validate and document timeline.

## 13) Last gate execution log (T048)

- `pnpm lint`: PASS (no warnings or errors).
- `pnpm build`: PASS (optimized production build generated successfully).
