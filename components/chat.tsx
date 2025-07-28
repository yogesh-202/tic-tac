"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, ChevronDown, ChevronUp, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Message {
  sender: string
  text: string
  timestamp: number
}


interface ChatProps {
  playerName: string
  socket: any
  gameId: string
  modalOnMobile?: boolean
}


export default function Chat({ playerName, socket, gameId, modalOnMobile }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Detect mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600

  useEffect(() => {
    if (!socket) return

    socket.on("chatMessage", (message: Message) => {
      setMessages((prev) => [...prev, message])
      if (!isOpen && message.sender !== playerName) {
        setUnreadCount((prev) => prev + 1)
      }
    })

    return () => {
      socket.off("chatMessage")
    }
  }, [socket, isOpen, playerName])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0)
    }
  }, [isOpen])

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !socket) return

    const message: Message = {
      sender: playerName,
      text: newMessage.trim(),
      timestamp: Date.now(),
    }

    socket.emit("chatMessage", { gameId, message })
    setNewMessage("")
  }

  // Modal mode for mobile
  if (modalOnMobile && isMobile) {
    return (
      <>
        <Button
          variant="outline"
          className="w-full flex items-center gap-2 justify-center"
          onClick={() => setShowModal(true)}
        >
          <MessageSquare className="w-5 h-5" />
          Game Chat
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">{unreadCount}</Badge>
          )}
        </Button>
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg w-[95vw] max-w-sm mx-auto flex flex-col">
              <div className="flex items-center justify-between p-3 border-b">
                <span className="flex items-center gap-2 text-lg font-semibold">
                  <MessageSquare className="w-5 h-5" /> Game Chat
                </span>
                <Button variant="ghost" size="icon" onClick={() => { setShowModal(false); setIsOpen(false); }}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <ScrollArea className="h-[300px] pr-4" ref={scrollRef}>
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex flex-col ${
                          message.sender === playerName ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`rounded-lg px-3 py-2 max-w-[80%] ${
                            message.sender === playerName
                              ? "bg-blue-100 text-blue-900"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <div className="text-xs font-medium mb-1">
                            {message.sender === playerName ? "You" : message.sender}
                          </div>
                          <div>{message.text}</div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <form onSubmit={sendMessage} className="mt-4 flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button type="submit" size="sm">
                    Send
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  // Default (desktop or not modal)
  return (
    <div className="w-[300px]">
      <Card className="w-full shadow-lg">
        <CardHeader className="p-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="w-5 h-5" />
              Game Chat
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="h-8 w-8 p-0"
            >
              {isOpen ? <ChevronUp /> : <ChevronDown />}
            </Button>
          </div>
        </CardHeader>
        {isOpen && (
          <CardContent className="p-3">
            <ScrollArea className="h-[300px] pr-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex flex-col ${
                      message.sender === playerName ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`rounded-lg px-3 py-2 max-w-[80%] ${
                        message.sender === playerName
                          ? "bg-blue-100 text-blue-900"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <div className="text-xs font-medium mb-1">
                        {message.sender === playerName ? "You" : message.sender}
                      </div>
                      <div>{message.text}</div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <form onSubmit={sendMessage} className="mt-4 flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button type="submit" size="sm">
                Send
              </Button>
            </form>
          </CardContent>
        )}
      </Card>
    </div>
  )
} 