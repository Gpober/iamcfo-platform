import { HeroSection } from "@/components/landing/hero-section"
import { ProblemSection } from "@/components/landing/problem-section"
import { SolutionSection } from "@/components/landing/solution-section"
import { ComparisonSection } from "@/components/landing/comparison-section"
import { IndustriesSection } from "@/components/landing/industries-section"
import { DemoSection } from "@/components/landing/demo-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { CTASection } from "@/components/landing/cta-section"
import { Header } from "@/components/header"

export default function HomePage() {
  return (
    <>
      <Header />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <ComparisonSection /> {/* ✅ NEW - Your ace in the hole */}
      <IndustriesSection />
      <DemoSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
    </>
  )
}
