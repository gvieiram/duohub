# CI/CD & Deployment

## Overview

```
Feature branch → PR → CI check → Merge to main → Dev deploy (auto)
                                                 ↓
                                    Run Release workflow → CI → Tag → GitHub Release → Prod deploy
```

| Ambiente    | Domínio                          | Trigger     | Branch |
| ----------- | -------------------------------- | ----------- | ------ |
| Development | `contabilidade.gvieiram.com.br`  | push        | main   |
| Production  | `duohub.gvieiram.com.br`         | tag (`v*`)  | main   |

## CI Pipeline

**Workflow:** `.github/workflows/ci.yml`
**Roda em:** PRs para `main` + pushes para `main`

Steps:

1. `pnpm install --frozen-lockfile`
2. `pnpm biome check .` — lint (sem autofix)
3. `pnpm tsc --noEmit` — type check
4. `pnpm build` — build de produção

O job **Lint & Build** é um required status check — PRs não podem ser mergeadas se ele falhar.

## Preview Deployments

Cada PR aberta contra `main` gera automaticamente um preview deployment no Dokploy.

| Ambiente    | Domínio do preview                                | Limite |
| ----------- | ------------------------------------------------- | ------ |
| Development | `preview-<appName>-<id>-contabilidade.gvieiram.com.br` | 3      |
| Production  | `preview-<appName>-<id>-duohub.gvieiram.com.br`        | 3      |

- Previews são recriados a cada push na PR
- Quando a PR é fechada/mergeada, o preview é destruído automaticamente
- Usa HTTPS com Let's Encrypt
- O Dokploy posta um comentário na PR com o link do preview

**DNS necessário:** wildcard `*.gvieiram.com.br` apontando para o IP do servidor Dokploy.

## Criando uma Release (Deploy para Produção)

1. Vá em **Actions** → **Release** → **Run workflow**
2. Escolha o tipo de bump:

| Tipo    | Exemplo             | Quando usar                    |
| ------- | ------------------- | ------------------------------ |
| `patch` | `0.1.0` → `0.1.1`  | Bugfix, ajuste pequeno         |
| `minor` | `0.1.0` → `0.2.0`  | Feature nova                   |
| `major` | `0.1.0` → `1.0.0`  | Breaking change, lançamento    |

3. O workflow executa automaticamente:
   - Roda CI (lint, type check, build)
   - Bumpa versão no `package.json`
   - Commita `release: v<version>` em `main`
   - Cria a tag `v<version>`
   - Pusha tag + commit
   - Cria GitHub Release com changelog automático
   - Dokploy detecta a tag e deploya em produção

## Branch Protection

**Branch:** `main`

- Push direto bloqueado — só via PR (ruleset)
- Required status check: **Lint & Build** (GitHub Actions)
- `enforce_admins: false` — admin pode bypassar se necessário
- Branches são deletadas automaticamente após merge

## Dependabot

**Config:** `.github/dependabot.yml`

- Atualiza **npm deps** e **GitHub Actions** semanalmente (segunda-feira)
- Minor + patch agrupados numa PR só
- PRs criadas com label `dependencies` ou `ci`
- Prefixo de commit: `chore(deps):` / `chore(ci):`

## PR Auto-labeler

**Config:** `.github/labeler.yml`
**Workflow:** `.github/workflows/labeler.yml`

Labels aplicadas automaticamente com base nos arquivos modificados:

| Label          | Arquivos                                      |
| -------------- | --------------------------------------------- |
| `ui`           | `src/components/**`                           |
| `content`      | `src/content/**`                              |
| `styles`       | `globals.css`, `tailwind.config.*`            |
| `config`       | `*.config.*`, `.github/**`, `biome.json`, `tsconfig.json` |
| `ci`           | `.github/workflows/**`                        |
| `dependencies` | `package.json`, `pnpm-lock.yaml`              |

## Infraestrutura (Dokploy)

**Projeto:** contabilidade
**Build:** Nixpacks
**GitHub App:** dokploy-2026-02-02-v6ewim

| App              | Application ID                | Env         |
| ---------------- | ----------------------------- | ----------- |
| frontend (prod)  | `5jxA6BNIEJC0vI3IkFBLK`      | production  |
| frontend (dev)   | `SosC2ehykP3dWeDHadIBE`      | development |

### Variáveis úteis no preview

- `${{DOKPLOY_DEPLOY_URL}}` — URL gerada do preview deployment (use em env vars)
