"use client"

import { MobileHeader } from "@/components/layout/mobile-header"
import { BackButton } from "@/components/ui/back-button"
import { Building2, Users, GraduationCap, MapPin } from "lucide-react"
import { polos, locais, turmas, alunas, pagamentosAlunas } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

export default async function PoloDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const polo = polos.find((p) => p.id === id)

  if (!polo) {
    return <div>Polo não encontrado</div>
  }

  const locaisDoPolo = locais.filter((l) => l.poloId === polo.id)
  const turmasDoPolo = turmas.filter((t) => t.poloId === polo.id)
  const alunasDoPolo = alunas.filter((a) => turmasDoPolo.some((t) => t.id === a.turmaId))

  const mesAtual = "2024-03"
  const pagamentosPolo = pagamentosAlunas.filter(
    (p) => p.mesReferencia === mesAtual && alunasDoPolo.some((a) => a.id === p.alunaId),
  )
  const receitaMes = pagamentosPolo.filter((p) => p.status === "Pago").reduce((sum, p) => sum + p.valor, 0)

  return (
    <div className="min-h-screen bg-(--color-background-secondary)">
      <MobileHeader title={polo.name} />

      <main className="px-4 pb-6 space-y-6">
        <div className="pt-4">
          <BackButton />
        </div>

        <section className="bg-white rounded-lg p-4 border border-(--color-border)">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-(--color-primary-light) flex items-center justify-center">
              <MapPin className="w-6 h-6 text-(--color-primary)" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-xl text-(--color-foreground) mb-1">{polo.name}</h2>
              <p className="text-(--color-foreground-secondary)">{polo.city}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-(--color-background-secondary) rounded-lg p-3">
              <p className="text-xs text-(--color-foreground-secondary) mb-1">Locais</p>
              <p className="text-2xl font-bold text-(--color-foreground)">{locaisDoPolo.length}</p>
            </div>
            <div className="bg-(--color-background-secondary) rounded-lg p-3">
              <p className="text-xs text-(--color-foreground-secondary) mb-1">Turmas</p>
              <p className="text-2xl font-bold text-(--color-foreground)">{turmasDoPolo.length}</p>
            </div>
            <div className="bg-(--color-background-secondary) rounded-lg p-3">
              <p className="text-xs text-(--color-foreground-secondary) mb-1">Alunas</p>
              <p className="text-2xl font-bold text-(--color-foreground)">{alunasDoPolo.length}</p>
            </div>
            <div className="bg-(--color-background-secondary) rounded-lg p-3">
              <p className="text-xs text-(--color-foreground-secondary) mb-1">Receita/mês</p>
              <p className="text-lg font-bold text-(--color-primary)">{formatCurrency(receitaMes)}</p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-(--color-foreground)">Locais</h3>
            <Link href="/admin/locais" className="text-sm font-medium text-(--color-primary) hover:underline">
              Ver todos
            </Link>
          </div>

          {locaisDoPolo.length === 0 ? (
            <div className="bg-white rounded-lg p-6 text-center border border-(--color-border)">
              <Building2 className="w-10 h-10 mx-auto text-(--color-foreground-muted) mb-2" />
              <p className="text-(--color-foreground-secondary)">Nenhum local cadastrado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {locaisDoPolo.map((local) => {
                const turmasDoLocal = turmas.filter((t) => t.localId === local.id)
                const alunasDoLocal = alunas.filter((a) => turmasDoLocal.some((t) => t.id === a.turmaId))

                return (
                  <Link
                    key={local.id}
                    href={`/admin/locais/${local.id}`}
                    className="block bg-white rounded-lg p-4 border border-(--color-border) hover:shadow-md transition-shadow"
                  >
                    <h4 className="font-semibold text-(--color-foreground) mb-2">{local.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-(--color-foreground-secondary)">
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-4 h-4" />
                        {turmasDoLocal.length} turmas
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {alunasDoLocal.length} alunas
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
