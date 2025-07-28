import { createServer } from "http";
import { Server } from "socket.io";
import { GameState } from "./types/game";

const httpServer = createServer((req, res) => {

  res.setHeader("Access-Control-Allow-Origin", "https://tic-tac-wheat-alpha.vercel.app/", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  
  if (req.url === '/') {
    res.writeHead(200);
    res.end('Server is running');
    return;
  }
  res.writeHead(404);
  res.end();
});


const io = new Server(httpServer, {
  cors: {
    origin: [
      "https://tic-tac-wheat-alpha.vercel.app/",
      "https://tictactoe-frontend-production.up.railway.app", 
      "http://localhost:3000",
      "*"
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
  
  transports: ['websocket', 'polling'],
  
  pingTimeout: 60000,
  pingInterval: 25000
});


interface GameRoom {
  gameState: GameState;
  players: string[];
}

const games = new Map<string, GameRoom>();


const checkWinner = (board: (string | null)[]): string | null => {
  const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ];

  for (const combo of winningCombos) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
};


const checkDraw = (board: (string | null)[]): boolean => {
  return board.every(cell => cell !== null);
};

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("createGame", ({ gameId, gameState }) => {
    if (games.has(gameId)) {
      socket.emit("joinError", { message: "Game already exists" });
      return;
    }

    games.set(gameId, {
      gameState,
      players: [socket.id]
    });
    socket.join(gameId);
    io.to(gameId).emit("gameCreated", gameState);
    console.log(`Game created: ${gameId}`);
  });


  socket.on("joinGame", ({ gameId, player }) => {
    const game = games.get(gameId);
    if (!game) {
      socket.emit("joinError", { message: "Game not found" });
      return;
    }
    
    if (game.players.length >= 2) {
      socket.emit("joinError", { message: "Game is full" });
      return;
    }

    game.players.push(socket.id);
    game.gameState.players[player.id] = player;
    game.gameState.isGameActive = true;
    socket.join(gameId);
    io.to(gameId).emit("playerJoined", game.gameState);
    console.log(`Player joined game: ${gameId}`, game.gameState);
  });

  socket.on("makeMove", ({ gameId, playerId, index }) => {
    const game = games.get(gameId); 

    if (!game) return;

    const { gameState } = game;
    if (!gameState.isGameActive || gameState.board[index] !== null) return; 
    const player = gameState.players[playerId];
    if (!player || player.symbol !== gameState.currentPlayer) return;

    
    gameState.board[index] = gameState.currentPlayer;

   
    const winner = checkWinner(gameState.board);
    if (winner) {
      gameState.winner = winner;
      gameState.isGameActive = false;
      io.to(gameId).emit("moveMade", gameState);
      return;
    }

    
    if (checkDraw(gameState.board)) {
      gameState.isDraw = true;
      gameState.isGameActive = false;
      io.to(gameId).emit("moveMade", gameState);
      return;
    }

   
    gameState.currentPlayer = gameState.currentPlayer === "X" ? "O" : "X";
    io.to(gameId).emit("moveMade", gameState);
  });

  socket.on("resetGame", ({ gameId }) => {
    const game = games.get(gameId);
    if (game) {
      
      game.gameState.board = Array(9).fill(null);
      game.gameState.currentPlayer = "X";
      game.gameState.winner = null;
      game.gameState.isDraw = false;
      game.gameState.isGameActive = true;

      
      io.in(gameId).emit("gameReset", game.gameState);
      console.log(`Game ${gameId} reset - broadcasting to all players`);
    }
  });

  socket.on("chatMessage", ({ gameId, message }) => {
   
    io.to(gameId).emit("chatMessage", message);
  });

  socket.on("disconnect", () => {
    for (const [gameId, game] of games.entries()) {
      if (game.players.includes(socket.id)) {
        socket.to(gameId).emit("playerLeft");
        games.delete(gameId);
        console.log(`Game ${gameId} ended - player disconnected`);
      }
    }
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = parseInt(process.env.PORT || '3001', 10);
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});


