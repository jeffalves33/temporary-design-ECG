"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { UserCircle, Shield } from "lucide-react"
import Image from "next/image"

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <Image
              src="/logo.jpeg"
              alt="Equipe Carolina Garcia"
              width={120}
              height={120}
              className="rounded-2xl shadow-lg"
            />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Equipe Carolina Garcia</h1>
          <p className="text-muted-foreground">Sistema de Gestão de Ginástica Rítmica</p>
        </div>

        <div className="bg-card rounded-lg shadow-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-center mb-6">Selecione seu perfil</h2>

          <Button
            onClick={() => router.push("/admin")}
            className="w-full h-auto py-6 flex flex-col items-center gap-2 bg-(--color-primary) hover:bg-(--color-primary-hover) text-white"
            size="lg"
          >
            <Shield className="w-8 h-8" />
            <div>
              <div className="font-bold text-lg">Administrador</div>
              <div className="text-xs opacity-90">Gestão completa do sistema</div>
            </div>
          </Button>

          <Button
            onClick={() => router.push("/professora")}
            className="w-full h-auto py-6 flex flex-col items-center gap-2 bg-(--color-primary) hover:bg-(--color-primary-hover) text-white"
            size="lg"
          >
            <UserCircle className="w-8 h-8" />
            <div>
              <div className="font-bold text-lg">Professora</div>
              <div className="text-xs opacity-90">Minhas turmas e alunas</div>
            </div>
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">Versão 1.0 • PWA Mobile First</p>
      </div>
    </div>
  )
}
