"use client"

import { useState } from "react"
import { MobileHeader } from "@/components/layout/mobile-header"
import { SearchInput } from "@/components/ui/search-input"
import { Modal } from "@/components/ui/modal"
import { Plus, GraduationCap, Users, DollarSign, Edit, Trash2, ChevronRight } from "lucide-react"
import { polos, locais, turmas, alunas, professoras } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import type { Turma } from "@/lib/types"

export default function TurmasPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredPolo, setFilteredPolo] = useState("")
  const [filteredLocal, setFilteredLocal] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null)
  const [selectedProfessoras, setSelectedProfessoras] = useState<string[]>([])

  // Filtrar turmas
  const filteredTurmas = turmas.filter((turma) => {
    const matchesSearch = turma.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPolo = !filteredPolo || turma.poloId === filteredPolo
    const matchesLocal = !filteredLocal || turma.localId === filteredLocal
    return matchesSearch && matchesPolo && matchesLocal
  })

  const locaisDisponiveis = filteredPolo ? locais.filter((l) => l.poloId === filteredPolo) : locais

  return (
    <div className="min-h-screen bg-(--color-background-secondary)">
      <MobileHeader title="Turmas" />

      <main className="px-4 pb-6 space-y-4">
        {/* Filtros */}
        <div className="pt-4 space-y-3">
          <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Buscar turma..." />

          <div>
            <label className="block text-xs font-medium text-(--color-foreground-secondary) mb-1.5 ml-1">
              Filtrar por Polo
            </label>
            <select
              value={filteredPolo}
              onChange={(e) => {
                setFilteredPolo(e.target.value)
                setFilteredLocal("")
              }}
              className="w-full px-4 py-2.5 bg-white border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary) text-sm"
            >
              <option value="">Todos os polos</option>
              {polos.map((polo) => (
                <option key={polo.id} value={polo.id}>
                  {polo.name} - {polo.city}
                </option>
              ))}
            </select>
          </div>

          {filteredPolo && (
            <div>
              <label className="block text-xs font-medium text-(--color-foreground-secondary) mb-1.5 ml-1">
                Filtrar por Local
              </label>
              <select
                value={filteredLocal}
                onChange={(e) => setFilteredLocal(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary) text-sm"
              >
                <option value="">Todos os locais</option>
                {locaisDisponiveis.map((local) => (
                  <option key={local.id} value={local.id}>
                    {local.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-(--color-primary) text-white rounded-lg font-semibold hover:bg-(--color-primary-hover) transition-colors"
          >
            <Plus className="w-5 h-5" />
            Adicionar Turma
          </button>
        </div>

        {/* Lista de turmas */}
        <section className="space-y-3">
          {filteredTurmas.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="w-12 h-12 mx-auto text-(--color-foreground-muted) mb-3" />
              <p className="text-(--color-foreground-secondary)">Nenhuma turma encontrada</p>
            </div>
          ) : (
            filteredTurmas.map((turma) => {
              const polo = polos.find((p) => p.id === turma.poloId)
              const local = locais.find((l) => l.id === turma.localId)
              const alunasDaTurma = alunas.filter((a) => a.turmaId === turma.id)
              const professora = professoras.find((p) => turma.professoraIds.includes(p.id))

              return (
                <div key={turma.id} className="bg-white rounded-lg border border-(--color-border) overflow-hidden">
                  <Link
                    href={`/admin/turmas/${turma.id}`}
                    className="block p-4 hover:bg-(--color-card-hover) transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-(--color-foreground) mb-1">{turma.name}</h3>
                        <p className="text-sm text-(--color-foreground-secondary)">
                          {polo?.name} • {local?.name}
                        </p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 text-xs font-medium rounded-full bg-(--color-primary-light) text-(--color-primary)">
                          {turma.nivel}
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-(--color-foreground-muted) flex-shrink-0" />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-(--color-background-secondary) rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <DollarSign className="w-3.5 h-3.5 text-(--color-foreground-secondary)" />
                          <p className="text-xs text-(--color-foreground-secondary)">Mensalidade</p>
                        </div>
                        <p className="font-semibold text-sm text-(--color-foreground)">
                          {formatCurrency(turma.mensalidade)}
                        </p>
                      </div>

                      <div className="bg-(--color-background-secondary) rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Users className="w-3.5 h-3.5 text-(--color-foreground-secondary)" />
                          <p className="text-xs text-(--color-foreground-secondary)">Alunas</p>
                        </div>
                        <p className="font-semibold text-sm text-(--color-foreground)">{alunasDaTurma.length}</p>
                      </div>

                      <div className="bg-(--color-background-secondary) rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <GraduationCap className="w-3.5 h-3.5 text-(--color-foreground-secondary)" />
                          <p className="text-xs text-(--color-foreground-secondary)">Professora</p>
                        </div>
                        <p className="font-semibold text-xs text-(--color-foreground) truncate">
                          {professora ? professora.nome.split(" ")[0] : "-"}
                        </p>
                      </div>
                    </div>
                  </Link>

                  <div className="flex border-t border-(--color-border)">
                    <button
                      onClick={() => {
                        setSelectedTurma(turma)
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
                        setSelectedTurma(turma)
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
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Adicionar Turma">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            setIsAddModalOpen(false)
          }}
        >
          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Polo</label>
            <select
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              required
            >
              <option value="">Selecione um polo</option>
              {polos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Local</label>
            <select
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              required
            >
              <option value="">Selecione um local</option>
              {locais.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Nome da Turma</label>
            <input
              type="text"
              placeholder="Ex: Iniciante 1"
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Nível</label>
            <select
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              required
            >
              <option value="">Selecione o nível</option>
              <option value="Iniciante 1">Iniciante 1</option>
              <option value="Iniciante 2">Iniciante 2</option>
              <option value="Intermediário">Intermediário</option>
              <option value="Avançado">Avançado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Valor da Mensalidade</label>
            <input
              type="number"
              placeholder="150.00"
              step="0.01"
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Idade Alvo</label>
            <input
              type="text"
              placeholder="Ex: 4-6 anos"
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Professora Responsável</label>
            <select className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)">
              <option value="">Selecione uma professora</option>
              {professoras.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">
              Professoras Responsáveis
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto border border-(--color-border) rounded-lg p-3">
              {professoras.map((prof) => (
                <label key={prof.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={prof.id}
                    checked={selectedProfessoras.includes(prof.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProfessoras([...selectedProfessoras, prof.id])
                      } else {
                        setSelectedProfessoras(selectedProfessoras.filter((id) => id !== prof.id))
                      }
                    }}
                    className="w-4 h-4 text-(--color-primary) border-gray-300 rounded focus:ring-(--color-primary)"
                  />
                  <span className="text-sm text-(--color-foreground)">{prof.nome}</span>
                </label>
              ))}
            </div>
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
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Turma">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            setIsEditModalOpen(false)
          }}
        >
          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Nome da Turma</label>
            <input
              type="text"
              defaultValue={selectedTurma?.name}
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Valor da Mensalidade</label>
            <input
              type="number"
              defaultValue={selectedTurma?.mensalidade}
              step="0.01"
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
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Excluir Turma" size="sm">
        <div className="space-y-4">
          <p className="text-(--color-foreground-secondary)">
            Tem certeza que deseja excluir a turma <strong>{selectedTurma?.name}</strong>?
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
