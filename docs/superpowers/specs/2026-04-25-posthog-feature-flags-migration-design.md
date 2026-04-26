# Design — Migração de Vercel Flags para PostHog Feature Flags

**Data:** 2026-04-25
**Status:** Aprovado para implementação
**Escopo:** Substituir o setup atual de Vercel Flags (`flags` + `@flags-sdk/vercel`) por feature flags do PostHog, mantendo a landing pública estática e a regra arquitetural de `(marketing)` sem `cookies()`/`headers()`.

---

## 1. Contexto e motivação

### 1.1 Estado atual

O projeto usa hoje o SDK `flags` da Vercel com `@flags-sdk/vercel` como adapter. Três flags existem:

| Flag | Tipo | Uso |
|---|---|---|
| `logo-text-centered` | boolean | Toggle visual no `<Logo>` |
| `social-proof-type` | string variant (`clients` \| `credentials` \| `statement`) | Variante da `<SocialProofSection>` |
| `irpf-banner` | JSON payload | Configuração do `<Banner>` IRPF (com schema Zod, janela de datas, CTAs) |

Arquivos envolvidos:

- `src/lib/flags/flags.ts` — definições com `defineFlag()`
- `src/lib/flags/utils/define-flag.ts` — wrapper sobre `flag()` do `flags/next`
- `src/lib/flags/utils/resolve.ts` — `resolveAll()`, tipo `FlagsState`
- `src/lib/flags/utils/resolve-banner.ts` — validação Zod + janela de datas
- `src/lib/flags/schemas/banner.ts` — schema Zod do banner
- `src/lib/flags/index.ts` — barrel export
- `src/stores/use-flags-store.ts` — Zustand store hidratado pelo servidor
- `src/components/providers.tsx` — recebe `flags` por prop, hidrata Zustand
- `src/app/layout.tsx` — chama `resolveAll()` + `resolveBanner()`
- `src/app/page.tsx` — chama `socialProofType()` direto
- `src/components/logo.tsx` — usa `useFlag()` (Zustand) pra ler `isLogoTextCentered`
- `src/app/.well-known/vercel/flags/route.ts` — discovery endpoint pro Vercel Toolbar

PostHog já está parcialmente configurado:

- `posthog-js` inicializado em `instrumentation-client.ts`
- Reverse proxy `/ingest` no `next.config.ts`
- Sem `posthog-node` instalado
- Zero feature flags criadas no PostHog (projeto resetado em 2026-04-24)
- Vars de ambiente: `NEXT_PUBLIC_POSTHOG_TOKEN`, `NEXT_PUBLIC_POSTHOG_HOST`

### 1.2 Por que migrar

- O setup atual de Vercel Flags foi implementado de forma customizada e não segue o pattern canônico do SDK.
- O PostHog já é a fonte de verdade pra analytics. Concentrar feature flags no mesmo dashboard reduz fragmentação.
- A UI do PostHog pra editar flags (multivariate + JSON payloads) atende todos os casos atuais.
- Remove dependências (`flags`, `@flags-sdk/vercel`) e código próprio (`src/lib/flags/`, `src/stores/use-flags-store.ts`).

### 1.3 Restrição arquitetural

`docs/architecture.md` e `CLAUDE.md` definem que a área `(marketing)` **deve permanecer estaticamente renderizável** — proibido usar `cookies()`, `headers()`, `noStore()`, `fetch({ cache: "no-store" })` ou Server Actions dinâmicos.

Essa restrição **se mantém** após a migração. O design respeita ela.

---

## 2. Decisão arquitetural

### 2.1 Estratégia escolhida — Híbrida

Dois "modos" de uso, cada um com sua estratégia, ambos lendo do PostHog:

**Modo 1 — Config flags (server-side, estáticas):**

- Avaliadas em Server Components da `(marketing)` sem identificar o usuário (sem `distinct_id`)
- Resposta determinística (mesmo valor pra todo mundo) → ISR-friendly
- Cache via `fetch_options: { next: { revalidate: 60 } }` no `posthog-node`
- Cobertura: as 3 flags atuais (`irpf-banner`, `social-proof-type`, `logo-text-centered`)

**Modo 2 — Experiment flags (client-side, opt-in):**

- Hooks `useFeatureFlag()` / `useFeatureFlagPayload()` do `@posthog/react` em Client Components
- Cookie do `posthog-js` já presente no browser → flag por usuário
- **Não usado agora.** Infra disponível pra quando precisar (A/B testing, rollout).

### 2.2 Por que essa estratégia

| Critério | Híbrida (escolhida) | Alternativa: `@posthog/next` com `bootstrapFlags` |
|---|---|---|
| Mantém static rendering da landing | Sim | Não — quebra ISR (doc oficial avisa) |
| Pattern oficial estável | Sim (Guia 1 da doc) | Pre-release, API pode mudar |
| Cobre os 3 flags atuais | Sim | Sim |
| Permite A/B testing futuro | Sim (client-side em spots pontuais) | Sim (server-side global) |
| Risco de quebrar static silenciosamente | Baixo (sem features que opt-in dynamic) | Alto (`getPostHog()` chama `cookies()` internamente) |
| Áreas privadas (F1+ /admin /app) | Mesma infra serve, com `distinct_id` do session | Idem |

### 2.3 Pacotes do PostHog a instalar

| Pacote | Função | Onde roda |
|---|---|---|
| `posthog-js` | SDK base do browser (já instalado) | Browser |
| `@posthog/react` | Hooks React (`PostHogProvider`, `useFeatureFlag`, `usePostHog`) | Browser |
| `posthog-node` | SDK Node.js (independente) | Servidor |

**Por que não `@posthog/next`:** o pacote é pre-release e suas features centrais (`bootstrapFlags`, `getPostHog()`, `postHogMiddleware`) são incompatíveis com static rendering ou desnecessárias pro escopo. Adicionaria peso sem benefício.

---

## 3. Estrutura de arquivos

### 3.1 Nova organização

```
src/lib/posthog/
├── client.ts                # Re-export posthog-js (existente, mantém)
├── server.ts                # Singleton posthog-node (novo)
└── flags/
    ├── index.ts             # Barrel export (resolveAll, types, schemas)
    ├── config.ts            # Definições das flags (irpfBanner, socialProofType, logoTextCentered)
    ├── define.ts            # Helper defineConfigFlag
    ├── resolve.ts           # resolveAll() — usa posthog-node + unstable_cache
    └── schemas/
        └── banner.ts        # Schema Zod do banner (com .transform pra active + janela de datas)
```

**Decisão sobre `resolve-banner.ts`:** o arquivo atual `src/lib/flags/utils/resolve-banner.ts` faz três coisas — validação Zod, checagem `active`, janela de datas BRT. As três responsabilidades são absorvidas pelo schema Zod via `.transform()` (ver seção 4.4). Isso elimina o arquivo inteiramente.

### 3.2 Arquivos removidos

- `src/lib/flags/` — pasta inteira
- `src/stores/use-flags-store.ts`
- `src/app/.well-known/vercel/flags/route.ts` (e a pasta `.well-known/`)
- `.agents/skills/flags-sdk/` — skill obsoleta

### 3.3 Arquivos modificados

- `src/components/providers.tsx` — remove props `flags`, adiciona `<PostHogProvider client={posthog}>`
- `src/components/logo.tsx` — recebe `isLogoCentered` como prop em vez de `useFlag()`
- `src/components/header.tsx` — passa `isLogoCentered` para `<Logo>`
- `src/app/layout.tsx` — troca import `@/lib/flags` → `@/lib/posthog/flags`, passa `isLogoCentered` ao `Header`, **remove `<VercelToolbar />`** (e import de `@vercel/toolbar/next`)
- `src/app/page.tsx` — troca import e chamada
- `next.config.ts` — **remove `createWithVercelToolbar()`** (volta a exportar `nextConfig` direto)
- `src/lib/env.ts` — adiciona `POSTHOG_API_KEY` (server-side)
- `package.json` — remove `flags`, `@flags-sdk/vercel`, **`@vercel/toolbar`**; adiciona `@posthog/react`, `posthog-node`

### 3.4 Arquivos preservados

- `instrumentation-client.ts` — sem mudança (init do `posthog-js` continua igual)
- `src/lib/posthog.ts` — renomeado para `src/lib/posthog/client.ts`, mas a API pública (`export { posthog }`) continua igual
- `@vercel/speed-insights` — mantido, não relacionado a feature flags

---

## 4. API de definição de flags

### 4.1 Helper `defineConfigFlag`

Inspirado no `defineFlag` atual, mas adaptado pro PostHog (validação Zod integrada, sem adapter):

```ts
// src/lib/posthog/flags/define.ts
import type { z } from "zod";

type ConfigFlagDefinition<TSchema extends z.ZodTypeAny> = {
  key: string;
  description?: string;
  schema: TSchema;
  defaultValue: z.infer<TSchema>;
  payload?: boolean; // se true, lê de getFeatureFlagPayload em vez de getFeatureFlag
};

export type AnyConfigFlag = ConfigFlagDefinition<z.ZodTypeAny>;

export function defineConfigFlag<TSchema extends z.ZodTypeAny>(
  def: ConfigFlagDefinition<TSchema>,
): ConfigFlagDefinition<TSchema> {
  return def;
}
```

### 4.2 Configuração das 3 flags

```ts
// src/lib/posthog/flags/config.ts
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
  defaultValue: "credentials",
});

export const irpfBanner = defineConfigFlag({
  key: "irpf-banner",
  description: "Banner promocional do IRPF 2026 (JSON payload)",
  schema: bannerConfigSchema, // já é nullable + transform interno (ver 4.4)
  defaultValue: null,
  payload: true,
});

export const allFlags = {
  isLogoTextCentered,
  socialProofType,
  irpfBanner,
} as const;
```

### 4.3 Diferenças em relação ao Vercel Flags

| Aspecto | Vercel Flags (atual) | PostHog (proposto) |
|---|---|---|
| Type inference | `defaultValue` define tipo | `schema` (Zod) define + valida tipo |
| JSON payloads | Manual (`Record<string, unknown>` + Zod externo) | Nativo via `getFeatureFlagPayload()` |
| Discovery endpoint | `.well-known/vercel/flags` | Não necessário (PostHog UI é o dashboard) |
| Adapter | `vercelAdapter()` em cada flag | Singleton `posthog-node` global |
| Validação runtime | Em `resolveBanner` (só pro banner) | Embutida em todo flag via `schema.safeParse` |
| Janela de datas / `active` do banner | Em `resolveBanner` (arquivo separado) | Em `bannerConfigSchema.transform()` (alta coesão) |

### 4.4 Schema do banner com `transform` integrado

O schema atual (`src/lib/flags/schemas/banner.ts`) só descreve a estrutura. As regras de "banner ativo" e "janela de datas" ficam num arquivo separado (`resolve-banner.ts`), que faz validação Zod redundante.

Na nova estrutura, o schema absorve essas regras via `.transform()`:

```ts
// src/lib/posthog/flags/schemas/banner.ts
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

// Tipo "puro" da config, antes do transform (útil pro Banner component se quiser)
export type BannerConfig = z.infer<typeof bannerConfigBaseSchema>;
export type BannerCtaConfig = z.infer<typeof bannerCtaSchema>;

/**
 * Schema final exportado: aceita JSON inválido / null / banner inativo /
 * fora da janela de datas BRT — em todos esses casos retorna null.
 *
 * Datas são interpretadas em BRT (UTC-3).
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

**Comportamento:** ao chamar `bannerConfigSchema.safeParse(raw)`:
- Se `raw` for JSON inválido → `.success === false` → `resolveAll` cai no `defaultValue: null`
- Se `raw` for válido mas `active: false` → `.data === null`
- Se estiver fora da janela de datas → `.data === null`
- Se tudo OK → `.data === BannerConfig` pronto pra renderizar

**Trade-off de precisão temporal:** o `transform` é avaliado dentro do `unstable_cache` (revalidate 60s), então a janela de datas é checada a cada revalidação ISR — atraso máximo de 60s. Hoje o site também é estático/ISR, então essa precisão já é a real (não é regressão). Ver seção 13.

---

## 5. Cliente `posthog-node` server-side

### 5.1 Estratégia de avaliação — Remote evaluation com cache via Next.js

**Decisão:** usar **remote evaluation** (modo padrão do `posthog-node`), e cachear via Next.js Data Cache no nível do nosso próprio resolver.

**Por que não local evaluation:**

A doc oficial do PostHog avisa explicitamente:

> "In edge/lambda environments and stateless PHP applications, local evaluation with the default in-memory cache causes performance issues and inflated costs due to per-request initialization. For these environments, use an external cache provider to share flag definitions across requests, or use regular flag evaluation instead."

A Vercel é um ambiente serverless/lambda. Local evaluation faria polling de 30s pra carregar definições, mas:
- Cold starts perdem o cache → cada cold é uma chamada extra
- Cada invocação serverless aloca seu próprio in-memory cache
- Polling rodando "no background" não tem sentido em funções stateless
- Custo de billing infla (10 flag-requests por polling × N invocações)

A doc é clara: **"use regular flag evaluation instead"** nesses ambientes.

**Por que cachear via `unstable_cache` do Next.js:**

Como `posthog-node` faz HTTP por baixo, podemos envelopar a chamada `getAllFlagsAndPayloads()` num `unstable_cache` do Next.js com `revalidate: 60`. Resultado: a primeira request gera a chamada à API do PostHog, as próximas dentro de 60s usam o cache em RAM/disco do Next.js. Páginas estáticas continuam estáticas (a chamada acontece no build/revalidação ISR).

### 5.2 Singleton do client

```ts
// src/lib/posthog/server.ts
import "server-only";
import { PostHog } from "posthog-node";
import { env } from "@/lib/env";

let cachedClient: PostHog | null = null;

export function getServerPostHog(): PostHog {
  if (cachedClient) return cachedClient;

  cachedClient = new PostHog(env.POSTHOG_API_KEY, {
    host: env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    // Server Components têm ciclo de vida curto — flush imediato
    flushAt: 1,
    flushInterval: 0,
    // Sem personalApiKey → modo remote evaluation (decisão deliberada, ver 5.1)
  });

  return cachedClient;
}
```

### 5.3 Notas

- `flushAt: 1` + `flushInterval: 0` — recomendações da doc oficial pra Server Components.
- **Sem `personalApiKey`** → remote evaluation. Cada `getAllFlagsAndPayloads()` é uma chamada HTTP. O cache acontece num nível acima (no `unstable_cache` do `resolveAll`).
- Singleton evita re-criar a instância a cada request mesmo no modo remote, reduzindo alocação.
- Se no futuro quisermos local evaluation (ex.: ao migrar pra Cloudflare Workers ou outro runtime stateful), basta adicionar `personalApiKey` e `featureFlagsPollingInterval` aqui — sem mudar consumers.

---

## 6. Resolver `resolveAll`

### 6.1 Implementação

```ts
// src/lib/posthog/flags/resolve.ts
import { unstable_cache } from "next/cache";
import { getServerPostHog } from "../server";
import { type AnyConfigFlag, allFlags } from "./config";

export type FlagsState = {
  [K in keyof typeof allFlags]: (typeof allFlags)[K] extends {
    schema: infer S;
  }
    ? S extends import("zod").ZodTypeAny
      ? import("zod").infer<S>
      : never
    : never;
};

// distinct_id fixo — todas as config flags têm 100% rollout no PostHog UI,
// então o ID não afeta o resultado (apenas é exigido pela API).
const ANONYMOUS_DISTINCT_ID = "anonymous-marketing-visitor";

// Wrapper cacheado: chama a API do PostHog 1x e reaproveita por 60s.
// Próximas requests dentro da janela de cache não tocam o PostHog.
const fetchAllFlagsFromPostHog = unstable_cache(
  async () => {
    const posthog = getServerPostHog();
    try {
      return await posthog.getAllFlagsAndPayloads(ANONYMOUS_DISTINCT_ID);
    } catch (error) {
      // Falha de rede / timeout → retorna estrutura vazia, defaults assumem
      console.error("[posthog] failed to fetch flags, falling back to defaults", error);
      return { featureFlags: {}, featureFlagPayloads: {} };
    }
  },
  ["posthog-config-flags"], // chave do cache
  {
    revalidate: 60, // segundos
    tags: ["posthog-flags"], // pra invalidação programática futura
  },
);

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

### 6.2 Princípios

- **Cache em camada do Next.js, não do `posthog-node`**: como o `posthog-node` não expõe `fetchOptions` (diferente do `posthog-js`), envolvemos a chamada com `unstable_cache`. É o método canônico do App Router pra cachear funções server-side por TTL.
- **Fail-closed**: se o PostHog devolver dado inválido (ex.: alguém botou JSON malformado no UI), o flag cai no `defaultValue`. Nunca quebra a renderização.
- **Try/catch no nível do cache**: se a API do PostHog estiver fora do ar, retornamos `{ featureFlags: {}, featureFlagPayloads: {} }` → todas as flags caem nos defaults. Site nunca crasha por dependência externa.
- **Determinismo**: o `distinct_id` fixo garante que a resposta seja a mesma em qualquer cold start. Como todas as flags têm 100% rollout no PostHog UI, o ID é só um placeholder que satisfaz a assinatura da API.
- **Invalidação manual** (futuro): `revalidateTag("posthog-flags")` num webhook do PostHog forçaria refresh imediato. Não implementado nesta migração — 60s de eventual consistency é aceito.

### 6.3 `resolveBanner` — eliminado

A função `resolveBanner` desaparece nesta migração. Sua lógica (validação Zod, checagem de `active`, janela de datas BRT) é absorvida por `bannerConfigSchema.transform()` (ver 4.4). O resultado: `flags.irpfBanner` retornado por `resolveAll()` já é `BannerConfig | null` pronto pra uso direto no `Banner` component.

### 6.4 Barrel export

```ts
// src/lib/posthog/flags/index.ts
export { allFlags } from "./config";
export type { FlagsState } from "./resolve";
export { resolveAll } from "./resolve";
export { bannerConfigSchema } from "./schemas/banner";
export type { BannerConfig, BannerCtaConfig } from "./schemas/banner";
```

---

## 7. Provider client (`@posthog/react`)

### 7.1 Mudança no `Providers`

```tsx
// src/components/providers.tsx
"use client";

import { PostHogProvider } from "@posthog/react";
import { ThemeProvider } from "next-themes";
import { posthog } from "@/lib/posthog/client";
import { Toaster } from "@/components/ui/sonner";

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

### 7.2 Por que o provider mesmo sem uso atual

O `<PostHogProvider>` simplesmente expõe a instância do `posthog-js` (já inicializada em `instrumentation-client.ts`) via React Context. Custo: zero overhead em runtime, ~1KB extra no bundle.

Beneficio: hooks como `useFeatureFlag()`, `usePostHog()`, `useFeatureFlagVariantKey()`, `useFeatureFlagPayload()` ficam disponíveis sem refactor adicional quando precisarmos.

### 7.3 Consumo futuro (exemplo, não implementado agora)

```tsx
// EXEMPLO HIPOTÉTICO — ilustra uso futuro
"use client";
import { useFeatureFlag } from "@posthog/react";

export function ExperimentalCta() {
  const variant = useFeatureFlag("hero-cta-experiment");
  if (variant === undefined) return <CtaSkeleton />;
  return variant === "test" ? <CtaV2 /> : <CtaV1 />;
}
```

---

## 8. Consumo nos componentes server

### 8.1 `src/app/layout.tsx`

```tsx
import { resolveAll } from "@/lib/posthog/flags";
// ... outros imports

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const flags = await resolveAll();
  // flags.irpfBanner já é BannerConfig | null (transform do Zod aplicou
  // validação + active + janela de datas). Pronto pra renderizar.
  const banner = flags.irpfBanner;

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      {/* ... head ... */}
      <body className="...">
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
              ctas={banner.cta?.map((cta) => /* ... */)}
              position={banner.position}
              enabledOnPaths={banner.enabledOnPaths}
            />
          )}
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
```

**Removido em relação ao atual:**
- `import { VercelToolbar } from "@vercel/toolbar/next"`
- Linha `{shouldInjectToolbar && <VercelToolbar />}`
- Variável local `shouldInjectToolbar`

### 8.2 `src/app/page.tsx`

```tsx
import { resolveAll } from "@/lib/posthog/flags";

export default async function Home() {
  const flags = await resolveAll();

  return (
    <div className="flex w-full flex-col">
      {/* ... */}
      <SocialProofSection variant={flags.socialProofType} />
      {/* ... */}
    </div>
  );
}
```

**Otimização possível** (não obrigatória): unificar `resolveAll()` no `layout.tsx` e passar via Context Provider, evitando 2 chamadas. Mas como o cache ISR de 60s já deduplica chamadas, o benefício é marginal. **Não vamos otimizar prematuramente.**

### 8.3 `next.config.ts` — remoção do plugin do toolbar

O `next.config.ts` atual envolve a config com `createWithVercelToolbar()`:

```ts
// Atual
import createWithVercelToolbar from "@vercel/toolbar/plugins/next";
// ... config
const withVercelToolbar = createWithVercelToolbar();
export default withVercelToolbar(nextConfig);
```

Sem o `@vercel/toolbar` instalado, o plugin some:

```ts
// Novo
// (sem import de @vercel/toolbar/plugins/next)
// ... config
export default nextConfig;
```

Restante do arquivo (rewrites do `/ingest`, `env`, `images`, `allowedDevOrigins`) permanece idêntico.

### 8.4 `src/components/logo.tsx` — refator de prop

Antes:
```tsx
"use client";
import { useFlag } from "@/stores/use-flags-store";
// ...
export function Logo({ ... }: LogoProps) {
  const { isLogoTextCentered } = useFlag(); // hook do Zustand
  // ...
}
```

Depois:
```tsx
"use client";
// (sem import de store)
type LogoProps = {
  className?: string;
  size?: LogoSize;
  subtitleClassName?: string;
  showSubtitle?: boolean;
  animated?: boolean;
  isCentered?: boolean; // nova prop, opcional, default false
};

export function Logo({ isCentered = false, ... }: LogoProps) {
  // ...
  return (
    // ...
    <div className={cn("flex flex-col", isCentered && "items-center")}>
    // ...
  );
}
```

### 8.5 `src/components/header.tsx` — passar prop

`Header` aceita `isLogoCentered` como prop e passa pro `<Logo>`. Quando o `Header` for um Server Component (verificar arquivo), pode receber direto do `layout.tsx`. Quando for Client (provável, dado que tem hook `useScroll`), continua como Client e recebe a prop.

---

## 9. Configuração no PostHog UI

### 9.1 Pré-requisito da implementação

Antes de qualquer deploy, criar as 3 flags no PostHog dashboard com **100% rollout** (release condition que garante que `getAllFlagsAndPayloads('anonymous-marketing-visitor')` devolva sempre o valor configurado):

| Key | Tipo | Default value | Release condition |
|---|---|---|---|
| `logo-text-centered` | Boolean | `false` (toggle off) | "Roll out to 100% of users" |
| `social-proof-type` | Multiple variant | variantes: `clients`, `credentials`, `statement` (vencedor: `credentials` 100%) | "Roll out to 100% of users" |
| `irpf-banner` | Boolean with JSON payload | toggle on, payload com a config atual do banner | "Roll out to 100% of users" |

### 9.2 Gerenciamento operacional

Após a migração, mudanças nos flags são feitas inteiramente pela UI do PostHog:

- Toggle do `logo-text-centered` → próxima revalidação ISR (max 60s) reflete no site
- Trocar variante ativa do `social-proof-type` → idem
- Editar JSON do `irpf-banner` (config, datas, CTAs) → idem

**Importante:** o JSON do `irpf-banner` é validado pelo schema Zod (`bannerConfigSchema`). Se alguém editar um JSON inválido pela UI, o site cai no `defaultValue: null` (banner some). Não há crash em runtime.

### 9.3 MCP do PostHog

O projeto está conectado ao MCP `user-posthog`. As flags podem ser criadas/atualizadas via tools MCP:

- `feature-flag-create` para criar
- `feature-flag-update` para atualizar payload/release conditions

Documentar isso na execução do plano como atalho operacional.

---

## 10. Variáveis de ambiente

### 10.1 Adicionar ao `src/lib/env.ts`

```ts
server: {
  // ... vars existentes ...
  POSTHOG_API_KEY: z.string().min(1).optional(),
},
runtimeEnv: {
  // ... vars existentes ...
  POSTHOG_API_KEY: process.env.POSTHOG_API_KEY,
},
```

**`.optional()`**: se o token não estiver presente (ex.: em CI sem secrets, ou ambiente local sem `.env.local`), `getServerPostHog()` lança erro. Mas `optional()` no Zod permite que o build do Next.js passe — o erro só surge em runtime. Trade-off aceitável: deixa devs novos clonarem o repo sem precisar do token até precisarem testar flags.

### 10.2 `.env.example`

Adicionar:
```
POSTHOG_API_KEY=
```

### 10.3 Vercel envs

Configurar `POSTHOG_API_KEY` em **Production**, **Preview** e **Development** no dashboard da Vercel. Mesmo valor do `NEXT_PUBLIC_POSTHOG_TOKEN` (PostHog usa o mesmo project token pra client e server).

**Por que separar `NEXT_PUBLIC_POSTHOG_TOKEN` (client) e `POSTHOG_API_KEY` (server) se o valor é o mesmo:**

Convenção de clareza: o nome `NEXT_PUBLIC_*` denuncia que vai pro bundle do client, enquanto `POSTHOG_API_KEY` (sem prefixo) deixa explícito que é server-only. Se no futuro o PostHog separar tokens (improvável, mas possível), a refatoração é trivial.

---

## 11. Cleanup

### 11.1 Pacotes a remover

```bash
pnpm remove flags @flags-sdk/vercel @vercel/toolbar
```

**Justificativa de remover `@vercel/toolbar`:** o pacote foi adicionado ao projeto especificamente como parte do setup do Vercel Flags (a skill `flags-sdk/SKILL.md` lista a instalação do toolbar como step do setup). O projeto não usa nenhuma outra feature do toolbar (preview comments, draft mode, etc.). Sem o Vercel Flags ele perde toda utilidade.

### 11.2 Pacotes a adicionar

```bash
pnpm add @posthog/react posthog-node
```

### 11.3 Diretórios/arquivos a deletar

- `src/lib/flags/` (recursivo)
- `src/stores/use-flags-store.ts`
- `src/app/.well-known/vercel/flags/route.ts`
- `src/app/.well-known/vercel/flags/` (pasta vazia depois)
- `src/app/.well-known/vercel/` (pasta vazia depois)
- `src/app/.well-known/` (pasta vazia depois — só apagar se ninguém mais usar)
- `.agents/skills/flags-sdk/` (skill obsoleta, recursivo)

### 11.4 Mantém instalado

- `posthog-js` (já está)
- `@vercel/speed-insights` (não relacionado a feature flags — coleta Web Vitals)

### 11.5 Documentação a atualizar

- `docs/architecture.md` — substituir referências a Vercel Flags pela seção de PostHog Feature Flags. Confirmar que a regra de static rendering em `(marketing)` continua válida (sem mudança).
- `docs/roadmap.md` — atualizar menção dos flags na fase F0 (mantém os 3 flags, só muda o backend de Vercel pra PostHog).
- `claude-memory/project_duohub_observabilidade.md` (vault) — adicionar seção sobre feature flags via PostHog.

---

## 12. Plano de migração (alto nível)

Detalhamento step-by-step será feito pela skill `writing-plans`. Visão geral:

1. **Setup PostHog UI** (manual, antes de codar): criar as 3 flags no dashboard com 100% rollout, valores atuais.
2. **Branch:** `feat/<DUO-XX>/posthog-feature-flags`.
3. **Instalar dependências:** `posthog-node`, `@posthog/react`. Remover `flags`, `@flags-sdk/vercel`.
4. **Criar infra nova:** `src/lib/posthog/server.ts`, `src/lib/posthog/flags/*` (paralelo ao código antigo).
5. **Atualizar env.ts** com `POSTHOG_API_KEY`.
6. **Migrar `Providers`** pra adicionar `<PostHogProvider>`.
7. **Migrar `Logo`** pra receber prop `isCentered`.
8. **Migrar `Header`** pra passar a prop.
9. **Migrar `layout.tsx` e `page.tsx`** pros novos imports.
10. **Smoke test local** + **smoke test preview** (Vercel) com flags vivas no PostHog.
11. **Cleanup:** deletar `src/lib/flags/`, `src/stores/use-flags-store.ts`, `src/app/.well-known/`, `.agents/skills/flags-sdk/`.
12. **Atualizar documentação:** `docs/architecture.md`, `docs/roadmap.md`.
13. **PR** + review (Level 2 do `review-before-completion.mdc`).

---

## 13. Riscos e mitigações

| Risco | Probabilidade | Mitigação |
|---|---|---|
| PostHog API outage durante build/ISR | Baixa | Try/catch no `unstable_cache` retorna objetos vazios em falha → todas flags caem em `defaultValue` (banner some, social proof vira `credentials`, logo não centraliza). Site permanece online. |
| JSON inválido no UI do PostHog | Média | `schema.safeParse` no `resolveAll` → cai em `defaultValue: null` → banner some. Não quebra render. |
| Cache ISR não invalida ao mudar flag | Esperado | Janela de até 60s entre mudança no UI e reflexo no site. Aceito como trade-off pela performance. Em emergência, redeploy manual revalida tudo. |
| Build do Next falha sem `POSTHOG_API_KEY` em CI | Baixa | `optional()` no Zod permite build sem token. Erro só ocorre em runtime, e PR previews na Vercel já têm o token. CI do GitHub Actions roda lint+typecheck que não dependem da var. |
| `getAllFlagsAndPayloads` exige `distinct_id` | Verificado | Passamos `"anonymous-marketing-visitor"` como ID fixo. Como todas as flags têm 100% rollout, o ID é irrelevante pro resultado. |
| Bundle do `@posthog/react` aumenta tamanho do JS | Baixa | Pacote é ~3KB gzipped. Aceito. |

---

## 14. Critérios de sucesso

- ✅ Todas as 3 flags atuais funcionam idênticas ao comportamento atual em prod.
- ✅ A landing pública continua estática (build report do Next mostra páginas como `○ (Static)` ou `● (SSG)`).
- ✅ Mudanças nas flags no PostHog UI refletem no site em até 60s sem deploy.
- ✅ Build, lint e tests passam (`pnpm build`, `pnpm lint`, `pnpm test`).
- ✅ Bundle size não aumenta significativamente (< 5KB total entre `@posthog/react` adicionado e `flags` + `@flags-sdk/vercel` removidos).
- ✅ Lighthouse perf score mantém ou melhora.
- ✅ Zero `console.error` ou warnings novos em runtime.
- ✅ `docs/architecture.md` atualizado.

---

## 15. Fora do escopo

- **Implementação de A/B testing client-side.** A infra (`<PostHogProvider>`, hooks) fica disponível, mas nenhum experiment flag é criado nesta migração.
- **Setup de feature flags em `/admin` ou `/app` (F1+).** Essas áreas não existem ainda. Quando forem criadas, vão usar `getServerPostHog()` com `distinct_id` da sessão (Better Auth), reutilizando a mesma infra.
- **Endpoint webhook pra `revalidateTag("posthog-flags")`.** Possibilidade futura, não implementada agora — ISR de 60s é suficiente.
