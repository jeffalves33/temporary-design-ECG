"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { User, Lock } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<"admin" | "professora" | null>(null)

  const handleLogin = () => {
    if (selectedRole === "admin") {
      router.push("/admin")
    } else if (selectedRole === "professora") {
      router.push("/professora")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-2xl mb-4">
            <span className="text-2xl font-bold text-white">GR</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ginástica Rítmica</h1>
          <p className="text-gray-600">Sistema de Gestão</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <div className="space-y-3">
            <button
              onClick={() => setSelectedRole("admin")}
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                selectedRole === "admin"
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 hover:border-emerald-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    selectedRole === "admin" ? "bg-emerald-500" : "bg-gray-100"
                  }`}
                >
                  <Lock className={`w-6 h-6 ${selectedRole === "admin" ? "text-white" : "text-gray-600"}`} />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-gray-900">Administrador</div>
                  <div className="text-sm text-gray-500">Acesso completo ao sistema</div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 ${
                    selectedRole === "admin" ? "border-emerald-500 bg-emerald-500" : "border-gray-300"
                  }`}
                >
                  {selectedRole === "admin" && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            </button>

            <button
              onClick={() => setSelectedRole("professora")}
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                selectedRole === "professora"
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 hover:border-emerald-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    selectedRole === "professora" ? "bg-emerald-500" : "bg-gray-100"
                  }`}
                >
                  <User className={`w-6 h-6 ${selectedRole === "professora" ? "text-white" : "text-gray-600"}`} />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-gray-900">Professora</div>
                  <div className="text-sm text-gray-500">Gerenciar turmas e alunas</div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 ${
                    selectedRole === "professora" ? "border-emerald-500 bg-emerald-500" : "border-gray-300"
                  }`}
                >
                  {selectedRole === "professora" && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            </button>
          </div>

          <Button
            onClick={handleLogin}
            disabled={!selectedRole}
            className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Entrar
          </Button>

          <p className="text-xs text-center text-gray-500 mt-4">Demo - Selecione um perfil para acessar</p>
        </div>
      </div>
    </div>
  )
}
