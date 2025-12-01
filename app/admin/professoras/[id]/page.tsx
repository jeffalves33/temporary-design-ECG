"use client"

import { useState } from "react"
import { MobileHeader } from "@/components/layout/mobile-header"
import { BackButton } from "@/components/ui/back-button"
import { Modal } from "@/components/ui/modal"
import { GraduationCap, Users, Phone, Mail, MapPin, CheckCircle, AlertCircle } from "lucide-react"
import { professoras, turmas, alunas, polos, locais, pagamentosProfessoras } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

export default async function ProfessoraDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const professora = professoras.find((p) => p.id === id)

  if (!professora) return <ProfessoraDetailClient professoraId={id} professora={null} />

  const turmasDaProfessora = turmas.filter((t) => t.professoraIds.includes(professora.id))
  const alunasDaProfessora = alunas.filter((a) => turmasDaProfessora.some((t) => t.id === a.turmaId))
  const polosDaProfessora = new Set(
    turmasDaProfessora.map((t) => {
      const polo = polos.find((p) => p.id === t.poloId)
      return polo?.name
    }),
  )

  const pagamentos = pagamentosProfessoras
    .filter((p) => p.professoraId === professora.id)
    .sort((a, b) => b.mesReferencia.localeCompare(a.mesReferencia))

  return (
    <ProfessoraDetailClient
      professoraId={id}
      professora={professora}
      turmasDaProfessora={turmasDaProfessora}
      alunasDaProfessora={alunasDaProfessora}
      polosDaProfessora={polosDaProfessora}
      pagamentos={pagamentos}
    />
  )
}

function ProfessoraDetailClient({
  professoraId,
  professora,
  turmasDaProfessora = [],
  alunasDaProfessora = [],
  polosDaProfessora = new Set(),
  pagamentos = [],
}: any) {
  const [isPagamentoModalOpen, setIsPagamentoModalOpen] = useState(false)

  if (!professora) return <div>Professora não encontrada</div>

  return (
    <div className="min-h-screen bg-(--color-background-secondary)">
      <MobileHeader title={professora.nome} />

      <main className="px-4 pb-6 space-y-6">
        <div className="pt-4">
          <BackButton />
        </div>

        {/* Info da professora */}
        <section className="pt-4 bg-white rounded-lg p-4 border border-(--color-border)">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-(--color-primary) to-(--color-primary-hover) flex items-center justify-center text-white text-xl font-semibold">
              {professora.nome.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-xl text-(--color-foreground) mb-1">{professora.nome}</h2>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-(--color-foreground-secondary)">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{professora.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-(--color-foreground-secondary)">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{professora.telefone}</span>
                </div>
                {polosDaProfessora.size > 0 && (
                  <div className="flex items-center gap-2 text-sm text-(--color-foreground-secondary)">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{Array.from(polosDaProfessora).join(", ")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-(--color-background-secondary) rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="w-4 h-4 text-(--color-foreground-secondary)" />
                <p className="text-xs text-(--color-foreground-secondary)">Turmas</p>
              </div>
              <p className="text-lg font-bold text-(--color-foreground)">{turmasDaProfessora.length}</p>
            </div>

            <div className="bg-(--color-background-secondary) rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-(--color-foreground-secondary)" />
                <p className="text-xs text-(--color-foreground-secondary)">Alunas</p>
              </div>
              <p className="text-lg font-bold text-(--color-foreground)">{alunasDaProfessora.length}</p>
            </div>
          </div>
        </section>

        {/* Turmas */}
        <section className="space-y-3">
          <h3 className="text-lg font-bold text-(--color-foreground)">Turmas</h3>

          <div className="space-y-2">
            {turmasDaProfessora.map((turma) => {
              const polo = polos.find((p) => p.id === turma.poloId)
              const local = locais.find((l) => l.id === turma.localId)
              const alunasDaTurma = alunas.filter((a) => a.turmaId === turma.id)

              return (
                <Link
                  key={turma.id}
                  href={`/admin/turmas/${turma.id}`}
                  className="block bg-white rounded-lg p-4 border border-(--color-border) hover:shadow-md transition-shadow"
                >
                  <h4 className="font-semibold text-(--color-foreground) mb-1">{turma.name}</h4>
                  <p className="text-sm text-(--color-foreground-secondary) mb-2">
                    {polo?.name} • {local?.name}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-(--color-foreground-secondary)">
                      <Users className="w-3.5 h-3.5" />
                      {alunasDaTurma.length} alunas
                    </span>
                    <span className="px-2 py-0.5 bg-(--color-primary-light) text-(--color-primary) text-xs font-medium rounded-full">
                      {turma.nivel}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Financeiro */}
        <section className="space-y-3">
          <h3 className="text-lg font-bold text-(--color-foreground)">Histórico de Pagamentos</h3>

          <div className="space-y-2">
            {pagamentos.map((pagamento) => {
              const [year, month] = pagamento.mesReferencia.split("-")
              const monthName = new Date(Number.parseInt(year), Number.parseInt(month) - 1).toLocaleDateString(
                "pt-BR",
                {
                  month: "long",
                  year: "numeric",
                },
              )

              return (
                <div key={pagamento.id} className="bg-white rounded-lg p-4 border border-(--color-border)">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-semibold text-(--color-foreground) capitalize">{monthName}</p>
                      {pagamento.dataPagamento && (
                        <p className="text-xs text-(--color-foreground-secondary) mt-1">
                          Pago em {new Date(pagamento.dataPagamento).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                    </div>
                    {pagamento.status === "Pago" ? (
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
                    <p className="text-lg font-bold text-(--color-foreground)">{formatCurrency(pagamento.valor)}</p>

                    {pagamento.status === "Pendente" && (
                      <button
                        onClick={() => setIsPagamentoModalOpen(true)}
                        className="px-3 py-1.5 bg-(--color-primary) text-white text-sm font-semibold rounded-lg hover:bg-(--color-primary-hover) transition-colors"
                      >
                        Registrar Pagamento
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
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
            <p className="font-semibold text-(--color-foreground)">{professora.nome}</p>
            <p className="text-sm text-(--color-foreground-secondary) mt-2 mb-1">Valor</p>
            <p className="text-xl font-bold text-(--color-foreground)">
              {formatCurrency(pagamentos.find((p) => p.status === "Pendente")?.valor || 0)}
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
