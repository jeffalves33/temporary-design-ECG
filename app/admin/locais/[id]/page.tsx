"use client"

import { MobileHeader } from "@/components/layout/mobile-header"
import { BackButton } from "@/components/ui/back-button"
import { Building2, GraduationCap, Users, MapPin, User } from "lucide-react"
import { locais, polos, turmas, alunas, professoras } from "@/lib/mock-data"
import Link from "next/link"

export default async function LocalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const local = locais.find((l) => l.id === id)

  if (!local) return <div>Local não encontrado</div>

  const polo = polos.find((p) => p.id === local.poloId)
  const turmasDoLocal = turmas.filter((t) => t.localId === local.id)
  const alunasDoLocal = alunas.filter((a) => turmasDoLocal.some((t) => t.id === a.turmaId))
  const professorasDoLocal = professoras.filter((p) => turmasDoLocal.some((t) => t.professoraIds.includes(p.id)))

  return (
    <div className="min-h-screen bg-(--color-background-secondary)">
      <MobileHeader title={local.name} />

      <main className="px-4 pb-6 space-y-6">
        <div className="pt-4">
          <BackButton />
        </div>

        {/* Info do local */}
        <section className="pt-4 bg-white rounded-lg p-4 border border-(--color-border)">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-xl text-(--color-foreground) mb-1">{local.name}</h2>
              <div className="flex items-center gap-2 text-sm text-(--color-foreground-secondary) mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>
                  {polo?.name} • {polo?.city}
                </span>
              </div>
              {local.address && <p className="text-sm text-(--color-foreground-muted)">{local.address}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-(--color-background-secondary) rounded-lg p-3">
              <p className="text-xs text-(--color-foreground-secondary) mb-1">Turmas</p>
              <p className="text-2xl font-bold text-(--color-foreground)">{turmasDoLocal.length}</p>
            </div>
            <div className="bg-(--color-background-secondary) rounded-lg p-3">
              <p className="text-xs text-(--color-foreground-secondary) mb-1">Alunas</p>
              <p className="text-2xl font-bold text-(--color-foreground)">{alunasDoLocal.length}</p>
            </div>
            <div className="bg-(--color-background-secondary) rounded-lg p-3">
              <p className="text-xs text-(--color-foreground-secondary) mb-1">Professoras</p>
              <p className="text-2xl font-bold text-(--color-foreground)">{professorasDoLocal.length}</p>
            </div>
          </div>
        </section>

        {professorasDoLocal.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-(--color-foreground)">Professoras</h3>
            <div className="bg-white rounded-lg p-4 border border-(--color-border) space-y-2">
              {professorasDoLocal.map((prof) => (
                <div key={prof.id} className="flex items-center gap-3 py-2">
                  <div className="w-10 h-10 rounded-full bg-(--color-primary-light) flex items-center justify-center">
                    <User className="w-5 h-5 text-(--color-primary)" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-(--color-foreground)">{prof.nome}</p>
                    <p className="text-sm text-(--color-foreground-secondary)">{prof.telefone}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Turmas */}
        <section className="space-y-3">
          <h3 className="text-lg font-bold text-(--color-foreground)">Turmas</h3>

          {turmasDoLocal.length === 0 ? (
            <div className="bg-white rounded-lg p-6 text-center border border-(--color-border)">
              <GraduationCap className="w-10 h-10 mx-auto text-(--color-foreground-muted) mb-2" />
              <p className="text-(--color-foreground-secondary)">Nenhuma turma cadastrada</p>
            </div>
          ) : (
            <div className="space-y-2">
              {turmasDoLocal.map((turma) => {
                const alunasDaTurma = alunas.filter((a) => a.turmaId === turma.id)

                return (
                  <Link
                    key={turma.id}
                    href={`/admin/turmas/${turma.id}`}
                    className="block bg-white rounded-lg p-4 border border-(--color-border) hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-(--color-foreground)">{turma.name}</h4>
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-(--color-primary-light) text-(--color-primary)">
                          {turma.nivel}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-(--color-foreground-secondary)">
                        <Users className="w-4 h-4" />
                        <span>{alunasDaTurma.length}</span>
                      </div>
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
