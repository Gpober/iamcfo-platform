import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgb(148, 163, 184) 1px, transparent 0)`,
          backgroundSize: '48px 48px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400 rounded-full px-6 py-3 backdrop-blur-sm">
              <span className="text-2xl">🎉</span>
              <span className="text-sm font-bold text-green-300">
                $299 Setup Fee WAIVED Throughout 2025
              </span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl font-extrabold text-white text-center mb-6 leading-tight">
            Stop Guessing Where Your <br />
            <span className="bg-gradient-to-r from-blue-400 to-sky-400 bg-clip-text text-transparent">
              Cash Actually Goes
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-slate-300 text-center mb-12 max-w-3xl mx-auto">
            Real-time financial intelligence for businesses doing <strong className="text-white">$2M-$25M</strong> in revenue. 
            See exactly which properties, customers, and expenses drive your bottom line.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              asChild
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all"
            >
              <Link href="https://buy.stripe.com/6oU6oH81gd0h2dq2e7dnW07">Get Started - Save $299</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-2 border-white text-white hover:bg-white/10 bg-transparent"
            >
              <a href="https://calendly.com/gpober/30min" target="_blank" rel="noopener">
                Book Free Demo
              </a>
            </Button>
          </div>

          {/* Video Demo */}
          <div className="relative max-w-4xl mx-auto">
            <div className="relative rounded-xl overflow-hidden shadow-2xl shadow-black/50 border-4 border-slate-700">
              <div className="aspect-video bg-slate-800">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/ZLEk7ybKMwk"
                  title="I AM CFO Demo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
            
            {/* Video Caption */}
            <p className="text-center text-slate-400 mt-4 text-sm">
              Watch how multi-unit operators get clarity in 2 minutes ⏱️
            </p>
          </div>

          {/* Client Logos */}
          <div className="mt-16">
            <p className="text-center text-slate-400 text-sm mb-6 uppercase tracking-wider">
              Trusted by Growing Businesses
            </p>
            <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap opacity-60">
              <img 
                src="/lib/client 1.png" 
                alt="Client Logo" 
                className="h-10 w-auto grayscale hover:grayscale-0 transition-all"
              />
              <img 
                src="/lib/client 2.png" 
                alt="Client Logo" 
                className="h-10 w-auto grayscale hover:grayscale-0 transition-all"
              />
              <img 
                src="/lib/client 3.png" 
                alt="Client Logo" 
                className="h-10 w-auto grayscale hover:grayscale-0 transition-all"
              />
              <img 
                src="/lib/client 4.png" 
                alt="Client Logo" 
                className="h-10 w-auto grayscale hover:grayscale-0 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="white"/>
        </svg>
      </div>
    </section>
  )
}
