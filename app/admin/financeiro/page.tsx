"use client"

import { useState, useMemo } from "react"
import { MobileHeader } from "@/components/layout/mobile-header"
import { StatCard } from "@/components/ui/stat-card"
import { Modal } from "@/components/ui/modal"
import { DollarSign, TrendingUp, AlertCircle, CheckCircle, Receipt, Layers, Tag } from "lucide-react"
import { polos, locais, turmas, alunas, professoras, pagamentosAlunas, pagamentosProfessoras } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"

type TabType = "mensalidades" | "matriculas" | "custos" | "salarios"

const MESES = [
  { value: "2024-01", label: "Janeiro 2024" },
  { value: "2024-02", label: "Fevereiro 2024" },
  { value: "2024-03", label: "Março 2024" },
  { value: "2024-04", label: "Abril 2024" },
]

function monthLabel(mes: string) {
  const found = MESES.find((m) => m.value === mes)
  if (found) return found.label
  const [y, m] = mes.split("-")
  return new Date(Number(y), Number(m) - 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
}

export default function FinanceiroPage() {
  const [activeTab, setActiveTab] = useState<TabType>("mensalidades")
  const [mesSelecionado, setMesSelecionado] = useState("2024-03")
  const [isPagamentoModalOpen, setIsPagamentoModalOpen] = useState(false)
  const [selectedProfessoraId, setSelectedProfessoraId] = useState<string | null>(null)
  const [filtroPoloFin, setFiltroPoloFin] = useState("")
  const [filtroLocalFin, setFiltroLocalFin] = useState("")
  const [filtroTurmaFin, setFiltroTurmaFin] = useState("")

  // ── Cálculo de salário por professora (dinâmico) ──
  const calcularSalarioProfessora = (professoraId: string, mes: string) => {
    const turmasDaProf = turmas.filter((t) => t.professoraIds.includes(professoraId))
    return turmasDaProf.reduce((total, turma) => {
      const cfg = turma.professorasConfig?.find((c) => c.professoraId === professoraId)
      if (!cfg) return total
      if (cfg.tipo === "fixo") return total + cfg.valor
      const receitaTurma = pagamentosAlunas
        .filter((p) => p.mesReferencia === mes && alunas.find((a) => a.turmaId === turma.id && a.id === p.alunaId))
        .reduce((s, p) => s + p.valor, 0)
      return total + (receitaTurma * cfg.valor) / 100
    }, 0)
  }

  // ── Filtragem de turmas conforme filtros hierárquicos ──
  const turmasFiltradas = useMemo(() => {
    return turmas.filter((t) => {
      if (filtroPoloFin && t.poloId !== filtroPoloFin) return false
      if (filtroLocalFin && t.localId !== filtroLocalFin) return false
      if (filtroTurmaFin && t.id !== filtroTurmaFin) return false
      return true
    })
  }, [filtroPoloFin, filtroLocalFin, filtroTurmaFin])

  const locaisFiltro = filtroPoloFin ? locais.filter((l) => l.poloId === filtroPoloFin) : locais
  const turmasFiltroSelect = filtroLocalFin ? turmas.filter((t) => t.localId === filtroLocalFin) : filtroPoloFin ? turmas.filter((t) => t.poloId === filtroPoloFin) : turmas

  // ── Mensalidades ──
  // Inclui pagamentos do mês selecionado E pendências de meses anteriores recebidas neste mês
  const pagamentosMes = useMemo(() =>
    pagamentosAlunas.filter((p) => {
      const alunasDasFiltradas = alunas.filter((a) => turmasFiltradas.some((t) => t.id === a.turmaId))
      if (!alunasDasFiltradas.find((a) => a.id === p.alunaId)) return false
      return p.mesReferencia === mesSelecionado
    }), [mesSelecionado, turmasFiltradas])

  // Pendências de meses ANTERIORES ao selecionado (ainda não pagas)
  const pendenciasAnteriores = useMemo(() =>
    pagamentosAlunas.filter((p) => {
      const alunasDasFiltradas = alunas.filter((a) => turmasFiltradas.some((t) => t.id === a.turmaId))
      if (!alunasDasFiltradas.find((a) => a.id === p.alunaId)) return false
      return p.mesReferencia < mesSelecionado && p.status === "Pendente"
    }), [mesSelecionado, turmasFiltradas])

  const totalEsperado = pagamentosMes.reduce((s, p) => s + p.valor, 0)
  const totalRecebido = pagamentosMes.filter((p) => p.status === "Pago").reduce((s, p) => s + p.valor, 0)
  const totalPendenteMes = totalEsperado - totalRecebido
  const totalPendenteAnterior = pendenciasAnteriores.reduce((s, p) => s + p.valor, 0)

  // ── Por turma (para tabela) ──
  const mensalidadesPorTurma = useMemo(() =>
    turmasFiltradas.map((t) => {
      const alunasDaTurma = alunas.filter((a) => a.turmaId === t.id)
      const pags = pagamentosMes.filter((p) => alunasDaTurma.find((a) => a.id === p.alunaId))
      const esperado = pags.reduce((s, p) => s + p.valor, 0)
      const recebido = pags.filter((p) => p.status === "Pago").reduce((s, p) => s + p.valor, 0)
      const polo = polos.find((po) => po.id === t.poloId)
      const local = locais.find((l) => l.id === t.localId)
      return { turma: t, polo, local, esperado, recebido, pendente: esperado - recebido, nAlunas: alunasDaTurma.length }
    }), [turmasFiltradas, pagamentosMes])

  // ── Matrículas ──
  const alunasMesMatricula = useMemo(() =>
    alunas.filter((a) => {
      if (!turmasFiltradas.find((t) => t.id === a.turmaId)) return false
      const createdMes = `${a.createdAt.getFullYear()}-${String(a.createdAt.getMonth() + 1).padStart(2, "0")}`
      return createdMes === mesSelecionado && a.taxaMatriculaPaga
    }), [mesSelecionado, turmasFiltradas])

  const totalMatriculas = alunasMesMatricula.reduce((s, a) => {
    const turma = turmas.find((t) => t.id === a.turmaId)
    return s + (turma?.taxaMatricula ?? 0)
  }, 0)

  // ── Custos ──
  const custosPorCategoria = useMemo(() => {
    const map = new Map<string, { categoria: string; total: number; turmas: { nome: string; valor: number }[] }>()
    turmasFiltradas.forEach((t) => {
      const receitaTurma = pagamentosAlunas
        .filter((p) => p.mesReferencia === mesSelecionado && alunas.find((a) => a.turmaId === t.id && a.id === p.alunaId))
        .reduce((s, p) => s + p.valor, 0)
      t.custos?.forEach((c) => {
        const valorReal = c.tipo === "fixo" ? c.valor : (receitaTurma * c.valor) / 100
        const key = c.categoria
        if (!map.has(key)) map.set(key, { categoria: key, total: 0, turmas: [] })
        const entry = map.get(key)!
        entry.total += valorReal
        entry.turmas.push({ nome: t.name, valor: valorReal })
      })
    })
    return Array.from(map.values())
  }, [turmasFiltradas, mesSelecionado])

  const totalCustos = custosPorCategoria.reduce((s, c) => s + c.total, 0)

  // ── Salários ──
  const pagamentosSalariosMes = pagamentosProfessoras.filter((p) => p.mesReferencia === mesSelecionado)
  const totalSalariosPrevistos = professoras.reduce((s, p) => s + calcularSalarioProfessora(p.id, mesSelecionado), 0)
  const totalSalariosPagos = pagamentosSalariosMes.filter((p) => p.status === "Pago").reduce((s, p) => s + p.valor, 0)
  const totalSalariosPendentes = totalSalariosPrevistos - totalSalariosPagos

  // Saldo líquido geral
  const saldoLiquido = totalRecebido - totalSalariosPagos - totalCustos

  const inputCls = "w-full px-3 py-2 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary) text-sm bg-white"

  const tabs: { id: TabType; label: string }[] = [
    { id: "mensalidades", label: "Mensalidades" },
    { id: "matriculas", label: "Matrículas" },
    { id: "custos", label: "Custos" },
    { id: "salarios", label: "Salários" },
  ]

  return (
    <div className="min-h-screen bg-(--color-background-secondary)">
      <MobileHeader title="Financeiro" />

      <main className="px-4 pb-6 space-y-5">
        {/* Filtros globais */}
        <div className="pt-4 space-y-3">
          {/* Filtro de mês */}
          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Período</label>
            <select value={mesSelecionado} onChange={(e) => setMesSelecionado(e.target.value)} className={inputCls}>
              {MESES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          {/* Filtro hierárquico */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium text-(--color-foreground) mb-1">Polo</label>
              <select value={filtroPoloFin} onChange={(e) => { setFiltroPoloFin(e.target.value); setFiltroLocalFin(""); setFiltroTurmaFin("") }} className={inputCls}>
                <option value="">Todos</option>
                {polos.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-(--color-foreground) mb-1">Local</label>
              <select value={filtroLocalFin} onChange={(e) => { setFiltroLocalFin(e.target.value); setFiltroTurmaFin("") }} className={inputCls} disabled={!filtroPoloFin}>
                <option value="">Todos</option>
                {locaisFiltro.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-(--color-foreground) mb-1">Turma</label>
              <select value={filtroTurmaFin} onChange={(e) => setFiltroTurmaFin(e.target.value)} className={inputCls} disabled={!filtroPoloFin}>
                <option value="">Todas</option>
                {turmasFiltroSelect.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Resumo geral rápido */}
        <div className="bg-white rounded-xl border border-(--color-border) p-4">
          <h2 className="text-sm font-semibold text-(--color-foreground-secondary) uppercase tracking-wide mb-3">Visão Geral — {monthLabel(mesSelecionado)}</h2>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-green-50 rounded-lg p-2.5">
              <p className="text-[10px] text-green-700 mb-0.5">Receita</p>
              <p className="font-bold text-sm text-green-800">{formatCurrency(totalRecebido + totalMatriculas)}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-2.5">
              <p className="text-[10px] text-red-700 mb-0.5">Saídas</p>
              <p className="font-bold text-sm text-red-800">{formatCurrency(totalSalariosPagos + totalCustos)}</p>
            </div>
            <div className={`rounded-lg p-2.5 ${saldoLiquido >= 0 ? "bg-(--color-primary-light)" : "bg-red-50"}`}>
              <p className={`text-[10px] mb-0.5 ${saldoLiquido >= 0 ? "text-(--color-primary)" : "text-red-700"}`}>Saldo</p>
              <p className={`font-bold text-sm ${saldoLiquido >= 0 ? "text-gray-900" : "text-red-800"}`}>{formatCurrency(saldoLiquido)}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-(--color-background-tertiary) p-1 rounded-lg overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[80px] px-3 py-2 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.id ? "bg-white text-(--color-foreground) shadow-sm" : "text-(--color-foreground-secondary) hover:text-(--color-foreground)"
              }`}
            >{tab.label}</button>
          ))}
        </div>

        {/* ── ABA MENSALIDADES ── */}
        {activeTab === "mensalidades" && (
          <div className="space-y-5">
            <div className="grid gap-3">
              <StatCard title="Total Esperado" value={formatCurrency(totalEsperado)} icon={TrendingUp} iconColor="text-blue-600" />
              <StatCard title="Total Recebido" value={formatCurrency(totalRecebido)} icon={DollarSign} iconColor="text-(--color-success)" />
              <StatCard title="Pendente (mês)" value={formatCurrency(totalPendenteMes)} icon={AlertCircle} iconColor="text-(--color-warning)" />
            </div>

            {/* Pendências de meses anteriores */}
            {pendenciasAnteriores.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3 mb-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900">Pendências de meses anteriores</p>
                    <p className="text-sm text-red-700">{pendenciasAnteriores.length} pagamentos em atraso • {formatCurrency(totalPendenteAnterior)}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  {pendenciasAnteriores.slice(0, 5).map((p) => {
                    const aluna = alunas.find((a) => a.id === p.alunaId)
                    return (
                      <div key={p.id} className="flex justify-between items-center text-sm bg-white rounded-lg px-3 py-2 border border-red-100">
                        <span className="text-gray-800 font-medium">{aluna?.nome}</span>
                        <span className="text-xs text-red-600">{monthLabel(p.mesReferencia)} • {formatCurrency(p.valor)}</span>
                      </div>
                    )
                  })}
                  {pendenciasAnteriores.length > 5 && (
                    <p className="text-xs text-red-500 text-center pt-1">+ {pendenciasAnteriores.length - 5} mais</p>
                  )}
                </div>
              </div>
            )}

            <h3 className="font-bold text-(--color-foreground)">Mensalidades por Turma</h3>
            <div className="space-y-2">
              {mensalidadesPorTurma.map(({ turma, polo, local, esperado, recebido, pendente, nAlunas }) => (
                <div key={turma.id} className="bg-white rounded-lg p-4 border border-(--color-border)">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-(--color-foreground)">{turma.name}</h4>
                      <p className="text-xs text-(--color-foreground-secondary)">{polo?.name} • {local?.name} • {nAlunas} alunas</p>
                    </div>
                    {pendente > 0 && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">Pendências</span>}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-(--color-background-secondary) rounded-lg p-2">
                      <p className="text-[10px] text-(--color-foreground-secondary)">Esperado</p>
                      <p className="font-semibold text-sm">{formatCurrency(esperado)}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2">
                      <p className="text-[10px] text-green-700">Recebido</p>
                      <p className="font-semibold text-sm text-green-700">{formatCurrency(recebido)}</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-2">
                      <p className="text-[10px] text-amber-700">Pendente</p>
                      <p className="font-semibold text-sm text-amber-700">{formatCurrency(pendente)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ABA MATRÍCULAS ── */}
        {activeTab === "matriculas" && (
          <div className="space-y-5">
            <StatCard title="Receita de Matrículas" value={formatCurrency(totalMatriculas)} icon={Receipt} iconColor="text-purple-600" />
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <p className="text-sm text-purple-700">Matrículas pagas em {monthLabel(mesSelecionado)}</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{alunasMesMatricula.length} aluna{alunasMesMatricula.length !== 1 ? "s" : ""}</p>
            </div>
            {alunasMesMatricula.length === 0 ? (
              <p className="text-center text-(--color-foreground-secondary) py-8">Nenhuma matrícula neste período.</p>
            ) : (
              <div className="space-y-2">
                {alunasMesMatricula.map((aluna) => {
                  const turma = turmas.find((t) => t.id === aluna.turmaId)
                  const polo = polos.find((p) => p.id === turma?.poloId)
                  return (
                    <div key={aluna.id} className="bg-white rounded-lg p-3 border border-(--color-border) flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-(--color-foreground) text-sm">{aluna.nome}</p>
                        <p className="text-xs text-(--color-foreground-secondary)">{polo?.name} • {turma?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-(--color-foreground)">{formatCurrency(turma?.taxaMatricula ?? 0)}</p>
                        <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full">Paga</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── ABA CUSTOS ── */}
        {activeTab === "custos" && (
          <div className="space-y-5">
            <StatCard title="Total de Custos" value={formatCurrency(totalCustos)} icon={Layers} iconColor="text-red-600" />
            {custosPorCategoria.length === 0 ? (
              <p className="text-center text-(--color-foreground-secondary) py-8">Nenhum custo cadastrado nas turmas filtradas.</p>
            ) : (
              <div className="space-y-3">
                {custosPorCategoria.map(({ categoria, total, turmas: turmasDoGrupo }) => (
                  <div key={categoria} className="bg-white rounded-lg border border-(--color-border) overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-(--color-background-secondary)">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-(--color-foreground-secondary)" />
                        <span className="font-semibold text-(--color-foreground)">{categoria}</span>
                      </div>
                      <span className="font-bold text-(--color-foreground)">{formatCurrency(total)}</span>
                    </div>
                    {turmasDoGrupo.map((tg, i) => (
                      <div key={i} className="flex justify-between items-center px-4 py-2 border-t border-(--color-border)">
                        <span className="text-sm text-(--color-foreground-secondary)">{tg.nome}</span>
                        <span className="text-sm font-medium text-(--color-foreground)">{formatCurrency(tg.valor)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ABA SALÁRIOS ── */}
        {activeTab === "salarios" && (
          <div className="space-y-5">
            <div className="grid gap-3">
              <StatCard title="Total Previsto" value={formatCurrency(totalSalariosPrevistos)} icon={TrendingUp} iconColor="text-blue-600" />
              <StatCard title="Total Pago" value={formatCurrency(totalSalariosPagos)} icon={CheckCircle} iconColor="text-(--color-success)" />
              <StatCard title="Pendente" value={formatCurrency(totalSalariosPendentes)} icon={AlertCircle} iconColor="text-(--color-warning)" />
            </div>

            <div className="space-y-3">
              {professoras.map((prof) => {
                const pagamento = pagamentosSalariosMes.find((p) => p.professoraId === prof.id)
                const turmasDaProf = turmas.filter((t) => t.professoraIds.includes(prof.id))
                const salarioTotal = calcularSalarioProfessora(prof.id, mesSelecionado)

                return (
                  <div key={prof.id} className="bg-white rounded-lg border border-(--color-border) overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-(--color-foreground)">{prof.nome}</h4>
                          <p className="text-xs text-(--color-foreground-secondary)">{turmasDaProf.length} turma{turmasDaProf.length !== 1 ? "s" : ""}</p>
                        </div>
                        {pagamento?.status === "Pago" ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" />Pago</span>
                        ) : (
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full flex items-center gap-1"><AlertCircle className="w-3 h-3" />Pendente</span>
                        )}
                      </div>

                      {/* Detalhamento por turma */}
                      <div className="space-y-1 mb-3">
                        {turmasDaProf.map((t) => {
                          const cfg = t.professorasConfig?.find((c) => c.professoraId === prof.id)
                          const receitaTurma = pagamentosAlunas
                            .filter((p) => p.mesReferencia === mesSelecionado && alunas.find((a) => a.turmaId === t.id && a.id === p.alunaId))
                            .reduce((s, p) => s + p.valor, 0)
                          const valorTurma = cfg ? (cfg.tipo === "fixo" ? cfg.valor : (receitaTurma * cfg.valor) / 100) : 0
                          return (
                            <div key={t.id} className="flex justify-between items-center bg-(--color-background-secondary) rounded px-3 py-1.5">
                              <span className="text-xs text-(--color-foreground)">{t.name}</span>
                              <span className="text-xs text-(--color-foreground-secondary)">
                                {cfg ? (cfg.tipo === "percentual" ? `${cfg.valor}% × ${formatCurrency(receitaTurma)}` : "Fixo") : "—"}
                                {" = "}<strong>{formatCurrency(valorTurma)}</strong>
                              </span>
                            </div>
                          )
                        })}
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-(--color-foreground-secondary)">Total calculado</p>
                          <p className="text-xl font-bold text-(--color-foreground)">{formatCurrency(salarioTotal)}</p>
                        </div>
                        {pagamento?.status !== "Pago" && (
                          <button
                            onClick={() => { setSelectedProfessoraId(prof.id); setIsPagamentoModalOpen(true) }}
                            className="px-4 py-2 bg-(--color-primary) text-white text-sm font-semibold rounded-lg hover:bg-(--color-primary-hover) transition-colors"
                          >
                            Registrar Pagamento
                          </button>
                        )}
                        {pagamento?.status === "Pago" && pagamento.dataPagamento && (
                          <p className="text-xs text-(--color-foreground-secondary)">Pago em {new Date(pagamento.dataPagamento).toLocaleDateString("pt-BR")}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* Modal Registrar Pagamento */}
      <Modal isOpen={isPagamentoModalOpen} onClose={() => setIsPagamentoModalOpen(false)} title="Registrar Pagamento" size="sm">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsPagamentoModalOpen(false) }}>
          {(() => {
            const prof = professoras.find((p) => p.id === selectedProfessoraId)
            const valor = calcularSalarioProfessora(selectedProfessoraId ?? "", mesSelecionado)
            return (
              <div className="bg-(--color-background-secondary) rounded-lg p-4 space-y-2">
                <div><p className="text-xs text-(--color-foreground-secondary)">Professora</p><p className="font-semibold">{prof?.nome}</p></div>
                <div><p className="text-xs text-(--color-foreground-secondary)">Referência</p><p className="font-semibold">{monthLabel(mesSelecionado)}</p></div>
                <div><p className="text-xs text-(--color-foreground-secondary)">Valor</p><p className="text-xl font-bold">{formatCurrency(valor)}</p></div>
              </div>
            )
          })()}
          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Data do Pagamento</label>
            <input type="date" defaultValue={new Date().toISOString().split("T")[0]} className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Observações</label>
            <textarea rows={2} placeholder="Informações adicionais..." className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary) resize-none" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setIsPagamentoModalOpen(false)} className="flex-1 px-4 py-2.5 border border-(--color-border) rounded-lg font-semibold">Cancelar</button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-(--color-primary) text-white rounded-lg font-semibold">Confirmar</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
