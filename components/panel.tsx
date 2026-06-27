"use client"
import { File, Camera, Video, Contact } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRef, useState } from "react"
import { socket } from "@/lib/socket" // assuming your Socket.io singleton path
//import type { Socket } from "socket.io"
//import { handleFileChange } from "@/lib/handleFileChange"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { contacts } from "@/config/contacts"
import { v4 as uuid } from "uuid"

const panelItems = [
  { icon: <File />, label: "File" },
  { icon: <Camera />, label: "Camera" },
  { icon: <Video />, label: "Video" },
  { icon: <Contact />, label: "Contact" },
]

export default function Panel({
  roomId,
  username,
}: {
  roomId: string
  username: string
}) {
  const fileInputRef = useRef<HTMLInputElement>(null) // 1. Create a reference to anchor the hidden input element
  const videoFileInputRef = useRef<HTMLInputElement>(null) // 1. Create a reference to anchor the hidden input element
  const [isUploading, setIsUploading] = useState(false)
  const [percent, setPercent] = useState(0)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 2. Handle file processing asynchronously
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const filePayload = {
        roomId: roomId,
        username: username,
        type: "file",
        fileName: file.name,
        size: file.size,
        fileData: reader.result, // The safe Base64 data string
      }
      socket.emit("chat_file", filePayload)

      if (fileInputRef.current) fileInputRef.current.value = ""
    }
console.log("zaza")
    reader.readAsDataURL(file)
  }

  const handleVideoFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const CHUNK_SIZE = 64 * 1024 // 64 KB
    const fileId = uuid()
    const totalChunks = Math.max(1, Math.ceil(file.size / CHUNK_SIZE))

    const metadata = {
      fileId,
      roomId: roomId,
      username: "guest",
      fileName: file.name,
      size: file.size,
      mimeType: file.type,
      totalChunks,
    }
    await new Promise<void>((resolve, reject) => {
      socket.emit(
        "file_start",
        metadata,
        (ack: { ok?: boolean; error?: string }) => {
          if (ack.error) reject()
          else resolve()
        }
      )
    })

    try {
      for (let index = 0; index < totalChunks; index++) {
        const start = index * CHUNK_SIZE
        const end = Math.min(start + CHUNK_SIZE, file.size)
        const slice = await file.slice(start, end).arrayBuffer()

        // Wait for the server to acknowledge receipt before sending the next one
        await new Promise<void>((resolve, reject) => {
          socket.emit(
            "file_chunk",
            { roomId: roomId, fileId, index, totalChunks, data: slice },
            (ack: { ok?: boolean; error?: string }) => {
              if (ack?.error) {
                reject(new Error(ack.error))
              } else {
                setPercent(Math.round(((index + 1) / totalChunks) * 100))
                resolve()
              }
            }
          )
        })
      }

      socket.emit("file_end", { fileId, roomId })
      //  alert("Upload complete!")
    } catch (error) {
      console.error("Upload failed:", error)
      alert("Upload failed. Please try again.")
    } finally {
      setIsUploading(false)
      if (videoFileInputRef.current) videoFileInputRef.current.value = ""
    }
  }

  const handleContactCard = (contact: (typeof contacts)[0]) => {
    const contactCardData = {
      name: contact.name,
      phone: contact.phone,
    }
    let message = "Contact Card:\n"
    Object.entries(contactCardData).map(([key, value]) => {
      message += `${key}: ${value}\n,`
    })
    socket.emit("chat_message", username, message, roomId)
  }

  const content = panelItems.map((item) => {
    if (item.label === "Contact") {
      return (
        <DropdownMenu key={item.label}>
          <DropdownMenuTrigger className="flex w-fit items-center justify-start gap-2">
            <span className="flex items-center justify-center [&>svg]:h-4 [&>svg]:w-4">
              {item.icon}
            </span>
            <span className="text-sm font-medium">{item.label}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-slate-500 text-amber-200">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-amber-300">
                My Contacts
              </DropdownMenuLabel>
              {contacts.map((contact) => (
                <DropdownMenuItem
                  key={contact.id}
                  onClick={() => handleContactCard(contact)}
                >
                  {contact.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    } else if (item.label === "File") {
      return (
        <Button
          key={item.label}
          variant="ghost"
          className="w-fit justify-start gap-2" // added gap-2 for spacing instead of class 'ml'
          onClick={() => {
            fileInputRef.current?.click()
          }}
        >
          {item.icon}
          <span>{item.label}</span>
        </Button>
      )
    } else if (item.label === "Video") {
      return (
        <Button
          key={item.label}
          variant="ghost"
          className="w-fit justify-start gap-2" // added gap-2 for spacing instead of class 'ml'
          onClick={() => {
            videoFileInputRef.current?.click()
          }}
        >
          {item.icon}
          <span>{item.label}</span>
        </Button>
      )
    } else {
      return (
        <Button
          key={item.label}
          variant="ghost"
          className="w-fit justify-start gap-2"
          onClick={() => {
            item.label === "File" && fileInputRef.current?.click()
            item.label === "Video" && videoFileInputRef.current?.click()
          }}
        >
          {item.icon}
          <span>{item.label}</span>
        </Button>
      )
    }
  })

  return (
    <section
      id="panel"
      className="flex w-full justify-evenly gap-2 rounded-full bg-amber-400 p-2 text-black"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,application/pdf" // Limits selection to images and PDFs
      />
      <input
        type="file"
        ref={videoFileInputRef}
        onChange={handleVideoFileChange}
        className="hidden"
        accept="mpeg/*,mov/*,video/*" //"video/*,mov/*" // Limits selection to videos
      />
      {content}
    </section>
  )
}
