import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f5faff] via-white to-white pt-32 pb-24">
      {/* Background Accent */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-96 w-[45rem] -translate-x-1/2 rounded-full bg-sky-200/30 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.35em] text-sky-600">
            Advanced CFO intelligence built on top of QuickBooks &amp; Xero
          </p>

          <h1 className="mb-6 text-4xl font-bold leading-tight text-sky-950 md:text-6xl">
            Sync <span className="text-sky-500">Smarter</span>, Not Harder
          </h1>

          <p className="mx-auto mb-10 max-w-3xl text-lg text-sky-900/80 md:text-xl">
            See which properties make and lose money. Edit transactions directly in our dashboard and sync back to QuickBooks or Xero. Real multi-property intelligence from your existing data.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Button
              asChild
              size="lg"
              className="h-14 min-w-[180px] bg-gradient-to-r from-sky-500 to-sky-600 text-base font-semibold shadow-lg shadow-sky-500/30 hover:shadow-xl"
            >
              <Link href="https://buy.stripe.com/6oU6oH81gd0h2dq2e7dnW07">Start Free Trial</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-14 min-w-[180px] border-sky-200 bg-white text-base font-semibold text-sky-700 hover:bg-sky-50"
            >
              <a href="https://calendly.com/gpober/30min" target="_blank" rel="noopener">
                See Live Demo
              </a>
            </Button>
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <div className="flex items-center gap-2 rounded-full border border-sky-100 bg-white px-4 py-2 text-sm font-medium text-sky-700 shadow-sm">
              <span className="h-3 w-3 rounded-full bg-[#2ca01c]" /> QuickBooks Integration
            </div>
            <div className="flex items-center gap-2 rounded-full border border-sky-100 bg-white px-4 py-2 text-sm font-medium text-sky-700 shadow-sm">
              <span className="h-3 w-3 rounded-full bg-[#13b5ea]" /> Xero Integration
            </div>
            <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 shadow-sm">
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                Real
              </span>
              Multi-property intelligence from your QuickBooks data
            </div>
          </div>
        </div>

        <div className="relative mx-auto mt-16 max-w-5xl">
          <div className="relative overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-[0_40px_120px_-40px_rgba(14,116,144,0.45)]">
            <div className="aspect-[16/9] bg-sky-50">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/ZLEk7ybKMwk"
                title="I AM CFO Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </div>
          <p className="mt-4 text-center text-sm font-medium uppercase tracking-[0.3em] text-sky-400">
            Real platform walkthrough in under 2 minutes
          </p>
        </div>

        <div className="mt-16">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.5em] text-sky-400">
            Trusted by growing operators
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-8 opacity-80">
            <img
              src="/images/client-1.png"
              alt="Client logo"
              className="h-10 w-auto"
            />
            <img
              src="/images/client-2.png"
              alt="Client logo"
              className="h-10 w-auto"
            />
            <img
              src="/images/client-3.png"
              alt="Client logo"
              className="h-10 w-auto"
            />
            <img
              src="/images/client-4.png"
              alt="Client logo"
              className="h-10 w-auto"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
