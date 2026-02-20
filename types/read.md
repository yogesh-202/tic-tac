# Multiplayer Tic Tac Toe

A real-time multiplayer Tic Tac Toe game built with Next.js, Socket.IO, and Tailwind CSS. Play with friends online in a modern, responsive interface with real-time chat functionality.

## Features

- 🎮 Real-time multiplayer gameplay
- 💬 In-game chat system
- 📱 Responsive design for mobile and desktop
- 🎯 Visual winning combinations
- 🔄 Game reset functionality
- 👥 Player turn indicators
- 🏆 Winner announcements
- 📱 Mobile-optimized chat interface

## Tech Stack

- **Frontend:**
  - Next.js 14
  - React
  - Tailwind CSS
  - Shadcn UI Components
  - Socket.IO Client

- **Backend:**
  - Node.js
  - Socket.IO
  - TypeScript

## Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/multiplayer-tictactoe.git
cd multiplayer-tictactoe
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env` file in the root directory:
```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## Development

1. Start the Socket.IO server:
```bash
pnpm run server
```

2. In a new terminal, start the Next.js development server:
```bash
pnpm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Play

1. Enter your name and create a new game
2. Share the room ID with a friend
3. Your friend can join using the room ID
4. Take turns placing X's and O's
5. First player to get three in a row wins!
6. Use the chat to communicate with your opponent
7. Click "New Game" to start a new match
8. Click "Leave Game" to exit the current game

## Deployment

This project requires a platform that supports WebSocket connections. Recommended deployment options:

1. **Render**
   - Deploy the Socket.IO server as a Web Service
   - Deploy the Next.js frontend as a Static Site
   - Update the `NEXT_PUBLIC_SOCKET_URL` to your deployed server URL

2. **Railway**
   - Supports both Node.js and WebSocket connections
   - Easy deployment from GitHub

3. **Fly.io**
   - Good for containerized applications
   - Supports WebSocket connections

## Project Structure

```
multiplayer-tictactoe/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main game page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── chat.tsx          # Chat component
│   ├── game-board.tsx    # Game board component
│   └── ui/               # UI components
├── server.mts            # Socket.IO server
├── types/                # TypeScript types
└── public/              # Static assets
```


## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](read2.md) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Socket.IO](https://socket.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/) 

