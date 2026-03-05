"use client"

import { useState } from "react"
import { MobileHeader } from "@/components/layout/mobile-header"
import { Modal } from "@/components/ui/modal"
import {
  Settings, Key, QrCode, Webhook, CheckCircle, AlertCircle, Eye, EyeOff,
  ToggleLeft, ToggleRight, Copy, MessageCircle, CreditCard, Wifi, WifiOff, Save
} from "lucide-react"
import { configuracaoCora as configInicial } from "@/lib/mock-data"
import type { ConfiguracaoCora } from "@/lib/types"

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState<ConfiguracaoCora>({ ...configInicial })
  const [saved, setSaved] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [testandoConexao, setTestandoConexao] = useState(false)
  const [resultadoTeste, setResultadoTeste] = useState<"sucesso" | "erro" | null>(null)
  const [isTesteModal, setIsTesteModal] = useState(false)
  const [pixCopiado, setPixCopiado] = useState(false)
  const [activeTab, setActiveTab] = useState<"cora" | "pix" | "contato">("cora")

  function salvar(e: React.FormEvent) {
    e.preventDefault()
    // Simula salvar
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function testarConexao() {
    setTestandoConexao(true)
    setResultadoTeste(null)
    setIsTesteModal(true)
    // Simula requisicao
    setTimeout(() => {
      setTestandoConexao(false)
      // Simula: sem credenciais = erro, com credenciais = sucesso
      setResultadoTeste(config.clientId && config.clientSecret ? "sucesso" : "erro")
    }, 2000)
  }

  function copiarPix() {
    navigator.clipboard.writeText(config.chavePix || "")
    setPixCopiado(true)
    setTimeout(() => setPixCopiado(false), 2000)
  }

  return (
    <div className="min-h-screen bg-(--color-background-secondary)">
      <MobileHeader title="Configuracoes" />

      <main className="px-4 pb-6 space-y-4">
        {/* Titulo */}
        <section className="pt-4">
          <h1 className="text-xl font-bold text-(--color-foreground)">Configuracoes de Pagamento</h1>
          <p className="text-sm text-(--color-foreground-secondary) mt-1">
            Configure a integracao com o Banco Cora, chave PIX e dados de contato para os pais.
          </p>
        </section>

        {/* Status geral */}
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${
          config.ativo
            ? "bg-green-50 border-green-200"
            : "bg-amber-50 border-amber-200"
        }`}>
          {config.ativo ? (
            <><Wifi className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-800">Integracao ativa</p>
              <p className="text-xs text-green-600">Banco Cora conectado — pagamentos automaticos habilitados</p>
            </div></>
          ) : (
            <><WifiOff className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-800">Integracao inativa</p>
              <p className="text-xs text-amber-600">Configure as credenciais do Banco Cora para ativar</p>
            </div></>
          )}
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-xl border border-(--color-border) p-1 gap-1">
          {([
            { key: "cora", label: "Banco Cora", icon: CreditCard },
            { key: "pix", label: "PIX", icon: QrCode },
            { key: "contato", label: "Contato", icon: MessageCircle },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === key
                  ? "bg-(--color-primary) text-gray-900"
                  : "text-(--color-foreground-secondary) hover:text-(--color-foreground)"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={salvar} className="space-y-4">
          {/* Tab Banco Cora */}
          {activeTab === "cora" && (
            <section className="bg-white rounded-xl border border-(--color-border) p-5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-(--color-primary)" />
                <h2 className="font-bold text-(--color-foreground)">Credenciais do Banco Cora</h2>
              </div>

              {/* Ambiente */}
              <div>
                <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Ambiente</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["sandbox", "producao"] as const).map((amb) => (
                    <button
                      key={amb}
                      type="button"
                      onClick={() => setConfig((c) => ({ ...c, ambiente: amb }))}
                      className={`py-2.5 rounded-lg text-sm font-semibold border transition-colors capitalize ${
                        config.ambiente === amb
                          ? "bg-(--color-primary) border-(--color-primary) text-gray-900"
                          : "border-(--color-border) text-(--color-foreground-secondary) hover:border-(--color-primary)"
                      }`}
                    >
                      {amb === "sandbox" ? "Sandbox (Testes)" : "Producao"}
                    </button>
                  ))}
                </div>
                {config.ambiente === "sandbox" && (
                  <p className="text-xs text-blue-600 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Modo sandbox: nenhuma transacao real sera processada.
                  </p>
                )}
              </div>

              {/* Client ID */}
              <div>
                <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">
                  <span className="flex items-center gap-1.5"><Key className="w-4 h-4" /> Client ID</span>
                </label>
                <input
                  type="text"
                  value={config.clientId}
                  onChange={(e) => setConfig((c) => ({ ...c, clientId: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary) font-mono text-sm"
                  placeholder="Insira o Client ID do Banco Cora"
                />
              </div>

              {/* Client Secret */}
              <div>
                <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">
                  <span className="flex items-center gap-1.5"><Key className="w-4 h-4" /> Client Secret</span>
                </label>
                <div className="relative">
                  <input
                    type={showSecret ? "text" : "password"}
                    value={config.clientSecret}
                    onChange={(e) => setConfig((c) => ({ ...c, clientSecret: e.target.value }))}
                    className="w-full px-4 py-2.5 pr-11 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary) font-mono text-sm"
                    placeholder="Insira o Client Secret"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-foreground-secondary)"
                  >
                    {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Conta bancaria */}
              <div>
                <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">
                  Conta Bancaria (recebimento)
                </label>
                <input
                  type="text"
                  value={config.contaBancaria}
                  onChange={(e) => setConfig((c) => ({ ...c, contaBancaria: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
                  placeholder="Ex: 0001-2345678"
                />
              </div>

              {/* Webhook */}
              <div>
                <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">
                  <span className="flex items-center gap-1.5"><Webhook className="w-4 h-4" /> URL do Webhook</span>
                </label>
                <input
                  type="url"
                  value={config.webhookUrl}
                  onChange={(e) => setConfig((c) => ({ ...c, webhookUrl: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary) font-mono text-sm"
                  placeholder="https://seu-dominio.com/api/webhook/cora"
                />
                <p className="text-xs text-(--color-foreground-secondary) mt-1">
                  O Banco Cora vai notificar esta URL quando um pagamento for confirmado, atualizando o status automaticamente.
                </p>
              </div>

              {/* Toggle ativo */}
              <div className="flex items-center justify-between p-3 bg-(--color-background-secondary) rounded-lg border border-(--color-border)">
                <div>
                  <p className="text-sm font-semibold text-(--color-foreground)">Ativar integracao</p>
                  <p className="text-xs text-(--color-foreground-secondary)">Habilita pagamentos automaticos pelo Cora</p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfig((c) => ({ ...c, ativo: !c.ativo }))}
                >
                  {config.ativo ? (
                    <ToggleRight className="w-9 h-9 text-(--color-primary)" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Testar conexao */}
              <button
                type="button"
                onClick={testarConexao}
                className="w-full py-2.5 border-2 border-(--color-primary) text-(--color-primary) rounded-lg font-semibold text-sm hover:bg-(--color-primary-light) transition-colors flex items-center justify-center gap-2"
              >
                <Wifi className="w-4 h-4" />
                Testar Conexao com Banco Cora
              </button>

              {/* Documentacao */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-blue-800 mb-1">Como obter as credenciais?</p>
                <ol className="text-xs text-blue-700 space-y-0.5 list-decimal list-inside">
                  <li>Acesse o portal do Banco Cora em app.cora.com.br</li>
                  <li>Va em Configuracoes → API e Integracoes</li>
                  <li>Gere um novo par de credenciais</li>
                  <li>Copie o Client ID e Client Secret acima</li>
                  <li>Configure a URL do Webhook com o endereco desta plataforma</li>
                </ol>
              </div>
            </section>
          )}

          {/* Tab PIX */}
          {activeTab === "pix" && (
            <section className="bg-white rounded-xl border border-(--color-border) p-5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <QrCode className="w-5 h-5 text-(--color-primary)" />
                <h2 className="font-bold text-(--color-foreground)">Configuracao de Chave PIX</h2>
              </div>

              <p className="text-sm text-(--color-foreground-secondary)">
                Esta e a chave PIX que aparecera na pagina de pagamentos para os responsaveis realizarem o pagamento das mensalidades.
              </p>

              {/* Tipo de chave */}
              <div>
                <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Tipo de Chave</label>
                <select
                  value={config.tipoChavePix}
                  onChange={(e) => setConfig((c) => ({ ...c, tipoChavePix: e.target.value as ConfiguracaoCora["tipoChavePix"] }))}
                  className="w-full px-3 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary) bg-white"
                >
                  <option value="CPF">CPF</option>
                  <option value="CNPJ">CNPJ</option>
                  <option value="Email">E-mail</option>
                  <option value="Telefone">Telefone</option>
                  <option value="Aleatoria">Chave Aleatoria</option>
                </select>
              </div>

              {/* Chave */}
              <div>
                <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">Chave PIX</label>
                <div className="relative">
                  <input
                    type="text"
                    value={config.chavePix}
                    onChange={(e) => setConfig((c) => ({ ...c, chavePix: e.target.value }))}
                    className="w-full px-4 py-2.5 pr-11 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary) font-mono text-sm"
                    placeholder={
                      config.tipoChavePix === "CPF" ? "000.000.000-00" :
                      config.tipoChavePix === "CNPJ" ? "00.000.000/0001-00" :
                      config.tipoChavePix === "Email" ? "seu@email.com" :
                      config.tipoChavePix === "Telefone" ? "+55 (27) 99000-0000" :
                      "Chave aleatoria gerada pelo banco"
                    }
                  />
                  {config.chavePix && (
                    <button
                      type="button"
                      onClick={copiarPix}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      title="Copiar chave"
                    >
                      <Copy className="w-4 h-4 text-(--color-foreground-secondary)" />
                    </button>
                  )}
                </div>
                {pixCopiado && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Chave copiada!
                  </p>
                )}
              </div>

              {/* Preview de como aparece para os pais */}
              <div className="bg-(--color-background-secondary) rounded-xl border border-(--color-border) p-4">
                <p className="text-xs font-semibold text-(--color-foreground-secondary) mb-3 uppercase tracking-wide">
                  Preview — Como aparece para os pais
                </p>
                <div className="bg-white rounded-lg border border-(--color-border) p-3 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <span className="flex-1 font-mono text-sm text-(--color-foreground) truncate">
                    {config.chavePix || "(chave nao configurada)"}
                  </span>
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-(--color-primary) text-gray-900 rounded-md text-xs font-semibold">
                    <Copy className="w-3 h-3" />
                    Copiar
                  </span>
                </div>
                <p className="text-xs text-(--color-foreground-secondary) mt-2">
                  Tipo: <strong>{config.tipoChavePix}</strong>
                </p>
              </div>

              {/* Link publico pagamentos */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-green-800 mb-1">Link publico de pagamentos</p>
                <p className="font-mono text-xs text-green-700 bg-white rounded border border-green-200 px-3 py-2">
                  {typeof window !== "undefined" ? window.location.origin : "https://seu-dominio.com"}/pagamentos
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Envie este link para os responsaveis acessarem o historico e pagarem as mensalidades.
                </p>
              </div>
            </section>
          )}

          {/* Tab Contato */}
          {activeTab === "contato" && (
            <section className="bg-white rounded-xl border border-(--color-border) p-5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-5 h-5 text-(--color-primary)" />
                <h2 className="font-bold text-(--color-foreground)">Contato da Administracao</h2>
              </div>

              <p className="text-sm text-(--color-foreground-secondary)">
                Este numero de WhatsApp aparece na pagina de produtos para os pais entrarem em contato para compras.
              </p>

              <div>
                <label className="block text-sm font-medium text-(--color-foreground) mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-green-600" />
                    WhatsApp da Administracao
                  </span>
                </label>
                <input
                  type="text"
                  value={config.whatsappAdmin}
                  onChange={(e) => setConfig((c) => ({ ...c, whatsappAdmin: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
                  placeholder="(27) 99000-0000"
                />
                <p className="text-xs text-(--color-foreground-secondary) mt-1">
                  Aparece na pagina de produtos e como contato de suporte na pagina de pagamentos.
                </p>
              </div>

              {/* Preview botao WhatsApp */}
              <div className="bg-(--color-background-secondary) rounded-xl border border-(--color-border) p-4">
                <p className="text-xs font-semibold text-(--color-foreground-secondary) mb-3 uppercase tracking-wide">
                  Preview — Botao na vitrine de produtos
                </p>
                <div className="flex items-center justify-center gap-2 py-2.5 bg-green-500 text-white rounded-lg text-sm font-semibold opacity-90">
                  <MessageCircle className="w-4 h-4" />
                  Tenho interesse — WhatsApp
                </div>
                <p className="text-xs text-(--color-foreground-secondary) mt-2 text-center">
                  Direciona para: {config.whatsappAdmin || "(numero nao configurado)"}
                </p>
              </div>

              {/* Links rapidos */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1.5">
                <p className="text-xs font-semibold text-blue-800">Links publicos do sistema</p>
                <div className="space-y-1">
                  <div>
                    <p className="text-xs text-blue-600 font-medium">Pagamentos (responsaveis):</p>
                    <p className="font-mono text-xs text-blue-700">/pagamentos</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 font-medium">Vitrine de produtos:</p>
                    <p className="font-mono text-xs text-blue-700">/produtos</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Botao salvar */}
          <button
            type="submit"
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-base transition-colors ${
              saved
                ? "bg-green-500 text-white"
                : "bg-(--color-primary) text-gray-900 hover:bg-(--color-primary-hover)"
            }`}
          >
            {saved ? (
              <><CheckCircle className="w-5 h-5" /> Salvo com sucesso!</>
            ) : (
              <><Save className="w-5 h-5" /> Salvar Configuracoes</>
            )}
          </button>
        </form>
      </main>

      {/* Modal teste de conexao */}
      <Modal isOpen={isTesteModal} onClose={() => setIsTesteModal(false)} title="Testando Conexao">
        <div className="space-y-4 text-center py-2">
          {testandoConexao && (
            <>
              <div className="w-12 h-12 border-4 border-(--color-primary) border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-(--color-foreground-secondary)">Conectando ao Banco Cora...</p>
            </>
          )}
          {!testandoConexao && resultadoTeste === "sucesso" && (
            <>
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <p className="font-bold text-green-800">Conexao bem-sucedida!</p>
              <p className="text-sm text-green-600">O Banco Cora foi conectado com sucesso. Pagamentos automaticos estao prontos.</p>
            </>
          )}
          {!testandoConexao && resultadoTeste === "erro" && (
            <>
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
              <p className="font-bold text-red-800">Falha na conexao</p>
              <p className="text-sm text-red-600">Verifique o Client ID e Client Secret e tente novamente. Certifique-se de que as credenciais sao validas para o ambiente selecionado.</p>
            </>
          )}
          {!testandoConexao && (
            <button
              onClick={() => setIsTesteModal(false)}
              className="w-full py-2.5 bg-(--color-primary) text-gray-900 rounded-lg font-semibold hover:bg-(--color-primary-hover)"
            >
              Fechar
            </button>
          )}
        </div>
      </Modal>
    </div>
  )
}
