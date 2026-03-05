"use client"

import { useState } from "react"
import { MobileHeader } from "@/components/layout/mobile-header"
import { SearchInput } from "@/components/ui/search-input"
import { Modal } from "@/components/ui/modal"
import {
  Plus, GraduationCap, Users, DollarSign, Edit, Trash2, ChevronRight,
  PlusCircle, X, Receipt, Calendar, Tag,
} from "lucide-react"
import { polos, locais, turmas, alunas, professoras } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import type { Turma, CustoTurma, ProfessoraTurma, BlocoCobranca, CategoriaCusto } from "@/lib/types"

const inputCls = "w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary) text-sm bg-white"
const labelCls = "block text-sm font-medium text-(--color-foreground) mb-1.5"
const sectionTitle = "font-semibold text-(--color-foreground) text-sm uppercase tracking-wide pt-1"

const CATEGORIAS_CUSTO: CategoriaCusto[] = [
  "Aluguel", "Parceiro", "Material", "Marketing",
  "Transporte", "Alimentação", "Equipamento", "Administrativo", "Outro",
]

// Formulário reutilizável para professoras, custos e blocos
function ProfessorasForm({
  items, onAdd, onRemove, onUpdate,
}: {
  items: ProfessoraTurma[]
  onAdd: () => void
  onRemove: (i: number) => void
  onUpdate: (i: number, field: keyof ProfessoraTurma, val: string | number) => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className={sectionTitle + " flex items-center gap-1"}><GraduationCap className="w-3.5 h-3.5" /> Professoras</p>
        <button type="button" onClick={onAdd} className="flex items-center gap-1 text-xs text-(--color-primary) font-medium">
          <PlusCircle className="w-3.5 h-3.5" /> Adicionar
        </button>
      </div>
      <p className="text-xs text-(--color-foreground-secondary) mb-2">Defina se cada professora recebe valor fixo (R$) ou porcentagem (%) da receita da turma no mês.</p>
      {items.length === 0 && <p className="text-xs text-(--color-foreground-muted) italic">Nenhuma professora adicionada.</p>}
      <div className="space-y-2">
        {items.map((p, i) => (
          <div key={i} className="flex items-end gap-2 bg-(--color-background-secondary) rounded-lg p-2">
            <div className="flex-[2]">
              <p className="text-xs text-(--color-foreground-secondary) mb-1">Professora</p>
              <select value={p.professoraId} onChange={(e) => onUpdate(i, "professoraId", e.target.value)} className={inputCls}>
                <option value="">Selecione</option>
                {professoras.map((prof) => <option key={prof.id} value={prof.id}>{prof.nome}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <p className="text-xs text-(--color-foreground-secondary) mb-1">Tipo</p>
              <select value={p.tipo} onChange={(e) => onUpdate(i, "tipo", e.target.value)} className={inputCls}>
                <option value="percentual">% Receita</option>
                <option value="fixo">Fixo R$</option>
              </select>
            </div>
            <div className="w-20">
              <p className="text-xs text-(--color-foreground-secondary) mb-1">{p.tipo === "percentual" ? "%" : "R$"}</p>
              <input type="number" step="0.01" value={p.valor || ""} onChange={(e) => onUpdate(i, "valor", Number(e.target.value))} className={inputCls} />
            </div>
            <button type="button" onClick={() => onRemove(i)} className="mb-0.5 text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  )
}

function CustosForm({
  items, onAdd, onRemove, onUpdate,
}: {
  items: CustoTurma[]
  onAdd: () => void
  onRemove: (i: number) => void
  onUpdate: (i: number, field: keyof CustoTurma, val: string | number) => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className={sectionTitle + " flex items-center gap-1"}><DollarSign className="w-3.5 h-3.5" /> Outros Custos</p>
        <button type="button" onClick={onAdd} className="flex items-center gap-1 text-xs text-(--color-primary) font-medium">
          <PlusCircle className="w-3.5 h-3.5" /> Adicionar custo
        </button>
      </div>
      <p className="text-xs text-(--color-foreground-secondary) mb-2">Selecione a categoria para facilitar agrupamento no Financeiro.</p>
      {items.length === 0 && <p className="text-xs text-(--color-foreground-muted) italic">Nenhum custo adicionado.</p>}
      <div className="space-y-2">
        {items.map((c, i) => (
          <div key={i} className="bg-(--color-background-secondary) rounded-lg p-2 space-y-2">
            <div className="flex gap-2">
              <div className="flex-1">
                <p className="text-xs text-(--color-foreground-secondary) mb-1">Categoria</p>
                <select value={c.categoria} onChange={(e) => onUpdate(i, "categoria", e.target.value)} className={inputCls}>
                  {CATEGORIAS_CUSTO.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <p className="text-xs text-(--color-foreground-secondary) mb-1">Tipo</p>
                <select value={c.tipo} onChange={(e) => onUpdate(i, "tipo", e.target.value)} className={inputCls}>
                  <option value="percentual">%</option>
                  <option value="fixo">Fixo R$</option>
                </select>
              </div>
              <div className="w-20">
                <p className="text-xs text-(--color-foreground-secondary) mb-1">{c.tipo === "percentual" ? "%" : "R$"}</p>
                <input type="number" step="0.01" value={c.valor || ""} onChange={(e) => onUpdate(i, "valor", Number(e.target.value))} className={inputCls} />
              </div>
              <button type="button" onClick={() => onRemove(i)} className="mt-5 text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
            </div>
            <div>
              <p className="text-xs text-(--color-foreground-secondary) mb-1">Descrição</p>
              <input type="text" placeholder="Ex: Aluguel Quadra" value={c.descricao} onChange={(e) => onUpdate(i, "descricao", e.target.value)} className={inputCls} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BlococobrancaForm({
  items, onAdd, onRemove, onUpdate,
}: {
  items: BlocoCobranca[]
  onAdd: () => void
  onRemove: (i: number) => void
  onUpdate: (i: number, field: keyof BlocoCobranca, val: number) => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className={sectionTitle + " flex items-center gap-1"}><Calendar className="w-3.5 h-3.5" /> Bloco de Cobrança</p>
        <button type="button" onClick={onAdd} className="flex items-center gap-1 text-xs text-(--color-primary) font-medium">
          <PlusCircle className="w-3.5 h-3.5" /> Adicionar faixa
        </button>
      </div>
      <p className="text-xs text-(--color-foreground-secondary) mb-2">Defina valores por prazo. Ex.: até dia 10 = R$150, após = R$170.</p>
      <div className="space-y-2">
        {items.map((b, i) => (
          <div key={i} className="flex items-center gap-2 bg-(--color-background-secondary) rounded-lg p-2">
            <div className="flex-1">
              <p className="text-xs text-(--color-foreground-secondary) mb-1">Até o dia</p>
              <input type="number" min={1} max={31} value={b.diaLimite} onChange={(e) => onUpdate(i, "diaLimite", Number(e.target.value))} className={inputCls} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-(--color-foreground-secondary) mb-1">Valor (R$)</p>
              <input type="number" step="0.01" value={b.valor || ""} onChange={(e) => onUpdate(i, "valor", Number(e.target.value))} className={inputCls} />
            </div>
            {items.length > 1 && (
              <button type="button" onClick={() => onRemove(i)} className="mt-5 text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function TurmasPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredPolo, setFilteredPolo] = useState("")
  const [filteredLocal, setFilteredLocal] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null)

  // estado formulário ADD
  const [formPolo, setFormPolo] = useState("")
  const [formLocal, setFormLocal] = useState("")
  const [formProfessoras, setFormProfessoras] = useState<ProfessoraTurma[]>([])
  const [formCustos, setFormCustos] = useState<CustoTurma[]>([])
  const [formBlocos, setFormBlocos] = useState<BlocoCobranca[]>([{ diaLimite: 10, valor: 0 }])

  // estado formulário EDIT (populados ao abrir)
  const [editProfessoras, setEditProfessoras] = useState<ProfessoraTurma[]>([])
  const [editCustos, setEditCustos] = useState<CustoTurma[]>([])
  const [editBlocos, setEditBlocos] = useState<BlocoCobranca[]>([])

  const locaisDisponiveis = filteredPolo ? locais.filter((l) => l.poloId === filteredPolo) : locais
  const locaisForm = formPolo ? locais.filter((l) => l.poloId === formPolo) : []

  const filteredTurmas = turmas.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchPolo = !filteredPolo || t.poloId === filteredPolo
    const matchLocal = !filteredLocal || t.localId === filteredLocal
    return matchSearch && matchPolo && matchLocal
  })

  // helpers ADD
  const addProfForm = () => setFormProfessoras([...formProfessoras, { professoraId: "", tipo: "percentual", valor: 0 }])
  const removeProfForm = (i: number) => setFormProfessoras(formProfessoras.filter((_, idx) => idx !== i))
  const updateProfForm = (i: number, f: keyof ProfessoraTurma, v: string | number) =>
    setFormProfessoras(formProfessoras.map((p, idx) => idx === i ? { ...p, [f]: v } : p))
  const addCustoForm = () => setFormCustos([...formCustos, { id: String(Date.now()), descricao: "", categoria: "Outro", tipo: "percentual", valor: 0 }])
  const removeCustoForm = (i: number) => setFormCustos(formCustos.filter((_, idx) => idx !== i))
  const updateCustoForm = (i: number, f: keyof CustoTurma, v: string | number) =>
    setFormCustos(formCustos.map((c, idx) => idx === i ? { ...c, [f]: v } : c))
  const addBlocoForm = () => setFormBlocos([...formBlocos, { diaLimite: 31, valor: 0 }])
  const removeBlocoForm = (i: number) => setFormBlocos(formBlocos.filter((_, idx) => idx !== i))
  const updateBlocoForm = (i: number, f: keyof BlocoCobranca, v: number) =>
    setFormBlocos(formBlocos.map((b, idx) => idx === i ? { ...b, [f]: v } : b))

  // helpers EDIT
  const addProfEdit = () => setEditProfessoras([...editProfessoras, { professoraId: "", tipo: "percentual", valor: 0 }])
  const removeProfEdit = (i: number) => setEditProfessoras(editProfessoras.filter((_, idx) => idx !== i))
  const updateProfEdit = (i: number, f: keyof ProfessoraTurma, v: string | number) =>
    setEditProfessoras(editProfessoras.map((p, idx) => idx === i ? { ...p, [f]: v } : p))
  const addCustoEdit = () => setEditCustos([...editCustos, { id: String(Date.now()), descricao: "", categoria: "Outro", tipo: "percentual", valor: 0 }])
  const removeCustoEdit = (i: number) => setEditCustos(editCustos.filter((_, idx) => idx !== i))
  const updateCustoEdit = (i: number, f: keyof CustoTurma, v: string | number) =>
    setEditCustos(editCustos.map((c, idx) => idx === i ? { ...c, [f]: v } : c))
  const addBlocoEdit = () => setEditBlocos([...editBlocos, { diaLimite: 31, valor: 0 }])
  const removeBlocoEdit = (i: number) => setEditBlocos(editBlocos.filter((_, idx) => idx !== i))
  const updateBlocoEdit = (i: number, f: keyof BlocoCobranca, v: number) =>
    setEditBlocos(editBlocos.map((b, idx) => idx === i ? { ...b, [f]: v } : b))

  function openEdit(turma: Turma) {
    setSelectedTurma(turma)
    setEditProfessoras(turma.professorasConfig ?? [])
    setEditCustos(turma.custos ?? [])
    setEditBlocos(turma.blocoCobranca ?? [{ diaLimite: 10, valor: turma.mensalidade }])
    setIsEditModalOpen(true)
  }

  function resetForm() {
    setFormPolo(""); setFormLocal(""); setFormProfessoras([])
    setFormCustos([]); setFormBlocos([{ diaLimite: 10, valor: 0 }])
  }

  return (
    <div className="min-h-screen bg-(--color-background-secondary)">
      <MobileHeader title="Turmas" />

      <main className="px-4 pb-6 space-y-4">
        {/* Filtros */}
        <div className="pt-4 space-y-3">
          <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Buscar turma..." />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Polo</label>
              <select value={filteredPolo} onChange={(e) => { setFilteredPolo(e.target.value); setFilteredLocal("") }} className={inputCls}>
                <option value="">Todos os polos</option>
                {polos.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Local</label>
              <select value={filteredLocal} onChange={(e) => setFilteredLocal(e.target.value)} className={inputCls} disabled={!filteredPolo}>
                <option value="">Todos</option>
                {locaisDisponiveis.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          </div>
          <button onClick={() => { resetForm(); setIsAddModalOpen(true) }} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-(--color-primary) text-white rounded-lg font-semibold hover:bg-(--color-primary-hover) transition-colors">
            <Plus className="w-5 h-5" /> Adicionar Turma
          </button>
        </div>

        {/* Lista */}
        <section className="space-y-3">
          {filteredTurmas.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="w-12 h-12 mx-auto text-(--color-foreground-muted) mb-3" />
              <p className="text-(--color-foreground-secondary)">Nenhuma turma encontrada</p>
            </div>
          ) : filteredTurmas.map((turma) => {
            const polo = polos.find((p) => p.id === turma.poloId)
            const local = locais.find((l) => l.id === turma.localId)
            const alunasDaTurma = alunas.filter((a) => a.turmaId === turma.id)
            const nProfs = turma.professorasConfig?.length ?? turma.professoraIds.length

            return (
              <div key={turma.id} className="bg-white rounded-lg border border-(--color-border) overflow-hidden">
                <Link href={`/admin/turmas/${turma.id}`} className="block p-4 hover:bg-(--color-card-hover) transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-(--color-foreground) mb-1">{turma.name}</h3>
                      <p className="text-sm text-(--color-foreground-secondary)">{polo?.name} • {local?.name}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 text-xs font-medium rounded-full bg-(--color-primary-light) text-(--color-primary)">{turma.nivel}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-(--color-foreground-muted) flex-shrink-0" />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { icon: DollarSign, label: "Mensalidade", value: formatCurrency(turma.mensalidade) },
                      { icon: Receipt, label: "Matrícula", value: formatCurrency(turma.taxaMatricula) },
                      { icon: Users, label: "Alunas", value: alunasDaTurma.length },
                      { icon: GraduationCap, label: "Profs.", value: nProfs },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="bg-(--color-background-secondary) rounded-lg p-2">
                        <Icon className="w-3 h-3 text-(--color-foreground-secondary) mb-1" />
                        <p className="text-[10px] text-(--color-foreground-secondary)">{label}</p>
                        <p className="font-semibold text-xs text-(--color-foreground)">{value}</p>
                      </div>
                    ))}
                  </div>
                  {/* Chips de custos por categoria */}
                  {turma.custos?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {turma.custos.map((c) => (
                        <span key={c.id} className="flex items-center gap-1 px-2 py-0.5 bg-(--color-background-secondary) border border-(--color-border) rounded-full text-[10px] text-(--color-foreground-secondary)">
                          <Tag className="w-2.5 h-2.5" />{c.categoria}: {c.tipo === "percentual" ? `${c.valor}%` : formatCurrency(c.valor)}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
                <div className="flex border-t border-(--color-border)">
                  <button onClick={() => openEdit(turma)} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-(--color-foreground-secondary) hover:bg-(--color-background-tertiary) transition-colors">
                    <Edit className="w-4 h-4" /><span className="text-sm font-medium">Editar</span>
                  </button>
                  <div className="w-px bg-(--color-border)" />
                  <button onClick={() => { setSelectedTurma(turma); setIsDeleteModalOpen(true) }} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-(--color-error) hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" /><span className="text-sm font-medium">Excluir</span>
                  </button>
                </div>
              </div>
            )
          })}
        </section>
      </main>

      {/* ─── MODAL ADICIONAR ─── */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Adicionar Turma" size="lg">
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setIsAddModalOpen(false) }}>
          <p className={sectionTitle}>Localização</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Polo *</label>
              <select value={formPolo} onChange={(e) => { setFormPolo(e.target.value); setFormLocal("") }} className={inputCls} required>
                <option value="">Selecione</option>
                {polos.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Local *</label>
              <select value={formLocal} onChange={(e) => setFormLocal(e.target.value)} className={inputCls} required disabled={!formPolo}>
                <option value="">Selecione</option>
                {locaisForm.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          </div>

          <p className={sectionTitle}>Dados da Turma</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Nome *</label>
              <input type="text" placeholder="Ex: Iniciante 1" className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>Nível *</label>
              <select className={inputCls} required>
                <option value="">Selecione</option>
                {["Iniciante 1","Iniciante 2","Intermediário","Avançado"].map((n) => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Mensalidade base (R$) *</label>
              <input type="number" step="0.01" placeholder="150.00" className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>Taxa de Matrícula (R$)</label>
              <input type="number" step="0.01" placeholder="80.00" className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Faixa etária</label>
              <input type="text" placeholder="Ex: 4-6 anos" className={inputCls} />
            </div>
          </div>

          <BlococobrancaForm items={formBlocos} onAdd={addBlocoForm} onRemove={removeBlocoForm} onUpdate={updateBlocoForm} />
          <ProfessorasForm items={formProfessoras} onAdd={addProfForm} onRemove={removeProfForm} onUpdate={updateProfForm} />
          <CustosForm items={formCustos} onAdd={addCustoForm} onRemove={removeCustoForm} onUpdate={updateCustoForm} />

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 px-4 py-2.5 border border-(--color-border) rounded-lg font-semibold text-(--color-foreground) hover:bg-(--color-background-tertiary) transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-(--color-primary) text-white rounded-lg font-semibold hover:bg-(--color-primary-hover) transition-colors">Salvar Turma</button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL EDITAR ─── */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Turma" size="lg">
        {selectedTurma && (
          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setIsEditModalOpen(false) }}>
            <p className={sectionTitle}>Dados Básicos</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={labelCls}>Nome da Turma *</label>
                <input type="text" defaultValue={selectedTurma.name} className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Nível *</label>
                <select defaultValue={selectedTurma.nivel} className={inputCls} required>
                  {["Iniciante 1","Iniciante 2","Intermediário","Avançado"].map((n) => <option key={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Faixa etária</label>
                <input type="text" defaultValue={selectedTurma.idadeAlvo} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Mensalidade base (R$) *</label>
                <input type="number" step="0.01" defaultValue={selectedTurma.mensalidade} className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Taxa de Matrícula (R$)</label>
                <input type="number" step="0.01" defaultValue={selectedTurma.taxaMatricula} className={inputCls} />
              </div>
            </div>

            <BlococobrancaForm items={editBlocos} onAdd={addBlocoEdit} onRemove={removeBlocoEdit} onUpdate={updateBlocoEdit} />
            <ProfessorasForm items={editProfessoras} onAdd={addProfEdit} onRemove={removeProfEdit} onUpdate={updateProfEdit} />
            <CustosForm items={editCustos} onAdd={addCustoEdit} onRemove={removeCustoEdit} onUpdate={updateCustoEdit} />

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 px-4 py-2.5 border border-(--color-border) rounded-lg font-semibold text-(--color-foreground) hover:bg-(--color-background-tertiary) transition-colors">Cancelar</button>
              <button type="submit" className="flex-1 px-4 py-2.5 bg-(--color-primary) text-white rounded-lg font-semibold hover:bg-(--color-primary-hover) transition-colors">Salvar Alterações</button>
            </div>
          </form>
        )}
      </Modal>

      {/* ─── MODAL EXCLUIR ─── */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Excluir Turma" size="sm">
        <div className="space-y-4">
          <p className="text-(--color-foreground-secondary)">Tem certeza que deseja excluir a turma <strong>{selectedTurma?.name}</strong>?</p>
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">Atenção: todas as alunas desta turma ficarão sem turma vinculada.</p>
          <div className="flex gap-3">
            <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-2.5 border border-(--color-border) rounded-lg font-semibold text-(--color-foreground)">Cancelar</button>
            <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold">Excluir</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
