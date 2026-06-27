"use client"
import { createContext, useContext, useState } from "react"

type DataContextType = {
  username: string
  setUsername: React.Dispatch<React.SetStateAction<string>>
  success: boolean
  setSuccess: React.Dispatch<React.SetStateAction<boolean>>
  roomId: string | null
  setRoomId: React.Dispatch<React.SetStateAction<(string | null)>>
  search: string
  setSearch: React.Dispatch<React.SetStateAction<string>>
  isLoggedin: string
  setIsLoggedin: React.Dispatch<React.SetStateAction<string>>
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [roomId, setRoomId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [isLoggedin, setIsLoggedin] = useState<string>("false")
  const [messages, setMessages] = useState<Message[]>([])
  const [username, setUsername] = useState<string>("Guest")
  const [success, setSuccess] = useState<boolean>(false)
  return (
    <DataContext.Provider
      value={{
        username,
        setUsername,
        roomId,
        setRoomId,
        search,
        setSearch,
        isLoggedin,
        setIsLoggedin,
        messages,
        setMessages,
        success,
        setSuccess
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useData must be used within DataProvider")
  }
  return context
}
