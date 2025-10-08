import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#06153d] via-[#1242d6] to-[#f2f8ff] pt-32 pb-24">
      {/* Background Accent */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-56 left-1/2 h-[28rem] w-[52rem] -translate-x-1/2 rounded-full bg-[#3a8dff]/45 blur-3xl" />
        <div className="absolute -left-32 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-[#1242d6]/35 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.35em] text-sky-100/90">
            Advanced CFO intelligence built on top of QuickBooks &amp; Xero
          </p>

          <h1 className="mb-6 text-4xl font-bold leading-tight text-white md:text-6xl">
            Sync <span className="text-[#54d7ff]">Smarter</span>, Not Harder
          </h1>

          <p className="mx-auto mb-10 max-w-3xl text-lg text-sky-50/90 md:text-xl">
            See which properties make and lose money. Edit transactions directly in our dashboard and sync back to QuickBooks or Xero. Real multi-property intelligence from your existing data.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Button
              asChild
              size="lg"
              className="h-14 min-w-[180px] bg-gradient-to-r from-[#2a82ff] to-[#5ae3ff] text-base font-semibold text-white shadow-lg shadow-[#2a82ff]/30 hover:shadow-xl"
            >
              <Link href="https://buy.stripe.com/6oU6oH81gd0h2dq2e7dnW07">Start Free Trial</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-14 min-w-[180px] border-sky-100/50 bg-white/15 text-base font-semibold text-sky-50 backdrop-blur-sm hover:bg-white/25"
            >
              <a href="https://calendly.com/gpober/30min" target="_blank" rel="noopener">
                See Live Demo
              </a>
            </Button>
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-sm font-medium text-sky-50 shadow-sm backdrop-blur">
              <span className="h-3 w-3 rounded-full bg-[#2ca01c]" /> QuickBooks Integration
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-sm font-medium text-sky-50 shadow-sm backdrop-blur">
              <span className="h-3 w-3 rounded-full bg-[#13b5ea]" /> Xero Integration
            </div>
            <div className="flex items-center gap-2 rounded-full border border-amber-300/50 bg-amber-200/30 px-4 py-2 text-sm font-semibold text-amber-100 shadow-sm backdrop-blur">
              <span className="rounded-full bg-amber-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#1b1235]">
                Real
              </span>
              Multi-property intelligence from your QuickBooks data
            </div>
          </div>
        </div>

        <div className="relative mx-auto mt-16 max-w-5xl">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-[0_40px_140px_-50px_rgba(17,80,205,0.45)] backdrop-blur">
            <div className="aspect-[16/9] bg-[#0d2f7a]/70">
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
          <p className="mt-4 text-center text-sm font-medium uppercase tracking-[0.3em] text-sky-100/80">
            Real platform walkthrough in under 2 minutes
          </p>
        </div>

        <div className="mt-16">
          <div className="mx-auto max-w-5xl rounded-3xl bg-white/95 p-10 text-center shadow-xl shadow-sky-500/20 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.5em] text-sky-700">
              Trusted by growing operators
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-8 opacity-90">
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
      </div>
    </section>
  )
}
