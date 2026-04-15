# Implementation Plan: Admin Certificate Type and Template Management

**Branch**: `[001-create-feature-branch]` | **Date**: 2026-04-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-admin-certificate-templates/spec.md`

## Summary

Implementar gestao administrativa de tipos e templates de certificados no dashboard,
incluindo CRUD com ciclo de vida (archive/inactivate/delete), upload de PDF
(`<= 10 MB`), armazenamento fixo em `/public/pdf-templates/{typeId}/{uuid}.pdf`
quando houver escrita direta, fallback manual via deploy/FTP em ambientes sem
escrita, concorrencia last-write-wins, e migracao de legado com fallback
temporario, backfill incremental obrigatorio e data de corte.

## Technical Context

**Language/Version**: TypeScript 5, Node.js 20, Next.js 14.2.4  
**Primary Dependencies**: Next.js App Router, React 18, zsa, zod, drizzle-orm, postgres, pdf-lib, uuid  
**Storage**: PostgreSQL para metadados e ciclo de vida; filesystem em `/public/pdf-templates` para modo `direct_upload`  
**Testing**: `pnpm lint`, `pnpm build` e evidencias reproduziveis de cenarios definidos em `quickstart.md`  
**Target Platform**: Linux server, incluindo hospedagens cPanel  
**Project Type**: Aplicacao web full-stack (single Next.js project)  
**Performance Goals**: Operacoes admin p95 `<= 300ms`; feedback de validacao/upload p95 `<= 5s`; preservar metas de LCP p75 `<= 2.5s` e INP p75 `<= 200ms`  
**Constraints**: Upload somente PDF `<= 10 MB`; caminho de escrita fixa no modo gravavel; bloqueio de upload em modo nao gravavel; referencias ativas incluem qualquer certificado (qualquer status) e solicitacao pendente; concorrencia last-write-wins; fallback legado temporario ate cutoff  
**Scale/Scope**: Feature administrativa para dezenas de tipos/templates com retrocompatibilidade durante janela de migracao

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Pre-Phase 0 Gate Result: PASS

- [x] Qualidade de codigo: manter arquitetura existente (actions -> services -> repositories), tipagem forte e gates `pnpm lint`/`pnpm build`.
- [x] Consistencia de UX: fluxos admin devem cobrir loading, vazio, erro e sucesso com responsividade e acessibilidade minima.
- [x] Performance: metas mensuraveis definidas para latencia de operacoes e feedback de upload.
- [x] Risco e regressao: estrategia explicita de migracao segura, fallback legado temporario, backfill incremental, cutoff e evidencias obrigatorias.

Post-Phase 1 Re-check Result: PASS

- [x] Artefatos de design atualizados com decisoes de migracao/retrocompatibilidade e criterios de medicao.
- [x] Contratos e modelo de dados refletem regras fechadas de referencia ativa, caminho fixo e denominador de SC-003.
- [x] Nenhuma excecao formal da constituicao foi necessaria.

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
│   │   └── certificate-types/
│   │       ├── action.ts
│   │       └── page.tsx
│   ├── _components/
│   │   └── organisms/
│   │       ├── CertificateTypeForm.tsx
│   │       ├── CertificateTypeTable.tsx
│   │       ├── CertificateTemplateUpload.tsx
│   │       ├── CertificateTemplateList.tsx
│   │       └── TemplateStorageCompatibilityCard.tsx
│   └── _lib/
│       └── validation-shemas/
│           └── certificate-management.ts
├── constants/
│   └── certificate-management.ts
├── dtos/
│   ├── certificate-type.ts
│   └── certificate-template.ts
├── lib/
│   └── db/
│       └── schema.ts
├── repositories/
│   ├── certificateTypesRepository.ts
│   └── certificateTemplatesRepository.ts
└── services/
      ├── certificateTypeAdminService.ts
      ├── templateStorageService.ts
      └── templateBackfillService.ts

drizzle/
└── migrations/

public/
└── pdf-templates/
```

**Structure Decision**: manter o projeto unico em Next.js e estender os modulos
existentes por composicao, sem introduzir novo backend separado.

## Complexity Tracking

Sem violacoes constitucionais ou waiver de complexidade nesta fase.
