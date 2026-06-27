import { TooltipProvider } from "@/components/ui/tooltip"

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div>
      <TooltipProvider>{children}</TooltipProvider>
    </div>
  )
}
