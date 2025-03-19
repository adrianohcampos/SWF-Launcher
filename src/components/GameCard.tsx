"use client"

import type React from "react"
import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Game } from "../types"

interface GameCardProps {
  game: Game
  onPlayGame: (gameId: string) => void
}

export const GameCard: React.FC<GameCardProps> = ({ game, onPlayGame }) => {
  // Adicionando handlers de drag event corretamente
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("application/json", JSON.stringify(game))
  }

  // Função para lidar com erros de carregamento de imagem
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.log("Erro ao carregar imagem:", game.coverPath)
    ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=300&width=200"
  }

  return (
    <div
      className="bg-[#202020] rounded-lg overflow-hidden flex flex-col transition-transform hover:scale-[1.02]"
      draggable={true}
      onDragStart={handleDragStart}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        {game.coverPath.startsWith("file://") ? (
          <img
            src={game.coverPath || "/placeholder.svg"}
            alt={`${game.title} cover`}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <img
            src={`file://${game.coverPath}`}
            alt={`${game.title} cover`}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        )}
      </div>
      <div className="p-2 flex flex-col flex-grow">
        <h3 className="font-bold text-lg mb-1 truncate">{game.title}</h3>
        <div className="text-xs text-gray-400 mb-3">{game.categories?.join(", ")}</div>
        <div className="mt-auto">
          <Button className="w-full bg-[#0074e4] hover:bg-[#0066cc] text-white" onClick={() => onPlayGame(game.id)}>
            <Play className="w-4 h-4 mr-2" />
            Jogar
          </Button>
        </div>
      </div>
    </div>
  )
}

