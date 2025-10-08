import { CheckCircle2, XCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function ComparisonSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            See The Difference
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Standard QuickBooks reports tell you what happened. I AM CFO tells you why—and what to do about it.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* QuickBooks Side */}
          <Card className="border-2 border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-700">Standard QuickBooks</h3>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="text-sm font-semibold text-slate-600 mb-2">STATEMENT OF CASH FLOWS</div>
                  <div className="text-xs text-slate-500 mb-3">May 2024</div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Operating Activities</span>
                      <span className="font-mono">$45,200</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Investing Activities</span>
                      <span className="font-mono">-$12,500</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Financing Activities</span>
                      <span className="font-mono">-$61,000</span>
                    </div>
                    <div className="border-t border-slate-300 pt-2 mt-2 flex justify-between font-bold">
                      <span>Net Cash Change</span>
                      <span className="font-mono text-red-600">-$28,294</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 font-semibold mb-2">
                  ❌ The Problem:
                </p>
                <p className="text-sm text-red-700">
                  You can see cash decreased by $28K... but <strong>WHY?</strong> Where exactly did the money go? Which expenses are normal vs alarming?
                </p>
              </div>
            </CardContent>
          </Card>

          {/* I AM CFO Side */}
          <Card className="border-2 border-blue-500 shadow-lg shadow-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                  I AM CFO Dashboard
                </h3>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-4 rounded-lg border-2 border-blue-200">
                  <div className="text-sm font-semibold text-blue-900 mb-2">ENHANCED CASH FLOW</div>
                  <div className="text-xs text-blue-600 mb-3">May 2024 • Click any line to drill down</div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="bg-white/70 p-2 rounded">
                      <div className="flex justify-between font-semibold text-green-700">
                        <span>Collections (A/R)</span>
                        <span className="font-mono">+$369,052</span>
                      </div>
                      <div className="text-xs text-slate-600 ml-4 mt-1">
                        Cox Automotive: $107K • Tesla Dealership: $89K
                      </div>
                    </div>
                    
                    <div className="bg-white/70 p-2 rounded">
                      <div className="flex justify-between font-semibold text-red-700">
                        <span>Payments (A/P)</span>
                        <span className="font-mono">-$376,294</span>
                      </div>
                      <div className="text-xs text-slate-600 ml-4 mt-1">
                        Paid down vendors • Can we negotiate terms?
                      </div>
                    </div>

                    <div className="bg-white/70 p-2 rounded">
                      <div className="flex justify-between text-slate-700">
                        <span>Travel Expenses</span>
                        <span className="font-mono">-$4,578</span>
                      </div>
                      <div className="text-xs text-slate-600 ml-4 mt-1">
                        Airbnb: $2,145 • Hotels: $1,890 • Flights: $543
                      </div>
                    </div>

                    <div className="bg-white/70 p-2 rounded">
                      <div className="flex justify-between text-slate-700">
                        <span>Office Supplies</span>
                        <span className="font-mono">-$4,578</span>
                      </div>
                      <div className="text-xs text-slate-600 ml-4 mt-1">
                        What did we buy? Worth investigating.
                      </div>
                    </div>
                    
                    <div className="border-t-2 border-blue-300 pt-2 mt-2 flex justify-between font-bold text-blue-900">
                      <span>Net Cash Change</span>
                      <span className="font-mono">-$28,294</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 font-semibold mb-2">
                  ✅ Actionable Insights:
                </p>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• "We spent $4,578 on travel—is that normal?"</li>
                  <li>• "Office supplies hit $4,578—what did we buy?"</li>
                  <li>• "We collected $369K but paid out $376K—can we negotiate vendor terms?"</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <a 
            href="#pricing" 
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            See Your Numbers Like This
          </a>
        </div>
      </div>
    </section>
  )
}
