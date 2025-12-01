"use client"

import { useState } from "react"
import { MobileHeader } from "@/components/layout/mobile-header"
import { SearchInput } from "@/components/ui/search-input"
import { FilterChip } from "@/components/ui/filter-chip"
import { GraduationCap, Users, DollarSign, AlertCircle } from "lucide-react"
import { turmas, polos, locais, alunas, pagamentosAlunas } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

export default function ProfessoraTurmasPage() {
  const professoraId = "1"
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredPolo, setFilteredPolo] = useState("")

  const minhasTurmas = turmas.filter((t) => t.professoraIds.includes(professoraId))

  const filteredTurmas = minhasTurmas.filter((turma) => {
    const matchesSearch = turma.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPolo = !filteredPolo || turma.poloId === filteredPolo
    return matchesSearch && matchesPolo
  })

  const polosAtuacao = Array.from(new Set(minhasTurmas.map((t) => t.poloId)))
  const poloOptions = [
    { value: "", label: "Todos" },
    ...polosAtuacao.map((id) => {
      const polo = polos.find((p) => p.id === id)
      return { value: id, label: polo?.name || "" }
    }),
  ]

  const mesAtual = "2024-03"

  return (
    <div className="min-h-screen bg-(--color-background-secondary)">
      <MobileHeader title="Minhas Turmas" />

      <main className="px-4 pb-6 space-y-4">
        <div className="pt-4 space-y-3">
          <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Buscar turma..." />
          <FilterChip label="Polo" value={filteredPolo} options={poloOptions} onChange={setFilteredPolo} />
        </div>

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
              const alunasPendentes = alunasDaTurma.filter((aluna) => {
                const pagamentos = pagamentosAlunas.filter(
                  (p) => p.alunaId === aluna.id && p.mesReferencia === mesAtual,
                )
                return pagamentos.some((p) => p.status === "Pendente")
              })

              return (
                <Link
                  key={turma.id}
                  href={`/professora/turmas/${turma.id}`}
                  className="block bg-white rounded-lg p-4 border border-(--color-border) hover:shadow-md transition-shadow"
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
                    {alunasPendentes.length > 0 && (
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {alunasPendentes.length}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-(--color-background-secondary) rounded-lg p-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Users className="w-3.5 h-3.5 text-(--color-foreground-secondary)" />
                        <p className="text-xs text-(--color-foreground-secondary)">Alunas</p>
                      </div>
                      <p className="font-semibold text-sm text-(--color-foreground)">{alunasDaTurma.length}</p>
                    </div>

                    <div className="bg-(--color-background-secondary) rounded-lg p-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <DollarSign className="w-3.5 h-3.5 text-(--color-foreground-secondary)" />
                        <p className="text-xs text-(--color-foreground-secondary)">Mensalidade</p>
                      </div>
                      <p className="font-semibold text-sm text-(--color-foreground)">
                        {formatCurrency(turma.mensalidade)}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </section>
      </main>
    </div>
  )
}
