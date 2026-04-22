import { Font } from "@react-email/components";

export function EmailFonts() {
	return (
		<>
			<Font
				fontFamily="Inter"
				fallbackFontFamily="Arial"
				webFont={{
					url: "https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2",
					format: "woff2",
				}}
				fontWeight={400}
				fontStyle="normal"
			/>
			<Font
				fontFamily="Inter"
				fallbackFontFamily="Arial"
				webFont={{
					url: "https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa05L7.woff2",
					format: "woff2",
				}}
				fontWeight={600}
				fontStyle="normal"
			/>
		</>
	);
}
