"use client"

import { useState, useMemo } from "react"
import { MobileHeader } from "@/components/layout/mobile-header"
import { Modal } from "@/components/ui/modal"
import {
  AlertCircle,
  MessageCircle,
  Send,
  CheckSquare,
  Users,
  Filter,
  Search,
  ChevronRight,
  Clock,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"
import { alunas, turmas, polos, locais, pagamentosAlunas, configuracaoCora } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"

interface AlunaPendente {
  aluna: typeof alunas[0]
  turma: typeof turmas[0] | undefined
  polo: typeof polos[0] | undefined
  local: typeof locais[0] | undefined
  mesesPendentes: typeof pagamentosAlunas
  totalPendente: number
}

function encodeWhatsApp(aluna: AlunaPendente) {
  const meses = aluna.mesesPendentes.map((p) => {
    const [y, m] = p.mesReferencia.split("-")
    return new Date(Number(y), Number(m) - 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
  })
  const msg = encodeURIComponent(
    `Ola, ${aluna.aluna.responsavel.nome}! 😊\n\nPassando para informar que a mensalidade de *${aluna.aluna.nome}* (${aluna.turma?.name}) esta em aberto:\n\n📅 Meses: ${meses.join(", ")}\n💰 Total: ${formatCurrency(aluna.totalPendente)}\n\nPode realizar o pagamento pelo link ou chave PIX. Qualquer duvida, estou aqui!`
  )
  const num = aluna.aluna.responsavel.whatsapp.replace(/\D/g, "")
  return `https://wa.me/55${num}?text=${msg}`
}

export default function CobrancasPage() {
  const [filtroPolo, setFiltroPolo] = useState("")
  const [filtroLocal, setFiltroLocal] = useState("")
  const [filtroTurma, setFiltroTurma] = useState("")
  const [busca, setBusca] = useState("")
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set())
  const [isCobrarTodosModal, setIsCobrarTodosModal] = useState(false)
  const [isConfirmModal, setIsConfirmModal] = useState(false)
  const [cobrandoAluna, setCobrandoAluna] = useState<AlunaPendente | null>(null)
  const [cobradaIds, setCobradaIds] = useState<Set<string>>(new Set())

  // Locais e turmas filtradas em cascata
  const locaisFiltrados = filtroPolo ? locais.filter((l) => l.poloId === filtroPolo) : locais
  const turmasFiltradas = useMemo(() => {
    let t = turmas
    if (filtroPolo) t = t.filter((tu) => tu.poloId === filtroPolo)
    if (filtroLocal) t = t.filter((tu) => tu.localId === filtroLocal)
    return t
  }, [filtroPolo, filtroLocal])

  // Monta lista de alunas com pendência
  const alunasPendentes: AlunaPendente[] = useMemo(() => {
    return alunas
      .map((aluna) => {
        const turma = turmas.find((t) => t.id === aluna.turmaId)
        const polo = polos.find((p) => p.id === turma?.poloId)
        const local = locais.find((l) => l.id === turma?.localId)
        const mesesPendentes = pagamentosAlunas.filter(
          (p) => p.alunaId === aluna.id && p.status === "Pendente"
        )
        const totalPendente = mesesPendentes.reduce((s, p) => s + p.valor, 0)
        return { aluna, turma, polo, local, mesesPendentes, totalPendente }
      })
      .filter((ap) => ap.mesesPendentes.length > 0)
  }, [])

  // Aplica filtros
  const resultados = useMemo(() => {
    return alunasPendentes.filter((ap) => {
      if (filtroPolo && ap.polo?.id !== filtroPolo) return false
      if (filtroLocal && ap.local?.id !== filtroLocal) return false
      if (filtroTurma && ap.turma?.id !== filtroTurma) return false
      if (busca && !ap.aluna.nome.toLowerCase().includes(busca.toLowerCase())) return false
      return true
    })
  }, [alunasPendentes, filtroPolo, filtroLocal, filtroTurma, busca])

  const totalPendenteGeral = resultados.reduce((s, ap) => s + ap.totalPendente, 0)
  const totalSelecionado = resultados
    .filter((ap) => selecionadas.has(ap.aluna.id))
    .reduce((s, ap) => s + ap.totalPendente, 0)

  function toggleSelecionada(id: string) {
    setSelecionadas((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function selecionarTodas() {
    if (selecionadas.size === resultados.length) {
      setSelecionadas(new Set())
    } else {
      setSelecionadas(new Set(resultados.map((ap) => ap.aluna.id)))
    }
  }

  function marcarCobrada(id: string) {
    setCobradaIds((prev) => new Set([...prev, id]))
  }

  function handleCobrarTodas() {
    // Abre WhatsApp para cada selecionada em sequencia (simulado via modal)
    setIsCobrarTodosModal(true)
  }

  return (
    <div className="min-h-screen bg-(--color-background-secondary)">
      <MobileHeader title="Cobranças" />

      <main className="px-4 pb-6 space-y-4">
        {/* Resumo */}
        <section className="pt-4 grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl border border-(--color-border) p-4">
            <p className="text-xs text-(--color-foreground-secondary) mb-1">Total Pendente</p>
            <p className="text-xl font-bold text-amber-600">{formatCurrency(totalPendenteGeral)}</p>
            <p className="text-xs text-(--color-foreground-secondary) mt-1">{alunasPendentes.length} alunas</p>
          </div>
          <div className="bg-white rounded-xl border border-(--color-border) p-4">
            <p className="text-xs text-(--color-foreground-secondary) mb-1">Filtradas</p>
            <p className="text-xl font-bold text-(--color-foreground)">{resultados.length}</p>
            <p className="text-xs text-(--color-foreground-secondary) mt-1">
              {formatCurrency(resultados.reduce((s, ap) => s + ap.totalPendente, 0))}
            </p>
          </div>
        </section>

        {/* Filtros em cascata */}
        <section className="bg-white rounded-xl border border-(--color-border) p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-(--color-foreground)">
            <Filter className="w-4 h-4" />
            Filtros
          </div>

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-foreground-secondary)" />
            <input
              type="text"
              placeholder="Buscar aluna..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-(--color-border) rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
            />
          </div>

          {/* Polo */}
          <select
            value={filtroPolo}
            onChange={(e) => { setFiltroPolo(e.target.value); setFiltroLocal(""); setFiltroTurma("") }}
            className="w-full px-3 py-2 border border-(--color-border) rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary) bg-white"
          >
            <option value="">Todos os polos</option>
            {polos.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          {/* Local */}
          <select
            value={filtroLocal}
            onChange={(e) => { setFiltroLocal(e.target.value); setFiltroTurma("") }}
            disabled={!filtroPolo}
            className="w-full px-3 py-2 border border-(--color-border) rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary) bg-white disabled:opacity-40"
          >
            <option value="">Todos os locais</option>
            {locaisFiltrados.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>

          {/* Turma */}
          <select
            value={filtroTurma}
            onChange={(e) => setFiltroTurma(e.target.value)}
            disabled={!filtroPolo}
            className="w-full px-3 py-2 border border-(--color-border) rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary) bg-white disabled:opacity-40"
          >
            <option value="">Todas as turmas</option>
            {turmasFiltradas.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </section>

        {/* Ações em massa */}
        {resultados.length > 0 && (
          <section className="bg-white rounded-xl border border-(--color-border) p-4 space-y-3">
            <div className="flex items-center justify-between">
              <button
                onClick={selecionarTodas}
                className="flex items-center gap-2 text-sm font-medium text-(--color-primary) hover:underline"
              >
                <CheckSquare className="w-4 h-4" />
                {selecionadas.size === resultados.length ? "Desmarcar todas" : "Selecionar todas"}
              </button>
              <span className="text-xs text-(--color-foreground-secondary)">
                {selecionadas.size} selecionadas
              </span>
            </div>

            {selecionadas.size > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-amber-900">{selecionadas.size} alunas</p>
                  <p className="text-xs text-amber-700">{formatCurrency(totalSelecionado)} total</p>
                </div>
                <button
                  onClick={handleCobrarTodas}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Cobrar selecionadas
                </button>
              </div>
            )}
          </section>
        )}

        {/* Lista de alunas pendentes */}
        <section className="space-y-2">
          {resultados.length === 0 ? (
            <div className="bg-white rounded-xl border border-(--color-border) p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="font-semibold text-(--color-foreground)">Nenhuma pendencia encontrada</p>
              <p className="text-sm text-(--color-foreground-secondary) mt-1">
                Todos os filtros selecionados estao em dia.
              </p>
            </div>
          ) : (
            resultados.map((ap) => {
              const isCobrada = cobradaIds.has(ap.aluna.id)
              const isSelecionada = selecionadas.has(ap.aluna.id)

              return (
                <div
                  key={ap.aluna.id}
                  className={`bg-white rounded-xl border transition-all ${
                    isSelecionada
                      ? "border-(--color-primary) ring-1 ring-(--color-primary)"
                      : "border-(--color-border)"
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleSelecionada(ap.aluna.id)}
                        className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelecionada
                            ? "bg-(--color-primary) border-(--color-primary)"
                            : "border-gray-300 hover:border-(--color-primary)"
                        }`}
                      >
                        {isSelecionada && <CheckCircle className="w-3 h-3 text-gray-900" />}
                      </button>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-(--color-foreground) truncate">{ap.aluna.nome}</p>
                            <p className="text-xs text-(--color-foreground-secondary) truncate">
                              {ap.turma?.name} • {ap.polo?.name}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-amber-600">{formatCurrency(ap.totalPendente)}</p>
                            <div className="flex items-center gap-1 justify-end mt-0.5">
                              <Clock className="w-3 h-3 text-amber-500" />
                              <span className="text-xs text-amber-600">
                                {ap.mesesPendentes.length} mes{ap.mesesPendentes.length > 1 ? "es" : ""}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Meses pendentes */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {ap.mesesPendentes.map((p) => {
                            const [y, m] = p.mesReferencia.split("-")
                            const nome = new Date(Number(y), Number(m) - 1).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })
                            return (
                              <span key={p.id} className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded font-medium">
                                {nome}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Acoes */}
                    <div className="flex items-center gap-2 mt-3">
                      <Link
                        href={`/admin/alunas/${ap.aluna.id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-(--color-border) rounded-lg text-xs font-semibold text-(--color-foreground) hover:bg-(--color-background-secondary) transition-colors"
                      >
                        <Users className="w-3.5 h-3.5" />
                        Ver ficha
                        <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                      </Link>

                      <a
                        href={encodeWhatsApp(ap)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => marcarCobrada(ap.aluna.id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                          isCobrada
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        {isCobrada ? "Cobrado" : "Cobrar"}
                      </a>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </section>
      </main>

      {/* Modal cobrar todos selecionados */}
      <Modal
        isOpen={isCobrarTodosModal}
        onClose={() => setIsCobrarTodosModal(false)}
        title="Cobrar selecionadas"
      >
        <div className="space-y-4">
          <div className="bg-(--color-background-secondary) rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <div>
                <p className="font-semibold text-(--color-foreground)">{selecionadas.size} alunas selecionadas</p>
                <p className="text-sm text-(--color-foreground-secondary)">Total: {formatCurrency(totalSelecionado)}</p>
              </div>
            </div>
            <p className="text-sm text-(--color-foreground-secondary)">
              Sera aberto o WhatsApp para cada responsavel individualmente. Confirme e envie a mensagem para cada um.
            </p>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {resultados
              .filter((ap) => selecionadas.has(ap.aluna.id))
              .map((ap) => (
                <a
                  key={ap.aluna.id}
                  href={encodeWhatsApp(ap)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => marcarCobrada(ap.aluna.id)}
                  className={`flex items-center justify-between p-3 rounded-lg border text-sm transition-colors ${
                    cobradaIds.has(ap.aluna.id)
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-white border-(--color-border) text-(--color-foreground) hover:bg-(--color-background-secondary)"
                  }`}
                >
                  <div>
                    <p className="font-medium">{ap.aluna.nome}</p>
                    <p className="text-xs opacity-70">{ap.aluna.responsavel.whatsapp}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{formatCurrency(ap.totalPendente)}</span>
                    {cobradaIds.has(ap.aluna.id) ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Send className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                </a>
              ))}
          </div>

          <button
            onClick={() => { setIsCobrarTodosModal(false); setSelecionadas(new Set()) }}
            className="w-full py-2.5 bg-(--color-primary) text-gray-900 rounded-lg font-semibold hover:bg-(--color-primary-hover) transition-colors"
          >
            Concluir
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={isConfirmModal}
        onClose={() => setIsConfirmModal(false)}
        title="Cobrar aluna"
      >
        {cobrandoAluna && (
          <div className="space-y-4">
            <p className="text-sm text-(--color-foreground-secondary)">
              Enviar cobrança para o responsavel de <strong>{cobrandoAluna.aluna.nome}</strong>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsConfirmModal(false)}
                className="flex-1 py-2.5 border border-(--color-border) rounded-lg font-semibold text-(--color-foreground)"
              >
                Cancelar
              </button>
              <a
                href={encodeWhatsApp(cobrandoAluna)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => { marcarCobrada(cobrandoAluna.aluna.id); setIsConfirmModal(false) }}
                className="flex-1 py-2.5 bg-green-600 text-white rounded-lg font-semibold text-center hover:bg-green-700 transition-colors"
              >
                Abrir WhatsApp
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
