export const admin = {
	nav: {
		sectionLabel: "Geral",
		dashboard: "Dashboard",
		clients: "Clientes",
		users: "Usuários",
		settings: "Configurações",
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
	breadcrumb: {
		root: "Dashboard",
		segments: {
			clients: "Clientes",
			users: "Usuários",
			settings: "Configurações",
			new: "Novo",
			edit: "Editar",
		},
	},
	errors: {
		pageBoundary: "Algo deu errado",
		pageBoundaryDescription:
			"Tente novamente. Se persistir, contate o suporte.",
		retry: "Tentar de novo",
		logoutFailed: "Não foi possível encerrar sua sessão. Tente novamente.",
	},
} as const;
