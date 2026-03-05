"use client"

import { useState } from "react"
import { MobileHeader } from "@/components/layout/mobile-header"
import { SearchInput } from "@/components/ui/search-input"
import { Modal } from "@/components/ui/modal"
import {
  Plus, Users, AlertCircle, Edit, Trash2, ChevronRight,
  CheckCircle, Receipt, ClipboardList, Clock, Check, X,
  MapPin, Phone, Mail, User as UserIcon, Calendar,
} from "lucide-react"
import { polos, locais, turmas, alunas, pagamentosAlunas, preMatriculas } from "@/lib/mock-data"
import { calculateAge, formatCurrency } from "@/lib/utils"
import Link from "next/link"
import type { Aluna, PreMatricula } from "@/lib/types"

const inputCls = "w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary) text-sm bg-white"
const labelCls = "block text-sm font-medium text-(--color-foreground) mb-1.5"
const sectionTitle = "font-semibold text-(--color-foreground) text-sm border-b border-(--color-border) pb-1 mb-3"

type Aba = "alunas" | "pre-matriculas"

export default function AlunasPage() {
  const [aba, setAba] = useState<Aba>("alunas")

  // ─── estados aba Alunas ───
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredPolo, setFilteredPolo] = useState("")
  const [filteredLocal, setFilteredLocal] = useState("")
  const [filteredTurma, setFilteredTurma] = useState("")
  const [filteredStatus, setFilteredStatus] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedAluna, setSelectedAluna] = useState<Aluna | null>(null)
  const [formTurmaId, setFormTurmaId] = useState("")
  const [formPolo, setFormPolo] = useState("")
  const [formLocal, setFormLocal] = useState("")

  // ─── estados aba Pré-Matrículas ───
  const [pmSearch, setPmSearch] = useState("")
  const [pmStatus, setPmStatus] = useState("")
  const [selectedPm, setSelectedPm] = useState<PreMatricula | null>(null)
  const [isPmDetailOpen, setIsPmDetailOpen] = useState(false)
  const [isPmConvertOpen, setIsPmConvertOpen] = useState(false)

  // pré-matrículas locais (em produção seria state real)
  const [pmList, setPmList] = useState<PreMatricula[]>(preMatriculas)

  const turmaSelecionadaForm = turmas.find((t) => t.id === formTurmaId)

  const getPendencias = (alunaId: string) =>
    pagamentosAlunas.filter((p) => p.alunaId === alunaId && p.status === "Pendente").length

  const locaisDisponiveis = filteredPolo ? locais.filter((l) => l.poloId === filteredPolo) : locais
  const turmasDisponiveis = filteredLocal
    ? turmas.filter((t) => t.localId === filteredLocal)
    : filteredPolo
      ? turmas.filter((t) => t.poloId === filteredPolo)
      : turmas

  const locaisForm = formPolo ? locais.filter((l) => l.poloId === formPolo) : []
  const turmasForm = formLocal
    ? turmas.filter((t) => t.localId === formLocal)
    : formPolo
      ? turmas.filter((t) => t.poloId === formPolo)
      : turmas

  const filteredAlunas = alunas.filter((aluna) => {
    const turma = turmas.find((t) => t.id === aluna.turmaId)
    const matchesSearch =
      aluna.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      aluna.responsavel.nome.toLowerCase().includes(searchQuery.toLowerCase())
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

  const filteredPms = pmList.filter((pm) => {
    const q = pmSearch.toLowerCase()
    const matchesSearch =
      pm.nomeAluna.toLowerCase().includes(q) ||
      pm.nomeResponsavel.toLowerCase().includes(q) ||
      pm.email.toLowerCase().includes(q)
    const matchesStatus = !pmStatus || pm.status === pmStatus
    return matchesSearch && matchesStatus
  })

  const pmPendentes = pmList.filter((p) => p.status === "pendente").length

  const resetForm = () => {
    setFormPolo("")
    setFormLocal("")
    setFormTurmaId("")
  }

  const handleReprovarPm = (id: string) => {
    setPmList((prev) => prev.map((pm) => pm.id === id ? { ...pm, status: "reprovada" as const } : pm))
    setIsPmDetailOpen(false)
  }

  // ─── helpers ───
  const formatDate = (d: Date | string) => {
    const date = typeof d === "string" ? new Date(d) : d
    return date.toLocaleDateString("pt-BR")
  }

  const calcIdade = (dataNasc: string) => {
    const hoje = new Date()
    const nasc = new Date(dataNasc)
    let idade = hoje.getFullYear() - nasc.getFullYear()
    const m = hoje.getMonth() - nasc.getMonth()
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--
    return idade
  }

  const statusBadgePm = (status: string) => {
    if (status === "pendente") return "bg-amber-100 text-amber-700"
    if (status === "aprovada") return "bg-green-100 text-green-700"
    return "bg-red-100 text-red-600"
  }

  const statusLabelPm = (status: string) => {
    if (status === "pendente") return "Pendente"
    if (status === "aprovada") return "Aprovada"
    return "Reprovada"
  }

  return (
    <div className="min-h-screen bg-(--color-background-secondary)">
      <MobileHeader title="Alunas" />

      {/* ─── ABAS ─── */}
      <div className="bg-white border-b border-(--color-border) px-4">
        <div className="flex gap-0">
          <button
            onClick={() => setAba("alunas")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
              aba === "alunas"
                ? "border-(--color-primary) text-(--color-primary)"
                : "border-transparent text-(--color-foreground-secondary) hover:text-(--color-foreground)"
            }`}
          >
            <Users className="w-4 h-4" />
            Alunas
          </button>
          <button
            onClick={() => setAba("pre-matriculas")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
              aba === "pre-matriculas"
                ? "border-(--color-primary) text-(--color-primary)"
                : "border-transparent text-(--color-foreground-secondary) hover:text-(--color-foreground)"
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Pré-Matrículas
            {pmPendentes > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-(--color-primary) text-white leading-none">
                {pmPendentes}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* ABA: ALUNAS                                 */}
      {/* ═══════════════════════════════════════════ */}
      {aba === "alunas" && (
        <main className="px-4 pb-6 space-y-4">
          <div className="pt-4 space-y-3">
            <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Buscar aluna ou responsável..." />

            <div>
              <label className={labelCls}>Polo</label>
              <select value={filteredPolo} onChange={(e) => { setFilteredPolo(e.target.value); setFilteredLocal(""); setFilteredTurma("") }} className={inputCls}>
                <option value="">Todos os polos</option>
                {polos.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.city}</option>)}
              </select>
            </div>

            {filteredPolo && (
              <div>
                <label className={labelCls}>Local</label>
                <select value={filteredLocal} onChange={(e) => { setFilteredLocal(e.target.value); setFilteredTurma("") }} className={inputCls}>
                  <option value="">Todos os locais</option>
                  {locaisDisponiveis.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className={labelCls}>Turma</label>
              <select value={filteredTurma} onChange={(e) => setFilteredTurma(e.target.value)} className={inputCls}>
                <option value="">Todas as turmas</option>
                {turmasDisponiveis.map((t) => {
                  const p = polos.find((polo) => polo.id === t.poloId)
                  return <option key={t.id} value={t.id}>{t.name} — {p?.name}</option>
                })}
              </select>
            </div>

            <div>
              <label className={labelCls}>Status Financeiro</label>
              <select value={filteredStatus} onChange={(e) => setFilteredStatus(e.target.value)} className={inputCls}>
                <option value="">Todos</option>
                <option value="emdia">Em dia</option>
                <option value="pendente">Com pendência</option>
              </select>
            </div>

            <button onClick={() => { resetForm(); setIsAddModalOpen(true) }} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-(--color-primary) text-white rounded-lg font-semibold hover:bg-(--color-primary-hover) transition-colors">
              <Plus className="w-5 h-5" /> Adicionar Aluna
            </button>
          </div>

          <p className="text-xs text-(--color-foreground-secondary) px-1">
            {filteredAlunas.length} aluna{filteredAlunas.length !== 1 ? "s" : ""} encontrada{filteredAlunas.length !== 1 ? "s" : ""}
          </p>

          <section className="space-y-2">
            {filteredAlunas.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-(--color-foreground-muted) mb-3" />
                <p className="text-(--color-foreground-secondary)">Nenhuma aluna encontrada</p>
              </div>
            ) : filteredAlunas.map((aluna) => {
              const turma = turmas.find((t) => t.id === aluna.turmaId)
              const polo = polos.find((p) => p.id === turma?.poloId)
              const pendencias = getPendencias(aluna.id)
              const idade = calculateAge(aluna.dataNascimento)

              return (
                <div key={aluna.id} className="bg-white rounded-lg border border-(--color-border) overflow-hidden">
                  <Link href={`/admin/alunas/${aluna.id}`} className="block p-3 hover:bg-(--color-card-hover) transition-colors">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-(--color-foreground) truncate">{aluna.nome}</h3>
                          {!aluna.taxaMatriculaPaga && (
                            <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-blue-100 text-blue-700 flex items-center gap-0.5">
                              <Receipt className="w-2.5 h-2.5" /> Matrícula
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-(--color-foreground-secondary) truncate">
                          {idade} anos • {turma?.name} • {polo?.name}
                        </p>
                        <p className="text-xs text-(--color-foreground-muted) truncate">{aluna.responsavel.email}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {pendencias > 0 ? (
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full flex items-center gap-1 whitespace-nowrap">
                            <AlertCircle className="w-3 h-3" /> {pendencias}m
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
                    <button onClick={() => { setSelectedAluna(aluna); setIsEditModalOpen(true) }} className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-(--color-foreground-secondary) hover:bg-(--color-background-tertiary) transition-colors">
                      <Edit className="w-3.5 h-3.5" /><span className="text-xs font-medium">Editar</span>
                    </button>
                    <div className="w-px bg-(--color-border)" />
                    <button onClick={() => { setSelectedAluna(aluna); setIsDeleteModalOpen(true) }} className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-(--color-error) hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /><span className="text-xs font-medium">Excluir</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </section>
        </main>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* ABA: PRÉ-MATRÍCULAS                         */}
      {/* ═══════════════════════════════════════════ */}
      {aba === "pre-matriculas" && (
        <main className="px-4 pb-6 space-y-4">
          <div className="pt-4 space-y-3">
            <SearchInput value={pmSearch} onChange={setPmSearch} placeholder="Buscar aluna ou responsável..." />
            <div>
              <label className={labelCls}>Status</label>
              <select value={pmStatus} onChange={(e) => setPmStatus(e.target.value)} className={inputCls}>
                <option value="">Todos</option>
                <option value="pendente">Pendente</option>
                <option value="aprovada">Aprovada</option>
                <option value="reprovada">Reprovada</option>
              </select>
            </div>
          </div>

          <p className="text-xs text-(--color-foreground-secondary) px-1">
            {filteredPms.length} pré-matrícula{filteredPms.length !== 1 ? "s" : ""} encontrada{filteredPms.length !== 1 ? "s" : ""}
          </p>

          <section className="space-y-2">
            {filteredPms.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="w-12 h-12 mx-auto text-(--color-foreground-muted) mb-3" />
                <p className="text-(--color-foreground-secondary)">Nenhuma pré-matrícula encontrada</p>
              </div>
            ) : filteredPms.map((pm) => (
              <div key={pm.id} className="bg-white rounded-lg border border-(--color-border) overflow-hidden">
                <button
                  onClick={() => { setSelectedPm(pm); setIsPmDetailOpen(true) }}
                  className="w-full text-left block p-3 hover:bg-(--color-card-hover) transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-semibold text-(--color-foreground) truncate">{pm.nomeAluna}</h3>
                        <span className={`flex-shrink-0 px-2 py-0.5 text-[10px] font-semibold rounded-full ${statusBadgePm(pm.status)}`}>
                          {statusLabelPm(pm.status)}
                        </span>
                      </div>
                      <p className="text-xs text-(--color-foreground-secondary) truncate">
                        {calcIdade(pm.dataNascimento)} anos • Resp: {pm.nomeResponsavel}
                      </p>
                      <p className="text-xs text-(--color-foreground-muted) truncate">{pm.email}</p>
                      <p className="text-xs text-(--color-foreground-muted) mt-0.5">
                        <Clock className="w-3 h-3 inline mr-0.5" />
                        {formatDate(pm.createdAt)}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-(--color-foreground-muted) flex-shrink-0 mt-1" />
                  </div>
                </button>

                {pm.status === "pendente" && (
                  <div className="flex border-t border-(--color-border)">
                    <button
                      onClick={() => { setSelectedPm(pm); setIsPmConvertOpen(true) }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-green-700 hover:bg-green-50 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" /><span className="text-xs font-medium">Converter em Aluna</span>
                    </button>
                    <div className="w-px bg-(--color-border)" />
                    <button
                      onClick={() => handleReprovarPm(pm.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-(--color-error) hover:bg-red-50 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /><span className="text-xs font-medium">Reprovar</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </section>
        </main>
      )}

      {/* ─── MODAL ADICIONAR ALUNA ─── */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Adicionar Aluna" size="lg">
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setIsAddModalOpen(false) }}>

          <p className={sectionTitle}>Dados da Aluna</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={labelCls}>Nome Completo *</label>
              <input type="text" placeholder="Ex: Sofia Rodrigues" className={inputCls} required />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Data de Nascimento *</label>
              <input type="date" className={inputCls} required />
            </div>
          </div>

          <p className={sectionTitle}>Matrícula</p>
          <div className="space-y-3">
            <div>
              <label className={labelCls}>Polo *</label>
              <select value={formPolo} onChange={(e) => { setFormPolo(e.target.value); setFormLocal(""); setFormTurmaId("") }} className={inputCls} required>
                <option value="">Selecione o polo</option>
                {polos.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.city}</option>)}
              </select>
            </div>
            {formPolo && (
              <div>
                <label className={labelCls}>Local *</label>
                <select value={formLocal} onChange={(e) => { setFormLocal(e.target.value); setFormTurmaId("") }} className={inputCls} required>
                  <option value="">Selecione o local</option>
                  {locaisForm.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            )}
            {formPolo && (
              <div>
                <label className={labelCls}>Turma *</label>
                <select value={formTurmaId} onChange={(e) => setFormTurmaId(e.target.value)} className={inputCls} required>
                  <option value="">Selecione a turma</option>
                  {turmasForm.map((t) => <option key={t.id} value={t.id}>{t.name} — {t.nivel} — {formatCurrency(t.mensalidade)}/mês</option>)}
                </select>
              </div>
            )}
            {turmaSelecionadaForm && (
              <div className="flex items-start gap-3 bg-(--color-primary-light) rounded-lg p-3">
                <Receipt className="w-5 h-5 text-(--color-primary) flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-(--color-primary)">Taxa de Matrícula</p>
                  <p className="text-lg font-bold text-(--color-primary)">{formatCurrency(turmaSelecionadaForm.taxaMatricula)}</p>
                  <p className="text-xs text-(--color-foreground-secondary) mt-0.5">
                    Ao salvar, será registrada automaticamente como receita no financeiro (não entra no cálculo de professoras/custos).
                  </p>
                </div>
              </div>
            )}
          </div>

          <p className={sectionTitle}>Dados do Responsável</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={labelCls}>Nome do Responsável *</label>
              <input type="text" placeholder="Ex: Maria Rodrigues" className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>CPF do Responsável</label>
              <input type="text" placeholder="000.000.000-00" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>WhatsApp *</label>
              <input type="tel" placeholder="(27) 99999-9999" className={inputCls} required />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>E-mail *</label>
              <input type="email" placeholder="responsavel@email.com" className={inputCls} required />
              <p className="text-xs text-(--color-foreground-muted) mt-1">Usado para cobranças automáticas futuras.</p>
            </div>
          </div>

          <p className={sectionTitle}>Endereço</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>CEP</label>
              <input type="text" placeholder="00000-000" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Estado</label>
              <input type="text" placeholder="ES" maxLength={2} className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Logradouro</label>
              <input type="text" placeholder="Rua das Flores" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Número</label>
              <input type="text" placeholder="123" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Complemento</label>
              <input type="text" placeholder="Apto 1" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Bairro</label>
              <input type="text" placeholder="Centro" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Cidade</label>
              <input type="text" placeholder="São Mateus" className={inputCls} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 px-4 py-2.5 border border-(--color-border) rounded-lg font-semibold text-(--color-foreground) hover:bg-(--color-background-tertiary) transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-(--color-primary) text-white rounded-lg font-semibold hover:bg-(--color-primary-hover) transition-colors">Salvar Aluna</button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL EDITAR ALUNA ─── */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Aluna" size="lg">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsEditModalOpen(false) }}>
          <p className={sectionTitle}>Dados da Aluna</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={labelCls}>Nome Completo *</label>
              <input type="text" defaultValue={selectedAluna?.nome} className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select defaultValue={selectedAluna?.status} className={inputCls}>
                <option value="Ativa">Ativa</option>
                <option value="Trancada">Trancada</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Taxa matrícula</label>
              <select defaultValue={selectedAluna?.taxaMatriculaPaga ? "sim" : "nao"} className={inputCls}>
                <option value="sim">Paga</option>
                <option value="nao">Pendente</option>
              </select>
            </div>
          </div>

          <p className={sectionTitle}>Responsável</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={labelCls}>Nome *</label>
              <input type="text" defaultValue={selectedAluna?.responsavel.nome} className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>CPF</label>
              <input type="text" defaultValue={selectedAluna?.responsavel.cpf} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>WhatsApp *</label>
              <input type="tel" defaultValue={selectedAluna?.responsavel.whatsapp} className={inputCls} required />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>E-mail *</label>
              <input type="email" defaultValue={selectedAluna?.responsavel.email} className={inputCls} required />
            </div>
          </div>

          <p className={sectionTitle}>Endereço</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>CEP</label>
              <input type="text" defaultValue={selectedAluna?.endereco?.cep} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Estado</label>
              <input type="text" defaultValue={selectedAluna?.endereco?.estado} maxLength={2} className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Logradouro</label>
              <input type="text" defaultValue={selectedAluna?.endereco?.logradouro} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Número</label>
              <input type="text" defaultValue={selectedAluna?.endereco?.numero} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Bairro</label>
              <input type="text" defaultValue={selectedAluna?.endereco?.bairro} className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Cidade</label>
              <input type="text" defaultValue={selectedAluna?.endereco?.cidade} className={inputCls} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 px-4 py-2.5 border border-(--color-border) rounded-lg font-semibold text-(--color-foreground) hover:bg-(--color-background-tertiary) transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-(--color-primary) text-white rounded-lg font-semibold hover:bg-(--color-primary-hover) transition-colors">Salvar</button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL EXCLUIR ALUNA ─── */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Excluir Aluna" size="sm">
        <div className="space-y-4">
          <p className="text-(--color-foreground-secondary)">Tem certeza que deseja excluir a aluna <strong>{selectedAluna?.nome}</strong>?</p>
          <div className="flex gap-3">
            <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-2.5 border border-(--color-border) rounded-lg font-semibold text-(--color-foreground) hover:bg-(--color-background-tertiary) transition-colors">Cancelar</button>
            <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-2.5 bg-(--color-error) text-white rounded-lg font-semibold hover:bg-red-600 transition-colors">Excluir</button>
          </div>
        </div>
      </Modal>

      {/* ─── MODAL DETALHE PRÉ-MATRÍCULA ─── */}
      <Modal isOpen={isPmDetailOpen} onClose={() => setIsPmDetailOpen(false)} title="Detalhe da Pré-Matrícula" size="lg">
        {selectedPm && (
          <div className="space-y-5">
            {/* Status badge */}
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusBadgePm(selectedPm.status)}`}>
                {statusLabelPm(selectedPm.status)}
              </span>
              <span className="text-xs text-(--color-foreground-muted)">
                <Clock className="w-3 h-3 inline mr-0.5" />
                Enviada em {formatDate(selectedPm.createdAt)}
              </span>
            </div>

            {/* Aluna */}
            <div>
              <p className={sectionTitle}>Aluna</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm">
                  <UserIcon className="w-4 h-4 text-(--color-foreground-muted)" />
                  <span className="font-medium text-(--color-foreground)">{selectedPm.nomeAluna}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-(--color-foreground-secondary)">
                  <Calendar className="w-4 h-4 text-(--color-foreground-muted)" />
                  <span>{formatDate(selectedPm.dataNascimento)} ({calcIdade(selectedPm.dataNascimento)} anos)</span>
                </div>
              </div>
            </div>

            {/* Responsável */}
            <div>
              <p className={sectionTitle}>Responsável</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm">
                  <UserIcon className="w-4 h-4 text-(--color-foreground-muted)" />
                  <span className="font-medium text-(--color-foreground)">{selectedPm.nomeResponsavel}</span>
                </div>
                {selectedPm.cpfResponsavel && (
                  <p className="text-sm text-(--color-foreground-secondary) ml-6">CPF: {selectedPm.cpfResponsavel}</p>
                )}
                <div className="flex items-center gap-2 text-sm text-(--color-foreground-secondary)">
                  <Phone className="w-4 h-4 text-(--color-foreground-muted)" />
                  <span>{selectedPm.whatsapp || selectedPm.telefone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-(--color-foreground-secondary)">
                  <Mail className="w-4 h-4 text-(--color-foreground-muted)" />
                  <span>{selectedPm.email}</span>
                </div>
              </div>
            </div>

            {/* Endereço */}
            {(selectedPm.logradouro || selectedPm.cidade) && (
              <div>
                <p className={sectionTitle}>Endereço</p>
                <div className="flex items-start gap-2 text-sm text-(--color-foreground-secondary)">
                  <MapPin className="w-4 h-4 text-(--color-foreground-muted) mt-0.5 flex-shrink-0" />
                  <p>
                    {selectedPm.logradouro}{selectedPm.numero ? `, ${selectedPm.numero}` : ""}
                    {selectedPm.bairro ? ` — ${selectedPm.bairro}` : ""}
                    {selectedPm.cidade ? ` — ${selectedPm.cidade}` : ""}
                    {selectedPm.estado ? `/${selectedPm.estado}` : ""}
                    {selectedPm.cep ? ` — CEP ${selectedPm.cep}` : ""}
                  </p>
                </div>
              </div>
            )}

            {/* Observações */}
            {selectedPm.observacoes && (
              <div>
                <p className={sectionTitle}>Observações</p>
                <p className="text-sm text-(--color-foreground-secondary) bg-(--color-background-secondary) rounded-lg p-3">
                  {selectedPm.observacoes}
                </p>
              </div>
            )}

            {/* Ações */}
            {selectedPm.status === "pendente" && (
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => { setIsPmDetailOpen(false); setIsPmConvertOpen(true) }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-(--color-primary) text-white rounded-lg font-semibold hover:bg-(--color-primary-hover) transition-colors"
                >
                  <Check className="w-4 h-4" /> Converter em Aluna
                </button>
                <button
                  onClick={() => { handleReprovarPm(selectedPm.id) }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-(--color-error) rounded-lg font-semibold hover:bg-red-50 transition-colors"
                >
                  <X className="w-4 h-4" /> Reprovar
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ─── MODAL CONVERTER EM ALUNA ─── */}
      <Modal isOpen={isPmConvertOpen} onClose={() => setIsPmConvertOpen(false)} title="Converter em Aluna" size="lg">
        {selectedPm && (
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault()
              setPmList((prev) => prev.map((pm) => pm.id === selectedPm.id ? { ...pm, status: "aprovada" as const } : pm))
              setIsPmConvertOpen(false)
            }}
          >
            <div className="flex items-start gap-3 bg-(--color-primary-light) rounded-lg p-3">
              <ClipboardList className="w-5 h-5 text-(--color-primary) flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-(--color-primary)">Dados da pré-matrícula serão usados como base</p>
                <p className="text-xs text-(--color-foreground-secondary) mt-0.5">Confira e complemente as informações para finalizar a matrícula de <strong>{selectedPm.nomeAluna}</strong>.</p>
              </div>
            </div>

            <p className={sectionTitle}>Matrícula</p>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Polo *</label>
                <select value={formPolo} onChange={(e) => { setFormPolo(e.target.value); setFormLocal(""); setFormTurmaId("") }} className={inputCls} required>
                  <option value="">Selecione o polo</option>
                  {polos.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.city}</option>)}
                </select>
              </div>
              {formPolo && (
                <div>
                  <label className={labelCls}>Local *</label>
                  <select value={formLocal} onChange={(e) => { setFormLocal(e.target.value); setFormTurmaId("") }} className={inputCls} required>
                    <option value="">Selecione o local</option>
                    {locaisForm.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
              )}
              {formPolo && (
                <div>
                  <label className={labelCls}>Turma *</label>
                  <select value={formTurmaId} onChange={(e) => setFormTurmaId(e.target.value)} className={inputCls} required>
                    <option value="">Selecione a turma</option>
                    {turmasForm.map((t) => <option key={t.id} value={t.id}>{t.name} — {t.nivel} — {formatCurrency(t.mensalidade)}/mês</option>)}
                  </select>
                </div>
              )}
              {turmaSelecionadaForm && (
                <div className="flex items-start gap-3 bg-(--color-primary-light) rounded-lg p-3">
                  <Receipt className="w-5 h-5 text-(--color-primary) flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-(--color-primary)">Taxa de Matrícula</p>
                    <p className="text-lg font-bold text-(--color-primary)">{formatCurrency(turmaSelecionadaForm.taxaMatricula)}</p>
                  </div>
                </div>
              )}
            </div>

            <p className={sectionTitle}>Dados Confirmados</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-(--color-foreground-secondary)">Aluna:</span>
                <span className="font-medium text-(--color-foreground)">{selectedPm.nomeAluna}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-(--color-foreground-secondary)">Nascimento:</span>
                <span className="font-medium text-(--color-foreground)">{formatDate(selectedPm.dataNascimento)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-(--color-foreground-secondary)">Responsável:</span>
                <span className="font-medium text-(--color-foreground)">{selectedPm.nomeResponsavel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-(--color-foreground-secondary)">WhatsApp:</span>
                <span className="font-medium text-(--color-foreground)">{selectedPm.whatsapp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-(--color-foreground-secondary)">E-mail:</span>
                <span className="font-medium text-(--color-foreground)">{selectedPm.email}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setIsPmConvertOpen(false)} className="flex-1 px-4 py-2.5 border border-(--color-border) rounded-lg font-semibold text-(--color-foreground) hover:bg-(--color-background-tertiary) transition-colors">Cancelar</button>
              <button type="submit" className="flex-1 px-4 py-2.5 bg-(--color-primary) text-white rounded-lg font-semibold hover:bg-(--color-primary-hover) transition-colors">Confirmar Matrícula</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
