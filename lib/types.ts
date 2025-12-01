// Tipos e interfaces do sistema

export type UserRole = "admin" | "professora"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

export interface Polo {
  id: string
  name: string
  city: string
  observations?: string
  createdAt: Date
}

export interface Local {
  id: string
  poloId: string
  name: string
  address?: string
  observations?: string
  createdAt: Date
}

export interface Turma {
  id: string
  poloId: string
  localId: string
  name: string
  nivel: "Iniciante 1" | "Iniciante 2" | "Intermediário" | "Avançado"
  mensalidade: number
  idadeAlvo?: string
  professoraIds: string[]
  createdAt: Date
}

export interface Horario {
  id: string
  turmaId: string
  diaSemana: "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta" | "Sábado" | "Domingo"
  horaInicio: string
  horaFim: string
}

export interface Responsavel {
  nome: string
  telefone: string
  whatsapp: string
  email: string
}

export interface Aluna {
  id: string
  nome: string
  dataNascimento: Date
  turmaId: string
  responsavel: Responsavel
  status: "Ativa" | "Trancada"
  createdAt: Date
}

export interface PagamentoAluna {
  id: string
  alunaId: string
  mesReferencia: string // formato: 'YYYY-MM'
  valor: number
  status: "Pago" | "Pendente"
  dataPagamento?: Date
}

export interface Professora {
  id: string
  nome: string
  email: string
  telefone: string
  turmaIds: string[]
  salarioMensal?: number // Adicionando campo de salário mensal
  createdAt: Date
}

export interface PagamentoProfessora {
  id: string
  professoraId: string
  mesReferencia: string // formato: 'YYYY-MM'
  valor: number
  status: "Pago" | "Pendente"
  dataPagamento?: Date
}
