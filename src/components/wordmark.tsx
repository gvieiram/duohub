import { company } from "@/content/company";
import { cn } from "@/lib/utils";

type WordmarkProps = React.ComponentProps<"span"> & {
	textUppercase?: boolean;
};

export function Wordmark({
	className,
	textUppercase = false,
	...props
}: WordmarkProps) {
	return (
		<span
			className={cn(
				"select-none font-logo font-semibold text-2xl tracking-wide",
				textUppercase && "uppercase",
				className,
			)}
			{...props}
		>
			<span className="text-primary">{company.brand.displayNameProps.duo}</span>
			<span className="text-highlight">
				{company.brand.displayNameProps.hub}
			</span>
		</span>
	);
}
