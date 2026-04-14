# Research: Admin Certificate Type and Template Management

## Decision 1: Model certificate types and templates as relational entities with legacy compatibility

- Decision: Add dedicated `certificate_types` and `certificate_templates` relational entities, with optional `legacyTokenType` mapping for current enum-based flows.
- Rationale: Admin-managed types/templates need lifecycle, validation, and reference checks that are difficult to guarantee with hardcoded enums and static file names.
- Alternatives considered:
  - Keep only `pgEnum` values and update code on each new type: rejected because each new type would require code deployment/migration.
  - Store type/template config as JSON in filesystem: rejected because it weakens transactional integrity and auditability.

## Decision 2: Use runtime storage compatibility detection for public folder writes

- Decision: Detect write capability for `/public/pdf-templates` at runtime with filesystem access and controlled write checks, then expose status in admin UI.
- Rationale: cPanel hosts vary in permissions and quotas; runtime verification prevents false positives and failed uploads.
- Alternatives considered:
  - Static environment flag only: rejected because drift between config and real host permissions is common.
  - Attempt upload directly and fail late: rejected due to poor UX and avoidable retries.

## Decision 3: Enforce strict upload validation on server side

- Decision: Accept only PDF files up to 10 MB, validate MIME/extension/size, and parse document with `pdf-lib` before persistence.
- Rationale: Server-side validation is required for security and consistency; client-side checks alone are bypassable.
- Alternatives considered:
  - Client-side validation only: rejected for security reasons.
  - Extension-only validation: rejected because file extension can be spoofed.

## Decision 4: Apply lifecycle-first deletion policy with last-write-wins concurrency

- Decision: When active references exist, convert delete requests into archive/inactivate transitions; allow hard delete only without active references. Keep concurrent writes as last-write-wins.
- Rationale: Preserves historical integrity while matching clarified behavior and minimizing synchronization complexity.
- Alternatives considered:
  - Force delete with cascade: rejected because it risks historical data loss.
  - Optimistic conflict prompts: rejected because clarified requirement is last-write-wins without prompts.

## Decision 5: Persist templates with UUID path per type

- Decision: Save uploaded templates under `/public/pdf-templates/{typeId}/{uuid}.pdf` and store relative path metadata.
- Rationale: Prevents filename collisions, keeps deterministic organization per type, and supports safe replacement/versioning.
- Alternatives considered:
  - Original filename: rejected due to collision and unsafe naming risk.
  - Slug + timestamp naming: rejected because still collision-prone under concurrency.

## Decision 6: Expose feature operations via server actions in dashboard module

- Decision: Implement admin operations as authenticated `zsa` server actions in dashboard scope, reusing repository/service layering.
- Rationale: Matches existing project architecture and avoids introducing parallel API patterns.
- Alternatives considered:
  - New REST route handlers for all operations: rejected as unnecessary architectural split for current codebase.
  - Direct DB calls from UI server components: rejected due to layering and testability concerns.
