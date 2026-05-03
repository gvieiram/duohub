export const admin = {
	nav: {
		dashboard: "Dashboard",
		clients: "Clientes",
		users: "Usuários",
	},
	shell: {
		logout: "Sair",
		profile: "Meu perfil",
		toggleSidebar: "Alternar menu lateral",
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
	},
} as const;
