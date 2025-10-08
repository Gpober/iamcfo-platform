import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section id="cta" className="py-16 bg-gradient-to-r from-slate-800 to-slate-700 text-white">
      <div className="container mx-auto px-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400 rounded-full px-4 py-2 mb-6">
          <span className="text-2xl">🎉</span>
          <span className="text-sm font-semibold text-green-300">
            $299 Setup Fee WAIVED Throughout 2025
          </span>
        </div>

        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
          Stop Flying Blind With Your Cash Flow
        </h2>
        <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
          See exactly where every dollar goes—down to the customer and vendor level. 
          Connect your QuickBooks and get your first dashboard in 48 hours.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-sky-500 to-sky-700 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-sky-500/30 transition-all"
          >
            <Link href="#pricing">Get Started Now</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white/10 bg-transparent"
          >
            <a href="https://calendly.com/your-link" target="_blank" rel="noopener">
              Book Free Demo
            </a>
          </Button>
        </div>
        
        <div className="mt-8 text-sm opacity-75">
          <p>$399-$999/month • Real QuickBooks sync • No contracts</p>
          <p className="mt-2 text-green-300 font-semibold">
            Save $299 on setup when you sign up in 2025
          </p>
        </div>
        
        {/* Platform badges */}
        <div className="mt-8 flex items-center justify-center gap-8">
          <div className="flex items-center gap-2 opacity-75">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">QB</span>
            </div>
            <span className="text-sm">QuickBooks Ready</span>
          </div>
          <div className="flex items-center gap-2 opacity-75">
            <div className="w-8 h-8 bg-teal-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">X</span>
            </div>
            <span className="text-sm">Xero Compatible</span>
          </div>
        </div>
      </div>
    </section>
  )
}
