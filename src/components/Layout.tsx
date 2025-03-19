import type React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-[#121212] text-white">{children}</div>
    </SidebarProvider>
  )
}

