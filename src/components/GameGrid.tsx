import type React from "react"
import { GameCard } from "./GameCard"
import { GameListItem } from "./GameListItem"
import type { Game } from "../types"

interface GameGridProps {
  games: Game[]
  onPlayGame: (gameId: string) => void
  viewMode: "grid" | "list"
}

export const GameGrid: React.FC<GameGridProps> = ({ games, onPlayGame, viewMode }) => {
  if (games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <h2 className="text-2xl font-bold text-gray-400">Nenhum jogo encontrado</h2>
        <p className="text-gray-500 mt-2">Tente ajustar seus filtros ou adicionar jogos à pasta 'games'</p>
      </div>
    )
  }

  return (
    <div className="p-6 overflow-auto">
      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {games.map((game) => (
            <GameCard key={game.id} game={game} onPlayGame={onPlayGame} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {games.map((game) => (
            <GameListItem key={game.id} game={game} onPlayGame={onPlayGame} />
          ))}
        </div>
      )}
    </div>
  )
}

