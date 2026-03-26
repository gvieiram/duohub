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
6. Deploy em produção via Vercel CLI: `vercel pull` → `vercel build --prod` → `vercel deploy --prebuilt --prod`

**Secrets obrigatórios no repositório:** `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

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
- Branches de feature são apagadas automaticamente após o merge.

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

Usados pelo workflow Release para fazer deploy via Vercel CLI.
