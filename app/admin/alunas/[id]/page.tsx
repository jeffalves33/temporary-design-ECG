"use client"

import { useState } from "react"
import { MobileHeader } from "@/components/layout/mobile-header"
import { Modal } from "@/components/ui/modal"
import { BackButton } from "@/components/ui/back-button"
import { Users, Phone, Mail, Calendar, AlertCircle, CheckCircle, MessageCircle } from "lucide-react"
import { alunas, turmas, polos, locais, pagamentosAlunas } from "@/lib/mock-data"
import { formatCurrency, calculateAge, formatDate } from "@/lib/utils"

export default async function AlunaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const aluna = alunas.find((a) => a.id === id)

  if (!aluna) return <AlunaDetailClient alunaId={id} aluna={null} />

  const turma = turmas.find((t) => t.id === aluna.turmaId)
  const polo = polos.find((p) => p.id === turma?.poloId)
  const local = locais.find((l) => l.id === turma?.localId)
  const idade = calculateAge(aluna.dataNascimento)

  const pagamentos = pagamentosAlunas
    .filter((p) => p.alunaId === aluna.id)
    .sort((a, b) => b.mesReferencia.localeCompare(a.mesReferencia))
  const pendentes = pagamentos.filter((p) => p.status === "Pendente")
  const valorPendente = pendentes.reduce((sum, p) => sum + p.valor, 0)

  return (
    <AlunaDetailClient
      alunaId={id}
      aluna={aluna}
      turma={turma}
      polo={polo}
      local={local}
      idade={idade}
      pagamentos={pagamentos}
      pendentes={pendentes}
      valorPendente={valorPendente}
    />
  )
}

function AlunaDetailClient({
  alunaId,
  aluna,
  turma,
  polo,
  local,
  idade,
  pagamentos = [],
  pendentes = [],
  valorPendente = 0,
}: any) {
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isCobrarModalOpen, setIsCobrarModalOpen] = useState(false)

  if (!aluna) return <div>Aluna não encontrada</div>

  return (
    <div className="min-h-screen bg-(--color-background-secondary)">
      <MobileHeader title={aluna.nome} />

      <main className="px-4 pb-6 space-y-6">
        <div className="pt-4">
          <BackButton />
        </div>

        {/* Info da aluna */}
        <section className="pt-4 bg-white rounded-lg p-4 border border-(--color-border)">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-(--color-primary) to-(--color-primary-hover) flex items-center justify-center text-white text-xl font-semibold">
              {aluna.nome.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-xl text-(--color-foreground) mb-1">{aluna.nome}</h2>
              <p className="text-sm text-(--color-foreground-secondary)">{idade} anos</p>
              <span
                className={`inline-block mt-1.5 px-2 py-0.5 text-xs font-medium rounded-full ${
                  aluna.status === "Ativa" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                }`}
              >
                {aluna.status}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-(--color-foreground-secondary)" />
              <span className="text-(--color-foreground-secondary)">Nascimento:</span>
              <span className="font-medium text-(--color-foreground)">{formatDate(aluna.dataNascimento)}</span>
            </div>
          </div>
        </section>

        {/* Turma atual */}
        <section className="bg-white rounded-lg p-4 border border-(--color-border)">
          <h3 className="text-lg font-bold text-(--color-foreground) mb-3">Turma Atual</h3>

          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-semibold text-(--color-foreground)">{turma?.name}</p>
              <p className="text-sm text-(--color-foreground-secondary)">
                {polo?.name} • {local?.name}
              </p>
              <span className="inline-block mt-1.5 px-2 py-0.5 text-xs font-medium rounded-full bg-(--color-primary-light) text-(--color-primary)">
                {turma?.nivel}
              </span>
            </div>
            <div className="text-right">
              <p className="text-xs text-(--color-foreground-secondary)">Mensalidade</p>
              <p className="font-bold text-(--color-foreground)">{formatCurrency(turma?.mensalidade || 0)}</p>
            </div>
          </div>

          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="w-full px-4 py-2 border border-(--color-primary) text-(--color-primary) rounded-lg text-sm font-semibold hover:bg-(--color-primary-light) transition-colors"
          >
            Transferir de Turma
          </button>
        </section>

        {/* Responsável */}
        <section className="bg-white rounded-lg p-4 border border-(--color-border)">
          <h3 className="text-lg font-bold text-(--color-foreground) mb-3">Responsável</h3>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-(--color-foreground-secondary)" />
              <span className="font-medium text-(--color-foreground)">{aluna.responsavel.nome}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-(--color-foreground-secondary)" />
              <span className="text-(--color-foreground)">{aluna.responsavel.whatsapp}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-(--color-foreground-secondary)" />
              <span className="text-(--color-foreground)">{aluna.responsavel.email}</span>
            </div>
          </div>
        </section>

        {/* Status financeiro */}
        <section className="space-y-3">
          <h3 className="text-lg font-bold text-(--color-foreground)">Histórico de Pagamentos</h3>

          {pendentes.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-900">
                    {pendentes.length} mês{pendentes.length > 1 ? "es" : ""} pendente{pendentes.length > 1 ? "s" : ""}
                  </p>
                  <p className="text-sm text-amber-700 mt-1">Total: {formatCurrency(valorPendente)}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="flex-1 px-4 py-2 bg-(--color-primary) text-white rounded-lg text-sm font-semibold hover:bg-(--color-primary-hover) transition-colors"
                >
                  Registrar Pagamento
                </button>
                <button
                  onClick={() => setIsCobrarModalOpen(true)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  Cobrar
                </button>
              </div>
            </div>
          )}

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
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-(--color-foreground) capitalize">{monthName}</p>
                      {pagamento.dataPagamento && (
                        <p className="text-xs text-(--color-foreground-secondary) mt-1">
                          Pago em {formatDate(pagamento.dataPagamento)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-(--color-foreground)">{formatCurrency(pagamento.valor)}</p>
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
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </main>

      {/* Modal Transferir */}
      <Modal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} title="Transferir Aluna">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            setIsTransferModalOpen(false)
          }}
        >
          <p className="text-(--color-foreground-secondary)">
            Transferir <strong>{aluna.nome}</strong> para:
          </p>
          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Nova Turma</label>
            <select
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              required
            >
              <option value="">Selecione uma turma</option>
              {turmas
                .filter((t) => t.id !== aluna.turmaId)
                .map((t) => {
                  const p = polos.find((po) => po.id === t.poloId)
                  return (
                    <option key={t.id} value={t.id}>
                      {t.name} - {p?.name}
                    </option>
                  )
                })}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsTransferModalOpen(false)}
              className="flex-1 px-4 py-2.5 border border-(--color-border) rounded-lg font-semibold text-(--color-foreground) hover:bg-(--color-background-tertiary) transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-(--color-primary) text-white rounded-lg font-semibold hover:bg-(--color-primary-hover) transition-colors"
            >
              Transferir
            </button>
          </div>
        </form>
      </Modal>

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
            <p className="font-semibold text-(--color-foreground)">{aluna.nome}</p>
            <p className="text-sm text-(--color-foreground-secondary) mt-3 mb-1">Valor da Mensalidade</p>
            <p className="text-xl font-bold text-(--color-foreground)">{formatCurrency(turma?.mensalidade || 0)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Mês de Referência</label>
            <select
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              required
            >
              <option value="">Selecione o mês</option>
              {pendentes.map((p) => {
                const [year, month] = p.mesReferencia.split("-")
                const monthName = new Date(Number.parseInt(year), Number.parseInt(month) - 1).toLocaleDateString(
                  "pt-BR",
                  {
                    month: "long",
                    year: "numeric",
                  },
                )
                return (
                  <option key={p.id} value={p.mesReferencia} className="capitalize">
                    {monthName}
                  </option>
                )
              })}
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
              Confirmar Pagamento
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isCobrarModalOpen} onClose={() => setIsCobrarModalOpen(false)} title="Cobrar pelo WhatsApp">
        <div className="space-y-4">
          <div className="bg-(--color-background-secondary) rounded-lg p-4">
            <p className="text-sm text-(--color-foreground-secondary) mb-1">Aluna</p>
            <p className="font-semibold text-(--color-foreground)">{aluna.nome}</p>

            <p className="text-sm text-(--color-foreground-secondary) mt-3 mb-1">Responsável</p>
            <p className="font-medium text-(--color-foreground)">{aluna.responsavel.nome}</p>
            <p className="text-sm text-(--color-foreground-secondary)">{aluna.responsavel.whatsapp}</p>

            <p className="text-sm text-(--color-foreground-secondary) mt-3 mb-1">Meses Pendentes</p>
            <p className="text-xl font-bold text-amber-600">
              {pendentes.length} mês{pendentes.length > 1 ? "es" : ""}
            </p>

            <p className="text-sm text-(--color-foreground-secondary) mt-3 mb-1">Valor Total</p>
            <p className="text-2xl font-bold text-(--color-foreground)">{formatCurrency(valorPendente)}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Em breve:</strong> Botão para enviar mensagem automática no WhatsApp e gerar link de pagamento via
              Stripe.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsCobrarModalOpen(false)}
              className="flex-1 px-4 py-2.5 border border-(--color-border) rounded-lg font-semibold text-(--color-foreground) hover:bg-(--color-background-tertiary) transition-colors"
            >
              Fechar
            </button>
            <button
              disabled
              className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-semibold opacity-50 cursor-not-allowed flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Enviar Cobrança (Em breve)
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
