"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, CreditCard, ShoppingBag, UserPlus } from "lucide-react"

interface PublicHeaderProps {
  subtitle?: string
}

const navLinks = [
  { href: "/pagamentos", label: "Pagamentos", icon: CreditCard },
  { href: "/cadastro", label: "Pré-matrícula", icon: UserPlus },
  { href: "/produtos", label: "Produtos", icon: ShoppingBag },
]

export function PublicHeader({ subtitle }: PublicHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Logo + título */}
          <Link href="/pagamentos" className="flex items-center gap-3">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/icon-EbF6LeuW8nwzcDaIBRfQ1hsbkBhixN.jpeg"
              alt="Equipe Carolina Garcia"
              width={38}
              height={38}
              className="rounded-lg flex-shrink-0"
            />
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">Equipe Carolina Garcia</p>
              {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
            </div>
          </Link>

          {/* Botão menu mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
          </button>
        </div>

        {/* Nav links — sempre visíveis em md+, dropdown em mobile */}
        <div className="hidden md:block border-t border-gray-100">
          <div className="max-w-lg mx-auto px-4 flex gap-1 py-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === href
                    ? "bg-[#9EF01A] text-gray-900"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Drawer mobile */}
      {menuOpen && (
        <div className="fixed inset-0 z-10 md:hidden" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute top-[68px] left-0 right-0 bg-white border-b border-gray-200 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <nav className="max-w-lg mx-auto px-4 py-2 space-y-1">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    pathname === href
                      ? "bg-[#9EF01A] text-gray-900"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
