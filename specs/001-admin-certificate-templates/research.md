# Research: Admin Certificate Type and Template Management

## Decision 1: Modelar tipos/templates em entidades relacionais com compatibilidade legada temporaria

- Decision: Criar entidades `certificate_types` e `certificate_templates`, mantendo fallback legado temporario enquanto o backfill incremental nao termina.
- Rationale: A feature exige lifecycle, associacao, rastreabilidade e regras de exclusao que nao cabem em enum hardcoded apenas.
- Alternatives considered:
  - Manter apenas enum estatico e alterar codigo a cada tipo novo: rejeitado por alto acoplamento e baixa escalabilidade.
  - Persistir metadados apenas em arquivo/JSON: rejeitado por fragilidade transacional e auditoria.

## Decision 2: Definir estrategia de migracao segura com data de corte

- Decision: Adotar fallback legado temporario + backfill incremental obrigatorio + cutoff para desligar fallback.
- Rationale: Atende constituicao para compatibilidade retroativa/plano seguro sem travar entrega em migracao bloqueante unica.
- Alternatives considered:
  - Migracao bloqueante completa antes de liberar feature: rejeitado por risco operacional e indisponibilidade.
  - Fallback legado permanente: rejeitado por perpetuar complexidade e ambiguidade de comportamento.

## Decision 3: Fixar caminho de armazenamento em modo gravavel

- Decision: Em `direct_upload`, persistir sempre em `/public/pdf-templates/{typeId}/{uuid}.pdf`.
- Rationale: Remove conflito entre caminho configuravel e caminho fixo, reduz erro operacional e facilita observabilidade.
- Alternatives considered:
  - Caminho totalmente configuravel: rejeitado por aumentar variacao de deploy e risco de inconsistencias.
  - Nome original de arquivo: rejeitado por colisao e risco de sanitizacao.

## Decision 4: Definir referencia ativa de forma conservadora

- Decision: Referencia ativa inclui qualquer registro de certificado (qualquer status) e qualquer solicitacao pendente apontando para tipo/template.
- Rationale: Preserva integridade historica e evita hard delete destrutivo de entidades ainda referenciadas.
- Alternatives considered:
  - Considerar apenas certificados recentes: rejeitado por risco de apagar historico relevante.
  - Permitir override para forcar exclusao: rejeitado por alto risco de corrupcao de trilha historica.

## Decision 5: Validacao de upload estrita no backend

- Decision: Aceitar somente PDF `<= 10 MB`, validar tipo/tamanho no servidor antes de persistir arquivo.
- Rationale: Controle de seguranca e consistencia deve ser inescapavel por cliente.
- Alternatives considered:
  - Validacao apenas no frontend: rejeitado por ser bypassavel.
  - Validacao por extensao apenas: rejeitado por spoofing de arquivo.

## Decision 6: Concorrencia last-write-wins sem prompt de conflito

- Decision: Operacoes concorrentes de update/delete seguem last-write-wins conforme clarificacao.
- Rationale: Requisito explicito do produto, com menor custo de UX versus locking/prompt.
- Alternatives considered:
  - Lock pessimista: rejeitado por piorar throughput e UX.
  - Prompt de conflito otimista: rejeitado por divergir da regra definida.

## Decision 7: Definir denominador de SC-003 de forma auditavel

- Decision: "Valid template upload attempt" = requisicao autenticada em `direct_upload`, com `certificateType` existente e arquivo PDF valido `<= 10 MB`.
- Rationale: Permite medicao objetiva e comparavel entre ambientes gravaveis.
- Alternatives considered:
  - Contar toda submissao de UI: rejeitado por ruido e baixa confiabilidade de metrica.
  - Contar apenas apos inicio de escrita em disco: rejeitado por esconder falhas de precondicao relevantes.

## Decision 8: Expor operacoes como server actions no modulo dashboard

- Decision: Implementar interface via server actions autenticadas com `zsa` no escopo dashboard admin.
- Rationale: Mantem padrao arquitetural atual e reduz fragmentacao de integração.
- Alternatives considered:
  - Criar API REST separada para tudo: rejeitado por overhead arquitetural sem beneficio direto.
  - Acesso direto ao banco na camada de pagina: rejeitado por perda de separacao e testabilidade.
