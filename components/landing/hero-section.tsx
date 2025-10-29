import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 bg-gradient-to-b from-[#ECF4FF] via-[#F6FAFF] to-white">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(45, 126, 214, 0.28) 1px, transparent 0)`,
          }}
        />
        <div className="absolute -top-32 -right-20 h-64 w-64 rounded-full bg-[#B7DAFF] blur-3xl opacity-40" />
        <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-[#D4E8FF] blur-3xl opacity-70" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Tagline */}
          <p className="mb-6 text-center text-[0.8rem] font-semibold uppercase tracking-[0.35em] text-sky-700">
            Advanced CFO Intelligence Built on QuickBooks &amp; Xero
          </p>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl font-extrabold text-center mb-6 leading-tight text-slate-900">
            Sync Smarter,
            <span className="block bg-gradient-to-r from-[#1B75D1] via-[#1C8EEF] to-[#13A0FF] bg-clip-text text-transparent">
              Not Harder
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-slate-600 text-center mb-10 max-w-3xl mx-auto">
            See which properties make and lose money. Edit transactions directly in our dashboard and sync back to QuickBooks
            or Xero. Real multi-property intelligence from your existing data.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Button
              asChild
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-to-r from-[#1B75D1] to-[#1590F9] text-white shadow-lg shadow-sky-200/40 hover:scale-[1.02] transition-transform"
            >
              <Link href="https://buy.stripe.com/6oU6oH81gd0h2dq2e7dnW07">Start Free Trial</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-2 border-sky-200 text-sky-700 bg-white/80 hover:bg-sky-50/60"
            >
              <a href="https://calendly.com/gpober/30min" target="_blank" rel="noopener">
                See Live Demo
              </a>
            </Button>
          </div>

          {/* Platform badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-5 py-2 text-sm font-semibold text-sky-700 shadow-sm">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">
                QB
              </span>
              QuickBooks Integrated
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-5 py-2 text-sm font-semibold text-sky-700 shadow-sm">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#13A0FF] text-xs font-bold text-white">
                X
              </span>
              Xero Ready
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FDB556] to-[#FF914D] px-5 py-2 text-sm font-semibold text-white shadow-sm">
              <span className="text-lg">⚡</span>
              Real multi-property intel from your QuickBooks data
            </div>
          </div>

          {/* Video Demo */}
          <div className="relative max-w-4xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-sky-200/60 border border-sky-100 bg-white">
              <div className="aspect-video bg-[#0F3A75]/10">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/watch?v=ZLEk7ybKMwk"
                  title="I AM CFO Demo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>

            {/* Video Caption */}
            <p className="text-center text-slate-500 mt-4 text-sm">
              Watch how multi-unit operators get clarity in 2 minutes ⏱️
            </p>
          </div>

          {/* Client Logos */}
          <div className="mt-16">
            <p className="text-center text-slate-500 text-sm mb-6 uppercase tracking-wider">
              Trusted by Growing Businesses
            </p>
            <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap opacity-80">
              <img src="/images/client-1.png" alt="Client Logo" className="h-10 w-auto" />
              <img src="/images/client-2.png" alt="Client Logo" className="h-10 w-auto" />
              <img src="/images/client-3.png" alt="Client Logo" className="h-10 w-auto" />
              <img src="/images/client-4.png" alt="Client Logo" className="h-10 w-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
            fill="#F6FAFF"
          />
        </svg>
      </div>
    </section>
  )
}
