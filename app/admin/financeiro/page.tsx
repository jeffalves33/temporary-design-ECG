"use client"

import { useState } from "react"
import { MobileHeader } from "@/components/layout/mobile-header"
import { StatCard } from "@/components/ui/stat-card"
import { Modal } from "@/components/ui/modal"
import { DollarSign, TrendingUp, AlertCircle, CheckCircle } from "lucide-react"
import { polos, turmas, alunas, professoras, pagamentosAlunas, pagamentosProfessoras } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"

type TabType = "mensalidades" | "salarios"

export default function FinanceiroPage() {
  const [activeTab, setActiveTab] = useState<TabType>("mensalidades")
  const [isPagamentoModalOpen, setIsPagamentoModalOpen] = useState(false)
  const [selectedProfessora, setSelectedProfessora] = useState<string | null>(null)

  const mesAtual = "2024-03"

  // Mensalidades
  const pagamentosMes = pagamentosAlunas.filter((p) => p.mesReferencia === mesAtual)
  const totalEsperado = pagamentosMes.reduce((sum, p) => sum + p.valor, 0)
  const totalRecebido = pagamentosMes.filter((p) => p.status === "Pago").reduce((sum, p) => sum + p.valor, 0)
  const totalPendente = totalEsperado - totalRecebido
  const alunasPendentes = new Set(pagamentosMes.filter((p) => p.status === "Pendente").map((p) => p.alunaId)).size

  // Salários
  const pagamentosSalariosMes = pagamentosProfessoras.filter((p) => p.mesReferencia === mesAtual)
  const totalSalariosPrevistos = pagamentosSalariosMes.reduce((sum, p) => sum + p.valor, 0)
  const totalSalariosPagos = pagamentosSalariosMes
    .filter((p) => p.status === "Pago")
    .reduce((sum, p) => sum + p.valor, 0)
  const totalSalariosPendentes = totalSalariosPrevistos - totalSalariosPagos

  // Mensalidades por Polo
  const mensalidadesPorPolo = polos.map((polo) => {
    const turmasDoPolo = turmas.filter((t) => t.poloId === polo.id)
    const alunasDoPolo = alunas.filter((a) => turmasDoPolo.some((t) => t.id === a.turmaId))
    const pagamentosPolo = pagamentosMes.filter((p) => alunasDoPolo.some((a) => a.id === p.alunaId))
    const esperado = pagamentosPolo.reduce((sum, p) => sum + p.valor, 0)
    const recebido = pagamentosPolo.filter((p) => p.status === "Pago").reduce((sum, p) => sum + p.valor, 0)
    const pendente = esperado - recebido

    return { polo, esperado, recebido, pendente, alunas: alunasDoPolo.length }
  })

  return (
    <div className="min-h-screen bg-(--color-background-secondary)">
      <MobileHeader title="Financeiro" />

      <main className="px-4 pb-6 space-y-6">
        {/* Tabs */}
        <div className="pt-4 flex gap-2 bg-(--color-background-tertiary) p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("mensalidades")}
            className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-colors ${
              activeTab === "mensalidades"
                ? "bg-white text-(--color-foreground) shadow-sm"
                : "text-(--color-foreground-secondary) hover:text-(--color-foreground)"
            }`}
          >
            Mensalidades
          </button>
          <button
            onClick={() => setActiveTab("salarios")}
            className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-colors ${
              activeTab === "salarios"
                ? "bg-white text-(--color-foreground) shadow-sm"
                : "text-(--color-foreground-secondary) hover:text-(--color-foreground)"
            }`}
          >
            Salários
          </button>
        </div>

        {/* Aba Mensalidades */}
        {activeTab === "mensalidades" && (
          <div className="space-y-6">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-(--color-foreground)">Resumo - Março 2024</h2>

              <div className="grid gap-3">
                <StatCard
                  title="Total Esperado"
                  value={formatCurrency(totalEsperado)}
                  icon={TrendingUp}
                  iconColor="text-blue-600"
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
                      <p className="text-sm text-amber-700 mt-1">Total pendente: {formatCurrency(totalPendente)}</p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-(--color-foreground)">Mensalidades por Polo</h2>

              <div className="space-y-2">
                {mensalidadesPorPolo.map(({ polo, esperado, recebido, pendente, alunas }) => (
                  <div key={polo.id} className="bg-white rounded-lg p-4 border border-(--color-border)">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-(--color-foreground)">{polo.name}</h3>
                        <p className="text-sm text-(--color-foreground-secondary)">{alunas} alunas</p>
                      </div>
                      {pendente > 0 && (
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                          Pendências
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-(--color-background-secondary) rounded-lg p-2.5">
                        <p className="text-xs text-(--color-foreground-secondary) mb-0.5">Esperado</p>
                        <p className="font-semibold text-sm text-(--color-foreground)">{formatCurrency(esperado)}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-2.5">
                        <p className="text-xs text-green-700 mb-0.5">Recebido</p>
                        <p className="font-semibold text-sm text-green-700">{formatCurrency(recebido)}</p>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-2.5">
                        <p className="text-xs text-amber-700 mb-0.5">Pendente</p>
                        <p className="font-semibold text-sm text-amber-700">{formatCurrency(pendente)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Aba Salários */}
        {activeTab === "salarios" && (
          <div className="space-y-6">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-(--color-foreground)">Resumo - Março 2024</h2>

              <div className="grid gap-3">
                <StatCard
                  title="Total Previsto"
                  value={formatCurrency(totalSalariosPrevistos)}
                  icon={TrendingUp}
                  iconColor="text-blue-600"
                />
                <StatCard
                  title="Total Pago"
                  value={formatCurrency(totalSalariosPagos)}
                  icon={CheckCircle}
                  iconColor="text-(--color-success)"
                />
                <StatCard
                  title="Pendente"
                  value={formatCurrency(totalSalariosPendentes)}
                  icon={AlertCircle}
                  iconColor="text-(--color-warning)"
                />
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-(--color-foreground)">Salários das Professoras</h2>

              <div className="space-y-2">
                {professoras.map((prof) => {
                  const pagamento = pagamentosSalariosMes.find((p) => p.professoraId === prof.id)
                  const turmasDaProfessora = turmas.filter((t) => t.professoraIds.includes(prof.id))
                  const polosDaProfessora = new Set(
                    turmasDaProfessora.map((t) => polos.find((p) => p.id === t.poloId)?.name),
                  )

                  return (
                    <div key={prof.id} className="bg-white rounded-lg p-4 border border-(--color-border)">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-(--color-foreground)">{prof.nome}</h3>
                          <p className="text-sm text-(--color-foreground-secondary)">
                            {Array.from(polosDaProfessora).join(", ")}
                          </p>
                          <p className="text-xs text-(--color-foreground-muted) mt-1">
                            {turmasDaProfessora.length} turma{turmasDaProfessora.length > 1 ? "s" : ""}
                          </p>
                        </div>
                        {pagamento?.status === "Pago" ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Pago
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Pendente
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-(--color-foreground-secondary)">Valor</p>
                          <p className="text-lg font-bold text-(--color-foreground)">
                            {pagamento ? formatCurrency(pagamento.valor) : "-"}
                          </p>
                        </div>

                        {pagamento?.status === "Pendente" && (
                          <button
                            onClick={() => {
                              setSelectedProfessora(prof.id)
                              setIsPagamentoModalOpen(true)
                            }}
                            className="px-4 py-2 bg-(--color-primary) text-white text-sm font-semibold rounded-lg hover:bg-(--color-primary-hover) transition-colors"
                          >
                            Registrar Pagamento
                          </button>
                        )}

                        {pagamento?.status === "Pago" && pagamento.dataPagamento && (
                          <p className="text-xs text-(--color-foreground-secondary)">
                            Pago em {new Date(pagamento.dataPagamento).toLocaleDateString("pt-BR")}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Modal Registrar Pagamento */}
      <Modal
        isOpen={isPagamentoModalOpen}
        onClose={() => setIsPagamentoModalOpen(false)}
        title="Registrar Pagamento"
        size="sm"
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            setIsPagamentoModalOpen(false)
          }}
        >
          <div className="bg-(--color-background-secondary) rounded-lg p-4">
            <p className="text-sm text-(--color-foreground-secondary) mb-1">Professora</p>
            <p className="font-semibold text-(--color-foreground)">
              {professoras.find((p) => p.id === selectedProfessora)?.nome}
            </p>
            <p className="text-sm text-(--color-foreground-secondary) mt-2 mb-1">Valor</p>
            <p className="text-xl font-bold text-(--color-foreground)">
              {formatCurrency(pagamentosSalariosMes.find((p) => p.professoraId === selectedProfessora)?.valor || 0)}
            </p>
            <p className="text-sm text-(--color-foreground-secondary) mt-2">Referente a: Março 2024</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Data do Pagamento</label>
            <input
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Observações</label>
            <textarea
              rows={3}
              placeholder="Informações adicionais..."
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary) resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsPagamentoModalOpen(false)}
              className="flex-1 px-4 py-2.5 border border-(--color-border) rounded-lg font-semibold text-(--color-foreground) hover:bg-(--color-background-tertiary) transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-(--color-primary) text-white rounded-lg font-semibold hover:bg-(--color-primary-hover) transition-colors"
            >
              Confirmar Pagamento
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
