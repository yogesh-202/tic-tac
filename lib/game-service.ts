import { Socket } from "socket.io-client";
import type { GameState, Player } from "@/types/game.mts";

export class GameService {
  private socket: Socket;
  private gameState: GameState;
  private onGameStateChange: (state: GameState) => void;

  constructor(
    socket: Socket, 
    initialState: GameState,
    onStateChange: (state: GameState) => void
  ) {
    this.socket = socket;
    this.gameState = initialState;
    this.onGameStateChange = onStateChange;
    this.initializeSocketListeners();
  }

  private initializeSocketListeners() {
    this.socket.on("gameCreated", (state: GameState) => {
      console.log("Game created:", state);
      this.updateGameState(state);
    });

    this.socket.on("playerJoined", (state: GameState) => {
      console.log("Player joined:", state);
      this.updateGameState(state);
    });

    this.socket.on("moveMade", (state: GameState) => {
      this.updateGameState(state);
    });

    this.socket.on("gameReset", (state: GameState) => {
      this.updateGameState(state);
    });
  }

  private updateGameState(newState: GameState) {
    this.gameState = newState;
    this.onGameStateChange(newState);
  }

  createGame(playerId: string, playerName: string): string {
    const roomId = Math.random().toString(36).substr(2, 6).toUpperCase();
    
    const initialState: GameState = {
      board: Array(9).fill(null),
      currentPlayer: "X",
      winner: null,
      isDraw: false,
      gameId: roomId,
      players: {
        [playerId]: { name: playerName, symbol: "X", id: playerId }
      },
      isGameActive: true
    };

    this.socket.emit("createGame", {
      gameId: roomId,
      gameState: initialState
    });

    return roomId;
  }

  joinGame(gameId: string, player: Player) {
    this.socket.emit("joinGame", {
      gameId,
      player
    });
  }

  makeMove(index: number) {
    if (!this.gameState.gameId) return;
    
    this.socket.emit("makeMove", {
      gameId: this.gameState.gameId,
      index,
      playerId: this.gameState.currentPlayer
    });
  }

  resetGame() {
    if (!this.gameState.gameId) return;
    
    this.socket.emit("resetGame", {
      gameId: this.gameState.gameId
    });
  }

  disconnect() {
    this.socket.disconnect();
  }
}