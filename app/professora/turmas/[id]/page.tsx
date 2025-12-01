"use client"

import { useState } from "react"
import { MobileHeader } from "@/components/layout/mobile-header"
import { Modal } from "@/components/ui/modal"
import { GraduationCap, Users, DollarSign, Clock, AlertCircle, CheckCircle, MessageSquare } from "lucide-react"
import { turmas, polos, locais, alunas, horarios, pagamentosAlunas } from "@/lib/mock-data"
import { formatCurrency, calculateAge } from "@/lib/utils"

export default async function ProfessoraTurmaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const turma = turmas.find((t) => t.id === id)

  if (!turma) return <TurmaDetailClient turmaId={id} turma={null} />

  const polo = polos.find((p) => p.id === turma.poloId)
  const local = locais.find((l) => l.id === turma.localId)
  const horariosDaTurma = horarios.filter((h) => h.turmaId === turma.id)
  const alunasDaTurma = alunas.filter((a) => a.turmaId === turma.id)

  return (
    <TurmaDetailClient
      turmaId={id}
      turma={turma}
      polo={polo}
      local={local}
      horariosDaTurma={horariosDaTurma}
      alunasDaTurma={alunasDaTurma}
    />
  )
}

function TurmaDetailClient({ turmaId, turma, polo, local, horariosDaTurma = [], alunasDaTurma = [] }: any) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isCobrancaModalOpen, setIsCobrancaModalOpen] = useState(false)
  const [selectedAluna, setSelectedAluna] = useState<any>(null)

  if (!turma) return <div>Turma não encontrada</div>

  const mesAtual = "2024-03"
  const getPendencias = (alunaId: string) => {
    const pagamentos = pagamentosAlunas.filter((p) => p.alunaId === alunaId && p.status === "Pendente")
    return pagamentos
  }

  const getValorPendente = (alunaId: string) => {
    const pendencias = getPendencias(alunaId)
    return pendencias.reduce((sum, p) => sum + p.valor, 0)
  }

  return (
    <div className="min-h-screen bg-(--color-background-secondary)">
      <MobileHeader title={turma.name} />

      <main className="px-4 pb-6 space-y-6">
        {/* Info da turma */}
        <section className="pt-4 bg-white rounded-lg p-4 border border-(--color-border)">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-(--color-primary-light) flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-(--color-primary)" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-xl text-(--color-foreground) mb-1">{turma.name}</h2>
              <p className="text-sm text-(--color-foreground-secondary)">
                {polo?.name} • {local?.name}
              </p>
              <span className="inline-block mt-1.5 px-2 py-0.5 text-xs font-medium rounded-full bg-(--color-primary-light) text-(--color-primary)">
                {turma.nivel}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-(--color-background-secondary) rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-(--color-foreground-secondary)" />
                <p className="text-xs text-(--color-foreground-secondary)">Mensalidade</p>
              </div>
              <p className="text-lg font-bold text-(--color-foreground)">{formatCurrency(turma.mensalidade)}</p>
            </div>

            <div className="bg-(--color-background-secondary) rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-(--color-foreground-secondary)" />
                <p className="text-xs text-(--color-foreground-secondary)">Alunas</p>
              </div>
              <p className="text-lg font-bold text-(--color-foreground)">{alunasDaTurma.length}</p>
            </div>
          </div>
        </section>

        {/* Horários */}
        <section className="space-y-3">
          <h3 className="text-lg font-bold text-(--color-foreground)">Horários</h3>

          {horariosDaTurma.length === 0 ? (
            <div className="bg-white rounded-lg p-6 text-center border border-(--color-border)">
              <Clock className="w-10 h-10 mx-auto text-(--color-foreground-muted) mb-2" />
              <p className="text-(--color-foreground-secondary)">Nenhum horário cadastrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {horariosDaTurma.map((horario) => (
                <div key={horario.id} className="bg-white rounded-lg p-3 border border-(--color-border)">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <p className="font-semibold text-sm text-(--color-foreground)">{horario.diaSemana}</p>
                  </div>
                  <p className="text-xs text-(--color-foreground-secondary)">
                    {horario.horaInicio} - {horario.horaFim}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Alunas */}
        <section className="space-y-3">
          <h3 className="text-lg font-bold text-(--color-foreground)">Alunas da Turma</h3>

          {alunasDaTurma.length === 0 ? (
            <div className="bg-white rounded-lg p-6 text-center border border-(--color-border)">
              <Users className="w-10 h-10 mx-auto text-(--color-foreground-muted) mb-2" />
              <p className="text-(--color-foreground-secondary)">Nenhuma aluna matriculada</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alunasDaTurma.map((aluna) => {
                const pendencias = getPendencias(aluna.id)
                const valorPendente = getValorPendente(aluna.id)
                const idade = calculateAge(aluna.dataNascimento)

                return (
                  <div key={aluna.id} className="bg-white rounded-lg p-4 border border-(--color-border)">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-(--color-foreground)">{aluna.nome}</h4>
                        <p className="text-sm text-(--color-foreground-secondary)">{idade} anos</p>
                        <p className="text-xs text-(--color-foreground-muted) mt-1">
                          Responsável: {aluna.responsavel.nome}
                        </p>
                      </div>
                      {pendencias.length > 0 ? (
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {pendencias.length} mês{pendencias.length > 1 ? "es" : ""}
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Em dia
                        </span>
                      )}
                    </div>

                    {pendencias.length > 0 && (
                      <div className="bg-amber-50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-amber-900 font-medium">Pendente: {formatCurrency(valorPendente)}</p>
                        <p className="text-xs text-amber-700 mt-1">
                          {pendencias
                            .map((p) => {
                              const [year, month] = p.mesReferencia.split("-")
                              const monthName = new Date(
                                Number.parseInt(year),
                                Number.parseInt(month) - 1,
                              ).toLocaleDateString("pt-BR", { month: "short" })
                              return monthName
                            })
                            .join(", ")}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      {pendencias.length > 0 ? (
                        <>
                          <button
                            onClick={() => {
                              setSelectedAluna({ ...aluna, pendencias, valorPendente })
                              setIsPaymentModalOpen(true)
                            }}
                            className="px-3 py-2 bg-(--color-primary) text-white rounded-lg text-sm font-medium hover:bg-(--color-primary-hover) transition-colors"
                          >
                            Registrar Pag.
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAluna({ ...aluna, pendencias, valorPendente })
                              setIsCobrancaModalOpen(true)
                            }}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Cobrar
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedAluna({ ...aluna, pendencias, valorPendente })
                            setIsPaymentModalOpen(true)
                          }}
                          className="col-span-2 px-3 py-2 border border-(--color-border) text-(--color-foreground) rounded-lg text-sm font-medium hover:bg-(--color-background-tertiary) transition-colors"
                        >
                          Registrar Pagamento
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>

      {/* Modal Registrar Pagamento */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Registrar Pagamento">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            setIsPaymentModalOpen(false)
          }}
        >
          <div className="bg-(--color-background-secondary) rounded-lg p-4">
            <p className="text-sm text-(--color-foreground-secondary) mb-1">Aluna</p>
            <p className="font-semibold text-(--color-foreground)">{selectedAluna?.nome}</p>

            <p className="text-sm text-(--color-foreground-secondary) mt-3 mb-1">Turma</p>
            <p className="font-semibold text-(--color-foreground)">{turma.name}</p>

            <p className="text-sm text-(--color-foreground-secondary) mt-3 mb-1">Valor da Mensalidade</p>
            <p className="text-xl font-bold text-(--color-foreground)">{formatCurrency(turma.mensalidade)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Mês de Referência</label>
            <select
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              required
            >
              <option value="2024-03">Março 2024</option>
              <option value="2024-02">Fevereiro 2024</option>
              <option value="2024-01">Janeiro 2024</option>
            </select>
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
              onClick={() => setIsPaymentModalOpen(false)}
              className="flex-1 px-4 py-2.5 border border-(--color-border) rounded-lg font-semibold text-(--color-foreground) hover:bg-(--color-background-tertiary) transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-(--color-primary) text-white rounded-lg font-semibold hover:bg-(--color-primary-hover) transition-colors"
            >
              Confirmar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Cobrar/Lembrar */}
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
              className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-semibold opacity-50 cursor-not-allowed flex items-center justify-center gap-2"
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
