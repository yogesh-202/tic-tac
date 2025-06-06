export interface Player {
  id: string
  name: string
  symbol: "X" | "O"
}

export interface GameState {
  board: (string | null)[]
  currentPlayer: "X" | "O"
  winner: string | null
  isDraw: boolean
  gameId: string
  players: Record<string, Player>
  isGameActive: boolean
}
