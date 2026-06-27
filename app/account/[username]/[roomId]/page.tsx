import ChatRoom from "@/components/chat-room"
import { use } from "react"

export default function page({
  params,
}: {
  params: Promise<{ username: string, roomId: string }>
}) {
  const { roomId, username } = use(params)
  return (
    <div className="w-full h-screen flex items-center justify-center bg-slate-800">
      <ChatRoom roomId={roomId} username={username} />
    </div>
  )
}
