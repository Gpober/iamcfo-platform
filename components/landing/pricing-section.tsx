import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import Link from "next/link"

export function PricingSection() {
  const plans = [
    {
      name: "Essential",
      price: "$399",
      description: "Perfect for single-location businesses",
      features: [
        "QuickBooks Online sync",
        "Real-time cash flow dashboard",
        "Basic financial reports",
        "Email support",
        "Monthly data refresh"
      ],
      cta: "Get Started",
      href: "https://buy.stripe.com/8x200j4P4d0hg4gdWPdnW06",
      popular: false
    },
    {
      name: "Professional",
      price: "$699",
      description: "Most popular for multi-unit operators",
      features: [
        "Everything in Essential, plus:",
        "QuickBooks + Operational platform sync",
        "AI-powered analytics & insights",
        "Property-level P&L breakdown",
        "Custom reporting",
        "Priority support",
        "Weekly data refresh"
      ],
      cta: "Get Started",
      href: "https://buy.stripe.com/6oU6oH81gd0h2dq2e7dnW07",
      popular: true
    },
    {
      name: "White Glove",
      price: "$999",
      description: "Fully customized for complex operations",
      features: [
        "Everything in Professional, plus:",
        "Custom dashboard buildout",
        "Dedicated account manager",
        "Custom integrations",
        "Advanced forecasting models",
        "Daily data refresh",
        "Phone + Slack support"
      ],
      cta: "Get Started",
      href: "https://buy.stripe.com/00wcN5chwf8p05i8CvdnW08",
      popular: false
    }
  ]

  return (
    <section id="pricing" className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          {/* $299 Waiver Badge */}
          <div className="inline-flex items-center gap-2 bg-green-500/10 border-2 border-green-500 rounded-full px-6 py-3 mb-6">
            <span className="text-2xl">🎉</span>
            <span className="text-sm font-bold text-green-700">
              $299 Setup Fee WAIVED Throughout 2025
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Choose the plan that fits your business. All plans include the $299 setup fee waived for 2025 signups.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.name}
              className={`relative ${
                plan.popular 
                  ? "border-2 border-blue-500 shadow-xl shadow-blue-500/20" 
                  : "border border-slate-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                  Most Popular
                </div>
              )}
              
              <CardHeader className="text-center pb-8 pt-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {plan.name}
                </h3>
                <div className="mb-2">
                  <span className="text-4xl font-extrabold text-slate-900">
                    {plan.price}
                  </span>
                  <span className="text-slate-600">/month</span>
                </div>
                <p className="text-sm text-slate-600">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={`w-full ${
                    plan.popular
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:shadow-lg hover:scale-105"
                      : "bg-slate-800 hover:bg-slate-700"
                  } transition-all`}
                  size="lg"
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>

                <p className="text-xs text-center text-slate-500 mt-4">
                  No contracts • Cancel anytime
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-slate-600">
            Need a custom solution for 10+ locations?{" "}
            <a href="mailto:sales@iamcfo.com" className="text-blue-600 hover:text-blue-700 font-semibold">
              Contact us for enterprise pricing
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
