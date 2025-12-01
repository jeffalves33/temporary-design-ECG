"use client"

import { useState } from "react"
import { MobileHeader } from "@/components/layout/mobile-header"
import { SearchInput } from "@/components/ui/search-input"
import { Modal } from "@/components/ui/modal"
import { Plus, MapPin, Building2, Users, Edit, Trash2, ChevronRight } from "lucide-react"
import { polos, locais, alunas, turmas } from "@/lib/mock-data"
import Link from "next/link"
import type { Polo } from "@/lib/types"

export default function PolosPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedPolo, setSelectedPolo] = useState<Polo | null>(null)

  // Filtrar polos
  const filteredPolos = polos.filter(
    (polo) =>
      polo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      polo.city.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Abrir modal de edição
  const handleEdit = (polo: Polo) => {
    setSelectedPolo(polo)
    setIsEditModalOpen(true)
  }

  // Abrir modal de exclusão
  const handleDelete = (polo: Polo) => {
    setSelectedPolo(polo)
    setIsDeleteModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-(--color-background-secondary)">
      <MobileHeader title="Polos" />

      <main className="px-4 pb-6 space-y-4">
        {/* Barra de busca e botão adicionar */}
        <div className="pt-4 space-y-3">
          <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Buscar polo..." />

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-(--color-primary) text-white rounded-lg font-semibold hover:bg-(--color-primary-hover) transition-colors"
          >
            <Plus className="w-5 h-5" />
            Adicionar Polo
          </button>
        </div>

        {/* Lista de polos */}
        <section className="space-y-3">
          {filteredPolos.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 mx-auto text-(--color-foreground-muted) mb-3" />
              <p className="text-(--color-foreground-secondary)">Nenhum polo encontrado</p>
            </div>
          ) : (
            filteredPolos.map((polo) => {
              const locaisDoPolo = locais.filter((l) => l.poloId === polo.id)
              const turmasDoPolo = turmas.filter((t) => t.poloId === polo.id)
              const alunasDoPolo = alunas.filter((a) => turmasDoPolo.some((t) => t.id === a.turmaId))

              return (
                <div key={polo.id} className="bg-white rounded-lg border border-(--color-border) overflow-hidden">
                  <Link
                    href={`/admin/polos/${polo.id}`}
                    className="block p-4 hover:bg-(--color-card-hover) transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-(--color-foreground) mb-1">{polo.name}</h3>
                        <p className="text-sm text-(--color-foreground-secondary)">{polo.city}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-(--color-foreground-muted) flex-shrink-0" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-(--color-foreground-secondary)">Locais</p>
                          <p className="font-semibold text-(--color-foreground)">{locaisDoPolo.length}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-(--color-primary-light) flex items-center justify-center">
                          <Users className="w-4 h-4 text-(--color-primary)" />
                        </div>
                        <div>
                          <p className="text-xs text-(--color-foreground-secondary)">Alunas</p>
                          <p className="font-semibold text-(--color-foreground)">{alunasDoPolo.length}</p>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="flex border-t border-(--color-border)">
                    <button
                      onClick={() => handleEdit(polo)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-(--color-foreground-secondary) hover:bg-(--color-background-tertiary) transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="text-sm font-medium">Editar</span>
                    </button>
                    <div className="w-px bg-(--color-border)" />
                    <button
                      onClick={() => handleDelete(polo)}
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
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Adicionar Polo">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            setIsAddModalOpen(false)
          }}
        >
          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Nome do Polo</label>
            <input
              type="text"
              placeholder="Ex: Polo São Mateus"
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Cidade</label>
            <input
              type="text"
              placeholder="Ex: São Mateus"
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Observações</label>
            <textarea
              placeholder="Informações adicionais..."
              rows={3}
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary) resize-none"
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
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Polo">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            setIsEditModalOpen(false)
          }}
        >
          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Nome do Polo</label>
            <input
              type="text"
              defaultValue={selectedPolo?.name}
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Cidade</label>
            <input
              type="text"
              defaultValue={selectedPolo?.city}
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Observações</label>
            <textarea
              defaultValue={selectedPolo?.observations}
              rows={3}
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary) resize-none"
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
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Excluir Polo" size="sm">
        <div className="space-y-4">
          <p className="text-(--color-foreground-secondary)">
            Tem certeza que deseja excluir o polo <strong>{selectedPolo?.name}</strong>? Esta ação não pode ser
            desfeita.
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
