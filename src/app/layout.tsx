import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import Header from "@/components/layout/Header"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "ALUVE - Calculadora de Ventanas",
  description: "Sistema de cálculo y cotización de ventanas de aluminio. Optimización de cortes, materiales y generación de PDF.",
  keywords: ["ventanas", "aluminio", "cotización", "cálculo", "cortes"],
  authors: [{ name: "ALUVE" }],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Header />
        <main className="container mx-auto">{children}</main>
      </body>
    </html>
  )
}
