import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function AlertDialogClearChat({
  setMessages,
  roomId,
}: {
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  roomId: string
}) {
  const [open, setOpen] = useState(false)

  const handleClearChat = async () => {
    setMessages([])
    try {
      const response = await fetch("/api/messages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      })
      const count = await response.json()
      console.log("deleted", count, "messages for room", roomId)
    } catch (e) {
      console.error(e)
    } finally {
      setOpen(false) // <-- always close, success or fail
    }
  }
  const alert = (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        className={
          "rounded-2xl border bg-amber-400 py-1 text-sm font-semibold text-slate-800"
        }
      >
        Clear Chat
      </AlertDialogTrigger>
      <AlertDialogContent className={"bg-slate-800"}>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className={"bg-slate-800"}>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleClearChat}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  return alert
}
