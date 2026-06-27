"use client"
import { socket } from "@/lib/socket"
import { createContext, useContext, useEffect, ReactNode } from "react"
import { Socket } from "socket.io-client"

const SocketContext = createContext<Socket | null>(null)

export const SocketProvider = ({ children }: { children: ReactNode }) => {
 
  useEffect(() => {
    return () => {
      socket.disconnect() // Disconnects only when the entire app unmounts
    }
  }, [socket])

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  )
}

// Custom hook for easy consumption
export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context)
    throw new Error("useSocket must be used within a SocketProvider")
  return context
}
