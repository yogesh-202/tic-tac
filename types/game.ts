export interface Player {
  name: string;
  symbol: "X" | "O";
  id: string;
}

export interface GameState {
  board: (string | null)[];
  currentPlayer: "X" | "O";
  winner: string | null;
  isDraw: boolean;
  gameId: string;
  players: Record<string, Player>;
  isGameActive: boolean;
}



