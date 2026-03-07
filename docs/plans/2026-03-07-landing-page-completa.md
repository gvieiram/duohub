# Landing Page Completa — Plano de Implementação

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Completar a landing page da Effer Contabilidade com as 6 seções faltantes: Footer, Sobre as Sócias, Depoimentos, Campanha Sazonal, FAQ e CTA.

**Architecture:** Cada seção é um componente React Server Component (ou Client Component quando necessário para interatividade) em `src/components/ui/`. A `page.tsx` importa e compõe todos os componentes na ordem definida. Novos componentes shadcn/ui (Accordion, Avatar) são adicionados via CLI.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, shadcn/ui (new-york), Radix UI, Framer Motion, Lucide React

**Design doc:** `docs/plans/2026-03-07-landing-page-completa-design.md`

---

## Task 1: Footer

**Files:**
- Create: `src/components/ui/footer.tsx`
- Modify: `src/app/page.tsx`

**Step 1: Criar o componente Footer**

Criar `src/components/ui/footer.tsx`:

```tsx
import { InstagramIcon, LinkedinIcon, MessageCircleIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const links = [
	{ label: "Serviços", href: "#servicos" },
	{ label: "Planos", href: "#planos" },
	{ label: "Sobre", href: "#sobre" },
	{ label: "Contato", href: "#contato" },
];

const socials = [
	{ label: "Instagram", href: "#", icon: InstagramIcon },
	{ label: "LinkedIn", href: "#", icon: LinkedinIcon },
	{ label: "WhatsApp", href: "#", icon: MessageCircleIcon },
];

export function Footer() {
	return (
		<footer className="border-t">
			<div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12">
				<div className="flex flex-col items-center justify-between gap-8 md:flex-row">
					{/* Logo */}
					<div>
						<WordmarkIcon className="h-4" />
					</div>

					{/* Links */}
					<nav className="flex flex-wrap items-center justify-center gap-4" aria-label="Footer">
						{links.map((link) => (
							<a
								key={link.label}
								href={link.href}
								className="text-muted-foreground text-sm transition-colors hover:text-foreground"
							>
								{link.label}
							</a>
						))}
					</nav>

					{/* Social */}
					<div className="flex items-center gap-3">
						{socials.map((social) => (
							<a
								key={social.label}
								href={social.href}
								className="text-muted-foreground transition-colors hover:text-foreground"
								aria-label={social.label}
							>
								<social.icon className="size-5" />
							</a>
						))}
					</div>
				</div>

				<Separator />

				<p className="text-center text-muted-foreground text-sm">
					© {new Date().getFullYear()} Effer Contabilidade. Todos os
					direitos reservados.
				</p>
			</div>
		</footer>
	);
}
```

Nota: `WordmarkIcon` — copiar o SVG wordmark que já existe em `src/components/ui/header.tsx`. Extrair para um componente compartilhado ou duplicar (a decisão fica para o implementador, mas duplicar é mais simples no momento).

**Step 2: Integrar na page.tsx**

Em `src/app/page.tsx`, adicionar o import e o componente após o `</main>`, antes do `</div>` final:

```tsx
import { Footer } from "@/components/ui/footer";
// ... no JSX, após </main>:
<Footer />
```

**Step 3: Verificar no navegador**

Run: `pnpm dev` (se não estiver rodando)
Verificar: footer aparece no final da página, responsivo, links e ícones corretos.

**Step 4: Lint check**

Run: `pnpm biome check src/components/ui/footer.tsx src/app/page.tsx`
Expected: sem erros

**Step 5: Commit**

```bash
git add src/components/ui/footer.tsx src/app/page.tsx
git commit -m "feat: add footer section with links and social icons"
```

---

## Task 2: Instalar dependências (Avatar + Accordion)

**Step 1: Instalar Avatar via shadcn CLI**

Run: `pnpm dlx shadcn@latest add avatar`
Expected: cria `src/components/ui/avatar.tsx`, instala `@radix-ui/react-avatar`

**Step 2: Instalar Accordion via shadcn CLI**

Run: `pnpm dlx shadcn@latest add accordion`
Expected: cria `src/components/ui/accordion.tsx`, instala `@radix-ui/react-accordion`

**Step 3: Verificar instalação**

Run: `ls src/components/ui/avatar.tsx src/components/ui/accordion.tsx`
Expected: ambos os arquivos existem

**Step 4: Commit**

```bash
git add src/components/ui/avatar.tsx src/components/ui/accordion.tsx package.json pnpm-lock.yaml
git commit -m "feat: add avatar and accordion shadcn components"
```

---

## Task 3: Sobre as Sócias

**Files:**
- Create: `src/components/ui/about-section.tsx`
- Modify: `src/app/page.tsx`

**Step 1: Criar o componente AboutSection**

Criar `src/components/ui/about-section.tsx`:

Layout: título centralizado, 2 colunas com foto placeholder (div com iniciais), nome (Marcellus), cargo (terracota), bio curta. Abaixo: parágrafo sobre a visão da empresa.

Dados das sócias como array de objetos com: `name`, `role`, `bio`, `initials`, `imageSrc?` (opcional, para quando tiver foto real).

Sem dependências externas novas — usa tipografia e cores do tema.

**Step 2: Integrar na page.tsx**

Adicionar `<AboutSection />` entre `<StackedFeatures />` e o que vier depois.

**Step 3: Verificar no navegador**

Verificar: seção aparece, 2 colunas no desktop, empilha em mobile, fotos placeholder com iniciais.

**Step 4: Lint check**

Run: `pnpm biome check src/components/ui/about-section.tsx src/app/page.tsx`

**Step 5: Commit**

```bash
git add src/components/ui/about-section.tsx src/app/page.tsx
git commit -m "feat: add about section with partner bios"
```

---

## Task 4: Depoimentos (Bento Grid)

**Files:**
- Create: `src/components/ui/testimonials-section.tsx`
- Modify: `src/app/page.tsx`

**Step 1: Criar o componente TestimonialsSection**

Criar `src/components/ui/testimonials-section.tsx`:

Inspiração: componente testimonial-v2 do 21st.dev. Layout bento grid 4 colunas com:
- 1 card destaque (2 cols, 2 rows) com ícone de aspas
- Cards menores com blockquote, avatar (componente Avatar do Radix), nome, empresa
- Animações staggered com Framer Motion (`"use client"`)
- Usa `Card`, `CardContent`, `CardHeader` existentes
- Usa `Avatar`, `AvatarImage`, `AvatarFallback` da Task 2

Dados como array de objetos: `quote`, `name`, `role`, `avatarSrc?`, `avatarFallback`, `featured?`.

Conteúdo placeholder — 4-5 depoimentos fictícios de empresários/profissionais satisfeitos.

**Step 2: Integrar na page.tsx**

Adicionar `<TestimonialsSection />` após `<AboutSection />`.

**Step 3: Verificar no navegador**

Verificar: grid bento no desktop, empilha em mobile, animações de entrada, avatares com fallback.

**Step 4: Lint check**

Run: `pnpm biome check src/components/ui/testimonials-section.tsx src/app/page.tsx`

**Step 5: Commit**

```bash
git add src/components/ui/testimonials-section.tsx src/app/page.tsx
git commit -m "feat: add testimonials section with bento grid layout"
```

---

## Task 5: Campanha Sazonal (IR 2026)

**Files:**
- Create: `src/components/ui/campaign-section.tsx`
- Modify: `src/app/page.tsx`

**Step 1: Criar o componente CampaignSection**

Criar `src/components/ui/campaign-section.tsx`:

Layout: fundo com destaque (highlight/terracota), 2 colunas. Esquerda: badge "Campanha", título "Imposto de Renda 2026", subtítulo com prazo, bullets, CTA WhatsApp. Direita: ícone/ilustração placeholder (Lucide `FileText` ou `Calculator` em tamanho grande com fundo sutil).

Props configuráveis para facilitar troca de campanha:
```tsx
type CampaignData = {
	badge: string;
	title: string;
	subtitle: string;
	bullets: string[];
	cta: { label: string; href: string };
};
```

**Step 2: Integrar na page.tsx**

Adicionar `<CampaignSection />` após `<TestimonialsSection />`, passando os dados do IR 2026 como props.

**Step 3: Verificar no navegador**

Verificar: seção aparece com destaque visual, responsiva, CTA funciona.

**Step 4: Lint check**

Run: `pnpm biome check src/components/ui/campaign-section.tsx src/app/page.tsx`

**Step 5: Commit**

```bash
git add src/components/ui/campaign-section.tsx src/app/page.tsx
git commit -m "feat: add seasonal campaign section (IR 2026)"
```

---

## Task 6: FAQ

**Files:**
- Create: `src/components/ui/faq-section.tsx`
- Modify: `src/app/page.tsx`

**Step 1: Criar o componente FaqSection**

Criar `src/components/ui/faq-section.tsx` (`"use client"` para Radix Accordion):

Layout inspirado no 21st.dev Faqs 1: coluna única `max-w-3xl`, título + parágrafo, accordion em card `bg-card` com cantos arredondados. Usa `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` da Task 2.

Perguntas como array:
```tsx
const questions = [
	{
		id: "item-1",
		question: "Como funciona a contabilidade digital da Effer?",
		answer: "...",
	},
	// ... mais 4-5 perguntas
];
```

Link final: "Não encontrou o que procura? Fale com nosso time" → WhatsApp.

**Step 2: Integrar na page.tsx**

Adicionar `<FaqSection />` após `<CampaignSection />`.

**Step 3: Verificar no navegador**

Verificar: accordion abre/fecha com animação, chevron rotaciona, responsivo.

**Step 4: Lint check**

Run: `pnpm biome check src/components/ui/faq-section.tsx src/app/page.tsx`

**Step 5: Commit**

```bash
git add src/components/ui/faq-section.tsx src/app/page.tsx
git commit -m "feat: add FAQ section with accordion"
```

---

## Task 7: CTA Final (WhatsApp + Formulário)

**Files:**
- Create: `src/components/ui/cta-section.tsx`
- Modify: `src/app/page.tsx`

**Step 1: Criar o componente CtaSection**

Criar `src/components/ui/cta-section.tsx`:

Layout: fundo escuro (primary/teal), 2 colunas. Esquerda: título, subtítulo, botão WhatsApp (verde, `MessageCircleIcon`) + botão secundário. Direita: formulário com `Input` (nome, email, telefone) + `Textarea` (mensagem) + `Button` "Enviar".

Formulário é visual — sem backend. `onSubmit` com `preventDefault()`.

**Step 2: Integrar na page.tsx**

Adicionar `<CtaSection />` após `<FaqSection />`, antes do `<Footer />`.

**Step 3: Verificar no navegador**

Verificar: fundo escuro, botão WhatsApp visível, formulário funcional visualmente, responsivo.

**Step 4: Lint check**

Run: `pnpm biome check src/components/ui/cta-section.tsx src/app/page.tsx`

**Step 5: Commit**

```bash
git add src/components/ui/cta-section.tsx src/app/page.tsx
git commit -m "feat: add CTA section with WhatsApp and lead capture form"
```

---

## Task 8: Revisão final e ajustes

**Step 1: Verificar página completa**

Navegar pela página inteira no desktop e mobile. Verificar:
- Fluxo visual coeso entre seções
- Espaçamento consistente
- Todas as seções responsivas
- Dark mode funciona em todas as seções
- Animações suaves

**Step 2: Lint check completo**

Run: `pnpm biome check src/`
Expected: sem erros

**Step 3: Build check**

Run: `pnpm build`
Expected: build com sucesso, sem warnings relevantes

**Step 4: Ajustar espaçamento se necessário**

Se houver inconsistência de espaçamento entre seções, ajustar padding/margin nos componentes.

**Step 5: Commit final**

```bash
git add -A
git commit -m "fix: landing page layout adjustments and polish"
```
