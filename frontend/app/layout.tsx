import 'leaflet/dist/leaflet.css';
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context" // Corrected import path
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GramAlert Plus - Rural Governance Platform",
  description: "Connecting villagers with their local panchayat for alerts and grievances",
  
  // --- ENHANCEMENTS for Responsiveness & PWA ---
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  manifest: "/manifest.json",
  themeColor: "#16a34a", // Matching the app's green theme
  
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      {/* Added `antialiased` for smoother font rendering */}
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          {children}
          {/* Toaster for sitewide notifications */}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}