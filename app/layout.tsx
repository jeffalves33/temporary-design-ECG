import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Ginástica Rítmica - Gestão",
  description: "Sistema de gestão para rede de escolas de ginástica rítmica infantil",
  generator: "v0.app",
  applicationName: "Ginástica Rítmica",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ginástica Rítmica",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      {
        url: "/icon-192.jpg",
        sizes: "192x192",
        type: "image/jpeg",
      },
      {
        url: "/icon-512.jpg",
        sizes: "512x512",
        type: "image/jpeg",
      },
    ],
    apple: "/icon-192.jpg",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#10b981",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
