import { Star, Quote } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function TestimonialsSection() {
  const testimonials = [
    {
      quote: "I was spending 10 hours a week in spreadsheets trying to figure out which properties were profitable. Now I see it in real-time. Paid for itself in the first month.",
      author: "Sarah Chen",
      role: "Owner, 12 Vacation Rentals",
      revenue: "$4.2M annual revenue"
    },
    {
      quote: "We were making decisions based on 45-day-old data. I AM CFO shows us today's cash position and flags problems before they become crises. Game changer.",
      author: "Marcus Williams",
      role: "CFO, Multi-Unit Retail",
      revenue: "$18M annual revenue"
    },
    {
      quote: "The drill-down feature is incredible. I can click on 'Travel Expenses' and see every Airbnb booking, every hotel stay. No more mystery charges.",
      author: "Jennifer Lopez",
      role: "Controller, Construction Company",
      revenue: "$9M annual revenue"
    }
  ]

  const stats = [
    { number: "48hrs", label: "Average Setup Time" },
    { number: "10hrs/wk", label: "Time Saved on Reports" },
    { number: "100%", label: "Data Accuracy" },
    { number: "$12K", label: "Avg. First-Year Savings" }
  ]

  return (
    <section id="testimonials" className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-16">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-3xl md:text-4xl font-extrabold text-blue-600 mb-2">
                {stat.number}
              </div>
              <div className="text-sm text-slate-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Real businesses, real results. Here's how I AM CFO transformed their operations.
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, idx) => (
            <Card key={idx} className="border-2 border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all">
              <CardContent className="p-6">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Quote */}
                <Quote className="w-8 h-8 text-blue-200 mb-3" />
                <p className="text-slate-700 mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div className="border-t border-slate-200 pt-4">
                  <p className="font-bold text-slate-900">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-slate-600">
                    {testimonial.role}
                  </p>
                  <p className="text-xs text-blue-600 font-semibold mt-1">
                    {testimonial.revenue}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 flex items-center justify-center gap-8 flex-wrap">
          <div className="flex items-center gap-2 text-slate-600">
            <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">QB</span>
            </div>
            <span className="text-sm font-semibold">QuickBooks Certified Partner</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <div className="w-10 h-10 bg-green-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">🔒</span>
            </div>
            <span className="text-sm font-semibold">Bank-Level Security</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <div className="w-10 h-10 bg-purple-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">✓</span>
            </div>
            <span className="text-sm font-semibold">SOC 2 Compliant</span>
          </div>
        </div>
      </div>
    </section>
  )
}
