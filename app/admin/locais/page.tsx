"use client"

import { useState } from "react"
import { MobileHeader } from "@/components/layout/mobile-header"
import { SearchInput } from "@/components/ui/search-input"
import { Modal } from "@/components/ui/modal"
import { Plus, Building2, GraduationCap, Users, Edit, Trash2, ChevronRight, User } from "lucide-react"
import { polos, locais, turmas, alunas, professoras } from "@/lib/mock-data"
import Link from "next/link"
import type { Local } from "@/lib/types"

export default function LocaisPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredPolo, setFilteredPolo] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedLocal, setSelectedLocal] = useState<Local | null>(null)

  // Filtrar locais
  const filteredLocais = locais.filter((local) => {
    const matchesSearch = local.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPolo = !filteredPolo || local.poloId === filteredPolo
    return matchesSearch && matchesPolo
  })

  const poloOptions = [
    { value: "", label: "Todos" },
    ...polos.map((p) => ({ value: p.id, label: `${p.name} - ${p.city}` })),
  ]

  return (
    <div className="min-h-screen bg-(--color-background-secondary)">
      <MobileHeader title="Locais" />

      <main className="px-4 pb-6 space-y-4">
        {/* Filtros */}
        <div className="pt-4 space-y-3">
          <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Buscar local..." />

          <div>
            <label className="block text-xs font-medium text-(--color-foreground-secondary) mb-1.5 ml-1">
              Filtrar por Polo
            </label>
            <select
              value={filteredPolo}
              onChange={(e) => setFilteredPolo(e.target.value)}
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

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-(--color-primary) text-white rounded-lg font-semibold hover:bg-(--color-primary-hover) transition-colors"
          >
            <Plus className="w-5 h-5" />
            Adicionar Local
          </button>
        </div>

        {/* Lista de locais */}
        <section className="space-y-3">
          {filteredLocais.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 mx-auto text-(--color-foreground-muted) mb-3" />
              <p className="text-(--color-foreground-secondary)">Nenhum local encontrado</p>
            </div>
          ) : (
            filteredLocais.map((local) => {
              const polo = polos.find((p) => p.id === local.poloId)
              const turmasDoLocal = turmas.filter((t) => t.localId === local.id)
              const alunasDoLocal = alunas.filter((a) => turmasDoLocal.some((t) => t.id === a.turmaId))

              const professorasDoLocal = professoras.filter((p) =>
                turmasDoLocal.some((t) => t.professoraIds.includes(p.id)),
              )

              return (
                <div key={local.id} className="bg-white rounded-lg border border-(--color-border) overflow-hidden">
                  <Link
                    href={`/admin/locais/${local.id}`}
                    className="block p-4 hover:bg-(--color-card-hover) transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-(--color-foreground) mb-1">{local.name}</h3>
                        <p className="text-sm text-(--color-foreground-secondary)">
                          {polo?.name} • {polo?.city}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-(--color-foreground-muted) flex-shrink-0" />
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                          <GraduationCap className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-(--color-foreground-secondary)">Turmas</p>
                          <p className="font-semibold text-(--color-foreground)">{turmasDoLocal.length}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-(--color-primary-light) flex items-center justify-center">
                          <Users className="w-4 h-4 text-(--color-primary)" />
                        </div>
                        <div>
                          <p className="text-xs text-(--color-foreground-secondary)">Alunas</p>
                          <p className="font-semibold text-(--color-foreground)">{alunasDoLocal.length}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-(--color-foreground-secondary)">Profes.</p>
                          <p className="font-semibold text-(--color-foreground)">{professorasDoLocal.length}</p>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="flex border-t border-(--color-border)">
                    <button
                      onClick={() => {
                        setSelectedLocal(local)
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
                        setSelectedLocal(local)
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
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Adicionar Local">
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
              {polos.map((polo) => (
                <option key={polo.id} value={polo.id}>
                  {polo.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Nome do Local</label>
            <input
              type="text"
              placeholder="Ex: Escola Elesmão"
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Endereço</label>
            <input
              type="text"
              placeholder="Rua, número, bairro"
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
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
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Local">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            setIsEditModalOpen(false)
          }}
        >
          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Polo</label>
            <select
              defaultValue={selectedLocal?.poloId}
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              required
            >
              {polos.map((polo) => (
                <option key={polo.id} value={polo.id}>
                  {polo.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Nome do Local</label>
            <input
              type="text"
              defaultValue={selectedLocal?.name}
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Endereço</label>
            <input
              type="text"
              defaultValue={selectedLocal?.address}
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
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
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Excluir Local" size="sm">
        <div className="space-y-4">
          <p className="text-(--color-foreground-secondary)">
            Tem certeza que deseja excluir o local <strong>{selectedLocal?.name}</strong>?
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
