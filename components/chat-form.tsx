"use client"
//export const dynamic = "force-dynamic"
import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "@/components/ui/input"
import { useData } from "@/context/dataContext"
import { socket } from "@/lib/socket"
import { Plus, Minus } from "lucide-react"
import Panel from "./panel"
import { AlertDialogClearChat } from "@/components/alert"
import { clsx } from "clsx"

export default function ChatForm({
  username,
  roomId,
}: {
  username: string
  roomId: string
}) {
  const { setMessages } = useData()
  const [inputMsg, setInputMsg] = useState("")

  const [showPanel, setShowPanel] = useState(false)
  const togglePanel = () => {
    showPanel ? setShowPanel(false) : setShowPanel(true)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!inputMsg.trim()) return
    socket.emit("chat_message", username, inputMsg, roomId)
    setInputMsg("")
  }

  return (
    <form
      id="form"
      action=""
      className="bottom-2 flex w-100 flex-col gap-1 bg-slate-900"
      onSubmit={handleSubmit}
    >
      <div
        className={clsx({
          "flex w-full gap-2 text-amber-400": showPanel,
          "hidden w-full text-amber-400": !showPanel,
        })}
      >
        <Panel roomId={roomId} username={username} />
      </div>
      <div className="flex w-full gap-2">
        <Button
          onClick={togglePanel}
          variant="outline"
          className="rounded-full"
        >
          {showPanel === false ? <Plus /> : <Minus />}
        </Button>
        <Input
          id="input"
          name="input"
          placeholder="type message"
          className="rounded-full"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
        />
      </div>
      <Button type="submit" className={"w-full rounded-full bg-amber-400"}>
        Send
      </Button>

      <AlertDialogClearChat setMessages={setMessages} roomId={roomId} />
    </form>
  )
}
