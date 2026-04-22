import { Img, Section } from "@react-email/components";
import { getSiteUrl } from "@/lib/site-url";

export function EmailHeader() {
	const logoUrl = `${getSiteUrl()}/logos/Full_Logo_Horizontal.png`;
	return (
		<Section className="px-6 py-8 text-center">
			<Img
				src={logoUrl}
				alt="DuoHub Gestão Contábil"
				width={240}
				height={69}
				className="mx-auto block"
			/>
		</Section>
	);
}
