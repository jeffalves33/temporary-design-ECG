"use client"

import { MobileHeader } from "@/components/layout/mobile-header"
import { StatCard } from "@/components/ui/stat-card"
import { Modal } from "@/components/ui/modal"
import { DollarSign, AlertCircle, Users, MessageSquare } from "lucide-react"
import { turmas, alunas, pagamentosAlunas } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"
import { useState } from "react"

export default function ProfessoraFinanceiroPage() {
  const professoraId = "1"
  const [isCobrancaModalOpen, setIsCobrancaModalOpen] = useState(false)
  const [selectedAluna, setSelectedAluna] = useState<any>(null)

  const minhasTurmas = turmas.filter((t) => t.professoraIds.includes(professoraId))
  const minhasAlunas = alunas.filter((a) => minhasTurmas.some((t) => t.id === a.turmaId))

  const mesAtual = "2024-03"
  const getPendencias = (alunaId: string) => {
    return pagamentosAlunas.filter((p) => p.alunaId === alunaId && p.status === "Pendente")
  }

  const alunasPendentes = minhasAlunas.filter((a) => getPendencias(a.id).length > 0)
  const totalPendente = alunasPendentes.reduce((sum, aluna) => {
    const pendencias = getPendencias(aluna.id)
    return sum + pendencias.reduce((s, p) => s + p.valor, 0)
  }, 0)

  // Pendências por turma
  const pendenciasPorTurma = minhasTurmas.map((turma) => {
    const alunasDaTurma = alunas.filter((a) => a.turmaId === turma.id)
    const alunasPendentesTurma = alunasDaTurma.filter((a) => getPendencias(a.id).length > 0)
    const valorPendente = alunasPendentesTurma.reduce((sum, aluna) => {
      const pendencias = getPendencias(aluna.id)
      return sum + pendencias.reduce((s, p) => s + p.valor, 0)
    }, 0)

    return {
      turma,
      totalAlunas: alunasDaTurma.length,
      alunasPendentes: alunasPendentesTurma.length,
      valorPendente,
    }
  })

  return (
    <div className="min-h-screen bg-(--color-background-secondary)">
      <MobileHeader title="Financeiro" />

      <main className="px-4 pb-6 space-y-6">
        <section className="pt-4 space-y-3">
          <h2 className="text-lg font-bold text-(--color-foreground)">Resumo - Março 2024</h2>

          <div className="grid gap-3">
            <StatCard
              title="Alunas com Pendência"
              value={alunasPendentes.length}
              icon={AlertCircle}
              iconColor="text-(--color-warning)"
            />
            <StatCard
              title="Total Pendente"
              value={formatCurrency(totalPendente)}
              icon={DollarSign}
              iconColor="text-(--color-error)"
            />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-(--color-foreground)">Pendências por Turma</h2>

          <div className="space-y-2">
            {pendenciasPorTurma.map(({ turma, totalAlunas, alunasPendentes, valorPendente }) => (
              <div key={turma.id} className="bg-white rounded-lg p-4 border border-(--color-border)">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-(--color-foreground)">{turma.name}</h3>
                    <p className="text-sm text-(--color-foreground-secondary)">{totalAlunas} alunas</p>
                  </div>
                  {alunasPendentes > 0 && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                      {alunasPendentes} pendência{alunasPendentes > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {alunasPendentes > 0 && (
                  <div className="bg-amber-50 rounded-lg p-3">
                    <p className="text-sm text-amber-900 font-medium">
                      Total pendente: {formatCurrency(valorPendente)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-(--color-foreground)">Alunas com Pendências</h2>

          {alunasPendentes.length === 0 ? (
            <div className="bg-white rounded-lg p-6 text-center border border-(--color-border)">
              <Users className="w-10 h-10 mx-auto text-(--color-foreground-muted) mb-2" />
              <p className="text-(--color-foreground-secondary)">Nenhuma pendência no momento</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alunasPendentes.map((aluna) => {
                const turma = turmas.find((t) => t.id === aluna.turmaId)
                const pendencias = getPendencias(aluna.id)
                const valorPendente = pendencias.reduce((sum, p) => sum + p.valor, 0)

                return (
                  <div key={aluna.id} className="bg-white rounded-lg p-4 border border-(--color-border)">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-(--color-foreground)">{aluna.nome}</h3>
                        <p className="text-sm text-(--color-foreground-secondary)">{turma?.name}</p>
                      </div>
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                        {pendencias.length} mês{pendencias.length > 1 ? "es" : ""}
                      </span>
                    </div>

                    <div className="bg-amber-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-amber-900 font-medium">Pendente: {formatCurrency(valorPendente)}</p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedAluna({ ...aluna, pendencias, valorPendente })
                        setIsCobrancaModalOpen(true)
                      }}
                      className="w-full px-4 py-2 bg-(--color-primary) text-white rounded-lg text-sm font-semibold hover:bg-(--color-primary-hover) transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Cobrar
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>

      {/* Modal Cobrar */}
      <Modal isOpen={isCobrancaModalOpen} onClose={() => setIsCobrancaModalOpen(false)} title="Cobrar Mensalidade">
        <div className="space-y-4">
          <div className="bg-(--color-background-secondary) rounded-lg p-4">
            <p className="text-sm text-(--color-foreground-secondary) mb-1">Aluna</p>
            <p className="font-semibold text-(--color-foreground) mb-3">{selectedAluna?.nome}</p>

            <p className="text-sm text-(--color-foreground-secondary) mb-1">Responsável</p>
            <p className="font-semibold text-(--color-foreground) mb-1">{selectedAluna?.responsavel?.nome}</p>
            <p className="text-sm text-(--color-foreground-secondary)">{selectedAluna?.responsavel?.whatsapp}</p>

            <div className="mt-4 pt-4 border-t border-(--color-border)">
              <p className="text-sm text-(--color-foreground-secondary) mb-1">Valor Pendente</p>
              <p className="text-2xl font-bold text-amber-600">{formatCurrency(selectedAluna?.valorPendente || 0)}</p>
              <p className="text-xs text-(--color-foreground-muted) mt-1">
                {selectedAluna?.pendencias?.length} mês{selectedAluna?.pendencias?.length > 1 ? "es" : ""} em atraso
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-medium mb-2">Funcionalidade Futura</p>
            <p className="text-xs text-blue-700">
              Este botão será integrado ao WhatsApp/Stripe para enviar lembretes de pagamento e gerar links de cobrança
              automaticamente.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsCobrancaModalOpen(false)}
              className="flex-1 px-4 py-2.5 border border-(--color-border) rounded-lg font-semibold text-(--color-foreground) hover:bg-(--color-background-tertiary) transition-colors"
            >
              Fechar
            </button>
            <button
              disabled
              className="flex-1 px-4 py-2.5 bg-gray-300 text-gray-500 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Gerar Link (Em breve)
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
