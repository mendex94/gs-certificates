# Quickstart: Admin Certificate Type and Template Management

## 1) Prepare environment

1. Install dependencies.
2. Ensure database is reachable.
3. Ensure `public/pdf-templates` exists for writable-mode testing.
4. Run pending database migrations.

## 2) Run application

1. Start dev server:
   - `pnpm dev`
2. Access dashboard as admin user.

## 3) Validate primary scenarios

1. Create certificate type:
   - Open dashboard certificate type management.
   - Create a new type with unique name.
   - Confirm type appears in list.
2. Upload template (writable mode):
   - Upload a PDF <= 10 MB.
   - Confirm stored path follows `/public/pdf-templates/{typeId}/{uuid}.pdf`.
   - Confirm type shows active template.
3. Replace template:
   - Upload replacement template for same type.
   - Confirm new template is active and previous template is inactive.
4. Delete with references:
   - Trigger delete on type/template with active references.
   - Confirm result is archive/inactivate, not hard delete.
5. Delete without references:
   - Trigger delete on type/template without active references.
   - Confirm hard delete succeeds.

## 4) Validate fallback behavior (non-writable host)

1. Simulate no write permission for `public/pdf-templates`.
2. Open storage compatibility status.
3. Confirm mode is `manual_publish`.
4. Try upload and confirm operation is blocked with deploy/FTP guidance.

## 5) Validate concurrency behavior

1. Open same type in two admin sessions.
2. Submit conflicting updates near-simultaneously.
3. Confirm persisted state follows last-write-wins.

## 6) Quality gates before PR

1. Run lint:
   - `pnpm lint`
2. Run build:
   - `pnpm build`
3. Attach evidence in PR:
   - Admin flow screenshots or logs for loading/empty/error/success states.
   - Storage compatibility validation evidence.
   - Upload validation evidence (invalid type, oversize file).
   - Performance spot-check evidence for critical admin actions.
