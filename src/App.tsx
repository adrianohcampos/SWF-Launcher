"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Layout } from "./components/Layout"
import { GameGrid } from "./components/GameGrid"
import { Sidebar } from "./components/Sidebar"
import { SearchBar } from "./components/SearchBar"
import type { Game } from "./types"

function App() {
  const [games, setGames] = useState<Game[]>([])
  const [filteredGames, setFilteredGames] = useState<Game[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Verificar se estamos em um ambiente Electron
    const isElectron = window.require !== undefined

    if (isElectron) {
      const { ipcRenderer } = window.require("electron")

      console.log("Solicitando jogos ao processo principal...")

      // Solicitar jogos ao processo principal do Electron
      ipcRenderer
        .invoke("get-games")
        .then((result: Game[]) => {
          console.log("Jogos recebidos:", result.length)
          setGames(result)
          setFilteredGames(result)

          // Extrair categorias únicas
          const uniqueCategories = Array.from(new Set(result.flatMap((game) => game.categories || [])))
          setCategories(uniqueCategories)
          setLoading(false)
        })
        .catch((err: Error) => {
          console.error("Erro ao obter jogos:", err)
          setError("Falha ao carregar jogos: " + err.message)
          setLoading(false)
        })

      // Adicionar listener para atualização de jogos
      const handleGamesUpdated = (_: any, updatedGames: Game[]) => {
        console.log("Jogos atualizados:", updatedGames.length)
        setGames(updatedGames)
      }

      ipcRenderer.on("games-updated", handleGamesUpdated)

      return () => {
        ipcRenderer.removeListener("games-updated", handleGamesUpdated)
      }
    } else {
      // Dados de exemplo para ambiente não-Electron (desenvolvimento web)
      console.log("Ambiente não-Electron detectado, usando dados de exemplo")
      const exampleGames: Game[] = [
        {
          id: "exemplo_jogo",
          title: "Exemplo de Jogo",
          filePath: "/games/exemplo_jogo.swf",
          coverPath: "/placeholder.svg?height=300&width=200",
          categories: ["Ação", "Aventura"],
        },
        {
          id: "outro_jogo",
          title: "Outro Jogo",
          filePath: "/games/outro_jogo.swf",
          coverPath: "/placeholder.svg?height=300&width=200",
          categories: ["Puzzle", "Estratégia"],
        },
      ]

      setGames(exampleGames)
      setFilteredGames(exampleGames)
      setCategories(["Ação", "Aventura", "Puzzle", "Estratégia"])
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let result = games

    // Filtrar por pesquisa
    if (searchQuery) {
      result = result.filter((game) => game.title.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Filtrar por categoria
    if (selectedCategory) {
      result = result.filter((game) => game.categories?.includes(selectedCategory))
    }

    setFilteredGames(result)
  }, [searchQuery, selectedCategory, games])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category)
  }

  const handlePlayGame = (gameId: string) => {
    const isElectron = window.require !== undefined

    if (isElectron) {
      const { ipcRenderer } = window.require("electron")
      ipcRenderer.invoke("play-game", gameId)
    } else {
      console.log("Função de jogar não disponível no ambiente web")
      alert(`Jogo ${gameId} seria iniciado no ambiente Electron`)
    }
  }

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "grid" ? "list" : "grid"))
  }

  // Adicionando handlers para eventos de drag e drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    // Aqui você pode implementar a lógica para quando um jogo é solto
    // Por exemplo, adicionar a favoritos ou a uma playlist
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#121212] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0074e4] mx-auto mb-4"></div>
          <p>Carregando biblioteca de jogos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#121212] text-white">
        <div className="text-center p-6 bg-[#202020] rounded-lg max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Erro</h2>
          <p className="mb-4">{error}</p>
          <button
            className="bg-[#0074e4] hover:bg-[#0066cc] text-white px-4 py-2 rounded"
            onClick={() => window.location.reload()}
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <Sidebar categories={categories} selectedCategory={selectedCategory} onCategorySelect={handleCategorySelect} />
      <div className="flex flex-col w-full" onDragOver={handleDragOver} onDrop={handleDrop}>
        <SearchBar onSearch={handleSearch} viewMode={viewMode} onToggleViewMode={toggleViewMode} />
        <GameGrid games={filteredGames} onPlayGame={handlePlayGame} viewMode={viewMode} />
      </div>
    </Layout>
  )
}

export default App

