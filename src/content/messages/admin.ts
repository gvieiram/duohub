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
	users: {
		title: "Usuários",
		subtitle: "Administradores com acesso ao painel.",
		invite: "Convidar usuário",
		columns: {
			user: "Usuário",
			status: "Status",
			lastAccess: "Último acesso",
			createdAt: "Cadastrado em",
			actions: "Ações",
		},
		empty: {
			title: "Nenhum usuário cadastrado",
			description: "Convide o primeiro administrador.",
		},
		inviteDialog: {
			title: "Convidar administrador",
			description: "Vamos enviar um magic link para o e-mail informado.",
			emailLabel: "E-mail",
			nameLabel: "Nome",
			submit: "Convidar",
			success: "Convite enviado.",
		},
		revokeDialog: {
			title: "Revogar acesso?",
			description: (email: string) =>
				`Isso impede que ${email} acesse o painel. Sessões ativas serão encerradas.`,
			confirm: "Revogar acesso",
			cancel: "Cancelar",
			success: "Acesso revogado.",
		},
		errors: {
			duplicateEmail: "Já existe um administrador com este e-mail.",
			generic: "Não foi possível concluir. Tente novamente.",
			selfRevoke: "Você não pode revogar seu próprio acesso.",
		},
	},
} as const;
