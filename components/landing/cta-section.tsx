import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section id="cta" className="py-16 bg-gradient-to-r from-slate-800 to-slate-700 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Stop Guessing Which Properties Make Money</h2>
        <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
          Connect your QuickBooks or Xero data and see real property-level P&L in minutes. Edit transactions directly in
          the dashboard and sync back automatically. No more spreadsheet hell.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-sky-500 to-sky-700 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-sky-500/30 transition-all"
          >
            <Link href="/signup">Start Free Trial</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white/10 bg-transparent"
          >
            <Link href="/#demo">See Live Demo</Link>
          </Button>
        </div>

        <div className="mt-8 text-sm opacity-75">
          <p>14-day free trial • Real QuickBooks & Xero data • No credit card required</p>
        </div>

        {/* Platform badges */}
        <div className="mt-6 flex items-center justify-center gap-8">
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
