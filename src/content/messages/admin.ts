export const admin = {
	nav: {
		dashboard: "Dashboard",
		clients: "Clientes",
		users: "Usuários",
	},
	shell: {
		logout: "Sair",
		toggleSidebar: "Alternar menu lateral",
		loading: "Carregando",
	},
	dashboard: {
		title: "Dashboard",
		welcome: (firstName: string) => `Olá, ${firstName}`,
		placeholder: "Em breve: indicadores e atividade recente.",
	},
	errors: {
		pageBoundary: "Algo deu errado",
		pageBoundaryDescription:
			"Tente novamente. Se persistir, contate o suporte.",
		retry: "Tentar de novo",
		logoutFailed: "Não foi possível encerrar sua sessão. Tente novamente.",
	},
} as const;
