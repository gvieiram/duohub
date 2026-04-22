import { Column, Link, Row, Section, Text } from "@react-email/components";

const YEAR = new Date().getFullYear();

export function EmailFooter() {
	return (
		<Section className="bg-bg">
			<Row>
				<Column className="px-6 py-10 text-center">
					<Section className="mb-8">
						<Link
							href="https://duohubcontabil.com.br"
							className="inline-block px-2 align-middle font-13 text-fg-3 underline"
						>
							duohubcontabil.com.br
						</Link>
						<Link
							href="https://instagram.com/duohubcontabil"
							className="inline-block px-2 align-middle font-13 text-fg-3 underline"
						>
							@duohubcontabil
						</Link>
						<Link
							href="https://wa.me/5548992467107"
							className="inline-block px-2 align-middle font-13 text-fg-3 underline"
						>
							WhatsApp
						</Link>
					</Section>

					<Text className="mt-4 mb-2 text-center font-11 font-sans text-fg-3">
						Florianópolis, SC · CNPJ 58.333.395/0001-24
					</Text>
					<Text className="m-0 text-center font-11 font-sans text-fg-3">
						© {YEAR} DuoHub Gestão Contábil
					</Text>
				</Column>
			</Row>
		</Section>
	);
}
