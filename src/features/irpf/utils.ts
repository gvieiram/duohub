export function normalizeWhatsapp(value: string): string {
	return value.replace(/\D/g, "");
}

export function whatsappLink(whatsapp: string, text: string): string {
	const digits = normalizeWhatsapp(whatsapp);
	const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
	return `https://wa.me/${withCountry}?text=${encodeURIComponent(text)}`;
}
