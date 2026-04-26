# PostHog Feature Flags Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar o sistema de feature flags de Vercel Flags (`@flags-sdk/vercel` + Zustand) para PostHog Feature Flags, mantendo a landing pública estática (ISR) e preparando infraestrutura pra A/B testing client-side futuro.

**Architecture:** Estratégia híbrida — `posthog-node` no server (com `unstable_cache(revalidate: 60)`) pra config flags globais, `@posthog/react` no client pra futuros experiments. Schema do banner absorve lógica temporal via Zod `.transform()`. Toda a estrutura mora em `src/lib/posthog/`.

**Tech Stack:** PostHog (`posthog-js`, `@posthog/react`, `posthog-node`), Next.js 16 App Router, Zod, Next.js `unstable_cache`.

**Linear:** [DUO-32](https://linear.app/gvieiram/issue/DUO-32/migrar-vercel-flags-para-posthog-feature-flags)

**Spec de design:** [`docs/superpowers/specs/2026-04-25-posthog-feature-flags-migration-design.md`](../specs/2026-04-25-posthog-feature-flags-migration-design.md)

---

## Notas de processo

- **Sem test runner:** o projeto não tem Jest/Vitest configurado (ver `CLAUDE.md`). A verificação de cada task usa `pnpm lint`, `pnpm build` e checagens manuais via `pnpm dev` no browser. Quando uma task troca uma flag por outra, a verificação obrigatória é abrir a página no dev e conferir o comportamento.
- **Convenção de commits:** Conventional Commits em inglês, body em pt-BR opcional. Cada task termina em **um** commit.
- **Branch:** `feat/DUO-32/posthog-feature-flags-migration` (criada na Task 0).
- **PostHog flags pré-existentes em PROD:** o usuário **já tem** as flags `logo-text-centered`, `social-proof-type` e `irpf-banner` configuradas no projeto PostHog (são as mesmas que existem hoje no Vercel Flags — o objetivo desta migração é trocar o consumidor, não recriá-las).

---

## Task 0: Setup — branch, dependências e env vars

**Files:**
- Create branch: `feat/DUO-32/posthog-feature-flags-migration`
- Modify: `package.json` (via pnpm CLI)
- Modify: `src/lib/env.ts:7-14` (server schema), `src/lib/env.ts:23-29` (runtimeEnv)
- Modify: `.env.local` (local apenas — adicionar `POSTHOG_API_KEY`)

- [ ] **Step 1: Confirmar branch e estado limpo**

```bash
git status
git branch --show-current
```

Expected: status mostra apenas arquivos não rastreados pré-existentes (screenshots, `.previews/`, `.playwright-mcp/`); branch atual deve ser `main`. Se houver mudanças relevantes não relacionadas, **PARE** e faça stash.

- [ ] **Step 2: Criar e mudar pra branch da task**

```bash
git checkout -b feat/DUO-32/posthog-feature-flags-migration
git branch --show-current
```

Expected: output `feat/DUO-32/posthog-feature-flags-migration`.

- [ ] **Step 3: Instalar dependências do PostHog server-side e client-side**

```bash
pnpm add @posthog/react posthog-node
```

Expected: `package.json` ganha `@posthog/react` e `posthog-node` em `dependencies`. `pnpm-lock.yaml` atualizado. Não execute `pnpm dev` ainda — vamos adicionar a env var primeiro.

- [ ] **Step 4: Adicionar `POSTHOG_API_KEY` ao schema de env**

Edite `src/lib/env.ts`:

```ts
// biome-ignore-all lint/style/useNamingConvention: env vars use SCREAMING_SNAKE_CASE by convention

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().url(),
		DIRECT_URL: z.string().url(),
		RESEND_API_KEY: z.string().min(1),
		INTERNAL_CONTACT_EMAIL: z.string().email(),
		UPSTASH_REDIS_REST_URL: z.string().url(),
		UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
		POSTHOG_API_KEY: z.string().min(1).optional(),
	},
	client: {
		NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
		NEXT_PUBLIC_POSTHOG_TOKEN: z.string().min(1).optional(),
		NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
		NEXT_PUBLIC_VERCEL_ENV: z
			.enum(["production", "preview", "development"])
			.optional(),
	},
	runtimeEnv: {
		DATABASE_URL: process.env.DATABASE_URL,
		DIRECT_URL: process.env.DIRECT_URL,
		RESEND_API_KEY: process.env.RESEND_API_KEY,
		INTERNAL_CONTACT_EMAIL: process.env.INTERNAL_CONTACT_EMAIL,
		UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
		UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
		POSTHOG_API_KEY: process.env.POSTHOG_API_KEY,
		NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
		NEXT_PUBLIC_POSTHOG_TOKEN: process.env.NEXT_PUBLIC_POSTHOG_TOKEN,
		NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
		NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
	},
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
});
```

A var é `optional()` por dois motivos: (1) builds em CI sem secrets ainda devem passar; (2) em dev local pode rodar sem ela e cair em defaults (banner some, social proof = "credentials", logo = não centralizado).

- [ ] **Step 5: Adicionar a chave em `.env.local`**

Pegue o **Personal API Key** do PostHog (Settings → Personal API Keys → Create) com escopo **Read** em `feature_flag`. Adicione em `.env.local` (NÃO commitar):

```bash
# Adicione esta linha em .env.local
POSTHOG_API_KEY="phx_..."
```

Expected: a key começa com `phx_` (Personal API Key, **não** confundir com `phc_` que é o token público do `NEXT_PUBLIC_POSTHOG_TOKEN`).

- [ ] **Step 6: Validar — typecheck e lint passam**

```bash
pnpm lint
```

Expected: zero erros. Pode haver warnings pré-existentes (pré-migração), mas nada novo introduzido por essa task.

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml src/lib/env.ts
git commit -m "chore(deps): add posthog-node and @posthog/react for flag migration

Adds POSTHOG_API_KEY (optional) to server env schema for posthog-node
remote evaluation. Client-side @posthog/react replaces the upcoming
removal of Zustand flags hydration."
```

---

## Task 1: PostHogProvider — wrap client tree

**Files:**
- Create: `src/lib/posthog/client.ts` (movendo de `src/lib/posthog.ts`)
- Modify: `src/components/providers.tsx` (entire file)
- Delete: `src/lib/posthog.ts` (apenas após confirmar que importadores foram atualizados)

> **Importante:** essa task ainda **não remove** o sistema atual de flags. Apenas adiciona o `<PostHogProvider>` em paralelo, pra deixar o client pronto. O Zustand de flags continua funcionando até a Task 6.

- [ ] **Step 1: Buscar todos os importadores de `@/lib/posthog`**

```bash
rg "from \"@/lib/posthog\"" -n
```

Expected: deve listar os arquivos que importam `posthog` do client. Anote eles — serão atualizados no Step 4.

- [ ] **Step 2: Criar diretório e mover o re-export**

```bash
mkdir -p src/lib/posthog
```

Crie `src/lib/posthog/client.ts` com o conteúdo (copiando do `src/lib/posthog.ts` atual):

```ts
/**
 * Client-side PostHog singleton re-export.
 *
 * Initialization happens once in [`instrumentation-client.ts`](../../../instrumentation-client.ts)
 * at the project root — Next.js loads that file automatically on every client
 * boot, before the first render. From here on, any client component can do
 * `import { posthog } from "@/lib/posthog/client"` and call `.capture()` /
 * `.identify()` safely; if the env token is missing the library becomes a no-op.
 */
export { default as posthog } from "posthog-js";
```

- [ ] **Step 3: Atualizar `providers.tsx` pra envolver em `<PostHogProvider>`**

Substitua o conteúdo inteiro de `src/components/providers.tsx`:

```tsx
"use client";

import { PostHogProvider } from "@posthog/react";
import { ThemeProvider } from "next-themes";
import { useRef } from "react";
import { Toaster } from "@/components/ui/sonner";
import type { FlagsState } from "@/lib/flags";
import { posthog } from "@/lib/posthog/client";
import { useFlagsStore } from "@/stores/use-flags-store";

type ProvidersProps = {
	children: React.ReactNode;
	flags?: Partial<FlagsState>;
};

export function Providers({ children, flags }: ProvidersProps) {
	const hydrated = useRef(false);
	if (flags && !hydrated.current) {
		useFlagsStore.setState(flags);
		hydrated.current = true;
	}

	return (
		<PostHogProvider client={posthog}>
			<ThemeProvider
				attribute="class"
				defaultTheme="light"
				forcedTheme="light"
				disableTransitionOnChange
			>
				{children}
				<Toaster position="bottom-right" richColors closeButton />
			</ThemeProvider>
		</PostHogProvider>
	);
}
```

A prop `flags` e o Zustand continuam aqui temporariamente — vão sair na Task 6.

- [ ] **Step 4: Atualizar todos os importadores listados no Step 1**

Para cada arquivo listado pelo `rg`, troque:

```ts
// Antes
import { posthog } from "@/lib/posthog";

// Depois
import { posthog } from "@/lib/posthog/client";
```

Use o StrReplace ou edição manual. Em seguida verifique novamente:

```bash
rg "from \"@/lib/posthog\"" -n
```

Expected: zero matches em `src/`. Se sobrar algum, atualize.

- [ ] **Step 5: Deletar o arquivo antigo**

```bash
rm src/lib/posthog.ts
```

- [ ] **Step 6: Validar — lint, build e dev**

```bash
pnpm lint
pnpm build
```

Expected: ambos passam. O build deve mostrar a página `/` como **`○ (Static)`** ou **`● (SSG)`** (estática). Se mostrar `ƒ (Dynamic)`, **PARE** — algo no `<PostHogProvider>` está forçando dynamic. Provavelmente é uma versão errada de `@posthog/react`.

```bash
pnpm dev
```

Abra `http://localhost:3000` e verifique no DevTools → Console:
- Sem erros vermelhos novos
- `window.posthog` continua disponível (em dev)
- O banner do IRPF (se existir flag ativa em PROD) ainda aparece via Vercel Flags atual

- [ ] **Step 7: Commit**

```bash
git add src/lib/posthog/client.ts src/components/providers.tsx
git rm src/lib/posthog.ts
# (e quaisquer arquivos atualizados no Step 4)
git commit -m "feat(posthog): wrap app tree with PostHogProvider

Moves the posthog-js re-export to src/lib/posthog/client.ts and adds
@posthog/react PostHogProvider so client components can use feature
flag hooks. Vercel Flags + Zustand hydration is still in place; will
be removed in a later task."
```

---

## Task 2: PostHog server singleton

**Files:**
- Create: `src/lib/posthog/server.ts`

- [ ] **Step 1: Criar o singleton do `posthog-node`**

Crie `src/lib/posthog/server.ts`:

```ts
import "server-only";

import { PostHog } from "posthog-node";
import { env } from "@/lib/env";

let cachedClient: PostHog | null = null;

/**
 * Returns a singleton PostHog Node client for server-side flag evaluation.
 *
 * Configuration choices:
 * - **Remote evaluation** (default mode): each request fetches the current
 *   flag state from PostHog. Local evaluation is intentionally avoided —
 *   it polls definitions and evaluates locally, which doesn't fit
 *   stateless serverless functions on Vercel (cold starts re-poll, costs
 *   add up, and there's no shared cache between instances). Remote
 *   evaluation paired with Next.js `unstable_cache` (in `flags/resolve.ts`)
 *   gives us fresh-enough data with a single network call per ISR window.
 * - `flushAt: 1` + `flushInterval: 0`: flush events immediately. Serverless
 *   functions can be killed at any moment; we don't want events stuck in
 *   memory.
 * - The token is **optional** (see `env.ts`). When missing (e.g. CI builds
 *   without secrets), `getServerPostHog()` still returns a client; PostHog's
 *   SDK no-ops on calls when the key is invalid.
 */
export function getServerPostHog(): PostHog {
	if (cachedClient) return cachedClient;

	cachedClient = new PostHog(env.POSTHOG_API_KEY ?? "", {
		host: env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
		flushAt: 1,
		flushInterval: 0,
	});

	return cachedClient;
}
```

- [ ] **Step 2: Validar — lint passa**

```bash
pnpm lint
```

Expected: zero erros. Se `env.POSTHOG_API_KEY` der erro de tipo, confira se a Task 0 Step 4 foi aplicada corretamente.

- [ ] **Step 3: Commit**

```bash
git add src/lib/posthog/server.ts
git commit -m "feat(posthog): add posthog-node server singleton

Singleton client configured for remote evaluation. Local evaluation
is avoided because it doesn't fit stateless serverless on Vercel.
flushAt: 1 ensures events aren't lost when functions are killed."
```

---

## Task 3: Flag definitions (helper, schema, config)

**Files:**
- Create: `src/lib/posthog/flags/define.ts`
- Create: `src/lib/posthog/flags/schemas/banner.ts`
- Create: `src/lib/posthog/flags/config.ts`

- [ ] **Step 1: Criar o helper `defineConfigFlag`**

Crie `src/lib/posthog/flags/define.ts`:

```ts
import type { z } from "zod";

type ConfigFlagDefinition<TSchema extends z.ZodTypeAny> = {
	/** PostHog flag key (the slug shown in the UI). */
	key: string;
	description?: string;
	/** Zod schema validating the raw value coming from PostHog. */
	schema: TSchema;
	/** Default value used when the flag is missing or fails validation. */
	defaultValue: z.infer<TSchema>;
	/**
	 * `true` for JSON payload flags (PostHog returns the JSON in
	 * `featureFlagPayloads`); `false`/omitted for boolean or multivariant
	 * flags (returned in `featureFlags`).
	 */
	payload?: boolean;
};

export type AnyConfigFlag = ConfigFlagDefinition<z.ZodTypeAny>;

export function defineConfigFlag<TSchema extends z.ZodTypeAny>(
	def: ConfigFlagDefinition<TSchema>,
): ConfigFlagDefinition<TSchema> {
	return def;
}
```

- [ ] **Step 2: Criar o schema do banner com `.transform()`**

Crie `src/lib/posthog/flags/schemas/banner.ts`:

```ts
import { z } from "zod";

const bannerCtaSchema = z
	.object({
		label: z.string().min(1),
		href: z.string().min(1).optional(),
		whatsappText: z.string().min(1).optional(),
	})
	.refine((value) => Boolean(value.href) !== Boolean(value.whatsappText), {
		message: "Provide exactly one of `href` or `whatsappText`.",
	});

const bannerConfigBaseSchema = z.object({
	active: z.boolean(),
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	title: z.string(),
	description: z.string().optional(),
	storageKey: z.string(),
	icon: z.string().optional(),
	position: z.enum(["top", "bottom"]).optional().default("bottom"),
	cta: z.array(bannerCtaSchema).min(1).max(2).optional(),
	enabledOnPaths: z.array(z.string()).optional(),
});

export type BannerConfig = z.infer<typeof bannerConfigBaseSchema>;
export type BannerCtaConfig = z.infer<typeof bannerCtaSchema>;

/**
 * Banner schema with built-in temporal logic.
 *
 * Returns `BannerConfig` when the banner should render, `null` otherwise.
 * Combines what was previously split between `bannerConfigSchema` and
 * `resolveBanner()` into a single Zod transform: validation + active flag +
 * date window all happen here.
 *
 * Dates are interpreted in BRT (UTC-3). Temporal precision is bounded by
 * the ISR cache window in `flags/resolve.ts` (~60s).
 */
export const bannerConfigSchema = bannerConfigBaseSchema
	.nullable()
	.transform((config): BannerConfig | null => {
		if (!config || !config.active) return null;

		const now = new Date();

		if (config.startDate) {
			const start = new Date(`${config.startDate}T00:00:00-03:00`);
			if (now < start) return null;
		}

		if (config.endDate) {
			const end = new Date(`${config.endDate}T23:59:59.999-03:00`);
			if (now > end) return null;
		}

		return config;
	});
```

- [ ] **Step 3: Criar o `config.ts` com as 3 flags**

Crie `src/lib/posthog/flags/config.ts`:

```ts
import { z } from "zod";
import { defineConfigFlag } from "./define";
import { bannerConfigSchema } from "./schemas/banner";

export const isLogoTextCentered = defineConfigFlag({
	key: "logo-text-centered",
	description: "Centraliza o texto do logo verticalmente",
	schema: z.boolean(),
	defaultValue: false,
});

export const socialProofType = defineConfigFlag({
	key: "social-proof-type",
	description: "Variante da seção de prova social",
	schema: z.enum(["clients", "credentials", "statement"]),
	defaultValue: "credentials" as const,
});

export const irpfBanner = defineConfigFlag({
	key: "irpf-banner",
	description: "Banner promocional do IRPF 2026 (JSON payload)",
	schema: bannerConfigSchema,
	defaultValue: null,
	payload: true,
});

export const allFlags = {
	isLogoTextCentered,
	socialProofType,
	irpfBanner,
} as const;

export type AllFlagsMap = typeof allFlags;
```

- [ ] **Step 4: Validar**

```bash
pnpm lint
```

Expected: zero erros. Se `defaultValue: "credentials"` der erro de tipo (porque o schema é `z.enum`), confirme que o `as const` está aplicado.

- [ ] **Step 5: Commit**

```bash
git add src/lib/posthog/flags/define.ts src/lib/posthog/flags/schemas/banner.ts src/lib/posthog/flags/config.ts
git commit -m "feat(posthog): define feature flags with zod schemas

Adds defineConfigFlag helper, the three current flags
(logo-text-centered, social-proof-type, irpf-banner) and the banner
schema with built-in active/date-window transform. The transform
folds the old resolveBanner() logic into the schema, so consumers
get either a valid BannerConfig or null."
```

---

## Task 4: `resolveAll` with `unstable_cache`

**Files:**
- Create: `src/lib/posthog/flags/resolve.ts`
- Create: `src/lib/posthog/flags/index.ts` (barrel export)

- [ ] **Step 1: Criar `resolve.ts`**

Crie `src/lib/posthog/flags/resolve.ts`:

```ts
import "server-only";

import { unstable_cache } from "next/cache";
import { getServerPostHog } from "../server";
import { type AllFlagsMap, type AnyConfigFlag, allFlags } from "./config";

/**
 * Strongly-typed shape of the resolved flags map. Each key matches the
 * variable name in `flags/config.ts`; each value is `z.infer` of the
 * flag's schema.
 */
export type FlagsState = {
	[K in keyof AllFlagsMap]: AllFlagsMap[K] extends {
		schema: infer S extends import("zod").ZodTypeAny;
	}
		? import("zod").infer<S>
		: never;
};

/**
 * Distinct ID used for server-side flag evaluation on the public
 * marketing site. All current flags target 100% of users (config flags,
 * not experiments), so the identifier is irrelevant — PostHog will
 * return the same payload regardless. Using a fixed string keeps the
 * unstable_cache key deterministic.
 */
const ANONYMOUS_DISTINCT_ID = "anonymous-marketing-visitor";

const fetchAllFlagsFromPostHog = unstable_cache(
	async () => {
		const posthog = getServerPostHog();
		try {
			return await posthog.getAllFlagsAndPayloads(ANONYMOUS_DISTINCT_ID);
		} catch (error) {
			console.error(
				"[posthog] failed to fetch flags, falling back to defaults",
				error,
			);
			return { featureFlags: {}, featureFlagPayloads: {} };
		}
	},
	["posthog-config-flags"],
	{
		// 60s aligns with our ISR posture: flag changes in the PostHog UI
		// reflect on the live site within a minute, no deploy required.
		revalidate: 60,
		tags: ["posthog-flags"],
	},
);

/**
 * Resolves every flag declared in `allFlags` to a typed value.
 *
 * Reads from PostHog through `unstable_cache` (60s window) so the marketing
 * pages stay statically generated / ISR-cacheable. Validates each value
 * with the flag's Zod schema; on validation failure, returns the flag's
 * `defaultValue`.
 */
export async function resolveAll(): Promise<FlagsState> {
	const result = await fetchAllFlagsFromPostHog();
	const featureFlags = result.featureFlags ?? {};
	const featureFlagPayloads = result.featureFlagPayloads ?? {};

	const entries = Object.entries(allFlags).map(([stateKey, def]) => {
		const flagDef = def as AnyConfigFlag;
		const raw = flagDef.payload
			? featureFlagPayloads[flagDef.key]
			: featureFlags[flagDef.key];

		const parsed = flagDef.schema.safeParse(raw);
		return [stateKey, parsed.success ? parsed.data : flagDef.defaultValue];
	});

	return Object.fromEntries(entries) as FlagsState;
}
```

- [ ] **Step 2: Criar barrel export `flags/index.ts`**

Crie `src/lib/posthog/flags/index.ts`:

```ts
export { allFlags } from "./config";
export type { FlagsState } from "./resolve";
export { resolveAll } from "./resolve";
export { bannerConfigSchema } from "./schemas/banner";
export type { BannerConfig, BannerCtaConfig } from "./schemas/banner";
```

- [ ] **Step 3: Validar lint e build**

```bash
pnpm lint
pnpm build
```

Expected: zero erros. O `resolveAll` ainda não é chamado por ninguém — apenas registra o módulo. O build deve seguir tratando `/` como estática.

- [ ] **Step 4: Smoke-test em dev**

```bash
pnpm dev
```

Abra `http://localhost:3000` (a página continua usando o sistema antigo de Vercel Flags por enquanto — só estamos validando que `resolveAll` compila e o servidor sobe sem erros). Verifique no terminal do dev server que **não há** erro `[posthog] failed to fetch flags`. Se houver, confirme que `POSTHOG_API_KEY` está em `.env.local` (Task 0).

Pare o dev server (`Ctrl+C`).

- [ ] **Step 5: Commit**

```bash
git add src/lib/posthog/flags/resolve.ts src/lib/posthog/flags/index.ts
git commit -m "feat(posthog): add resolveAll with ISR-friendly cache

resolveAll() fetches all defined flags via posthog-node and validates
them with each flag's Zod schema. unstable_cache(revalidate: 60)
bounds the network calls to ~once per minute and keeps the marketing
pages statically renderable. Falls back to defaults on API failure."
```

---

## Task 5: Refactor `Logo` and `Header` to use props

**Files:**
- Modify: `src/components/logo.tsx:96-126` (props + remove `useFlag`)
- Modify: `src/components/header.tsx:58-143` (forward prop to Logo)

> Esse refator desacopla o `Logo` do Zustand. Como ele só é usado dentro de `<Header>`, basta passar a flag como prop. O ganho é que o `Logo` vira "burro" (mais reutilizável) e some uma dependência da store que vai ser deletada.

- [ ] **Step 1: Atualizar `src/components/logo.tsx`**

Substitua o tipo e o corpo da função:

```tsx
"use client";

import { motion, type Variants } from "framer-motion";
import { company } from "@/content/company";
import { cn } from "@/lib/utils";

const EASING: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const LETTERS = [
	{
		char: company.brand.displayName.split("")[0],
		color: "text-primary",
		delay: 0.6,
	},
	{
		char: company.brand.displayName.split("")[1],
		color: "text-primary",
		delay: 0.66,
	},
	{
		char: company.brand.displayName.split("")[2],
		color: "text-primary",
		delay: 0.72,
	},
	{
		char: company.brand.displayName.split("")[3],
		color: "text-highlight",
		delay: 0.82,
	},
	{
		char: company.brand.displayName.split("")[4],
		color: "text-highlight",
		delay: 0.88,
	},
	{
		char: company.brand.displayName.split("")[5],
		color: "text-highlight",
		delay: 0.94,
	},
];

const logoVariants: Variants = {
	hidden: { opacity: 0, scale: 3 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: {
			duration: 0.5,
			ease: EASING,
			opacity: { duration: 0.2 },
		},
	},
};

const textRevealVariants: Variants = {
	hidden: { width: 0 },
	visible: {
		width: "auto",
		transition: { delay: 0.5, duration: 0.4, ease: EASING },
	},
};

const letterVariants: Variants = {
	hidden: { opacity: 0, x: 24 },
	visible: (delay: number) => ({
		opacity: 1,
		x: 0,
		transition: { delay, duration: 0.3, ease: EASING },
	}),
};

const subtitleWrapVariants: Variants = {
	hidden: { height: 0 },
	visible: {
		height: "auto",
		transition: { delay: 1.2, duration: 0.35, ease: EASING },
	},
};

const subtitleVariants: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { delay: 1.3, duration: 0.4, ease: EASING },
	},
};

const SIZE_PRESETS = {
	sm: { logo: 28, text: "text-lg", subtitle: "text-[0.45rem]" },
	md: { logo: 30, text: "text-xl", subtitle: "text-[0.55rem]" },
	lg: { logo: 38, text: "text-2xl", subtitle: "text-xs" },
} as const;

type LogoSize = keyof typeof SIZE_PRESETS;

type LogoProps = {
	className?: string;
	size?: LogoSize;
	subtitleClassName?: string;
	showSubtitle?: boolean;
	animated?: boolean;
	/** When true, vertically centers the title text (controlled by feature flag). */
	isCentered?: boolean;
};

export function Logo({
	className,
	size = "md",
	subtitleClassName,
	showSubtitle = true,
	animated = true,
	isCentered = false,
}: LogoProps) {
	const { logo, text, subtitle } = SIZE_PRESETS[size];

	return (
		<motion.div
			className={cn("flex items-center gap-2", className)}
			initial={animated ? "hidden" : "visible"}
			animate="visible"
			aria-label={company.brand.name}
		>
			<motion.div variants={logoVariants}>
				<LogoIcon size={logo} />
			</motion.div>
			<div className={cn("flex flex-col", isCentered && "items-center")}>
				<motion.div variants={textRevealVariants} className="overflow-hidden">
					<span
						className={cn(
							"flex select-none whitespace-nowrap font-logo font-semibold tracking-wide",
							text,
						)}
					>
						{LETTERS.map((letter, i) => (
							<motion.span
								// biome-ignore lint/suspicious/noArrayIndexKey: static list with duplicate chars needs index for unique keys
								key={`${letter.char}-${i}`}
								variants={letterVariants}
								custom={letter.delay}
								className={letter.color}
							>
								{letter.char}
							</motion.span>
						))}
					</span>
				</motion.div>
				{showSubtitle && (
					<motion.div
						variants={subtitleWrapVariants}
						className="overflow-hidden"
					>
						<motion.span
							variants={subtitleVariants}
							className={cn(
								"block select-none font-medium font-subtitle text-primary uppercase tracking-[0.28em]",
								subtitle,
								subtitleClassName,
							)}
						>
							{company.brand.subtitle}
						</motion.span>
					</motion.div>
				)}
			</div>
		</motion.div>
	);
}

function LogoIcon({ size = 40 }: { size?: number }) {
	const aspectRatio = 307 / 267;
	const width = Math.round(size * aspectRatio);

	return (
		<svg
			width={width}
			height={size}
			viewBox="0 0 307 267"
			fill="none"
			aria-hidden="true"
		>
			<path
				d="M239.5 45.5029V43.5029H306V45.5029C293.504 46.7908 289.588 51.2407 289.5 67.5029V239.503C289.354 254.116 293.662 258.412 306.5 261.503V263.503H238.5V261.503C254.597 257.338 255.49 251.529 255.5 239.503V67.5029C255.733 55.9914 253.468 46.6207 239.5 45.5029Z"
				className="fill-primary stroke-primary"
			/>
			<path
				d="M255 150.503V143.503C201.423 139.174 151.984 134.469 109 141.003C52.9999 152.003 -0.111481 193.607 0.999803 232.503C1.58526 252.995 20.9998 266.638 52.9998 265.503C123.5 263.003 185.5 213.503 205 161.003C189.416 162.818 178.276 162.661 161.5 161.003C169 193.003 115.5 254.003 66.4997 252.503C43.9998 252.503 36.1271 237.216 36.9997 224.503C38.4998 189.003 76.0731 157.547 141.5 150.503C176.758 147.776 210.312 150.104 255 150.503Z"
				className="fill-primary stroke-primary"
			/>
			<path
				d="M205.5 128.003C211.094 47.1978 164.02 0.562145 86 1.00293L0.5 0.502934V2.50298C13.9499 3.33558 22.5248 7.36422 22 40.503V170.003C34.2902 156.346 43.0117 151.175 56.5 146.503V10.0029C56.5 10.0029 90 9.50293 97 10.0029C149 14.5029 172.5 63.0029 163 128.003C181.153 125.505 187.242 125.277 205.5 128.003Z"
				className="fill-highlight stroke-highlight"
			/>
			<circle
				cx="113.5"
				cy="99.5029"
				r="14.5"
				className="fill-highlight stroke-highlight"
			/>
		</svg>
	);
}
```

Diferenças vs. atual:
- Removido `import { useFlag } from "@/stores/use-flags-store"`
- Adicionada prop `isCentered?: boolean` (default `false`)
- Substituído `const { isLogoTextCentered } = useFlag()` pelo uso direto da prop `isCentered`

- [ ] **Step 2: Atualizar `src/components/header.tsx` pra aceitar a prop**

Edite a assinatura e o uso do `<Logo>`:

```tsx
// linha ~58, na assinatura de Header
type HeaderProps = {
	isLogoCentered?: boolean;
};

export function Header({ isLogoCentered = false }: HeaderProps) {
	const messages = useMessages();
	// ... resto idêntico ao atual
```

E no JSX onde `<Logo>` é renderizado (linha ~142):

```tsx
<HomeLink>
	<Logo isCentered={isLogoCentered} />
</HomeLink>
```

Mantenha tudo o mais igual.

- [ ] **Step 3: Validar — lint e build**

```bash
pnpm lint
pnpm build
```

Expected: zero erros. Como `<Header>` ainda é chamado sem props no `layout.tsx` (será corrigido na Task 6), o `isLogoCentered` cai no default `false` — comportamento idêntico ao Vercel Flag desligado.

- [ ] **Step 4: Smoke-test visual em dev**

```bash
pnpm dev
```

Abra `http://localhost:3000`. O logo no header deve renderizar **idêntico** ao que era antes (já que o flag default é `false`). Pare o dev (`Ctrl+C`).

- [ ] **Step 5: Commit**

```bash
git add src/components/logo.tsx src/components/header.tsx
git commit -m "refactor(logo): accept isCentered as prop instead of zustand hook

Decouples Logo from the flags store so it can be driven from a server
component via props. Header forwards an isLogoCentered prop (default
false). The flag value will be wired up from resolveAll() in a later
task; until then behavior matches the default-off case."
```

---

## Task 6: Wire `resolveAll` into layout and page

**Files:**
- Modify: `src/app/layout.tsx` (entire file)
- Modify: `src/app/page.tsx` (entire file)
- Modify: `src/components/providers.tsx` (remove `flags` prop and Zustand hydration)

> Essa é a task que **troca o motor**: `layout.tsx` e `page.tsx` deixam de ler do Vercel Flags e passam a ler do PostHog. Após esta task, o sistema antigo (`src/lib/flags/`, `use-flags-store`) ainda existe mas está órfão — será removido na Task 8.

- [ ] **Step 1: Atualizar `src/app/layout.tsx`**

Substitua os imports de flags e o uso no componente:

```tsx
import { SpeedInsights } from "@vercel/speed-insights/next";
import { VercelToolbar } from "@vercel/toolbar/next";

import type { Metadata } from "next";
import {
	Inter,
	JetBrains_Mono,
	Marcellus,
	Playfair_Display,
	Plus_Jakarta_Sans,
} from "next/font/google";
import { Banner } from "@/components/banner";
import { JsonLd } from "@/components/json-ld";
import { Providers } from "@/components/providers";
import "./globals.css";
import { Header } from "@/components/header";
import { company } from "@/content/company";
import { messages } from "@/content/messages";
import { getBannerIcon } from "@/lib/banner-icons";
import { resolveAll } from "@/lib/posthog/flags";
import {
	getLocalBusinessSchema,
	getWebSiteSchema,
} from "@/lib/structured-data";

const plusJakartaSans = Plus_Jakarta_Sans({
	variable: "--font-plus-jakarta",
	subsets: ["latin"],
});

const marcellus = Marcellus({
	variable: "--font-marcellus",
	subsets: ["latin"],
	weight: ["400"],
});

const jetbrainsMono = JetBrains_Mono({
	variable: "--font-jetbrains-mono",
	subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
	variable: "--font-playfair",
	subsets: ["latin"],
});

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
	weight: ["500"],
});

const { title, description } = messages.home.metadata;

export const metadata: Metadata = {
	metadataBase: new URL(company.siteUrl),
	title,
	description,
	alternates: {
		canonical: "/",
	},
	openGraph: {
		title,
		description,
		url: "/",
		siteName: company.brand.name,
		locale: "pt_BR",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title,
		description,
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const shouldInjectToolbar = process.env.NODE_ENV === "development";

	const flags = await resolveAll();
	// flags.irpfBanner is already BannerConfig | null (the schema's transform
	// validates active state and the date window). Ready to render.
	const banner = flags.irpfBanner;

	return (
		<html lang="pt-BR" suppressHydrationWarning>
			<head>
				<JsonLd data={getWebSiteSchema()} />
				<JsonLd data={getLocalBusinessSchema()} />
			</head>
			<body
				suppressHydrationWarning
				className={`${plusJakartaSans.variable} ${marcellus.variable} ${jetbrainsMono.variable} ${playfairDisplay.variable} ${inter.variable} antialiased`}
			>
				<Providers>
					<Header isLogoCentered={flags.isLogoTextCentered} />
					{children}
					{banner && (
						<Banner
							icon={getBannerIcon(banner.icon)}
							title={banner.title}
							description={banner.description}
							storageKey={banner.storageKey}
							dismissLabel={messages.common.a11y.closeBanner}
							ctas={banner.cta?.map((cta) =>
								cta.whatsappText
									? {
											label: cta.label,
											href: company.links.whatsappUrl(cta.whatsappText),
											external: true,
										}
									: {
											label: cta.label,
											// biome-ignore lint/style/noNonNullAssertion: schema guarantees href when whatsappText is absent
											href: cta.href!,
											external: false,
										},
							)}
							position={banner.position}
							enabledOnPaths={banner.enabledOnPaths}
						/>
					)}
				</Providers>
				{shouldInjectToolbar && <VercelToolbar />}
				<SpeedInsights />
			</body>
		</html>
	);
}
```

Diferenças vs. atual:
- `import { resolveAll, resolveBanner } from "@/lib/flags"` → `import { resolveAll } from "@/lib/posthog/flags"`
- `const flagValues = await resolveAll(); const banner = resolveBanner(flagValues.irpfBanner);` → `const flags = await resolveAll(); const banner = flags.irpfBanner;`
- `<Providers flags={flagValues}>` → `<Providers>` (sem prop)
- `<Header />` → `<Header isLogoCentered={flags.isLogoTextCentered} />`

> O `<VercelToolbar>` continua nesta task — sai na Task 7.

- [ ] **Step 2: Atualizar `src/app/page.tsx`**

Substitua o conteúdo:

```tsx
import { AboutSection } from "@/components/about-section";
import { CtaSection } from "@/components/cta-section";
import { FaqSection } from "@/components/faq-section";
import { StackedFeatures } from "@/components/feature-section";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/hero";
import { JsonLd } from "@/components/json-ld";
import { SocialProofSection } from "@/components/social-proof-section";
import { messages } from "@/content/messages";
import { resolveAll } from "@/lib/posthog/flags";
import { getFaqSchema } from "@/lib/structured-data";

const features = messages.home.features;

export default async function Home() {
	const flags = await resolveAll();

	return (
		<div className="flex w-full flex-col">
			<JsonLd data={getFaqSchema()} />
			<main className="grow">
				<HeroSection />
				<SocialProofSection variant={flags.socialProofType} />
				<StackedFeatures features={features} />
				<AboutSection />
				<FaqSection />
				<CtaSection />
			</main>
			<Footer />
		</div>
	);
}
```

Diferenças:
- `import { socialProofType } from "@/lib/flags"` removido; importa `resolveAll` do novo módulo
- `import type { SocialProofVariant }` e o cast `as SocialProofVariant` removidos — o tipo do `flags.socialProofType` já é `"clients" | "credentials" | "statement"` (do schema do enum)

- [ ] **Step 3: Atualizar `src/components/providers.tsx`** — remover `flags` prop e Zustand

```tsx
"use client";

import { PostHogProvider } from "@posthog/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { posthog } from "@/lib/posthog/client";

type ProvidersProps = {
	children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
	return (
		<PostHogProvider client={posthog}>
			<ThemeProvider
				attribute="class"
				defaultTheme="light"
				forcedTheme="light"
				disableTransitionOnChange
			>
				{children}
				<Toaster position="bottom-right" richColors closeButton />
			</ThemeProvider>
		</PostHogProvider>
	);
}
```

Removido:
- `import { useRef } from "react"`
- `import type { FlagsState } from "@/lib/flags"`
- `import { useFlagsStore } from "@/stores/use-flags-store"`
- Prop `flags` e a hidratação do Zustand

- [ ] **Step 4: Validar — lint e build**

```bash
pnpm lint
pnpm build
```

Expected: ambos passam. Confira no output do build:

```
Route (app)                              Size  First Load JS
┌ ○ /                                   ...
```

A `/` precisa estar com **`○ (Static)`**. Se aparecer **`ƒ (Dynamic)`**, alguma coisa está forçando dynamic — possivelmente o `posthog-node` ou o `@posthog/react`. Investigue antes de prosseguir.

- [ ] **Step 5: Smoke-test visual completo em dev**

```bash
pnpm dev
```

Abra `http://localhost:3000` e valide as 3 flags:

1. **Logo:** com `logo-text-centered` desligada no PostHog UI (ou usando default), o texto do logo deve aparecer alinhado **ao topo** (atual). Ligue a flag em PROD no PostHog → recarregue após ~60s → texto deve centralizar verticalmente. *(Pode pular se não tiver acesso ao PostHog UI agora — o fallback default é o mesmo do estado atual.)*
2. **Social proof:** verifique o texto da seção "Social Proof". Com `social-proof-type=credentials` (default) ela mostra a variante de credenciais. Mude no PostHog → 60s → recarregue → variante muda.
3. **Banner IRPF:** se o flag JSON tiver `active: true` e estiver na janela de datas, o banner aparece no rodapé (ou topo, conforme `position`). Caso contrário, fica oculto. Comportamento idêntico ao atual.

Pare o dev (`Ctrl+C`).

- [ ] **Step 6: Commit**

```bash
git add src/app/layout.tsx src/app/page.tsx src/components/providers.tsx
git commit -m "feat(posthog): switch flag consumers to posthog-based resolveAll

layout.tsx and page.tsx now read flags from src/lib/posthog/flags
instead of @/lib/flags. The banner is consumed directly (Zod
transform handles active+date-window). Providers no longer hydrates
Zustand — Logo gets isCentered via prop chain through Header.

The old src/lib/flags directory and the flags Zustand store are now
orphaned and will be deleted in a follow-up task."
```

---

## Task 7: Remove `@vercel/toolbar`

**Files:**
- Modify: `src/app/layout.tsx` (remove import + render of `<VercelToolbar />`)
- Modify: `next.config.ts` (remove `createWithVercelToolbar` plugin)
- Modify: `package.json` (via pnpm CLI)

- [ ] **Step 1: Remover `<VercelToolbar />` do `layout.tsx`**

Edite `src/app/layout.tsx`:

1. Remova a linha 2: `import { VercelToolbar } from "@vercel/toolbar/next";`
2. Remova a linha que define `shouldInjectToolbar`:
   ```ts
   const shouldInjectToolbar = process.env.NODE_ENV === "development";
   ```
3. Remova o JSX `{shouldInjectToolbar && <VercelToolbar />}`.

O bloco `<body>` final deve ficar:

```tsx
<body
	suppressHydrationWarning
	className={`${plusJakartaSans.variable} ${marcellus.variable} ${jetbrainsMono.variable} ${playfairDisplay.variable} ${inter.variable} antialiased`}
>
	<Providers>
		<Header isLogoCentered={flags.isLogoTextCentered} />
		{children}
		{banner && (
			<Banner
				/* ...props inalterados... */
			/>
		)}
	</Providers>
	<SpeedInsights />
</body>
```

- [ ] **Step 2: Remover o plugin do `next.config.ts`**

Substitua `next.config.ts` por:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Expose Vercel's server-side `VERCEL_ENV` to the client bundle as
	// `NEXT_PUBLIC_VERCEL_ENV`. Used by `instrumentation-client.ts` to gate
	// PostHog analytics capture (off outside production) while keeping the
	// SDK initialized everywhere so feature flags still work.
	// In local dev `VERCEL_ENV` is `undefined`; the client code falls back
	// to `"development"`.
	env: {
		// biome-ignore lint/style/useNamingConvention: Next.js requires SCREAMING_SNAKE_CASE for env keys
		NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV,
	},

	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
		],
	},
	allowedDevOrigins: ["192.168.*.*", "10.*.*.*"],

	// Reverse proxy for PostHog. Routing analytics through a same-origin path
	// ("/ingest") drastically reduces losses to ad blockers / privacy extensions
	// that match the "us.i.posthog.com" domain in their blocklists.
	// Ref: https://posthog.com/docs/advanced/proxy/nextjs
	skipTrailingSlashRedirect: true,
	async rewrites() {
		return [
			// Static SDK assets (recorder bundle, survey widget, etc.) live on a
			// separate CDN host (`us-assets.i.posthog.com`) — keep this rule above
			// the catch-all so it matches first.
			{
				source: "/ingest/static/:path*",
				destination: "https://us-assets.i.posthog.com/static/:path*",
			},
			{
				source: "/ingest/:path*",
				destination: "https://us.i.posthog.com/:path*",
			},
		];
	},
};

export default nextConfig;
```

Removido:
- `import createWithVercelToolbar from "@vercel/toolbar/plugins/next";`
- `const withVercelToolbar = createWithVercelToolbar();`
- `export default withVercelToolbar(nextConfig);` → `export default nextConfig;`

- [ ] **Step 3: Desinstalar o pacote**

```bash
pnpm remove @vercel/toolbar
```

Expected: `package.json` perde `@vercel/toolbar` em `dependencies`. `pnpm-lock.yaml` atualizado.

- [ ] **Step 4: Validar — lint e build**

```bash
pnpm lint
pnpm build
```

Expected: ambos passam. Não pode haver erros de import faltando.

- [ ] **Step 5: Smoke-test em dev**

```bash
pnpm dev
```

Abra `http://localhost:3000`. Antes da remoção, em dev aparecia o "Vercel Toolbar" no canto inferior direito. Agora **não deve** mais aparecer. O resto da página continua idêntico. Pare o dev (`Ctrl+C`).

- [ ] **Step 6: Commit**

```bash
git add src/app/layout.tsx next.config.ts package.json pnpm-lock.yaml
git commit -m "chore(deps): remove @vercel/toolbar

The toolbar was added solely as part of the Vercel Flags setup and
no other Vercel features (preview comments, draft mode, etc.) are in
use. Without Vercel Flags it has no purpose."
```

---

## Task 8: Delete legacy flag code

**Files:**
- Delete: `src/lib/flags/` (recursive)
- Delete: `src/stores/use-flags-store.ts`
- Delete: `src/app/.well-known/vercel/flags/route.ts`
- Delete: `src/app/.well-known/vercel/flags/` (empty dir)
- Delete: `src/app/.well-known/vercel/` (empty dir)
- Delete: `src/app/.well-known/` (empty dir, only if no other content)
- Delete: `.agents/skills/flags-sdk/` (recursive)
- Modify: `package.json` (via pnpm CLI — remove `flags`, `@flags-sdk/vercel`)

- [ ] **Step 1: Confirmar que ninguém mais importa o sistema antigo**

```bash
rg "from \"@/lib/flags" -n
rg "from \"@/stores/use-flags-store\"" -n
rg "@flags-sdk/vercel" -n --glob '!pnpm-lock.yaml' --glob '!package.json'
```

Expected: zero matches em todos. Se houver algum match, **PARE** e atualize o consumidor antes de deletar.

- [ ] **Step 2: Deletar diretórios e arquivos**

```bash
rm -rf src/lib/flags
rm src/stores/use-flags-store.ts
rm -rf src/app/.well-known
rm -rf .agents/skills/flags-sdk
```

A pasta `src/app/.well-known/` é deletada inteira porque ela só contém o endpoint do Vercel Flags. Confirme com `ls src/app/.well-known 2>/dev/null` (não deve existir).

- [ ] **Step 3: Desinstalar pacotes do Vercel Flags**

```bash
pnpm remove flags @flags-sdk/vercel
```

Expected: `package.json` perde `flags` e `@flags-sdk/vercel` em `dependencies`. `pnpm-lock.yaml` atualizado.

- [ ] **Step 4: Validar — lint e build limpos**

```bash
pnpm lint
pnpm build
```

Expected: ambos passam **sem warnings novos**. Confira novamente que `/` é estática (`○`).

- [ ] **Step 5: Smoke-test final**

```bash
pnpm dev
```

Abra `http://localhost:3000`. Verifique:
- Página renderiza sem erros no console
- Logo aparece corretamente
- Social Proof renderiza a variante esperada
- Banner aparece/some conforme configurado no PostHog
- Sem erros de import faltando no terminal do dev

Pare o dev (`Ctrl+C`).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore(flags): remove legacy vercel flags system

Deletes src/lib/flags/, src/stores/use-flags-store.ts,
src/app/.well-known/vercel/flags/route.ts, and the obsolete
.agents/skills/flags-sdk skill. Removes the flags and
@flags-sdk/vercel packages. PostHog Feature Flags is now the
single source of truth."
```

---

## Task 9: Update documentation and persistent memory

**Files:**
- Modify: `docs/architecture.md` (seção sobre flags / Vercel Flags)
- Modify: `docs/roadmap.md` (referências a Vercel Flags se houver)
- Modify (memória persistente Zé Papagaio): `/Users/gvieiram/cofre/ai-zepapagaio/claude-memory/project_duohub_observabilidade.md` (ou similar)
- Modify (memória persistente): `/Users/gvieiram/cofre/ai-zepapagaio/claude-memory/MEMORY.md` (se houver entrada nova)

- [ ] **Step 1: Buscar menções a Vercel Flags na documentação**

```bash
rg -i "vercel flags|flags-sdk|@flags-sdk|use-flags-store|src/lib/flags" docs/
```

Anote cada arquivo. Os candidatos esperados são `docs/architecture.md` e talvez `docs/roadmap.md`.

- [ ] **Step 2: Atualizar `docs/architecture.md`**

Em qualquer seção que descrevia "Vercel Flags como solução de feature flags", substitua a descrição por:

```markdown
### Feature Flags

Usamos **PostHog Feature Flags** como única fonte de verdade pra config flags
(`logo-text-centered`, `social-proof-type`, `irpf-banner`) e, futuramente,
A/B testing client-side.

**Server (config flags globais):**
- `posthog-node` em `src/lib/posthog/server.ts` (singleton, modo remote evaluation).
- `resolveAll()` em `src/lib/posthog/flags/resolve.ts` busca todas as flags com
  `getAllFlagsAndPayloads("anonymous-marketing-visitor")`, validando cada valor
  com Zod (`.safeParse`) e caindo no `defaultValue` em caso de falha.
- O fetch é envolvido em `unstable_cache(revalidate: 60, tags: ["posthog-flags"])`,
  o que mantém a landing pública estática (ISR) e limita o tráfego ao PostHog
  a no máximo uma chamada por minuto.

**Client (preparação pra A/B testing futuro):**
- `<PostHogProvider>` em `src/components/providers.tsx` envolve a árvore.
- Hooks de `@posthog/react` (`useFeatureFlagVariantKey`, etc.) ficam disponíveis
  pra qualquer client component.
- Ainda não há experiment flags em uso — a infra existe, mas a primeira flag
  desse tipo só será criada quando houver um teste real planejado.

**Validação de payloads:**
- Toda flag declara um schema Zod em `src/lib/posthog/flags/config.ts`.
- O schema do banner (`src/lib/posthog/flags/schemas/banner.ts`) inclui um
  `.transform()` que absorve a lógica de `active` + janela de datas (BRT). O
  consumidor recebe `BannerConfig | null` direto.

**Por que não Vercel Flags / Feature Flags SDK:**
- O time já paga por PostHog (analytics + session replay); ter dois sistemas
  de flags era desnecessário.
- O setup customizado anterior (Zustand pra hidratar flags no cliente) era
  legal-mas-frágil: agora todo state vive no server e só o que vira variante
  visual é passado como prop.
```

- [ ] **Step 3: Atualizar `docs/roadmap.md` se necessário**

Verifique o output do `rg` no Step 1. Se houver menção a "Vercel Flags" no roadmap, troque por "PostHog Feature Flags". Se não houver, pule.

- [ ] **Step 4: Atualizar memória persistente do Zé Papagaio**

Use `rag_search` pra ver se já existe nota sobre o tema:

```
rag_search "vercel flags posthog feature flags duohub"
```

- Se existir uma nota sobre flags (`project_duohub_*` mencionando Vercel Flags), edite ela trocando "Vercel Flags" por "PostHog Feature Flags" e adicionando uma linha tipo "Migrado em 2026-04-25 — DUO-32".
- Se não existir nota específica, crie uma nova em `/Users/gvieiram/cofre/ai-zepapagaio/claude-memory/project_duohub_feature_flags.md`:

```markdown
---
name: project_duohub_feature_flags
description: "Sistema de feature flags do DuoHub: PostHog (post-migração DUO-32)"
type: project
project: duohub
---

# Feature Flags — DuoHub

## Stack
- **Server:** `posthog-node` em `src/lib/posthog/server.ts` (singleton, remote evaluation).
- **Client:** `<PostHogProvider>` (`@posthog/react`) em `src/components/providers.tsx`.
- **Cache:** `unstable_cache(revalidate: 60, tags: ["posthog-flags"])` no `resolveAll`.
- **Validação:** Zod schemas por flag em `src/lib/posthog/flags/config.ts`.

## Flags ativas
- `logo-text-centered` (boolean, default `false`)
- `social-proof-type` (enum: `clients` | `credentials` | `statement`, default `credentials`)
- `irpf-banner` (JSON payload — banner promocional com janela de datas embutida no schema)

## Princípios
- **Páginas públicas continuam estáticas.** Server-side nunca lê cookies/headers
  pra resolver flags — usa `distinct_id` fixo (`"anonymous-marketing-visitor"`).
  Identificação por usuário só vai existir quando começar A/B testing client-side.
- **Defaults seguros.** Se a chamada ao PostHog falhar, `resolveAll` cai no
  `defaultValue` declarado e segue renderizando.
- **Banner com data-window:** lógica de `active` + start/end vive no `.transform()`
  do schema, não em utilitário separado. Janela é em BRT (UTC-3).

## Histórico
- **2026-04-25 (DUO-32):** Migração do Vercel Flags (`@flags-sdk/vercel` + Zustand)
  pra PostHog. `@vercel/toolbar` removido junto (sem outras Vercel features em uso).
```

E adicione a linha em `MEMORY.md` na seção Projects:

```markdown
- [[project_duohub_feature_flags]] — Sistema de feature flags do DuoHub via PostHog
```

- [ ] **Step 5: Validar — lint final e build**

```bash
pnpm lint
pnpm build
```

Expected: ambos passam limpo. Esta é a verificação final antes do PR.

- [ ] **Step 6: Commit**

```bash
git add docs/
git commit -m "docs: update architecture and roadmap for posthog flags

Replaces Vercel Flags references with PostHog Feature Flags. Adds
a dedicated section explaining the hybrid client/server strategy,
ISR caching, and Zod validation. Persistent agent memory updated
out-of-band (claude-memory)."
```

---

## Final review (Level 2 — before PR)

Conforme `.cursor/rules/review-before-completion.mdc`, antes de abrir o PR:

- [ ] **Step 1: Diff completo da branch**

```bash
git diff main...HEAD --stat
git log main..HEAD --oneline
```

Expected: 9 commits (Task 0 → Task 9), arquivos coerentes (sem dumps de pacotes não relacionados).

- [ ] **Step 2: Despachar code-reviewer subagent**

Use a skill `requesting-code-review` ou despache diretamente:

> "Review the diff between main and feat/DUO-32/posthog-feature-flags-migration. Check against the project's review-before-completion checklist (Critical/Important/Minor). Pay special attention to: (1) page `/` continues to be statically generated in `pnpm build` output; (2) no hardcoded user-facing strings — pt-BR content stays in `src/content/`; (3) no leaked Vercel Flags references in code or docs; (4) Zod schemas correctly validate the three flag values."

- [ ] **Step 3: Resolver issues Critical/Important**

Para cada issue, fix in-place ou abra discussão. Não claim completion até ambas as classes estarem zeradas.

- [ ] **Step 4: Build limpo final**

```bash
pnpm lint
pnpm build
```

Expected: zero erros, zero warnings novos. `/` aparece como `○ (Static)` no output do `next build`.

- [ ] **Step 5: Push e abrir PR**

```bash
git push -u origin feat/DUO-32/posthog-feature-flags-migration
gh pr create --title "feat(posthog): migrate from vercel flags to posthog feature flags (DUO-32)" --body "$(cat <<'EOF'
## Summary

- Replaces `@flags-sdk/vercel` + Zustand flag hydration with PostHog Feature Flags as the single source of truth.
- Server reads global config flags via `posthog-node` + `unstable_cache(revalidate: 60)` so the marketing pages remain statically generated (ISR-friendly).
- Client tree is wrapped in `@posthog/react`'s `<PostHogProvider>` to enable future A/B testing without further restructuring.
- Banner schema absorbs the old `resolveBanner` logic via Zod `.transform()`, returning `BannerConfig | null` directly.
- `@vercel/toolbar` removed (it was installed only as part of the original Vercel Flags setup; no other Vercel features were in use).

## Test plan

- [ ] `pnpm lint` passes with zero new warnings
- [ ] `pnpm build` succeeds and shows `/` as `○ (Static)` in the route table
- [ ] Local dev run renders the landing page correctly with default flags (logo not centered, social proof = credentials, banner per current PostHog config)
- [ ] Toggling each of the three flags in the PostHog UI propagates to the live page within ~60s on a redeploy-free preview
- [ ] No `@/lib/flags`, `@flags-sdk/vercel`, `flags`, or `useFlagsStore` imports remain anywhere in `src/`

Closes DUO-32.
EOF
)"
```

Expected: PR criado com URL, todos os checks ainda pendentes (CI vai rodar). Cole o URL no Linear DUO-32.

---

## Self-review notes (autor do plano)

**Spec coverage:**
- ✅ Seção 3 (estrutura de arquivos): coberta nas tasks 1-4 e 7-8.
- ✅ Seção 4 (definições de flags): Task 3.
- ✅ Seção 5 (server singleton): Task 2.
- ✅ Seção 6 (resolveAll + ISR): Task 4.
- ✅ Seção 7 (Providers + PostHogProvider): Tasks 1 e 6.
- ✅ Seção 8 (consumo em layout/page/logo/header): Tasks 5 e 6.
- ✅ Seção 10 (env vars): Task 0.
- ✅ Seção 11 (cleanup): Tasks 7 e 8.
- ✅ Cleanup do `@vercel/toolbar`: Task 7.
- ✅ Documentação: Task 9.

**Type consistency:**
- `FlagsState` tipado a partir de `AllFlagsMap` (Task 4) — bate com `allFlags as const` em `config.ts` (Task 3).
- `flags.irpfBanner` é `BannerConfig | null` em todo lugar (schema do banner com `.transform()` retornando esse tipo).
- `flags.socialProofType` é `"clients" | "credentials" | "statement"` (do `z.enum`). O tipo `SocialProofVariant` exportado por `src/components/social-proof-section.tsx` é literalmente `"clients" | "credentials" | "statement"`, então é diretamente assignável — o cast `as SocialProofVariant` antigo era desnecessário e some na Task 6 Step 2.
- `Logo.isCentered` (Task 5) recebe valor de `Header.isLogoCentered` (Task 5), que recebe de `flags.isLogoTextCentered` (Task 6) — todos `boolean`.
