"use client"

import { Button } from "@/components/ui/button"

interface GameBoardProps {
  board: (string | null)[]
  onSquareClick: (index: number) => void
  winningLine: number[] | null
  disabled?: boolean
}


export default function GameBoard({ board, onSquareClick, winningLine, disabled }: GameBoardProps) {
  return (
    <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
      {board.map((value, index) => (
        <Button
          key={index}
          variant="outline"
          className={`
            aspect-square text-4xl font-bold h-20 w-20 sm:h-24 sm:w-24
            ${value ? "bg-white" : "bg-gray-50 hover:bg-gray-100"}
            ${winningLine?.includes(index) ? "bg-green-100 border-green-500" : ""}
            ${disabled ? "cursor-not-allowed opacity-50" : ""}
          `}
          onClick={() => !disabled && onSquareClick(index)}
          disabled={disabled || !!value}
        >
          {value && <span className={value === "X" ? "text-blue-600" : "text-red-600"}>{value}</span>}
        </Button>
      ))}
    </div>
  )
}


