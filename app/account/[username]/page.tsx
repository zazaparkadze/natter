"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useData } from "@/context/dataContext"
import * as React from "react"
import SelectroomId from "@/components/select-roomId"

export default function ChatPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = React.use(params)
  const { messages, setMessages, setUsername, roomId } = useData()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)
  ////////
  ///////
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/messages", {
          method: "GET",
          credentials: "include",
        })

        if (response.status !== 200) {
          throw new Error("Failed to fetch Messages")
        }

        const data = await response.json()
        setMessages(data || [])
        setUsername(username)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        console.error("Error fetching Messages:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [roomId, username])

  const handleDeleteMessage = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this message?")) {
      return
    }

    try {
      setDeleting(id)
      const response = await fetch("/api/messages", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      })

      if (response.status !== 200) {
        throw new Error("Failed to delete ")
      }

      setMessages(messages.filter((message) => message.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete message")
      console.error("Error deleting appointment:", err)
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <div className="text-2xl">Loading Messages...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col p-8 text-white">
        <div className="mb-8">
          <div className="flex w-full justify-between">
            <h1 className="mb-2 text-2xl font-bold text-amber-400">
              {username.charAt(0).toUpperCase() + username.slice(1)} At Messages
            </h1>
            <div className="flex gap-2">
            <Button
              className="mb-2 justify-center gap-1.5 bg-amber-400 text-slate-950 hover:bg-amber-300"
              size="lg"
            >
              <Link href={"/"} className="flex gap-1.5">
                <ArrowLeft className="mt-0.5 h-4 w-4" /> Leave
              </Link>
            </Button>
            <Button
              className="mb-2 justify-center gap-1.5 bg-amber-600 text-slate-950 hover:bg-amber-200"
              size="lg"
            >
              <Link href={`/account/${username}/natter`} className="flex gap-1.5">
                <ArrowLeft className="mt-0.5 h-4 w-4" /> Natter
              </Link>
            </Button>
            </div>
          </div>
        </div>
        {error && (
          <div className="mb-6 rounded-lg border border-red-700 bg-red-900/50 p-4 text-red-200">
            {error}
          </div>
        )}

        <div className="flex grow flex-col gap-0.5 rounded-lg bg-gray-800 p-2.5 shadow-xl">
          {messages.length === 0 ? (
            <div className="p-8 text-center text-gray-400">no messages</div>
          ) : (
            messages.map((message) => (
              <p
                key={message.id}
                className="flex justify-between rounded-lg bg-gray-700 p-1 text-sm odd:text-amber-400 even:bg-gray-600"
              >
                {message.username}: {message.body}
                <span
                  className="opacity-0 hover:px-5 hover:opacity-75"
                  onClick={() => handleDeleteMessage(message.id)}
                >
                  delete
                </span>
              </p>
            ))
          )}
        </div>

        <div className="mt-6 flex w-full justify-between">
          <div className="block text-sm text-gray-400">
            Total Messages:{" "}
            <span className="font-semibold text-white">{messages.length}</span>
          </div>
        </div>
      
        <section className="flex items-center justify-center gap-x-3">
          <SelectroomId />
          <Button
            className="justify-center gap-1.5 bg-amber-400 text-slate-950 hover:bg-amber-300"
            size="default"
          >
            <Link
              href={`/account/${username}/${roomId}`}
              className="flex gap-x-1.5"
            >
              <ArrowLeft className="h-4 w-4 pt-0.5" /> Enter the Private Chat
              Room
            </Link>
          </Button>
        </section>
      </div>
    </div>
  )
}
