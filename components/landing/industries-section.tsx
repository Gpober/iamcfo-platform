import { Building2, Home, Truck, Wrench, Users, Briefcase } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function IndustriesSection() {
  const industries = [
    {
      icon: Home,
      name: "Vacation Rentals",
      description: "Track P&L per property, compare STR vs LTR performance, forecast seasonal cash flow."
    },
    {
      icon: Building2,
      name: "Multi-Unit Retail",
      description: "See which locations drive profit, compare COGS across stores, optimize inventory spend."
    },
    {
      icon: Truck,
      name: "Transportation & Logistics",
      description: "Monitor per-route profitability, driver costs, fuel trends, and maintenance by vehicle."
    },
    {
      icon: Wrench,
      name: "Contractors & Trades",
      description: "Job costing, labor vs materials breakdown, client profitability, equipment depreciation."
    },
    {
      icon: Users,
      name: "Franchise Owners",
      description: "Consolidate multi-location data, benchmark against franchise averages, track royalty costs."
    },
    {
      icon: Briefcase,
      name: "Professional Services",
      description: "Client-level profitability, billable hours vs revenue, overhead allocation by practice area."
    }
  ]

  return (
    <section id="industries" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Built for Businesses That Need <br />
            <span className="text-blue-600">More Than Basic Bookkeeping</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Whether you run 3 vacation rentals or 30 retail locations, I AM CFO gives you 
            the visibility you need to scale profitably.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {industries.map((industry, idx) => (
            <Card key={idx} className="border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all group">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors">
                  <industry.icon className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {industry.name}
                </h3>
                <p className="text-sm text-slate-600">
                  {industry.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Custom Solutions CTA */}
        <div className="mt-12 text-center">
          <p className="text-slate-600 mb-4">
            Don't see your industry? We customize dashboards for any multi-unit business model.
          </p>
          <a 
            href="mailto:sales@iamcfo.com" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold"
          >
            Contact us about custom solutions →
          </a>
        </div>
      </div>
    </section>
  )
}
