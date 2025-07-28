"use client";

import { io, Socket } from "socket.io-client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast }from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Users, Gamepad2, Trophy, RotateCcw } from "lucide-react";
import GameBoard from "@/components/game-board";
import Chat from "@/components/chat";
import type { GameState } from "@/types/game";

export default function TicTacToeGame() {
  const socketRef = useRef<Socket | null>(null);
  
  const [gameState, setGameState] = useState<GameState>({
    board: Array(9).fill(null),
    currentPlayer: "X",
    winner: null,
    isDraw: false,
    gameId: "",
    players: {},
    isGameActive: false,
  });


  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [playerId] = useState(() => Math.random().toString(36).substr(2, 9));
  


  useEffect(() => {
  const socket = io( process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
    transports: ['websocket', 'polling'],
    reconnection: true, 
    reconnectionAttempts: 5,  
    reconnectionDelay: 1000   
  });    

  socketRef.current = socket;
  
    socket.on("connect_error", (error) => {
    console.error("Connection error:", error);
    toast({
      title: "Connection Error",
      description: "Unable to connect to game server",
      variant: "destructive",
    });
  });


    socket.on("gameCreated", (updatedGameState: GameState) => {
      console.log("Game created with state:", updatedGameState);
      setGameState(updatedGameState);
      setWinningLine(null);
    });

    socket.on("playerJoined", (updatedGameState: GameState) => {
      console.log("Player joined with state:", updatedGameState);
      setGameState(updatedGameState);
      setWinningLine(null);
      toast({
        title: "Player joined!",
        description: "The game can now begin",
        variant: "default",
      });
    });

    socket.on("joinError", (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    });

    socket.on("moveMade", (updatedGameState: GameState) => { //ye Game state type define krta h ki staet mein kya kya hoga ...vallue nhi change ho rhi h 
      console.log("Move made, new state:", updatedGameState);
      setGameState(updatedGameState); ///ye updatedGameState server se aaya h from event "moveMade" in server.ts
      if (updatedGameState.winner) { 
        // Calculate winning line when there's a winner
        const lines = [
          [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
          [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
          [0, 4, 8], [2, 4, 6] // diagonals
        ];
        for (const line of lines) {
          const [a, b, c] = line;
          if (
            updatedGameState.board[a] &&
            updatedGameState.board[a] === updatedGameState.board[b] &&
            updatedGameState.board[a] === updatedGameState.board[c]
          ) {
            setWinningLine(line);
            // Show toast notification for winner
            const winnerName = updatedGameState.winner === updatedGameState.players[playerId]?.symbol
              ? "You"
              : getPlayerBySymbol(updatedGameState.winner)?.name;
            toast({
              title: "Game Over! 🎉",
              description: `${winnerName} won the game!`,
              variant: "default",
            });
            break;
          }
        }
      } else {
        setWinningLine(null);
      }
    });

    socket.on("gameReset", (updatedGameState: GameState) => {
      console.log("Game reset with state:", updatedGameState);
      setGameState(updatedGameState);
      setWinningLine(null);
      toast({
        title: "New Game",
        description: "The game has been reset",
        variant: "default",
      });
    });

    socket.on("playerLeft", () => {
      setGameState({
        board: Array(9).fill(null),
        currentPlayer: "X",
        winner: null,
        isDraw: false,
        gameId: "",
        players: {},
        isGameActive: false,
      });
      setRoomId("");
      setIsHost(false);
      setWinningLine(null);
      toast({
        title: "Player left",
        description: "The other player has left the game",
        variant: "destructive",
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const generateRoomId = () => {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  };

  const createGame = () => {
    if (!playerName.trim()) { 
      toast({
        title: "Name required",
        description: "Please enter your name to create a game",
        variant: "destructive",
      });
      return;
    }

    const newRoomId = generateRoomId();
    const newGameState: GameState = {
      board: Array(9).fill(null),
      currentPlayer: "X",
      winner: null,
      isDraw: false,
      gameId: newRoomId,
      players: {
        [playerId]: { name: playerName, symbol: "X", id: playerId },
      },
      isGameActive: true,
    };

    socketRef.current?.emit("createGame", {
      gameId: newRoomId,
      gameState: newGameState,
    });

    setGameState(newGameState);
    setRoomId(newRoomId);
    setIsHost(true);
  };

  const joinGame = () => {
    if (!playerName.trim() || !roomId.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter your name and room ID",
        variant: "destructive",
      });
      return;
    }

    const player = {
      name: playerName,
      symbol: "O" as const,
      id: playerId,
    };

    socketRef.current?.emit("joinGame", {
      gameId: roomId,
      player,
    });

    setIsHost(false);
  };

  const makeMove = (index: number) => {
    if (!gameState.isGameActive || gameState.winner || gameState.isDraw) return;

    const currentPlayer = gameState.players[playerId];
    if (!currentPlayer || currentPlayer.symbol !== gameState.currentPlayer) return;

    socketRef.current?.emit("makeMove", {
      gameId: gameState.gameId,
      index,
      playerId,
    });
  };

  const resetGame = () => {
    socketRef.current?.emit("resetGame", {
      gameId: gameState.gameId,
    });
    setWinningLine(null);
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(gameState.gameId);
    toast({
      title: "Copied!",
      description: "Room ID copied to clipboard",
    });
  };

  const getPlayerBySymbol = (symbol: string) => {
    return Object.values(gameState.players).find(
      (player) => player.symbol === symbol
    );
  };


  if (!gameState.gameId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md mx-auto pt-8">
          <div className="text-center mb-8">
            <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Tic Tac Toe
            </h1>
            <p className="text-gray-600">Play with friends online!</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Enter Your Name</CardTitle>
              <CardDescription>Choose a name to play with</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="mb-4"
              />
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Create New Game
                </CardTitle>
                <CardDescription>
                  Start a new game and invite a friend
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={createGame} className="w-full" size="lg">
                  Create Game
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5" />
                  Join Game
                </CardTitle>
                <CardDescription>
                  Enter a room ID to join an existing game
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  className="uppercase"
                />
                <Button
                  onClick={joinGame}
                  className="w-full"
                  size="lg"
                  variant="outline"
                >
                  Join Game
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto pt-4">
        {/* Game Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="w-6 h-6 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Tic Tac Toe</h1>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary">Room: {gameState.gameId}</Badge>
            <Button size="sm" variant="ghost" onClick={copyRoomId}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Players Info */}
        <Card className="mb-4">
          <CardContent className="py-2 px-3">
            <div className="flex flex-row gap-2 justify-center items-center">
              {Object.values(gameState.players).map((player) => (
                <div
                  key={player.id}
                  className={`flex flex-col items-center justify-center px-2 py-1 rounded border ${
                    gameState.currentPlayer === player.symbol && gameState.isGameActive
                      ? "border-indigo-400 bg-indigo-50"
                      : "border-gray-200 bg-white"
                  } min-w-[70px] mx-1`}
                  style={{ fontSize: '0.95rem' }}
                >
                  <div className="text-xl font-bold mb-0.5">{player.symbol}</div>
                  <div className="flex items-center gap-1 text-xs font-medium">
                    {player.name}
                    {player.id === playerId && (
                      <span className="ml-1 px-1 py-0.5 rounded bg-gray-100 border text-gray-600 border-gray-300 text-[10px]">You</span>
                    )}
                  </div>
                </div>
              ))}
              {Object.keys(gameState.players).length === 1 && (
                <div
                  className="flex flex-col items-center justify-center px-2 py-1 rounded border border-dashed border-gray-300 bg-white min-w-[70px] mx-1"
                  style={{ fontSize: '0.95rem' }}
                >
                  <div className="text-xl font-bold mb-0.5 text-gray-400">?</div>
                  <div className="text-xs text-gray-400">Waiting...</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Game Status */}
        {gameState.isGameActive && (
          <Card className="mb-6">
            <CardContent className="pt-6 text-center">
              {gameState.winner ? (
                <div className="space-y-2">
                  <div className="text-2xl">🎉</div>
                  <div className="text-lg font-semibold">
                   {gameState.winner === gameState.players[playerId]?.symbol 
              ? "You won! 🏆" 
              : `${getPlayerBySymbol(gameState.winner)?.name} won! 🏆`}
                  </div>
                  <div className="text-sm text-gray-500">
            {gameState.winner === "X" ? "Player X" : "Player O"} has won the game!
          </div>

                </div>
              ) : gameState.isDraw ? (
                <div className="space-y-2">
                  <div className="text-2xl">🤝</div>
                  <div className="text-lg font-semibold">It's a draw!</div>
                </div>
              ) : (
                <div className="text-lg font-semibold">
                  {gameState.currentPlayer ===
                  gameState.players[playerId]?.symbol
                    ? "Your turn!"
                    : `${
                        getPlayerBySymbol(gameState.currentPlayer)?.name
                      }'s turn`}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Game Board */}
        <div className="flex flex-col items-center justify-center gap-2">
          <GameBoard
            board={gameState.board}
            onSquareClick={makeMove}
            winningLine={winningLine}
            disabled={
              !gameState.isGameActive || 
              Object.keys(gameState.players).length < 2 ||
              !!gameState.winner ||
              gameState.isDraw
            }
          />
        </div>

        {/* Chat Button (not fixed, above controls) */}
        {gameState.isGameActive && Object.keys(gameState.players).length === 2 && (
          <div className="w-full flex justify-center mt-2 mb-2">
            <Chat
              playerName={playerName}
              socket={socketRef.current}
              gameId={gameState.gameId}
              modalOnMobile={true}
            />
          </div>
        )}

        {/* Game Controls - horizontal and compact */}
        <div className="mt-2 flex flex-row gap-2 justify-center w-full">
          <Button onClick={resetGame} variant="outline" size="sm" className="flex-1 min-w-0">
            <RotateCcw className="w-4 h-4 mr-1" />
            New Game
          </Button>
          <Button
            onClick={() => {
              setGameState({
                board: Array(9).fill(null),
                currentPlayer: "X",
                winner: null,
                isDraw: false,
                gameId: "",
                players: {},
                isGameActive: false,
              });
              setRoomId("");
              setIsHost(false);
            }}
            variant="secondary"
            size="sm"
            className="flex-1 min-w-0"
          >
            Leave Game
          </Button>
        </div>

        {!gameState.isGameActive &&
          Object.keys(gameState.players).length === 1 && (
            <Card className="mt-6">
              <CardContent className="pt-6 text-center">
                <div className="text-lg font-semibold mb-2">
                  Share this room ID with a friend:
                </div>
                <div className="text-2xl font-mono font-bold text-indigo-600 mb-4">
                  {gameState.gameId}
                </div>
                <Button onClick={copyRoomId} variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Room ID
                </Button>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
}
