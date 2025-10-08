import { XCircle, Clock, FileText, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function ProblemSection() {
  const problems = [
    {
      icon: XCircle,
      title: "Flying Blind on Cash Flow",
      description: "QuickBooks tells you the totals, but not which properties are bleeding money or which customers are worth keeping."
    },
    {
      icon: Clock,
      title: "Weeks Behind on Reports",
      description: "By the time you pull last month's P&L, it's too late to make decisions. You're always reacting, never planning."
    },
    {
      icon: FileText,
      title: "Spreadsheet Hell",
      description: "Hours spent manually categorizing transactions, reconciling accounts, and building custom reports in Excel that break constantly."
    },
    {
      icon: AlertTriangle,
      title: "Can't See the Warning Signs",
      description: "You don't know a customer went from profitable to problem until you're already thousands in the hole."
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            You Built a $2M+ Business... <br />
            <span className="text-red-600">But Your Books Don't Show You Why It Works</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Standard accounting tools weren't built for multi-unit operators. They show you what happened, 
            but never <strong>why</strong> or <strong>what to do about it</strong>.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {problems.map((problem, idx) => (
            <Card key={idx} className="border-2 border-slate-200 hover:border-red-300 hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <problem.icon className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {problem.title}
                    </h3>
                    <p className="text-slate-600">
                      {problem.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pain Amplifier */}
        <div className="mt-12 max-w-3xl mx-auto">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
            <p className="text-lg text-red-900 font-semibold mb-2">
              The Real Cost?
            </p>
            <p className="text-slate-700">
              You're making million-dollar decisions based on 30-day-old data and gut feeling. 
              One wrong move—keeping a bad property, missing a cash crunch—can wipe out months of profit.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
