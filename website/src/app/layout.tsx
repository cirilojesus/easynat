import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/Header";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "easynat — Componentes para React Native", template: "%s · easynat" },
  description: "Librería de componentes para React Native: botones, formularios con validación, modales, tablas, gráficos, editor de texto, editor de imágenes, visor de PDF y más. Con tema, variantes y TypeScript.",
  keywords: ["React Native", "componentes", "UI", "Expo", "librería", "TypeScript", "gráficos", "formularios", "PDF", "editor"],
  openGraph: { type: "website", siteName: "easynat", locale: "es_ES" },
  twitter: { card: "summary_large_image" },
  // Código de verificación de Google Search Console (la etiqueta meta "google-site-verification"): en .env.local o al compilar
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } } : {}),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <footer className="border-t border-border py-8 text-center text-sm text-muted">
          easynat · Licencia MIT · Hecho para React Native y Expo
        </footer>
      </body>
    </html>
  );
}
