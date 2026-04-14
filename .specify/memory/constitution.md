<!--
Sync Impact Report
- Version change: template-placeholder -> 1.0.0
- Modified principles:
	- Template Principle 1 -> I. Qualidade de Codigo Nao Negociavel
	- Template Principle 2 -> II. Consistencia de Experiencia do Usuario
	- Template Principle 3 -> III. Performance Como Requisito de Entrega
	- Template Principle 4 -> IV. Verificacao Continua e Prevencao de Regressao
	- Template Principle 5 -> V. Entrega Incremental com Rastreabilidade
- Added sections:
	- Padroes Tecnicos Obrigatorios
	- Fluxo de Entrega e Quality Gates
- Removed sections:
	- Nenhuma
- Templates requiring updates:
	- updated: .specify/templates/plan-template.md
	- updated: .specify/templates/spec-template.md
	- updated: .specify/templates/tasks-template.md
	- updated: README.md
	- updated: .specify/templates/commands/*.md (nenhum arquivo encontrado; sem acao necessaria)
- Follow-up TODOs:
	- Nenhum
-->

# GS Certificates Constitution

## Core Principles

### I. Qualidade de Codigo Nao Negociavel

Toda mudanca MUST preservar legibilidade, tipagem forte e baixo acoplamento.
Alteracoes MUST reutilizar padroes existentes e MUST evitar strings de dominio
hardcoded, preferindo constantes ou enums tipados. Antes de merge, toda mudanca
MUST passar em `pnpm lint` e `pnpm build`.
Justificativa: consistencia tecnica reduz regressao e custo de manutencao.

### II. Consistencia de Experiencia do Usuario

Fluxos de UI MUST usar componentes compartilhados e linguagem visual existente.
Toda interface nova ou alterada MUST cobrir estados de carregamento, vazio, erro
e sucesso, com comportamento responsivo em mobile e desktop. Mudancas visuais
MUST manter acessibilidade minima com foco visivel, contraste adequado e
navegacao por teclado.
Justificativa: previsibilidade da experiencia aumenta confianca e reduz friccao.

### III. Performance Como Requisito de Entrega

Toda entrega MUST definir impacto esperado de performance e validar o resultado
nos fluxos criticos. Para paginas publicas, mudancas MUST manter alvo de
LCP p75 <= 2.5s e INP p75 <= 200ms. Para operacoes de API criticas, mudancas
MUST manter alvo de latencia p95 <= 300ms, salvo excecao explicitamente
documentada e aprovada.
Justificativa: performance impacta conversao, retencao e custo operacional.

### IV. Verificacao Continua e Prevencao de Regressao

Toda correcao de bug MUST incluir verificacao proporcional ao risco, por teste
automatizado ou evidencia reproduzivel documentada quando automacao nao for
viavel. Alteracoes em contratos, validacoes e persistencia MUST demonstrar
compatibilidade retroativa ou plano de migracao seguro.
Justificativa: validacao continua evita regressao silenciosa em producao.

### V. Entrega Incremental com Rastreabilidade

Mudancas MUST ser entregues em incrementos pequenos, revisaveis e reversiveis.
Cada PR MUST descrever escopo, risco, decisoes tecnicas e evidencias de
qualidade, UX e performance. Excecoes a esta constituicao MUST ser temporarias,
explicitas e aprovadas por responsavel tecnico.
Justificativa: entregas incrementais aceleram a evolucao com governanca.

## Padroes Tecnicos Obrigatorios

- TypeScript strict MUST permanecer habilitado e novos usos de `any` MUST ser
  evitados ou justificados no PR.
- Validacoes de entrada MUST ser centralizadas e reutilizaveis, evitando logica
  duplicada em componentes, servicos e handlers.
- Componentes de UI MUST priorizar composicao sobre duplicacao e manter
  consistencia com o sistema de design existente.
- Mudancas de consulta, serializacao e geracao de PDF MUST considerar impacto de
  latencia e consumo de recursos antes de merge.

## Fluxo de Entrega e Quality Gates

- Especificacoes MUST declarar requisitos nao funcionais de qualidade, UX e
  performance para cada historia relevante.
- Planos de implementacao MUST passar pelo Constitution Check antes de iniciar
  codificacao.
- Antes do merge, o autor MUST anexar evidencias de execucao de `pnpm lint` e
  `pnpm build` e, quando aplicavel, evidencias de medicao de performance.
- Revisao tecnica MUST bloquear merge quando houver violacao de principios sem
  excecao formal aprovada.

## Governance

Esta constituicao prevalece sobre praticas locais conflitantes. Alteracoes MUST
ser propostas por PR com racional tecnico, impacto esperado e plano de migracao
quando houver mudanca de comportamento. A politica de versao segue SemVer:
MAJOR para redefinicoes incompativeis de principios, MINOR para novos principios
ou expansoes normativas e PATCH para clarificacoes sem mudanca semantica. Toda
revisao de PR MUST incluir verificacao explicita de conformidade com esta
constituicao.

**Version**: 1.0.0 | **Ratified**: 2026-04-14 | **Last Amended**: 2026-04-14
