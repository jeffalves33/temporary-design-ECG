"use client"

import { useState } from "react"
import { MobileHeader } from "@/components/layout/mobile-header"
import { SearchInput } from "@/components/ui/search-input"
import { Users, AlertCircle, CheckCircle, MessageCircle, ChevronRight } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { turmas, alunas, pagamentosAlunas, polos } from "@/lib/mock-data"
import { calculateAge, formatCurrency } from "@/lib/utils"
import Link from "next/link"

export default function ProfessoraAlunasPage() {
  const professoraId = "1"

  const [searchQuery, setSearchQuery] = useState("")
  const [filteredTurma, setFilteredTurma] = useState("")
  const [filteredStatus, setFilteredStatus] = useState("")
  const [isCobrarModalOpen, setIsCobrarModalOpen] = useState(false)
  const [selectedAluna, setSelectedAluna] = useState<any>(null)

  const minhasTurmas = turmas.filter((t) => t.professoraIds.includes(professoraId))
  const minhasAlunas = alunas.filter((a) => minhasTurmas.some((t) => t.id === a.turmaId))

  const getPendencias = (alunaId: string) => {
    const pendentes = pagamentosAlunas.filter((p) => p.alunaId === alunaId && p.status === "Pendente")
    return pendentes.length
  }

  const filteredAlunas = minhasAlunas.filter((aluna) => {
    const matchesSearch = aluna.nome.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTurma = !filteredTurma || aluna.turmaId === filteredTurma
    const pendencias = getPendencias(aluna.id)
    const matchesStatus =
      !filteredStatus ||
      (filteredStatus === "emdia" && pendencias === 0) ||
      (filteredStatus === "pendente" && pendencias > 0)

    return matchesSearch && matchesTurma && matchesStatus
  })

  return (
    <div className="min-h-screen bg-(--color-background-secondary)">
      <MobileHeader title="Minhas Alunas" />

      <main className="px-4 pb-6 space-y-4">
        <div className="pt-4 space-y-3">
          <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Buscar aluna..." />

          <div>
            <label className="block text-xs font-medium text-(--color-foreground-secondary) mb-1.5 ml-1">
              Filtrar por Turma
            </label>
            <select
              value={filteredTurma}
              onChange={(e) => setFilteredTurma(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary) text-sm"
            >
              <option value="">Todas as turmas</option>
              {minhasTurmas.map((turma) => (
                <option key={turma.id} value={turma.id}>
                  {turma.name} - {turma.nivel}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-(--color-foreground-secondary) mb-1.5 ml-1">
              Status Financeiro
            </label>
            <select
              value={filteredStatus}
              onChange={(e) => setFilteredStatus(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary) text-sm"
            >
              <option value="">Todos</option>
              <option value="emdia">Em dia</option>
              <option value="pendente">Com pendência</option>
            </select>
          </div>
        </div>

        <section className="space-y-2">
          {filteredAlunas.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-(--color-foreground-muted) mb-3" />
              <p className="text-(--color-foreground-secondary)">Nenhuma aluna encontrada</p>
            </div>
          ) : (
            filteredAlunas.map((aluna) => {
              const turma = turmas.find((t) => t.id === aluna.turmaId)
              const polo = polos.find((p) => p.id === turma?.poloId)
              const pendencias = getPendencias(aluna.id)
              const idade = calculateAge(aluna.dataNascimento)

              return (
                <div key={aluna.id} className="bg-white rounded-lg border border-(--color-border) overflow-hidden">
                  <Link
                    href={`/professora/alunas/${aluna.id}`}
                    className="block p-3 hover:bg-(--color-card-hover) transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-(--color-foreground) truncate">{aluna.nome}</h3>
                        <p className="text-xs text-(--color-foreground-secondary) truncate">
                          {idade} anos • {turma?.name} • {polo?.name}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {pendencias > 0 ? (
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full flex items-center gap-1 whitespace-nowrap">
                            <AlertCircle className="w-3 h-3" />
                            {pendencias}m
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                          </span>
                        )}
                        <ChevronRight className="w-5 h-5 text-(--color-foreground-muted)" />
                      </div>
                    </div>
                  </Link>

                  {pendencias > 0 && (
                    <div className="border-t border-(--color-border)">
                      <button
                        onClick={() => {
                          setSelectedAluna(aluna)
                          setIsCobrarModalOpen(true)
                        }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-green-700 hover:bg-green-50 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">Cobrar pelo WhatsApp</span>
                      </button>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </section>
      </main>

      <Modal isOpen={isCobrarModalOpen} onClose={() => setIsCobrarModalOpen(false)} title="Cobrar pelo WhatsApp">
        <div className="space-y-4">
          <div className="bg-(--color-background-secondary) rounded-lg p-4">
            <p className="text-sm text-(--color-foreground-secondary) mb-1">Aluna</p>
            <p className="font-semibold text-(--color-foreground)">{selectedAluna?.nome}</p>

            <p className="text-sm text-(--color-foreground-secondary) mt-3 mb-1">Responsável</p>
            <p className="font-medium text-(--color-foreground)">{selectedAluna?.responsavel.nome}</p>
            <p className="text-sm text-(--color-foreground-secondary)">{selectedAluna?.responsavel.whatsapp}</p>

            <p className="text-sm text-(--color-foreground-secondary) mt-3 mb-1">Meses Pendentes</p>
            <p className="text-xl font-bold text-amber-600">
              {getPendencias(selectedAluna?.id || "")} mês{getPendencias(selectedAluna?.id || "") > 1 ? "es" : ""}
            </p>

            <p className="text-sm text-(--color-foreground-secondary) mt-3 mb-1">Valor Total</p>
            <p className="text-2xl font-bold text-(--color-foreground)">
              {formatCurrency(
                pagamentosAlunas
                  .filter((p) => p.alunaId === selectedAluna?.id && p.status === "Pendente")
                  .reduce((sum, p) => sum + p.valor, 0),
              )}
            </p>
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
              Enviar (Em breve)
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
