import { Zap, BarChart3, Brain, RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function SolutionSection() {
  const features = [
    {
      icon: Zap,
      title: "Real-Time Sync",
      description: "Your QuickBooks data updates automatically. See today's numbers today, not next month.",
      color: "blue"
    },
    {
      icon: BarChart3,
      title: "Property-Level Clarity",
      description: "Every location, every customer, every expense line—broken down so you know exactly what's working.",
      color: "green"
    },
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description: "Our AI flags anomalies, predicts cash crunches, and tells you which decisions will move the needle.",
      color: "purple"
    },
    {
      icon: RefreshCw,
      title: "Drill-Down to Every Dollar",
      description: "Click any number to see the transactions behind it. From summary to detail in one click.",
      color: "orange"
    }
  ]

  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600"
  }

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Financial Intelligence That Actually <br />
            <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
              Helps You Make Decisions
            </span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            I AM CFO connects to your QuickBooks and transforms your raw data into actionable insights. 
            No more guessing. No more spreadsheets. Just clarity.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
          {features.map((feature, idx) => (
            <Card key={idx} className="border-2 border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[feature.color as keyof typeof colorClasses]}`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Value Prop */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-8 text-white text-center shadow-2xl shadow-blue-500/30">
            <p className="text-2xl font-bold mb-3">
              Setup Takes 48 Hours. Clarity Lasts Forever.
            </p>
            <p className="text-blue-100 text-lg">
              Invite us to your QuickBooks. We build your custom dashboard. 
              You start making data-driven decisions instead of educated guesses.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
