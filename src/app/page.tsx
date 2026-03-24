import { AboutSection } from "@/components/about-section";
import { CtaSection } from "@/components/cta-section";
import { FaqSection } from "@/components/faq-section";
import { StackedFeatures } from "@/components/feature-section";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/hero";
import { SocialProofSection } from "@/components/social-proof-section";
import { messages } from "@/content/messages";

const features = messages.home.features;

export default function Home() {
	return (
		<div className="flex w-full flex-col">
			<main className="grow">
				<HeroSection />
				<SocialProofSection variant="credentials" />
				<StackedFeatures features={features} />
				<AboutSection />
				<FaqSection />
				<CtaSection />
			</main>
			<Footer />
		</div>
	);
}
