# CI/CD & Deploy

## Visão geral

```
Feature branch → PR → CI (lint + typecheck) + Vercel Preview → Merge to main
                                                                     ↓
                                                        Auto-deploy para dev
                                                      (duohub-dev.vercel.app)
                                                                     ↓
                                                      Workflow Release (manual)
                                                                     ↓
                                                Tag + vercel deploy --prod
                                                      (www.duohubcontabil.com.br)
```

## Ambientes

| Ambiente        | URL                                      | Gatilho                         | Branch              |
| --------------- | ---------------------------------------- | ------------------------------- | ------------------- |
| Preview (PR)    | `project-xxx.vercel.app` (único por PR)  | PR aberta/atualizada            | branches de feature |
| Desenvolvimento | `duohub-dev.vercel.app`                  | push em `main` (automático)     | main                |
| Produção        | `www.duohubcontabil.com.br`              | tag `v*` via workflow Release   | main (commit da tag)|

## Pipeline de CI

**Workflow:** `.github/workflows/ci.yml`
**Dispara em:** PRs para `main` e pushes para `main`

Passos:

1. `pnpm install --frozen-lockfile`
2. `pnpm biome check .` — lint (sem autofix)
3. `pnpm tsc --noEmit` — verificação de tipos

O job **Lint & Type Check** é um status check obrigatório — PRs não podem ser mergeadas se ele falhar.

## Deploys de preview

- A integração Git da Vercel cria um preview automaticamente para cada PR.
- Cada PR recebe uma URL exclusiva.
- O preview é recriado a cada push na branch da PR.
- O preview é um check obrigatório — PRs não podem ser mergeadas se o deploy de preview falhar.

## Criando uma release (deploy em produção)

### Passo a passo

1. Acesse **Actions** → **Release** → **Run workflow**
2. Em "Use workflow from", mantenha **Branch: main**
3. Escolha o tipo de bump de versão (veja guia abaixo)
4. Clique em **Run workflow**

### O que o workflow faz automaticamente

1. **CI:** lint e typecheck (validação)
2. Bump da versão no `package.json`
3. Commit `release: v<versão>` em `main`
4. Criação da tag `v<versão>` e push (commit + tags)
5. Criação da **GitHub Release** com changelog automático
6. Deploy em produção via Vercel CLI:
   - `vercel pull` — puxa env vars de produção (inclui `DATABASE_URL` de prod)
   - `prisma migrate deploy` — aplica migrations pendentes no banco de produção
   - `vercel build --prod`
   - `vercel deploy --prebuilt --prod`

**Secrets obrigatórios no repositório:** `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `GH_PAT`.

### Limitações conhecidas

#### Tag órfã quando o deploy falha

O workflow faz o push da tag **antes** do deploy na Vercel. Se o deploy falhar (erro de migration, build, etc.), a tag já está no remote e não é removida automaticamente.

**Sintomas:**

- Ao re-rodar o workflow com a mesma versão, falha com `fatal: tag 'vX.Y.Z' already exists`.
- Forçar o re-run exige bumpar para a próxima versão (ex: `v1.0.0` falha → precisa rodar `v1.1.0`), deixando gaps no histórico.

**Workaround manual:**

1. Deletar a tag no remote: `git push origin --delete vX.Y.Z`
2. Deletar a GitHub Release (se tiver sido criada) em Releases → draft/published
3. Reverter o commit `release: vX.Y.Z` na `main` (via PR ou direto com admin bypass)
4. Re-rodar o workflow com a versão original

**Solução definitiva (futuro):**

Refatorar o workflow para criar tag e commit **apenas em memória** (localmente no runner) durante a execução, e só fazer o push no último step, depois do deploy bem-sucedido. Isso garante o padrão "tudo ou nada": se algo falhar, nada é pushado e o estado do repo fica intacto.

### Guia de versionamento (Semantic Versioning)

O projeto segue [semver](https://semver.org/lang/pt-BR/) — `MAJOR.MINOR.PATCH`.

#### `patch` (0.1.0 → 0.1.1)

Correções que **não mudam funcionalidade**:

- Fix de bug visual ou funcional
- Correção de typo no conteúdo
- Ajuste de responsividade
- Fix de link quebrado
- Mudanças de CI/CD ou infraestrutura

#### `minor` (0.1.0 → 0.2.0)

**Nova funcionalidade** ou melhoria visível para o usuário:

- Nova seção ou página no site
- Novo componente significativo
- Melhoria de UX notável
- Batch de várias features pequenas

#### `major` (0.1.0 → 1.0.0)

**Marco importante** ou breaking change:

- Lançamento oficial do site para clientes (`1.0.0`)
- Redesign completo
- Mudança de domínio ou plataforma
- Algo que invalida a versão anterior

#### Regra prática

Enquanto o projeto estiver em `0.x.x` (pré-lançamento):

| Mudança | Bump |
| --- | --- |
| Fix, ajuste, infra | `patch` |
| Feature(s) nova(s) | `minor` |
| Lançamento oficial | `major` → `1.0.0` |

## Proteção da branch `main`

- Push direto bloqueado (ruleset).
- Status checks obrigatórios: **Lint & Type Check** (GitHub Actions) e **Vercel Preview**.
- `enforce_admins: false` — administradores podem fazer bypass quando necessário.
- Bypass actor no ruleset: **Repository Admin** (permite que o workflow Release faça push do commit de version bump via `GH_PAT`).
- Branches de feature são apagadas automaticamente após o merge.

## Banco de dados e migrations (Prisma)

O projeto usa Prisma com PostgreSQL (Neon). O fluxo de migrations é controlado para evitar alterações acidentais no banco.

### Geração do Prisma Client

- `postinstall` no `package.json` roda `prisma generate` automaticamente após `pnpm install`.
- Garante que o client tipado está disponível em qualquer ambiente (local, CI, Vercel) sem steps manuais.

### Quando migrations são aplicadas

| Contexto              | Migrations aplicadas? | Como                                                   |
| --------------------- | --------------------- | ------------------------------------------------------ |
| Dev local             | Manualmente           | `pnpm db:migrate` ao alterar o schema                  |
| Preview (PR)          | Nunca                 | Preview só builda, não toca no banco                   |
| Push em `main` (dev)  | Nunca                 | Vercel só builda e deploya                             |
| Tag release (prod)    | Automaticamente       | Step no workflow Release antes do `vercel build`       |

### Por que não rodar migrations no `prebuild`

Rodar `prisma migrate deploy` a cada build significaria aplicar migrations em todo preview deployment (uma por PR). Isso poluiria o banco de dev com migrations de features ainda não aprovadas e criaria condições de corrida entre PRs concorrentes.

Migrations acontecem apenas em momentos controlados:

- **Dev**: você aplica conscientemente com `pnpm db:migrate` enquanto desenvolve.
- **Prod**: o Release workflow lê `DATABASE_URL`/`DIRECT_URL` dos GitHub Secrets e roda `prisma migrate deploy` antes de buildar — garantindo que o schema de produção está sincronizado antes do código ir para o ar.

### ⚠️ Credenciais do banco: defesa em profundidade

`DATABASE_URL` e `DIRECT_URL` são armazenadas em **dois lugares**:

1. **Vercel → Project Settings → Environment Variables** (marcadas como **Sensitive**) — usadas em runtime pelo Next.js na Vercel.
2. **GitHub → Repository Secrets** — usadas pelo workflow Release para rodar `prisma migrate deploy` no CI.

**Por que duplicar?**

Marcar as credenciais como **Sensitive** na Vercel impede que elas sejam baixadas via `vercel pull` ou API — só são injetadas nos processos de runtime. Isso protege contra exfiltração caso o `VERCEL_TOKEN` vaze. O trade-off é que o CI não consegue ler esses valores via `vercel pull`, então precisamos mantê-los também nos GitHub Secrets.

**🚨 IMPORTANTE — sincronização manual:**

Sempre que rotacionar ou alterar `DATABASE_URL` ou `DIRECT_URL`, **atualize nos dois lugares**:

1. Vercel → Project (`duohub`) → Settings → Environment Variables → Edit
2. GitHub → Repository → Settings → Secrets and variables → Actions → Update secret

Se atualizar apenas em um lugar, um dos cenários quebra:

- Atualizou só na Vercel → runtime funciona, mas `prisma migrate deploy` falha no próximo release (CI ainda usa a credencial antiga).
- Atualizou só no GitHub → migrations rodam, mas o app em produção falha ao conectar no banco (runtime usa credencial antiga).

**Quando rotacionar credenciais do Neon:** atualize em ambos os lugares **antes** de disparar qualquer release.

## Dependabot

**Configuração:** `.github/dependabot.yml`

- Atualiza dependências **npm** e **GitHub Actions** semanalmente (segundas-feiras).
- Minor e patch agrupados numa única PR (ecossistema npm).
- Labels: `dependencies`, `ci`.
- Prefixos de commit: `chore(deps):`, `chore(ci):`.

## Configuração na Vercel

**Settings → Environments → Production:**

- **Production Branch:** `release` (branch "fantasma" — existe no repositório mas nunca recebe pushes diretos)
- **Auto-assign Custom Production Domains:** Enabled
- Com isso, pushes em `main` geram deploys de **Preview** (não Production), e o ambiente de desenvolvimento (`duohub-dev.vercel.app`) aponta para esses previews

**Settings → Domains:**

- `www.duohubcontabil.com.br` → Production
- `duohubcontabil.com.br` → Redirect 307 → `www.duohubcontabil.com.br`
- `duohub-dev.vercel.app` → Preview, branch `main`

**Settings → Git:**

- Pull Request Comments: Enabled
- deployment_status Events: Enabled
- repository_dispatch Events: Enabled

Deploys de **produção** ocorrem somente via Vercel CLI no GitHub Actions (workflow Release), não por push de branch.

## Secrets no GitHub

**GitHub → Repository → Settings → Secrets and variables → Actions → Repository secrets:**

| Secret | Descrição |
| --- | --- |
| `VERCEL_TOKEN` | Token de acesso da Vercel (criado em vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | ID da organização/conta na Vercel (Settings → General) |
| `VERCEL_PROJECT_ID` | ID do projeto na Vercel (Settings → General) |
| `GH_PAT` | Classic PAT com scope `repo` (usado para bypass do ruleset ao pushar o commit de version bump) |
| `DATABASE_URL` | Connection string pooled do Neon (production). **Deve espelhar** o valor na Vercel |
| `DIRECT_URL` | Connection string direct do Neon (production). **Deve espelhar** o valor na Vercel |

Usados pelo workflow Release para fazer deploy via Vercel CLI, pushar o commit de version bump na `main` e aplicar migrations de produção.

> Ver seção **"Credenciais do banco: defesa em profundidade"** acima para detalhes sobre a sincronização obrigatória entre Vercel e GitHub.
