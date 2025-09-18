import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/react"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "AI Intake Agent - Professional SaaS Dashboard",
  description: "Manage your AI intake bots for medical, legal, and receptionist domains",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Suspense fallback={null}>
          {children}
          <Toaster />
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
