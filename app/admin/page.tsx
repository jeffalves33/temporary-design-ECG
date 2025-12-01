"use client"

import { useState } from "react"
import { MobileHeader } from "@/components/layout/mobile-header"
import { StatCard } from "@/components/ui/stat-card"
import { Users, GraduationCap, MapPin, DollarSign, TrendingUp, AlertCircle, Calendar } from "lucide-react"
import Link from "next/link"
import { polos, locais, turmas, alunas, professoras, pagamentosAlunas } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"

export default function AdminDashboard() {
  const [mesReferencia, setMesReferencia] = useState("2024-03")

  const totalAlunas = alunas.filter((a) => a.status === "Ativa").length
  const totalProfessoras = professoras.length
  const totalPolos = polos.length
  const totalLocais = locais.length

  const pagamentosMesAtual = pagamentosAlunas.filter((p) => p.mesReferencia === mesReferencia)
  const totalEsperado = pagamentosMesAtual.reduce((sum, p) => sum + p.valor, 0)
  const totalRecebido = pagamentosMesAtual.filter((p) => p.status === "Pago").reduce((sum, p) => sum + p.valor, 0)
  const totalPendente = totalEsperado - totalRecebido
  const alunasPendentes = new Set(pagamentosMesAtual.filter((p) => p.status === "Pendente").map((p) => p.alunaId)).size

  const quickLinks = [
    { label: "Gerenciar Polos", href: "/admin/polos", icon: MapPin, color: "bg-blue-100 text-blue-600" },
    { label: "Gerenciar Locais", href: "/admin/locais", icon: MapPin, color: "bg-purple-100 text-purple-600" },
    { label: "Gerenciar Turmas", href: "/admin/turmas", icon: GraduationCap, color: "bg-green-100 text-green-600" },
    { label: "Gerenciar Alunas", href: "/admin/alunas", icon: Users, color: "bg-pink-100 text-pink-600" },
    {
      label: "Gerenciar Professoras",
      href: "/admin/professoras",
      icon: GraduationCap,
      color: "bg-orange-100 text-orange-600",
    },
    {
      label: "Financeiro Geral",
      href: "/admin/financeiro",
      icon: DollarSign,
      color: "bg-emerald-100 text-emerald-600",
    },
  ]

  return (
    <div className="min-h-screen bg-(--color-background-secondary)">
      <MobileHeader title="Dashboard Admin" />

      <main className="px-4 pb-6 space-y-6">
        <section className="grid grid-cols-2 gap-3 pt-4">
          <StatCard title="Alunas Ativas" value={totalAlunas} icon={Users} iconColor="text-(--color-primary)" />
          <StatCard title="Professoras" value={totalProfessoras} icon={GraduationCap} iconColor="text-blue-600" />
          <StatCard title="Polos" value={totalPolos} icon={MapPin} iconColor="text-purple-600" />
          <StatCard title="Locais" value={totalLocais} icon={MapPin} iconColor="text-orange-600" />
        </section>

        {/* Financeiro resumo */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-(--color-foreground)">Financeiro</h2>
          </div>

          <div className="bg-white rounded-lg p-4 border border-(--color-border)">
            <label className="block text-sm font-medium text-(--color-foreground) mb-2">Período</label>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-(--color-foreground-secondary)" />
              <select
                value={mesReferencia}
                onChange={(e) => setMesReferencia(e.target.value)}
                className="flex-1 px-3 py-2 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary) bg-white"
              >
                <option value="2024-01">Janeiro 2024</option>
                <option value="2024-02">Fevereiro 2024</option>
                <option value="2024-03">Março 2024</option>
                <option value="2024-04">Abril 2024</option>
                <option value="2024-05">Maio 2024</option>
                <option value="2024-06">Junho 2024</option>
              </select>
            </div>
          </div>

          <div className="grid gap-3">
            <StatCard
              title="Total Esperado"
              value={formatCurrency(totalEsperado)}
              icon={TrendingUp}
              iconColor="text-(--color-info)"
            />
            <StatCard
              title="Total Recebido"
              value={formatCurrency(totalRecebido)}
              icon={DollarSign}
              iconColor="text-(--color-success)"
            />
            <StatCard
              title="Pendente"
              value={formatCurrency(totalPendente)}
              icon={AlertCircle}
              iconColor="text-(--color-warning)"
            />
          </div>

          {alunasPendentes > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900">{alunasPendentes} alunas com pendências</p>
                  <p className="text-sm text-amber-700 mt-1">Existem pagamentos em atraso neste mês</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Receitas por polo */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-(--color-foreground)">Receitas por Polo</h2>

          <div className="space-y-2">
            {polos.map((polo) => {
              const turmasDoPolo = turmas.filter((t) => t.poloId === polo.id)
              const alunasDoPolo = alunas.filter((a) => turmasDoPolo.some((t) => t.id === a.turmaId))
              const pagamentosPolo = pagamentosMesAtual.filter((p) => alunasDoPolo.some((a) => a.id === p.alunaId))
              const receitaPolo = pagamentosPolo.filter((p) => p.status === "Pago").reduce((sum, p) => sum + p.valor, 0)

              return (
                <div key={polo.id} className="bg-white rounded-lg p-4 border border-(--color-border)">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-(--color-foreground)">{polo.name}</h3>
                    <span className="text-xs text-(--color-foreground-secondary)">{polo.city}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-(--color-foreground-secondary)">{alunasDoPolo.length} alunas</span>
                    <span className="text-lg font-bold text-(--color-primary)">{formatCurrency(receitaPolo)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Acesso rápido */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-(--color-foreground)">Acesso Rápido</h2>

          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="bg-white rounded-lg p-4 border border-(--color-border) hover:shadow-md transition-shadow"
              >
                <div className={`w-10 h-10 rounded-lg ${link.color} flex items-center justify-center mb-3`}>
                  <link.icon className="w-5 h-5" />
                </div>
                <p className="font-semibold text-(--color-foreground) text-sm leading-tight">{link.label}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
