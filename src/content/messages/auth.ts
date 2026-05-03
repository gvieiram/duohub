export const auth = {
	login: {
		title: "Entrar no DuoHub",
		subtitle: "Receba um link de acesso por email.",
		emailLabel: "E-mail",
		emailPlaceholder: "voce@duohubcontabil.com.br",
		submit: "Receber link de acesso",
		submitting: "Enviando...",
		successTitle: "Verifique seu email",
		successMessage:
			"Se este email estiver cadastrado, você receberá um link de acesso em alguns minutos. O link expira em 15 minutos.",
		errors: {
			forbidden:
				"Este email não tem permissão para acessar a área administrativa.",
			sessionInvalidated: "Sua sessão foi encerrada. Entre novamente.",
		},
	},
	email: {
		subject: "Seu link de acesso ao DuoHub",
		heading: "Acesso ao DuoHub",
		cta: "Entrar no DuoHub",
		expiry: "O link expira em 15 minutos.",
		notRequested: "Se você não solicitou este link, ignore este email.",
	},
	verify: {
		loading: "Validando seu link…",
	},
} as const;
