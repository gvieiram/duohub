export const ir = {
	metadata: {
		title: "Contador para Imposto de Renda 2026 — DuoHub Gestão Contábil",
		description:
			"Declare seu IRPF 2026. CLT, autônomo, investidor, MEI. Atendimento por WhatsApp. Florianópolis e todo o Brasil.",
	},

	hero: {
		badge: "IRPF 2026",
		title: "Imposto de Renda 2026 sem surpresas",
		subtitle:
			"Especialistas dedicados ao seu caso. Revisão ativa de todas as deduções. Atendimento por WhatsApp.",
		bullets: [
			"Prazo: 23/03 a 29/05/2026",
			"Para CLT, autônomo, investidor e MEI",
			"Florianópolis e todo o Brasil",
		],
	},

	whoDeclares: {
		badge: "Quem declara",
		title: "Você precisa declarar em 2026?",
		intro:
			"Se você se encaixa em qualquer um desses critérios, a Receita Federal exige sua declaração.",
		primary: [
			{
				title: "Rendimentos tributáveis acima de R$ 35.584,00",
				description:
					"Salários, pró-labore, aposentadoria, aluguéis recebidos — somados no ano.",
			},
			{
				title: "Outros rendimentos acima de R$ 200 mil",
				description:
					"Isentos ou de tributação exclusiva (indenizações, FGTS, bolsas, ganhos líquidos em bolsa etc.).",
			},
			{
				title: "Ganho de capital",
				description:
					"Venda de imóveis, bens de valor relevante ou operações sujeitas a imposto.",
			},
		],
		showAllLabel: "Ver todos os 11 critérios",
		secondary: [
			"Atividade rural com renda acima de R$ 177.920,00.",
			"Posse de bens acima de R$ 800 mil em 31/12/2025.",
			"Alienação acima de R$ 40 mil em bolsa ou ganhos sujeitos ao imposto.",
			"Passou à condição de residente no Brasil em 2025.",
			"Optou por declarar bens de entidade controlada no exterior como pessoa física.",
			"Titularidade de trust regido por lei estrangeira em 31/12/2025.",
			"Rendimentos ou perdas em aplicações no exterior.",
			"Lucros ou dividendos recebidos do exterior.",
		],
	},

	changes2026: {
		badge: "Novidades 2026",
		title: "O que mudou no IR 2026",
		items: [
			{
				title: "Ganhos em bets precisam ser declarados",
				description:
					"Rendimentos e saldos mantidos em plataformas de apostas entram na declaração de 2026. Novidade oficial da Receita.",
			},
			{
				title: "Restituição em 4 lotes",
				description:
					"29/05 · 30/06 · 30/07 · 31/08. Quem entrega mais cedo, recebe mais cedo.",
			},
			{
				title: "Deduções permitidas seguem as mesmas",
				description:
					"Despesas médicas, educação, dependentes e previdência privada continuam válidas.",
			},
		],
	},

	situations: {
		badge: "Situações que atendemos",
		title: "Seu caso cabe aqui",
		cards: [
			{
				title: "CLT",
				description: "Declara quem teve carteira assinada em 2025.",
				triggers: [
					"Rendimentos tributáveis > R$ 35.584",
					"Dependentes",
					"Despesas médicas e educação",
				],
			},
			{
				title: "Autônomo",
				description:
					"Profissional liberal, freelancer ou prestador de serviço.",
				triggers: ["Carnê-leão", "Aluguéis", "Pró-labore"],
			},
			{
				title: "Investidor",
				description: "Tem posição em bolsa, renda fixa, cripto ou exterior.",
				triggers: [
					"Ganho de capital",
					"Alienação > R$ 40k em bolsa",
					"Aplicações no exterior",
					"Ganhos em bets",
				],
			},
			{
				title: "MEI com PF",
				description: "Faturamento do MEI + rendimentos pessoais separados.",
				triggers: [
					"Rendimentos PF do MEI",
					"Distribuição de lucros",
					"Pró-labore",
				],
			},
		],
	},

	whyDuohub: {
		badge: "Por que a DuoHub",
		title: "Declaração feita por quem se importa com o seu caso",
		pillars: [
			{
				title: "Especialistas dedicados ao seu caso",
				description:
					"Sem bot, sem fila, sem atendimento genérico. Quem te atende é quem faz a sua declaração.",
			},
			{
				title: "Revisão ativa das deduções",
				description:
					"Perguntamos ativamente sobre plano de saúde, dependentes, previdência e despesas médicas. Mais restituição, menos imposto pago a mais.",
			},
			{
				title: "Atendimento por WhatsApp",
				description:
					"Canal que você já usa. Resposta em até 24h úteis durante a temporada.",
			},
			{
				title: "Especializados em situações compostas",
				description:
					"CLT com aluguel, freelancer com PJ + PF, investidor com day trade. Aqui não tem caso esquisito.",
			},
		],
	},

	howItWorks: {
		badge: "Como funciona",
		title: "Seu IR em 4 passos",
		steps: [
			{
				number: "01",
				title: "Fale com a gente",
				description: "Preencha o formulário nesta página ou mande WhatsApp.",
			},
			{
				number: "02",
				title: "Briefing rápido",
				description:
					"Entendemos sua situação em até 24h úteis e te enviamos a lista de documentos personalizada.",
			},
			{
				number: "03",
				title: "Envio de documentos",
				description:
					"Você reúne os comprovantes com calma. A gente responde dúvidas no WhatsApp.",
			},
			{
				number: "04",
				title: "Declaração e entrega",
				description:
					"Revisamos cada dedução, enviamos pra Receita e te avisamos quando estiver tudo certo.",
			},
		],
	},

	documents: {
		badge: "Documentos",
		title: "O que você precisa separar",
		intro:
			"Lista base — ao entrar em contato, enviamos a versão personalizada pro seu caso.",
		groups: [
			{
				title: "Documentos pessoais",
				items: [
					"CPF e RG",
					"Comprovante de residência atualizado",
					"Título de eleitor",
					"Última declaração entregue (se houver)",
					"Dados bancários para restituição",
				],
			},
			{
				title: "Comprovantes de renda",
				items: [
					"Informe de rendimentos do empregador (DIRF)",
					"Carnê-leão (autônomos)",
					"Recibos de aluguéis recebidos",
					"Pró-labore e distribuição de lucros",
					"Pensão alimentícia",
				],
			},
			{
				title: "Bancos e investimentos",
				items: [
					"Informe de rendimentos de cada banco",
					"Informe das corretoras (B3, Nu, XP, Clear, Avenue etc.)",
					"Relatórios de criptomoedas",
					"Informe de ganhos em plataformas de apostas (bets)",
				],
			},
			{
				title: "Bens e direitos",
				items: [
					"Escrituras e contratos de imóveis",
					"Documentos de veículos",
					"Participações societárias",
					"Objetos de valor relevante",
				],
			},
			{
				title: "Dívidas e financiamentos",
				items: [
					"Contratos de financiamento (imóvel, veículo)",
					"Saldo devedor em 31/12/2025",
					"Empréstimos acima de R$ 5 mil",
				],
			},
			{
				title: "Despesas dedutíveis",
				items: [
					"Recibos médicos, odontológicos, hospitalares e terapêuticos",
					"Mensalidades escolares e universitárias",
					"Plano de saúde",
					"Previdência privada (PGBL)",
					"Pensão alimentícia paga",
				],
			},
			{
				title: "Dependentes",
				items: [
					"CPF de cada dependente",
					"Comprovantes de despesas dos dependentes (saúde, educação)",
				],
			},
		],
	},

	deadlines: {
		badge: "Prazos e riscos",
		title: "Prazo oficial",
		window: {
			title: "Prazo de entrega",
			description: "De 23/03/2026 a 29/05/2026.",
		},
		refundBatches: {
			title: "Lotes de restituição",
			items: ["29/05", "30/06", "30/07", "31/08"],
			caption: "Quem entrega mais cedo, recebe mais cedo.",
		},
		errors: {
			title: "Erros comuns que levam à malha fina",
			items: [
				"Omitir rendimentos e deduções",
				"Informar valores incorretos",
				"Não declarar investimentos",
			],
			consequence:
				"Em caso de malha ou atraso: multa mínima de R$ 165,74 + 1% ao mês sobre o imposto devido + juros Selic. Cair em malha não é o fim do mundo, e revisamos tudo antes de enviar pra evitar.",
		},
	},

	faq: {
		badge: "Perguntas frequentes",
		title: "Dúvidas comuns do IR 2026",
		items: [
			{
				question: "Quem precisa declarar IR em 2026?",
				answer:
					"Todo mundo que teve rendimentos tributáveis acima de R$ 35.584, outros rendimentos acima de R$ 200 mil, ganho de capital, bens acima de R$ 800 mil ou se encaixa em outros critérios da Receita. Em dúvida, a gente confirma junto com você em até 24h úteis.",
			},
			{
				question: "Qual o prazo de entrega da declaração?",
				answer:
					"A entrega abre em 23/03/2026 e fecha em 29/05/2026. Quem entrega cedo entra nos primeiros lotes de restituição.",
			},
			{
				question: "Quando sai a minha restituição?",
				answer:
					"Em 4 lotes: 29/05 · 30/06 · 30/07 · 31/08. A ordem é determinada pela data de entrega e pelo perfil do contribuinte (idosos e doentes têm prioridade).",
			},
			{
				question: "Preciso declarar ganhos em bets?",
				answer:
					"Sim. Em 2026 ficou oficial: rendimentos e saldos mantidos em plataformas de apostas devem ser declarados. É uma das principais mudanças deste ano.",
			},
			{
				question: "Quais deduções posso usar?",
				answer:
					"Despesas médicas (sem limite), educação (até R$ 3.561,50 por dependente), dependentes e previdência privada (PGBL, até 12% da renda tributável).",
			},
			{
				question: "Quais documentos preciso separar?",
				answer:
					"Depende do seu caso. Começamos com a lista padrão (documentos pessoais, comprovantes de renda, bancos/investimentos, bens, dívidas, dedutíveis e dependentes) e enviamos a versão personalizada após o briefing.",
			},
			{
				question: "O que acontece se eu errar na declaração?",
				answer:
					"Cair em malha não é o fim do mundo — dá pra retificar. Mas multas e juros Selic incidem sobre o imposto devido, o que pode pesar. A gente revisa cada dedução antes de enviar justamente pra evitar esse cenário.",
			},
			{
				question: "Preciso declarar investimentos mesmo sem ter vendido?",
				answer:
					"Sim. Posições em bolsa, renda fixa, cripto e fundos imobiliários precisam aparecer na sua declaração, mesmo sem movimentação de venda. O ganho só é tributado quando você realiza a venda.",
			},
			{
				question: "Posso declarar junto com meu cônjuge?",
				answer:
					"Sim, é possível declarar em conjunto ou separadamente. A escolha depende do total de rendimentos, dependentes e dedutíveis de cada um. Fazemos a simulação junto pra escolher o caminho mais vantajoso.",
			},
			{
				question: "Como funciona o atendimento da DuoHub?",
				answer:
					"Você fala diretamente com especialistas dedicados pelo WhatsApp. Quem te atende é a mesma pessoa que faz a sua declaração — sem protocolo, sem fila, sem bot.",
			},
		],
	},

	finalCta: {
		badge: "Pronto pra começar?",
		title: "Declare com tranquilidade",
		description:
			"Fale com nossos especialistas dedicados. Respondemos em até 24h úteis.",
	},

	form: {
		title: "Fale com a gente",
		description: "Responderemos em até 24 horas úteis.",
		fields: {
			name: { label: "Nome completo", placeholder: "Seu nome" },
			email: { label: "E-mail", placeholder: "voce@email.com" },
			whatsapp: { label: "WhatsApp", placeholder: "(48) 99246-7107" },
			situation: {
				label: "Qual é a sua situação?",
				placeholder: "Selecione uma opção",
				options: [
					{ value: "CLT", label: "CLT" },
					{ value: "AUTONOMO", label: "Autônomo ou PJ" },
					{ value: "INVESTIDOR", label: "Investidor" },
					{ value: "MEI", label: "MEI" },
					{ value: "APOSENTADO", label: "Aposentado" },
					{ value: "MULTIPLO", label: "Mais de uma situação" },
					{ value: "NAO_SEI", label: "Não sei" },
				],
			},
			consent: {
				label: "Aceito a",
				linkLabel: "política de privacidade",
			},
		},

		privacy: {
			trigger: "política de privacidade",
			title: "Política de Privacidade",
			lastUpdated: "Última atualização: abril de 2026",
			sections: [
				{
					heading: "1. Dados que coletamos",
					body: "Ao preencher o formulário, coletamos seu nome, e-mail, WhatsApp e, quando informado, dados de qualificação (situação, complexidade fiscal e momento atual). Também registramos a data e hora do seu consentimento e, quando aplicável, parâmetros de origem do acesso (UTMs) para fins analíticos.",
				},
				{
					heading: "2. Como usamos seus dados",
					body: "Usamos seus dados exclusivamente para retornar o contato em até 24 horas úteis, entender sua situação e oferecer o serviço de declaração de Imposto de Renda. Não vendemos, alugamos nem compartilhamos seus dados com terceiros para fins de marketing.",
				},
				{
					heading: "3. Base legal (LGPD)",
					body: "O tratamento dos seus dados se baseia no seu consentimento (art. 7º, I da Lei 13.709/2018 — LGPD) e, quando houver contratação, na execução do contrato entre você e a DuoHub (art. 7º, V).",
				},
				{
					heading: "4. Retenção e segurança",
					body: "Mantemos seus dados enquanto houver relacionamento comercial ativo ou pelo prazo exigido pela legislação fiscal e contábil brasileira. Utilizamos provedores de infraestrutura em nuvem (Neon, Resend e Upstash) que aplicam criptografia em trânsito e em repouso.",
				},
				{
					heading: "5. Seus direitos",
					body: "Você pode, a qualquer momento, solicitar acesso, correção, portabilidade, anonimização ou exclusão dos seus dados, bem como revogar o consentimento. Para isso, envie um e-mail para contato@duohubcontabil.com.br.",
				},
				{
					heading: "6. Contato do controlador",
					body: "DuoHub Gestão Contábil — Florianópolis/SC. E-mail: contato@duohubcontabil.com.br. WhatsApp: (48) 99246-7107.",
				},
			],
			closeLabel: "Fechar",
		},
		submit: "Quero ajuda com meu IR",
		submitting: "Enviando…",
		toast: {
			success: "Recebemos seu contato. Responderemos em até 24 horas úteis.",
			rateLimit: "Muitas tentativas, aguarde alguns minutos e tente novamente.",
			error: "Não foi possível enviar agora. Tente novamente em instantes.",
		},
	},

	mobileCta: {
		label: "Quero ajuda com meu IR",
	},
} as const;

export type IrMessages = typeof ir;
