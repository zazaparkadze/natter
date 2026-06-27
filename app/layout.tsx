import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { DataProvider } from "@/context/dataContext"
import { Metadata } from "next"
import Template from "./template"
import {Watch} from "@/components/watch"

export const metadata: Metadata = {
  title: "Chat App",
  description: "next & socket.io. chat app",
}

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable,
        
      )}
    >
      <body className={"bg-slate-900 text-white"}>
        <ThemeProvider>
          <DataProvider>
            <Watch />
            {" "}
            <Template key={"/"}>{children}</Template>
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
