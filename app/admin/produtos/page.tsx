"use client"

import { useState, useMemo } from "react"
import { MobileHeader } from "@/components/layout/mobile-header"
import { Modal } from "@/components/ui/modal"
import {
  ShoppingBag, Plus, Pencil, Trash2, Search, Eye, EyeOff,
  Tag, ExternalLink, ToggleLeft, ToggleRight
} from "lucide-react"
import Link from "next/link"
import { produtos as produtosIniciais } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"
import type { Produto } from "@/lib/types"

const categorias: Produto["categoria"][] = ["Roupa", "Sapatilha", "Equipamento", "Uniforme", "Acessório", "Outro"]

export default function AdminProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>(produtosIniciais)
  const [busca, setBusca] = useState("")
  const [filtroCategoria, setFiltroCategoria] = useState("")
  const [filtroDisponivel, setFiltroDisponivel] = useState("")

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModal, setIsDeleteModal] = useState(false)
  const [produtoAtual, setProdutoAtual] = useState<Produto | null>(null)

  const [form, setForm] = useState<Partial<Produto>>({
    nome: "", descricao: "", valor: 0, categoria: "Uniforme",
    disponivel: true, tamanhos: [],
  })
  const [tamanhoInput, setTamanhoInput] = useState("")

  const resultados = useMemo(() => {
    return produtos.filter((p) => {
      if (busca && !p.nome.toLowerCase().includes(busca.toLowerCase())) return false
      if (filtroCategoria && p.categoria !== filtroCategoria) return false
      if (filtroDisponivel === "sim" && !p.disponivel) return false
      if (filtroDisponivel === "nao" && p.disponivel) return false
      return true
    })
  }, [produtos, busca, filtroCategoria, filtroDisponivel])

  function abrirAdicionar() {
    setProdutoAtual(null)
    setForm({ nome: "", descricao: "", valor: 0, categoria: "Uniforme", disponivel: true, tamanhos: [] })
    setTamanhoInput("")
    setIsModalOpen(true)
  }

  function abrirEditar(p: Produto) {
    setProdutoAtual(p)
    setForm({ ...p, tamanhos: p.tamanhos ? [...p.tamanhos] : [] })
    setTamanhoInput("")
    setIsModalOpen(true)
  }

  function abrirExcluir(p: Produto) {
    setProdutoAtual(p)
    setIsDeleteModal(true)
  }

  function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (produtoAtual) {
      setProdutos((prev) =>
        prev.map((p) => p.id === produtoAtual.id ? { ...produtoAtual, ...form } as Produto : p)
      )
    } else {
      const novo: Produto = {
        id: Date.now().toString(),
        nome: form.nome!,
        descricao: form.descricao!,
        valor: Number(form.valor),
        categoria: form.categoria!,
        disponivel: form.disponivel ?? true,
        tamanhos: form.tamanhos,
        createdAt: new Date(),
      }
      setProdutos((prev) => [novo, ...prev])
    }
    setIsModalOpen(false)
  }

  function excluir() {
    if (produtoAtual) {
      setProdutos((prev) => prev.filter((p) => p.id !== produtoAtual.id))
    }
    setIsDeleteModal(false)
  }

  function toggleDisponivel(p: Produto) {
    setProdutos((prev) =>
      prev.map((pp) => pp.id === p.id ? { ...pp, disponivel: !pp.disponivel } : pp)
    )
  }

  function adicionarTamanho() {
    const t = tamanhoInput.trim()
    if (t && !form.tamanhos?.includes(t)) {
      setForm((f) => ({ ...f, tamanhos: [...(f.tamanhos || []), t] }))
      setTamanhoInput("")
    }
  }

  function removerTamanho(t: string) {
    setForm((f) => ({ ...f, tamanhos: (f.tamanhos || []).filter((x) => x !== t) }))
  }

  const disponiveisCount = produtos.filter((p) => p.disponivel).length
  const indisponiveisCount = produtos.filter((p) => !p.disponivel).length

  return (
    <div className="min-h-screen bg-(--color-background-secondary)">
      <MobileHeader title="Produtos" />

      <main className="px-4 pb-6 space-y-4">
        {/* Resumo */}
        <section className="pt-4 grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-(--color-border) p-3 text-center">
            <p className="text-2xl font-bold text-(--color-foreground)">{produtos.length}</p>
            <p className="text-xs text-(--color-foreground-secondary)">Total</p>
          </div>
          <div className="bg-white rounded-xl border border-(--color-border) p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{disponiveisCount}</p>
            <p className="text-xs text-(--color-foreground-secondary)">Disponíveis</p>
          </div>
          <div className="bg-white rounded-xl border border-(--color-border) p-3 text-center">
            <p className="text-2xl font-bold text-gray-400">{indisponiveisCount}</p>
            <p className="text-xs text-(--color-foreground-secondary)">Indisp.</p>
          </div>
        </section>

        {/* Link para vitrine */}
        <Link
          href="/produtos"
          target="_blank"
          className="flex items-center justify-between bg-(--color-primary-light) border border-(--color-primary) rounded-xl px-4 py-3"
        >
          <div>
            <p className="text-sm font-semibold text-(--color-primary)">Ver Vitrine Pública</p>
            <p className="text-xs text-(--color-foreground-secondary)">Como os pais enxergam os produtos</p>
          </div>
          <ExternalLink className="w-5 h-5 text-(--color-primary)" />
        </Link>

        {/* Filtros */}
        <section className="bg-white rounded-xl border border-(--color-border) p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-foreground-secondary)" />
            <input
              type="text"
              placeholder="Buscar produto..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-(--color-border) rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="px-3 py-2 border border-(--color-border) rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary) bg-white"
            >
              <option value="">Todas as categorias</option>
              {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={filtroDisponivel}
              onChange={(e) => setFiltroDisponivel(e.target.value)}
              className="px-3 py-2 border border-(--color-border) rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary) bg-white"
            >
              <option value="">Todos</option>
              <option value="sim">Disponíveis</option>
              <option value="nao">Indisponíveis</option>
            </select>
          </div>
        </section>

        {/* Botão adicionar */}
        <button
          onClick={abrirAdicionar}
          className="w-full flex items-center justify-center gap-2 py-3 bg-(--color-primary) text-gray-900 rounded-xl font-bold hover:bg-(--color-primary-hover) transition-colors"
        >
          <Plus className="w-5 h-5" />
          Adicionar Produto
        </button>

        {/* Lista de produtos */}
        <section className="space-y-2">
          {resultados.length === 0 ? (
            <div className="bg-white rounded-xl border border-(--color-border) p-8 text-center">
              <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="font-medium text-(--color-foreground-secondary)">Nenhum produto encontrado</p>
            </div>
          ) : (
            resultados.map((produto) => (
              <div
                key={produto.id}
                className={`bg-white rounded-xl border border-(--color-border) p-4 transition-opacity ${!produto.disponivel ? "opacity-60" : ""}`}
              >
                <div className="flex items-start gap-3">
                  {/* Icone categoria */}
                  <div className="w-10 h-10 rounded-lg bg-(--color-primary-light) flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-5 h-5 text-(--color-primary)" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-(--color-foreground) truncate">{produto.nome}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                            <Tag className="w-3 h-3" />
                            {produto.categoria}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${produto.disponivel ? "bg-green-500" : "bg-gray-400"}`} />
                          <span className="text-xs text-(--color-foreground-secondary)">
                            {produto.disponivel ? "Disponível" : "Indisponível"}
                          </span>
                        </div>
                      </div>
                      <p className="font-bold text-(--color-foreground) flex-shrink-0">{formatCurrency(produto.valor)}</p>
                    </div>

                    <p className="text-xs text-(--color-foreground-secondary) mt-1.5 line-clamp-2">
                      {produto.descricao}
                    </p>

                    {produto.tamanhos && produto.tamanhos.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {produto.tamanhos.map((t) => (
                          <span key={t} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Acoes */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => toggleDisponivel(produto)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      produto.disponivel
                        ? "border-gray-200 text-gray-600 hover:bg-gray-50"
                        : "border-green-200 text-green-700 hover:bg-green-50"
                    }`}
                  >
                    {produto.disponivel ? (
                      <><EyeOff className="w-3.5 h-3.5" /> Desativar</>
                    ) : (
                      <><Eye className="w-3.5 h-3.5" /> Ativar</>
                    )}
                  </button>
                  <button
                    onClick={() => abrirEditar(produto)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-(--color-border) text-(--color-foreground) hover:bg-(--color-background-secondary) transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Editar
                  </button>
                  <button
                    onClick={() => abrirExcluir(produto)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      </main>

      {/* Modal adicionar / editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={produtoAtual ? "Editar Produto" : "Adicionar Produto"}
      >
        <form onSubmit={salvar} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Nome do Produto</label>
            <input
              type="text"
              value={form.nome || ""}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              placeholder="Ex: Collant Oficial"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Descricao</label>
            <textarea
              value={form.descricao || ""}
              onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary) resize-none"
              placeholder="Descreva o produto..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.valor || ""}
                onChange={(e) => setForm((f) => ({ ...f, valor: Number(e.target.value) }))}
                className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Categoria</label>
              <select
                value={form.categoria}
                onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value as Produto["categoria"] }))}
                className="w-full px-3 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary) bg-white"
              >
                {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Tamanhos */}
          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">
              Tamanhos (opcional)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tamanhoInput}
                onChange={(e) => setTamanhoInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), adicionarTamanho())}
                className="flex-1 px-3 py-2 border border-(--color-border) rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
                placeholder="Ex: P, M, G ou 34..."
              />
              <button
                type="button"
                onClick={adicionarTamanho}
                className="px-3 py-2 bg-(--color-primary) text-gray-900 rounded-lg text-sm font-semibold hover:bg-(--color-primary-hover)"
              >
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(form.tamanhos || []).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => removerTamanho(t)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-(--color-primary-light) text-(--color-primary) text-xs rounded-full font-medium hover:bg-red-100 hover:text-red-600 transition-colors"
                >
                  {t} ×
                </button>
              ))}
            </div>
          </div>

          {/* Disponivel */}
          <div className="flex items-center justify-between p-3 bg-(--color-background-secondary) rounded-lg">
            <div>
              <p className="text-sm font-medium text-(--color-foreground)">Disponível na vitrine</p>
              <p className="text-xs text-(--color-foreground-secondary)">Os pais poderão ver este produto</p>
            </div>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, disponivel: !f.disponivel }))}
              className="text-(--color-primary)"
            >
              {form.disponivel ? (
                <ToggleRight className="w-8 h-8" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-gray-400" />
              )}
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2.5 border border-(--color-border) rounded-lg font-semibold text-(--color-foreground) hover:bg-(--color-background-secondary)"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-(--color-primary) text-gray-900 rounded-lg font-semibold hover:bg-(--color-primary-hover)"
            >
              Salvar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal excluir */}
      <Modal isOpen={isDeleteModal} onClose={() => setIsDeleteModal(false)} title="Excluir Produto">
        <div className="space-y-4">
          <p className="text-(--color-foreground-secondary)">
            Tem certeza que deseja excluir <strong>{produtoAtual?.nome}</strong>? Esta acao nao pode ser desfeita.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setIsDeleteModal(false)}
              className="flex-1 px-4 py-2.5 border border-(--color-border) rounded-lg font-semibold text-(--color-foreground)"
            >
              Cancelar
            </button>
            <button
              onClick={excluir}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
            >
              Excluir
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
