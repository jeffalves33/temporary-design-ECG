"use client"

import { useState } from "react"
import Image from "next/image"
import { ShoppingBag, MessageCircle, Filter, Tag, ChevronRight } from "lucide-react"
import { produtos, configuracaoCora } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"
import type { Produto } from "@/lib/types"
import { PublicHeader } from "@/components/layout/public-header"

const categorias = ["Todos", "Uniforme", "Sapatilha", "Equipamento", "Roupa", "Acessório", "Outro"] as const

function encodeWhatsAppMsg(produto: Produto, whatsapp: string) {
  const msg = encodeURIComponent(
    `Olá! Tenho interesse no produto: *${produto.nome}* (${formatCurrency(produto.valor)}). Poderia me dar mais informações?`
  )
  const num = whatsapp.replace(/\D/g, "")
  return `https://wa.me/55${num}?text=${msg}`
}

export default function ProdutosPublicPage() {
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>("Todos")

  const produtosFiltrados = categoriaAtiva === "Todos"
    ? produtos
    : produtos.filter((p) => p.categoria === categoriaAtiva)

  const disponiveisFiltrados = produtosFiltrados.filter((p) => p.disponivel)
  const indisponiveisFiltrados = produtosFiltrados.filter((p) => !p.disponivel)

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader subtitle="Loja de Produtos" />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Hero */}
        <section className="bg-[#9EF01A] rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <ShoppingBag className="w-8 h-8 text-gray-900 flex-shrink-0 mt-0.5" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Nossos Produtos</h1>
              <p className="text-sm text-gray-700 mt-1">
                Tudo que sua filha precisa para a ginastica ritmica. Clique no produto e fale conosco pelo WhatsApp para comprar!
              </p>
            </div>
          </div>
        </section>

        {/* Filtro de categorias */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaAtiva(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                categoriaAtiva === cat
                  ? "bg-[#9EF01A] text-gray-900 border-[#9EF01A]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Produtos disponíveis */}
        {disponiveisFiltrados.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-bold text-gray-900">Disponíveis ({disponiveisFiltrados.length})</h2>
            <div className="space-y-3">
              {disponiveisFiltrados.map((produto) => (
                <div
                  key={produto.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
                >
                  {/* Top */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-[#9EF01A]/20 text-gray-700 text-xs font-medium rounded-full flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {produto.categoria}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-green-500" title="Disponível" />
                      </div>
                      <h3 className="font-bold text-gray-900 text-base leading-tight">{produto.nome}</h3>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-400">Valor</p>
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(produto.valor)}</p>
                    </div>
                  </div>

                  {/* Descricao */}
                  <p className="text-sm text-gray-500 mb-3 leading-relaxed">{produto.descricao}</p>

                  {/* Tamanhos */}
                  {produto.tamanhos && produto.tamanhos.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-500 mb-1.5">Tamanhos disponíveis:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {produto.tamanhos.map((t) => (
                          <span key={t} className="px-2.5 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md border border-gray-200">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Botão WhatsApp */}
                  <a
                    href={encodeWhatsAppMsg(produto, configuracaoCora.whatsappAdmin)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-500 text-white rounded-lg font-semibold text-sm hover:bg-green-600 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Tenho interesse — WhatsApp
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Produtos indisponíveis */}
        {indisponiveisFiltrados.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-bold text-gray-500 text-sm">Temporariamente indisponíveis</h2>
            <div className="space-y-2">
              {indisponiveisFiltrados.map((produto) => (
                <div
                  key={produto.id}
                  className="bg-gray-50 rounded-xl border border-gray-200 p-4 opacity-60"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="w-2 h-2 rounded-full bg-gray-400" />
                        <span className="text-xs text-gray-500">{produto.categoria}</span>
                      </div>
                      <h3 className="font-semibold text-gray-600">{produto.nome}</h3>
                    </div>
                    <p className="font-bold text-gray-500">{formatCurrency(produto.valor)}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Indisponível no momento</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {disponiveisFiltrados.length === 0 && indisponiveisFiltrados.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Nenhum produto nesta categoria.</p>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-xs text-gray-400 pb-4 space-y-1">
          <p>Equipe Carolina Garcia &bull; Ginastica Ritmica</p>
          <a
            href={`https://wa.me/55${configuracaoCora.whatsappAdmin.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-green-600 font-medium hover:underline"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Fale conosco no WhatsApp
          </a>
        </footer>
      </main>
    </div>
  )
}
