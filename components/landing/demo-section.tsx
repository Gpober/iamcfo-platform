"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play, BarChart3, TrendingUp, DollarSign, MousePointerClick } from "lucide-react"

export function DemoSection() {
  const features = [
    {
      icon: BarChart3,
      title: "Real-Time Dashboard",
      description: "See today's cash position, not last month's"
    },
    {
      icon: MousePointerClick,
      title: "One-Click Drill-Down",
      description: "Click any number to see the transactions behind it"
    },
    {
      icon: TrendingUp,
      title: "Trend Analysis",
      description: "Spot patterns before they become problems"
    },
    {
      icon: DollarSign,
      title: "Property-Level P&L",
      description: "Know which locations actually make money"
    }
  ]

  return (
    <section id="demo" className="py-20 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              See It In Action
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Watch how we transform your QuickBooks data into actionable intelligence. 
              This is what your dashboard will look like.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Video */}
            <div className="order-2 lg:order-1">
              <div className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-slate-700">
                <div className="aspect-video bg-slate-800">
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/ZLEk7ybKMwk"
                    title="I AM CFO Dashboard Demo"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
              <p className="text-center text-slate-400 mt-4 text-sm">
                <Play className="inline w-4 h-4 mr-1" />
                2-minute walkthrough of your future dashboard
              </p>
            </div>

            {/* Features */}
            <div className="order-1 lg:order-2 space-y-4">
              {features.map((feature, idx) => (
                <Card key={idx} className="bg-slate-800/50 border-slate-700 backdrop-blur">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {feature.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="pt-4">
                <Button
                  asChild
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:shadow-xl hover:scale-105 transition-all"
                >
                  <a href="https://calendly.com/your-link" target="_blank" rel="noopener">
                    Book Your Free Demo
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Secret Weapon Callout */}
          <div className="mt-12 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-8 backdrop-blur">
            <div className="text-center">
              <p className="text-sm text-blue-300 font-semibold uppercase tracking-wider mb-2">
                The Game-Changer
              </p>
              <h3 className="text-2xl font-bold text-white mb-3">
                Click Any Number, See Every Transaction
              </h3>
              <p className="text-slate-300 max-w-2xl mx-auto">
                Your QuickBooks shows you collected $369K in May. I AM CFO shows you <strong>who paid you</strong>: 
                Cox Automotive ($107K), Tesla Dealership ($89K), and every other customer—down to the invoice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
