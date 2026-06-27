"use client"
import { Upload } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { socket } from "@/lib/socket"
import { v4 as uuid } from "uuid"

export default function Page() {
  const inputFileRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [percent, setPercent] = useState(0)

  useEffect(() => {
    if (!socket.connected) {
      socket.connect()
    }
  }, [])
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const CHUNK_SIZE = 64 * 1024 // 64 KB
    const fileId = uuid()
    const totalChunks = Math.max(1, Math.ceil(file.size / CHUNK_SIZE))

    const metadata = {
      fileId,
      roomId: "default",
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
            { fileId, index, totalChunks, data: slice },
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

      socket.emit("file_end", { fileId, roomId: "default" })
      //  alert("Upload complete!")
    } catch (error) {
      console.error("Upload failed:", error)
      alert("Upload failed. Please try again.")
    } finally {
      setIsUploading(false)
      if (inputFileRef.current) inputFileRef.current.value = ""
    }
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-5 text-3xl">
      <p>{isUploading ? "Uploading..." : "Upload Videos"}</p>
      <button
        disabled={isUploading}
        onClick={() => inputFileRef.current?.click()}
        className="disabled:opacity-50"
      >
        <Upload size={48} />
      </button>
      <input type="file" ref={inputFileRef} onChange={handleFile} hidden />
      {!percent ? null : (
        <div className="flex w-100 justify-start">
          <button
            className={`flex h-1 justify-start border bg-amber-400`}
            style={{
              width: `${Math.ceil(percent / 10) * 10}%`,
            }}
          />
        </div>
      )}
      {percent === 100 ? (
        <p>Done</p>
      ) : percent === 0 ? null : (
        <p> Uploading... {percent}%</p>
      )}
    </div>
  )
}
