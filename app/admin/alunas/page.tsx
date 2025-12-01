"use client"

import { useState } from "react"
import { MobileHeader } from "@/components/layout/mobile-header"
import { SearchInput } from "@/components/ui/search-input"
import { Modal } from "@/components/ui/modal"
import { Plus, Users, AlertCircle, Edit, Trash2, ChevronRight, CheckCircle } from "lucide-react"
import { polos, locais, turmas, alunas, pagamentosAlunas } from "@/lib/mock-data"
import { calculateAge } from "@/lib/utils"
import Link from "next/link"
import type { Aluna } from "@/lib/types"

export default function AlunasPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredPolo, setFilteredPolo] = useState("")
  const [filteredLocal, setFilteredLocal] = useState("")
  const [filteredTurma, setFilteredTurma] = useState("")
  const [filteredStatus, setFilteredStatus] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedAluna, setSelectedAluna] = useState<Aluna | null>(null)

  const getPendencias = (alunaId: string) => {
    const pendentes = pagamentosAlunas.filter((p) => p.alunaId === alunaId && p.status === "Pendente")
    return pendentes.length
  }

  const filteredAlunas = alunas.filter((aluna) => {
    const turma = turmas.find((t) => t.id === aluna.turmaId)
    const matchesSearch = aluna.nome.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPolo = !filteredPolo || turma?.poloId === filteredPolo
    const matchesLocal = !filteredLocal || turma?.localId === filteredLocal
    const matchesTurma = !filteredTurma || aluna.turmaId === filteredTurma
    const pendencias = getPendencias(aluna.id)
    const matchesStatus =
      !filteredStatus ||
      (filteredStatus === "emdia" && pendencias === 0) ||
      (filteredStatus === "pendente" && pendencias > 0)

    return matchesSearch && matchesPolo && matchesLocal && matchesTurma && matchesStatus
  })

  const locaisDisponiveis = filteredPolo ? locais.filter((l) => l.poloId === filteredPolo) : locais
  const turmasDisponiveis = filteredLocal
    ? turmas.filter((t) => t.localId === filteredLocal)
    : filteredPolo
      ? turmas.filter((t) => t.poloId === filteredPolo)
      : turmas

  return (
    <div className="min-h-screen bg-(--color-background-secondary)">
      <MobileHeader title="Alunas" />

      <main className="px-4 pb-6 space-y-4">
        <div className="pt-4 space-y-3">
          <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Buscar aluna..." />

          {/* Filtrar por Polo */}
          <div>
            <label className="block text-xs font-medium text-(--color-foreground-secondary) mb-1.5 ml-1">
              Filtrar por Polo
            </label>
            <select
              value={filteredPolo}
              onChange={(e) => {
                setFilteredPolo(e.target.value)
                setFilteredLocal("")
                setFilteredTurma("")
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

          {/* Filtrar por Local */}
          {filteredPolo && (
            <div>
              <label className="block text-xs font-medium text-(--color-foreground-secondary) mb-1.5 ml-1">
                Filtrar por Local
              </label>
              <select
                value={filteredLocal}
                onChange={(e) => {
                  setFilteredLocal(e.target.value)
                  setFilteredTurma("")
                }}
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

          {/* Filtrar por Turma */}
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
              {turmasDisponiveis.map((turma) => (
                <option key={turma.id} value={turma.id}>
                  {turma.name} - {turma.nivel}
                </option>
              ))}
            </select>
          </div>

          {/* Status Financeiro */}
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

          {/* Botão Adicionar Aluna */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-(--color-primary) text-white rounded-lg font-semibold hover:bg-(--color-primary-hover) transition-colors"
          >
            <Plus className="w-5 h-5" />
            Adicionar Aluna
          </button>
        </div>

        {/* Lista Compacta de Alunas */}
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
              const local = locais.find((l) => l.id === turma?.localId)
              const pendencias = getPendencias(aluna.id)
              const idade = calculateAge(aluna.dataNascimento)

              return (
                <div key={aluna.id} className="bg-white rounded-lg border border-(--color-border) overflow-hidden">
                  <Link
                    href={`/admin/alunas/${aluna.id}`}
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

                  <div className="flex border-t border-(--color-border)">
                    <button
                      onClick={() => {
                        setSelectedAluna(aluna)
                        setIsEditModalOpen(true)
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-(--color-foreground-secondary) hover:bg-(--color-background-tertiary) transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">Editar</span>
                    </button>
                    <div className="w-px bg-(--color-border)" />
                    <button
                      onClick={() => {
                        setSelectedAluna(aluna)
                        setIsDeleteModalOpen(true)
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-(--color-error) hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">Excluir</span>
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </section>
      </main>

      {/* Modal Adicionar */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Adicionar Aluna" size="lg">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            setIsAddModalOpen(false)
          }}
        >
          <h3 className="font-semibold text-(--color-foreground)">Dados da Aluna</h3>
          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Nome Completo</label>
            <input
              type="text"
              placeholder="Ex: Sofia Rodrigues"
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Data de Nascimento</label>
            <input
              type="date"
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Turma</label>
            <select
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              required
            >
              <option value="">Selecione uma turma</option>
              {turmas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} - {polos.find((p) => p.id === t.poloId)?.name}
                </option>
              ))}
            </select>
          </div>

          <h3 className="font-semibold text-(--color-foreground) pt-2">Dados do Responsável</h3>
          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Nome do Responsável</label>
            <input
              type="text"
              placeholder="Ex: Maria Rodrigues"
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">WhatsApp</label>
            <input
              type="tel"
              placeholder="(27) 99999-9999"
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">E-mail</label>
            <input
              type="email"
              placeholder="responsavel@email.com"
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
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Aluna" size="lg">
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
              defaultValue={selectedAluna?.nome}
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Status</label>
            <select
              defaultValue={selectedAluna?.status}
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
            >
              <option value="Ativa">Ativa</option>
              <option value="Trancada">Trancada</option>
            </select>
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
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Excluir Aluna" size="sm">
        <div className="space-y-4">
          <p className="text-(--color-foreground-secondary)">
            Tem certeza que deseja excluir a aluna <strong>{selectedAluna?.nome}</strong>?
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
