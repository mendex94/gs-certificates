# Implementation Plan: Admin Certificate Type and Template Management

**Branch**: `[001-create-feature-branch]` | **Date**: 2026-04-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-admin-certificate-templates/spec.md`

## Summary

Deliver admin-only management for certificate types and templates in dashboard,
including: create/update/archive/delete lifecycle, upload and replacement of
PDF templates (max 10 MB), UUID-based storage path per type, runtime detection
of write capability in `/public/pdf-templates`, manual deploy/FTP fallback for
non-writable hosts, and last-write-wins behavior for concurrent writes.

## Technical Context

**Language/Version**: TypeScript 5, Node.js 20, Next.js 14.2.4  
**Primary Dependencies**: Next.js App Router, React 18, zsa, zod, drizzle-orm, postgres, pdf-lib, uuid  
**Storage**: PostgreSQL for metadata and lifecycle state; filesystem in `/public/pdf-templates` for writable hosts  
**Testing**: `pnpm lint`, `pnpm build`, and reproducible manual validation scenarios captured in `quickstart.md`  
**Target Platform**: Linux server deployments, including cPanel-managed hosts  
**Project Type**: Full-stack web application (single Next.js project)  
**Performance Goals**: Admin metadata operations p95 <= 300ms; upload validation feedback p95 <= 5s for PDF <= 10 MB; preserve constitution Web Vitals targets (LCP p75 <= 2.5s, INP p75 <= 200ms)  
**Constraints**: PDF-only uploads <= 10 MB; block upload when `/public` is not writable and guide manual publish; last-write-wins on concurrent writes; avoid hardcoded domain strings by using constants/enums  
**Scale/Scope**: Admin dashboard feature affecting certificate type/template catalog, expected tens of types and versions, with backward compatibility for existing certificate records

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Pre-Phase 0 Gate Result: PASS

- [x] Qualidade de codigo: plano usa camada repository/service existente,
      reforca tipagem e inclui quality gates `pnpm lint` e `pnpm build`.
- [x] Consistencia de UX: fluxo inclui estados loading/vazio/erro/sucesso,
      responsividade e acessibilidade minima no dashboard admin.
- [x] Performance: metas mensuraveis de latencia p95 e feedback de upload
      foram definidas para fluxos criticos.
- [x] Risco e regressao: politica de lifecycle, compatibilidade de storage e
      evidencia obrigatoria em quickstart foram definidos.

Post-Phase 1 Re-check Result: PASS

- [x] Artefatos de pesquisa e design criados (`research.md`, `data-model.md`,
      `contracts/`, `quickstart.md`) sem violacoes constitucionais.
- [x] Nenhuma excecao temporaria de principio foi necessaria.

## Project Structure

### Documentation (this feature)

```text
specs/001-admin-certificate-templates/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── admin-certificate-management.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── dashboard/
│   │   ├── _admin-auth.ts
│   │   ├── action.ts
│   │   └── certificate-types/            # new module for admin CRUD/actions
│   ├── _components/
│   │   └── organisms/                    # reusable admin forms/tables
│   └── _lib/
│       └── validation-shemas/            # zod schemas for server actions
├── constants/
│   └── certificate-pdf-fields.ts
├── dtos/
│   ├── certificate.ts
│   ├── certificate-type.ts               # new
│   └── certificate-template.ts           # new
├── lib/
│   ├── db/
│   │   ├── schema.ts
│   │   └── index.ts
│   └── zsa-procedures.ts
├── repositories/
│   ├── certificatesRepository.ts
│   ├── certificateTypesRepository.ts     # new
│   └── certificateTemplatesRepository.ts # new
└── services/
    ├── certificatePdfService.ts
    └── certificateTypeAdminService.ts    # new

drizzle/
└── migrations/                           # new migration(s) for type/template metadata

public/
└── pdf-templates/                        # `/public/pdf-templates/{typeId}/{uuid}.pdf`
```

**Structure Decision**: Keep the existing single Next.js application and extend
the current layering (server actions -> services -> repositories -> db schema)
instead of introducing a separate backend API project.

## Complexity Tracking

No constitution violations or exceptional complexity waivers are required at
planning stage.
