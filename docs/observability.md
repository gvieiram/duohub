# Observability

Catálogo de eventos PostHog, funil F0 (IRPF 2026) e instruções para configurar dashboards e alertas operacionais. Esta página é **a fonte da verdade** dos eventos que o site emite — quando criar/renomear/remover um evento, atualize aqui.

> Para a parte de captura de origem (UTMs, first-touch attribution, validação de URLs com UTM), ver [`utm-tracking.md`](./utm-tracking.md). Os dois documentos se complementam.

## Stack

- **PostHog Cloud (US)** — projeto **DuoHub** (id `395893`, resetado em 2026-04-24).
- **`posthog-js`** no client, carregado via [`instrumentation-client.ts`](../instrumentation-client.ts).
- **`posthog-node`** no server, expoito por [`src/lib/posthog/server.ts`](../src/lib/posthog/server.ts) (`getServerPostHog()`).
- **Reverse proxy** `/ingest` → `us.i.posthog.com` em [`next.config.ts`](../next.config.ts) — same-origin pra contornar ad blockers.

## Catálogo de eventos

Lista canônica dos eventos emitidos pelo código. Toda nova captura PRECISA estar aqui antes de subir pra produção.

> **PII**: nenhum evento pode carregar e-mail, CPF, WhatsApp, nome completo etc. em texto plano. Use IDs internos (`contactId`) como `distinctId` quando relevante. Veja [Política de PII](#política-de-pii) abaixo.

### `$pageview` (auto)

- **Origem**: `posthog-js` automático
- **Onde**: toda página pública
- **Uso**: começo do funil F0 (filtrado por `pathname = /imposto-de-renda`)

### `irpf_modal_opened`

- **Origem**: client — [`src/app/(marketing)/imposto-de-renda/components/irpf-modal/index.tsx`](../src/app/(marketing)/imposto-de-renda/components/irpf-modal/index.tsx)
- **Quando**: o modal de captura é aberto (`isOpen` vira `true`)
- **Propriedades**:
  - `variant: "modal"` — reservado para o caso de termos versões inline/sheet no futuro
  - `submittedInSession: boolean` — true se o usuário já submeteu nesta sessão (usado pra desambiguar reabertura pós-sucesso)
- **PII**: nenhuma

### `irpf_contact_submitted`

- **Origem**: client — mesmo arquivo do `irpf_modal_opened`
- **Quando**: a Server Action `submitIrpfContact` retorna `success: true` no front
- **Propriedades**:
  - `variant: "modal"`
  - `hadSituation: boolean`
  - `complexityCount: number`
  - `hadMoment: boolean`
- **Identidade**: imediatamente antes da captura, o front chama `posthog.identify(email, { service: "IRPF", ... })`. Isso liga o `distinctId` anônimo ao contato e preserva o histórico de UTMs.
- **PII**: nenhuma no payload do evento (o e-mail entra apenas no `identify`).

### `irpf_email_send_failed`

- **Origem**: server — [`src/features/irpf/actions.ts`](../src/features/irpf/actions.ts) (`captureEmailFailure`)
- **Quando**: o `Promise.allSettled` em `sendIrpfContactEmails` retorna pelo menos um `rejected`. **Um evento por email rejeitado** (pode ser 1 ou 2 por submission).
- **Propriedades**:
  - `kind: "contact" | "internal"` — qual envio falhou
    - `contact` = e-mail de confirmação para o lead
    - `internal` = notificação interna para a inbox da DuoHub
  - `errorMessage: string` — `error.message` truncado em 500 chars (sanitizado, sem stack)
- **`distinctId`**: `contactId` (UUID do `Contact` recém-persistido). Não é o e-mail do lead.
- **PII**: nenhuma no payload. O `distinctId` é um ID interno opaco.
- **Best-effort**: erros na captura PostHog são engolidos. O contato já foi persistido — não vamos retornar erro ao usuário só porque a observabilidade falhou.

## Funil F0 — IRPF 2026

Este é o funil oficial de conversão da página de IR. Todo número que circula em decisão de produto (CTR, conversão por canal, etc.) deve sair daqui.

### Definição

| Passo | Evento | Filtro |
|-------|--------|--------|
| 1. Visualizou a página | `$pageview` | `pathname = "/imposto-de-renda"` |
| 2. Abriu o modal | `irpf_modal_opened` | — |
| 3. Submeteu o formulário | `irpf_contact_submitted` | — |

Janela de conversão: **24h** (o lead pode ler a página, voltar mais tarde e converter).

### Como criar no PostHog

1. PostHog → **Product analytics** → **+ New insight** → **Funnels**
2. Adicionar os 3 passos acima na ordem
3. Em **Conversion window**: 24 hours
4. **Visualization**: "Steps" (vertical) — mostra a queda em cada etapa
5. Salvar com nome **`F0 — Funil IRPF 2026`** e adicionar ao dashboard `My App Dashboard` (ou criar um novo dashboard `F0 — IR 2026`)

### Insights complementares

| Insight | Tipo | O que mede |
|---------|------|-----------|
| `F0 — Falhas de email (operacional)` | Trends — `irpf_email_send_failed` por dia, breakdown `kind` | Saúde do envio de email |
| `F0 — Submissions por origem` | Trends — `irpf_contact_submitted` breakdown `$initial_utm_source` | De onde vêm os leads |
| `F0 — Submissions por situação` | Trends — `irpf_contact_submitted` breakdown `hadSituation` | Quanto do funil completa o step de qualificação |

## Alerta operacional — `irpf_email_send_failed`

Crítico porque, hoje, o front sempre retorna `success: true` mesmo quando o e-mail de confirmação falha. Sem alerta, um lead pode nunca receber confirmação e a equipe da DuoHub não fica sabendo.

### Configuração no PostHog

1. PostHog → **Product analytics** → **+ New insight** → **Trends**
2. Métrica: `irpf_email_send_failed`, agregação **Total count**, intervalo **Hour**
3. Salvar como `F0 — Alert · email failures`
4. Abrir o insight → menu **⋯** (três pontos) → **Subscribe**
5. **Frequency**: por evento (alert when count > 0 in last hour)
6. **Destination**: e-mail (preencher com a inbox interna da DuoHub) ou webhook do Slack se/quando configurarmos
7. **Subject sugerido**: `[DuoHub] irpf_email_send_failed disparou — verificar Resend`

> A subscription do PostHog (free tier) tem granularidade mínima horária. Pra alerta sub-minuto seria preciso webhook + workflow externo (não vale o esforço enquanto o volume estiver baixo).

### Runbook quando o alerta dispara

1. Abrir o evento no PostHog → ver a propriedade `errorMessage` (mensagem original do Resend)
2. Verificar [status do Resend](https://status.resend.com/)
3. Se for `kind: "internal"` por muitos eventos, checar se o domínio do `INTERNAL_CONTACT_EMAIL` mudou (DNS, etc.)
4. Para os contatos afetados (filtrar no PostHog → Persons pelo distinctId), reenviar manualmente a partir do banco se necessário (a tabela `Contact` está intacta — é só o e-mail que pode ter falhado)

## Política de PII

**Nada** disso pode ir pra dentro de `properties` de um evento PostHog:

- E-mail
- CPF / CNPJ
- Telefone / WhatsApp
- Nome completo
- Endereço

O que pode:

- Hashes / IDs internos (Contact id, etc.)
- Booleans derivados (`hadSituation`, `complexityCount`)
- Categorias enumeradas (`kind: "contact" | "internal"`)
- Strings curtas e neutras (`variant: "modal"`)

`posthog.identify(email, ...)` é a **única** chamada que envia o e-mail (porque ele vira `distinctId`, e o identify é o que liga UTMs ao contato). Qualquer outra captura usa `contactId` ou o ID anônimo automático.

## Ver também

- [`docs/utm-tracking.md`](./utm-tracking.md) — UTM dictionary e como o first-touch attribution funciona
- [`docs/architecture.md`](./architecture.md) — visão geral de stack e segurança
- [`src/lib/posthog/server.ts`](../src/lib/posthog/server.ts) — comentários sobre por que usamos remote evaluation
