"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: "Demo", href: "#demo" },
    { name: "Industries", href: "#industries" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "Pricing", href: "#pricing" },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-sky-500/20 bg-gradient-to-br from-[#06153d]/95 via-[#1142d4]/92 to-[#4bd0ff]/88 backdrop-blur">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img
              src="/images/logo.png"
              alt="I AM CFO"
              className="h-12 w-auto"
            />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sky-50/80 hover:text-white font-medium transition-colors"
              >
                {item.name}
              </a>
            ))}

            <div className="flex items-center gap-3">
              <Button
                asChild
                variant="ghost"
                className="text-sky-50/80 hover:text-white"
              >
                <Link href="/login">Sign In</Link>
              </Button>
              <Button
                asChild
                className="bg-gradient-to-r from-[#2a82ff] to-[#5ae3ff] text-white hover:shadow-lg"
              >
                <Link href="#pricing">Get Started</Link>
              </Button>
            </div>
          </div>

          <button
            className="md:hidden p-2 text-sky-50/80 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-sky-900/20">
            <div className="flex flex-col gap-4 pt-4">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-sky-100/80 hover:text-white font-medium px-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-2">
                <Button asChild variant="outline" className="w-full border-sky-500/40 text-sky-50/80 hover:bg-sky-900/10">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild className="w-full bg-gradient-to-r from-[#2a82ff] to-[#5ae3ff] text-white">
                  <Link href="#pricing">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
