"use client"

import type React from "react"
import { useState } from "react"
import { Search, LayoutGrid, List, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"

interface SearchBarProps {
  onSearch: (query: string) => void
  viewMode: "grid" | "list"
  onToggleViewMode: () => void
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, viewMode, onToggleViewMode }) => {
  const [searchValue, setSearchValue] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
    onSearch(e.target.value)
  }

  const handleRefresh = () => {
    // Verificar se estamos em um ambiente Electron
    if (typeof window !== "undefined" && window.require) {
      const { ipcRenderer } = window.require("electron")
      ipcRenderer.invoke("refresh-games")
    } else {
      console.log("Função de atualização não disponível no ambiente web")
    }
  }

  return (
    <div className="flex items-center gap-4 p-4 ">
      <SidebarTrigger className="text-gray-400 hover:text-white" />

      <div className="relative flex-grow max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Pesquisar jogos..."
          value={searchValue}
          onChange={handleInputChange}
          className="pl-10 bg-[#202020] border-[#333] text-white"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleViewMode}
          title={viewMode === "grid" ? "Mudar para visualização em lista" : "Mudar para visualização em grade"}
        >
          {viewMode === "grid" ? <List className="h-5 w-5" /> : <LayoutGrid className="h-5 w-5" />}
        </Button>

        <Button variant="ghost" size="icon" onClick={handleRefresh} title="Atualizar biblioteca">
          <RefreshCw className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

