"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: "Features", href: "#solution" },
    { name: "Industries", href: "#industries" },
    { name: "Demo", href: "#demo" },
    { name: "Pricing", href: "#pricing" },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-sky-100 bg-white/80 backdrop-blur-xl shadow-sm">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img
              src="/images/logo.png"
              alt="I AM CFO"
              className="h-12 w-auto drop-shadow-sm"
            />
            <span className="hidden md:inline text-xs font-semibold uppercase tracking-[0.32em] text-sky-700">
              Advanced CFO Intelligence
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-slate-700 hover:text-sky-600 font-semibold transition-colors"
              >
                {item.name}
              </a>
            ))}

            <div className="flex items-center gap-3">
              <Button
                asChild
                variant="ghost"
                className="text-slate-700 hover:text-sky-600"
              >
                <Link href="/login">Sign In</Link>
              </Button>
              <Button
                asChild
                className="bg-gradient-to-r from-[#1B75D1] to-[#1590F9] text-white hover:shadow-lg hover:shadow-sky-200"
              >
                <Link href="/login">Dashboard</Link>
              </Button>
            </div>
          </div>

          <button
            className="md:hidden p-2 text-slate-700 hover:text-sky-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-sky-100">
            <div className="flex flex-col gap-4 pt-4">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-slate-700 hover:text-sky-600 font-semibold px-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-2">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild className="w-full bg-gradient-to-r from-[#1B75D1] to-[#1590F9] text-white">
                  <Link href="/login">Dashboard</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
