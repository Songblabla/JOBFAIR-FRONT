import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from 'next-themes'
import Navbar from "@/components/nav/navbar";
import ProtectedRoute from "@/components/protected/protectedRoute";
import ToasterProvider from "@/providers/ToasterProvider";

export const metadata: Metadata = {
  title: "Jobfair",
  description: "Experimental Platform for Jobfair System for User-Company",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen bg-background font-sans antialiased">
          <ProtectedRoute>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <div className="relative flex min-h-screen flex-col">
                <ToasterProvider />
                <Navbar />
                <div className="flex-1">{children}</div>
              </div>
            </ThemeProvider>
          </ProtectedRoute>
        </body>
    </html>
  )
}