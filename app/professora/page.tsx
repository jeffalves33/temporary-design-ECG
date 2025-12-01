"use client"

import { MobileHeader } from "@/components/layout/mobile-header"
import { StatCard } from "@/components/ui/stat-card"
import { Users, GraduationCap, AlertCircle } from "lucide-react"
import { turmas, alunas, pagamentosAlunas, currentUser } from "@/lib/mock-data"
import Link from "next/link"

export default function ProfessoraDashboard() {
  const professoraId = "1"

  const minhasTurmas = turmas.filter((t) => t.professoraIds.includes(professoraId))
  const minhasAlunas = alunas.filter((a) => minhasTurmas.some((t) => t.id === a.turmaId))

  // Alunas com pendência
  const mesAtual = "2024-03"
  const alunasPendentes = minhasAlunas.filter((aluna) => {
    const pagamentos = pagamentosAlunas.filter((p) => p.alunaId === aluna.id && p.mesReferencia === mesAtual)
    return pagamentos.some((p) => p.status === "Pendente")
  })

  return (
    <div className="min-h-screen bg-(--color-background-secondary)">
      <MobileHeader title="Dashboard" />

      <main className="px-4 pb-6 space-y-6">
        {/* Boas vindas */}
        <section className="pt-4 bg-gradient-to-br from-(--color-primary) to-(--color-primary-hover) rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Olá, {currentUser.name}!</h1>
          <p className="text-white/90">Bem-vinda ao seu painel</p>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <StatCard
            title="Minhas Turmas"
            value={minhasTurmas.length}
            icon={GraduationCap}
            iconColor="text-(--color-primary)"
          />
          <StatCard title="Minhas Alunas" value={minhasAlunas.length} icon={Users} iconColor="text-blue-600" />
        </section>

        {/* Pendências */}
        {alunasPendentes.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-(--color-foreground)">Atenção</h2>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-900 mb-2">
                    {alunasPendentes.length} aluna{alunasPendentes.length > 1 ? "s" : ""} com mensalidade pendente
                  </p>
                  <div className="space-y-1">
                    {alunasPendentes.slice(0, 3).map((aluna) => {
                      const turma = turmas.find((t) => t.id === aluna.turmaId)
                      return (
                        <p key={aluna.id} className="text-sm text-amber-700">
                          • {aluna.nome} - {turma?.name}
                        </p>
                      )
                    })}
                  </div>
                  {alunasPendentes.length > 3 && (
                    <p className="text-sm text-amber-600 mt-2">e mais {alunasPendentes.length - 3}...</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Minhas Turmas */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-(--color-foreground)">Minhas Turmas</h2>
            <Link href="/professora/turmas" className="text-sm font-medium text-(--color-primary) hover:underline">
              Ver todas
            </Link>
          </div>

          <div className="space-y-2">
            {minhasTurmas.slice(0, 5).map((turma) => {
              const alunasDaTurma = alunas.filter((a) => a.turmaId === turma.id)
              const alunasPendentesTurma = alunasDaTurma.filter((aluna) => {
                const pagamentos = pagamentosAlunas.filter(
                  (p) => p.alunaId === aluna.id && p.mesReferencia === mesAtual,
                )
                return pagamentos.some((p) => p.status === "Pendente")
              })

              return (
                <Link
                  key={turma.id}
                  href={`/professora/turmas/${turma.id}`}
                  className="block bg-white rounded-lg p-4 border border-(--color-border) hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-(--color-foreground)">{turma.name}</h3>
                      <p className="text-sm text-(--color-foreground-secondary)">{turma.nivel}</p>
                    </div>
                    {alunasPendentesTurma.length > 0 && (
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                        {alunasPendentesTurma.length} pendência{alunasPendentesTurma.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-(--color-foreground-secondary)">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {alunasDaTurma.length} alunas
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}
