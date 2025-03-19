"use client"

import type React from "react"
import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Game } from "../types"

interface GameListItemProps {
  game: Game
  onPlayGame: (gameId: string) => void
}

export const GameListItem: React.FC<GameListItemProps> = ({ game, onPlayGame }) => {
  // Adicionando handlers de drag event corretamente
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("application/json", JSON.stringify(game))
  }

  // Função para lidar com erros de carregamento de imagem
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.log("Erro ao carregar imagem:", game.coverPath)
    ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=64&width=64"
  }

  return (
    <div
      className="bg-[#202020] rounded-lg p-3 flex items-center gap-4 transition-colors hover:bg-[#2a2a2a]"
      draggable={true}
      onDragStart={handleDragStart}
    >
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded">
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
      <div className="flex-grow">
        <h3 className="font-bold">{game.title}</h3>
        <div className="text-xs text-gray-400">{game.categories?.join(", ")}</div>
      </div>
      <Button className="bg-[#0074e4] hover:bg-[#0066cc] text-white" onClick={() => onPlayGame(game.id)}>
        <Play className="w-4 h-4 mr-2" />
        Jogar
      </Button>
    </div>
  )
}

