"use client"

import { useState } from "react"
import Image from "next/image"
import { Search, CheckCircle, AlertCircle, Clock, QrCode, Copy, ExternalLink, ChevronDown, ChevronUp } from "lucide-react"
import { alunas, turmas, pagamentosAlunas, configuracaoCora } from "@/lib/mock-data"
import { formatCurrency, formatDate } from "@/lib/utils"
import { PublicHeader } from "@/components/layout/public-header"

function normalizeString(s: string) {
  return s.replace(/\D/g, "")
}

export default function PagamentosPublicPage() {
  const [cpfInput, setCpfInput] = useState("")
  const [buscado, setBuscado] = useState(false)
  const [alunaEncontrada, setAlunaEncontrada] = useState<typeof alunas[0] | null>(null)
  const [expandedPagamento, setExpandedPagamento] = useState<string | null>(null)
  const [pixCopiado, setPixCopiado] = useState(false)

  // CPFs mockados por aluna para simulação
  const cpfPorAluna: Record<string, string> = {
    "1": "11122233344",
    "2": "22233344455",
    "3": "33344455566",
    "4": "44455566677",
    "5": "55566677788",
    "6": "66677788899",
    "7": "77788899900",
    "8": "88899900011",
  }

  function handleBusca(e: React.FormEvent) {
    e.preventDefault()
    const cpfNorm = normalizeString(cpfInput)
    const entry = Object.entries(cpfPorAluna).find(([, cpf]) => cpf === cpfNorm)
    if (entry) {
      const aluna = alunas.find((a) => a.id === entry[0]) || null
      setAlunaEncontrada(aluna)
    } else {
      setAlunaEncontrada(null)
    }
    setBuscado(true)
  }

  function formatCpf(value: string) {
    const num = value.replace(/\D/g, "").slice(0, 11)
    return num
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
  }

  function copiarPix() {
    navigator.clipboard.writeText(configuracaoCora.chavePix || "00.000.000/0001-00")
    setPixCopiado(true)
    setTimeout(() => setPixCopiado(false), 2000)
  }

  const turma = alunaEncontrada ? turmas.find((t) => t.id === alunaEncontrada.turmaId) : null
  const pagamentos = alunaEncontrada
    ? pagamentosAlunas
        .filter((p) => p.alunaId === alunaEncontrada.id)
        .sort((a, b) => b.mesReferencia.localeCompare(a.mesReferencia))
    : []
  const pendentes = pagamentos.filter((p) => p.status === "Pendente")
  const totalPendente = pendentes.reduce((sum, p) => sum + p.valor, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader subtitle="Portal de Pagamentos" />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Busca por CPF */}
        <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Consultar Pagamentos</h1>
          <p className="text-sm text-gray-500 mb-4">
            Digite o CPF da aluna para consultar mensalidades e realizar pagamentos pendentes.
          </p>

          <form onSubmit={handleBusca} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">CPF da Aluna</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={cpfInput}
                  onChange={(e) => setCpfInput(formatCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9EF01A] text-lg tracking-wider"
                  maxLength={14}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#9EF01A] text-gray-900 rounded-lg font-bold text-base hover:bg-[#8AD915] transition-colors"
            >
              Consultar
            </button>
          </form>

          {/* CPFs de exemplo para demo */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-xs font-medium text-gray-600 mb-1">CPFs de exemplo (demonstracao):</p>
            <p className="text-xs text-gray-500">Sofia: 111.222.333-44</p>
            <p className="text-xs text-gray-500">Isabella (pendente): 222.333.444-55</p>
            <p className="text-xs text-gray-500">Valentina (pendente): 444.555.666-77</p>
          </div>
        </section>

        {/* Resultado da busca */}
        {buscado && !alunaEncontrada && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
            <p className="font-semibold text-red-800">CPF nao encontrado</p>
            <p className="text-sm text-red-600 mt-1">Verifique o CPF digitado ou entre em contato com a escola.</p>
          </div>
        )}

        {buscado && alunaEncontrada && (
          <>
            {/* Info da aluna */}
            <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#9EF01A] flex items-center justify-center text-gray-900 text-xl font-bold">
                  {alunaEncontrada.nome.charAt(0)}
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">{alunaEncontrada.nome}</h2>
                  <p className="text-sm text-gray-500">{turma?.name} • {turma?.nivel}</p>
                </div>
              </div>

              {/* Status geral */}
              {pendentes.length === 0 ? (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-800">Mensalidades em dia!</p>
                    <p className="text-xs text-green-600">Nenhuma pendencia encontrada.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-amber-800">
                      {pendentes.length} mensalidade{pendentes.length > 1 ? "s" : ""} pendente{pendentes.length > 1 ? "s" : ""}
                    </p>
                    <p className="text-sm font-bold text-amber-700">Total: {formatCurrency(totalPendente)}</p>
                  </div>
                </div>
              )}
            </section>

            {/* Pagamentos pendentes com PIX */}
            {pendentes.length > 0 && (
              <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-900 text-lg">Pagar com PIX</h3>

                {/* Total consolidado */}
                <div className="bg-[#9EF01A]/10 border border-[#9EF01A]/40 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Valor total a pagar</p>
                  <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalPendente)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {pendentes.length} mensalidade{pendentes.length > 1 ? "s" : ""}
                  </p>
                </div>

                {/* Chave PIX */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Chave PIX</p>
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <QrCode className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    <span className="flex-1 font-mono text-sm text-gray-800 truncate">
                      {configuracaoCora.chavePix || "00.000.000/0001-00 (CNPJ)"}
                    </span>
                    <button
                      onClick={copiarPix}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#9EF01A] text-gray-900 rounded-md text-xs font-semibold hover:bg-[#8AD915] transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {pixCopiado ? "Copiado!" : "Copiar"}
                    </button>
                  </div>
                </div>

                {/* Instrucoes */}
                <ol className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#9EF01A] text-gray-900 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                    <span>Abra o aplicativo do seu banco e escolha pagar com PIX.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#9EF01A] text-gray-900 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                    <span>Cole a chave PIX acima ou escaneie o QR Code.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#9EF01A] text-gray-900 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                    <span>Informe o valor <strong>{formatCurrency(totalPendente)}</strong> e confirme o pagamento.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#9EF01A] text-gray-900 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                    <span>O pagamento sera confirmado automaticamente em ate 1 hora.</span>
                  </li>
                </ol>

                {/* Link de pagamento Cora (futuro) */}
                <button
                  disabled
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-400 font-medium cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Link de Pagamento Online (em breve - Banco Cora)
                </button>
              </section>
            )}

            {/* Historico completo */}
            <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 text-lg mb-3">Historico de Pagamentos</h3>
              <div className="space-y-2">
                {pagamentos.map((pag) => {
                  const [year, month] = pag.mesReferencia.split("-")
                  const monthName = new Date(Number.parseInt(year), Number.parseInt(month) - 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
                  const isOpen = expandedPagamento === pag.id

                  return (
                    <div key={pag.id} className="border border-gray-100 rounded-lg overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                        onClick={() => setExpandedPagamento(isOpen ? null : pag.id)}
                      >
                        <div className="flex items-center gap-3">
                          {pag.status === "Pago" ? (
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          )}
                          <span className="font-medium text-gray-800 capitalize text-sm">{monthName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm">{formatCurrency(pag.valor)}</span>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${pag.status === "Pago" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                            {pag.status}
                          </span>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </div>
                      </button>
                      {isOpen && pag.dataPagamento && (
                        <div className="px-3 pb-3 text-xs text-gray-500">
                          Pago em {formatDate(pag.dataPagamento)}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          </>
        )}

        {/* Footer */}
        <footer className="text-center text-xs text-gray-400 pb-4">
          <p>Equipe Carolina Garcia &bull; Ginastica Ritmica</p>
          <p className="mt-1">Em caso de duvidas, entre em contato pelo WhatsApp.</p>
        </footer>
      </main>
    </div>
  )
}
