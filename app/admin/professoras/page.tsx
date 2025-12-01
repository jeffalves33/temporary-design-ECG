"use client"

import { useState } from "react"
import { MobileHeader } from "@/components/layout/mobile-header"
import { SearchInput } from "@/components/ui/search-input"
import { Modal } from "@/components/ui/modal"
import { Plus, GraduationCap, Users, Edit, Trash2, ChevronRight, CheckCircle, AlertCircle } from "lucide-react"
import { professoras, turmas, alunas, pagamentosProfessoras, polos } from "@/lib/mock-data"
import Link from "next/link"
import type { Professora } from "@/lib/types"

export default function ProfessorasPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("nome")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedProfessora, setSelectedProfessora] = useState<Professora | null>(null)

  const [salarioMensal, setSalarioMensal] = useState("")

  const getSalarioStatus = (professoraId: string) => {
    const pagamento = pagamentosProfessoras.find(
      (p) => p.professoraId === professoraId && p.mesReferencia === "2024-03",
    )
    return pagamento?.status === "Pago"
  }

  let filteredProfessoras = professoras.filter(
    (prof) =>
      prof.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prof.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  filteredProfessoras = [...filteredProfessoras].sort((a, b) => {
    if (sortBy === "nome") return a.nome.localeCompare(b.nome)
    if (sortBy === "turmas") {
      const turmasA = turmas.filter((t) => t.professoraIds.includes(a.id)).length
      const turmasB = turmas.filter((t) => t.professoraIds.includes(b.id)).length
      return turmasB - turmasA
    }
    return 0
  })

  return (
    <div className="min-h-screen bg-(--color-background-secondary)">
      <MobileHeader title="Professoras" />

      <main className="px-4 pb-6 space-y-4">
        <div className="pt-4 space-y-3">
          <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Buscar professora..." />

          <div>
            <label className="block text-xs font-medium text-(--color-foreground-secondary) mb-1.5 ml-1">
              Ordenar por
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary) text-sm"
            >
              <option value="nome">Nome (A-Z)</option>
              <option value="turmas">Número de Turmas</option>
            </select>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-(--color-primary) text-white rounded-lg font-semibold hover:bg-(--color-primary-hover) transition-colors"
          >
            <Plus className="w-5 h-5" />
            Adicionar Professora
          </button>
        </div>

        <section className="space-y-3">
          {filteredProfessoras.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="w-12 h-12 mx-auto text-(--color-foreground-muted) mb-3" />
              <p className="text-(--color-foreground-secondary)">Nenhuma professora encontrada</p>
            </div>
          ) : (
            filteredProfessoras.map((prof) => {
              const turmasDaProfessora = turmas.filter((t) => t.professoraIds.includes(prof.id))
              const alunasDaProfessora = alunas.filter((a) => turmasDaProfessora.some((t) => t.id === a.turmaId))
              const poloDaProfessora = new Set(
                turmasDaProfessora.map((t) => polos.find((p) => p.id === t.poloId)?.name),
              )
              const salarioPago = getSalarioStatus(prof.id)

              return (
                <div key={prof.id} className="bg-white rounded-lg border border-(--color-border) overflow-hidden">
                  <Link
                    href={`/admin/professoras/${prof.id}`}
                    className="block p-4 hover:bg-(--color-card-hover) transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-(--color-foreground) mb-1">{prof.nome}</h3>
                        <p className="text-sm text-(--color-foreground-secondary)">{prof.email}</p>
                        <p className="text-sm text-(--color-foreground-secondary)">{prof.telefone}</p>
                        {poloDaProfessora.size > 0 && (
                          <p className="text-xs text-(--color-foreground-muted) mt-1">
                            {Array.from(poloDaProfessora).join(", ")}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {salarioPago ? (
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
                        <ChevronRight className="w-5 h-5 text-(--color-foreground-muted)" />
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                          <GraduationCap className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-(--color-foreground-secondary)">Turmas</p>
                          <p className="font-semibold text-(--color-foreground)">{turmasDaProfessora.length}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-(--color-primary-light) flex items-center justify-center">
                          <Users className="w-4 h-4 text-(--color-primary)" />
                        </div>
                        <div>
                          <p className="text-xs text-(--color-foreground-secondary)">Alunas</p>
                          <p className="font-semibold text-(--color-foreground)">{alunasDaProfessora.length}</p>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="flex border-t border-(--color-border)">
                    <button
                      onClick={() => {
                        setSelectedProfessora(prof)
                        setIsEditModalOpen(true)
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-(--color-foreground-secondary) hover:bg-(--color-background-tertiary) transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="text-sm font-medium">Editar</span>
                    </button>
                    <div className="w-px bg-(--color-border)" />
                    <button
                      onClick={() => {
                        setSelectedProfessora(prof)
                        setIsDeleteModalOpen(true)
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-(--color-error) hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Excluir</span>
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </section>
      </main>

      {/* Modal Adicionar */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Adicionar Professora">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            setIsAddModalOpen(false)
          }}
        >
          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Nome Completo</label>
            <input
              type="text"
              placeholder="Ex: Mariana Silva"
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">E-mail</label>
            <input
              type="email"
              placeholder="mariana@ginastica.com"
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Telefone</label>
            <input
              type="tel"
              placeholder="(27) 99999-9999"
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Turmas</label>
            <p className="text-xs text-(--color-foreground-secondary) mb-2">
              Selecione as turmas que esta professora irá ministrar
            </p>
            <div className="max-h-48 overflow-y-auto border border-(--color-border) rounded-lg p-3 space-y-2">
              {turmas.map((t) => (
                <label key={t.id} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" value={t.id} className="w-4 h-4 text-(--color-primary) rounded" />
                  <span className="text-sm">
                    {t.name} - {polos.find((p) => p.id === t.poloId)?.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Salário Mensal</label>
            <input
              type="number"
              placeholder="1500.00"
              step="0.01"
              value={salarioMensal}
              onChange={(e) => setSalarioMensal(e.target.value)}
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="flex-1 px-4 py-2.5 border border-(--color-border) rounded-lg font-semibold text-(--color-foreground) hover:bg-(--color-background-tertiary) transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-(--color-primary) text-white rounded-lg font-semibold hover:bg-(--color-primary-hover) transition-colors"
            >
              Salvar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Professora">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            setIsEditModalOpen(false)
          }}
        >
          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Nome Completo</label>
            <input
              type="text"
              defaultValue={selectedProfessora?.nome}
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Telefone</label>
            <input
              type="tel"
              defaultValue={selectedProfessora?.telefone}
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Salário Mensal</label>
            <input
              type="number"
              placeholder="1500.00"
              step="0.01"
              defaultValue={selectedProfessora?.salarioMensal || ""}
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1 px-4 py-2.5 border border-(--color-border) rounded-lg font-semibold text-(--color-foreground) hover:bg-(--color-background-tertiary) transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-(--color-primary) text-white rounded-lg font-semibold hover:bg-(--color-primary-hover) transition-colors"
            >
              Salvar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Excluir */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Excluir Professora"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-(--color-foreground-secondary)">
            Tem certeza que deseja excluir a professora <strong>{selectedProfessora?.nome}</strong>?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 px-4 py-2.5 border border-(--color-border) rounded-lg font-semibold text-(--color-foreground) hover:bg-(--color-background-tertiary) transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 px-4 py-2.5 bg-(--color-error) text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
            >
              Excluir
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
