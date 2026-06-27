"use client"
import { useEffect, useState, useRef } from "react"
import { socket } from "@/lib/socket"

const inflight = new Map<
  string,
  {
    meta: Meta
    chunks: (Uint8Array | null)[]
    received: number
  }
>()

export default function Page() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [onComplete, setOnComplete] = useState<OnFileComplete[]>([])

  useEffect(() => {
    if (!socket.connected) {
      socket.connect()
    }

    const handleFileStart = (meta: Meta & { fileId: string }) => {
      console.log(meta)
      inflight.set(meta.fileId, {
        meta,
        chunks: new Array(meta.totalChunks).fill(null),
        received: 0,
      })
    }

    socket.on("file_start", handleFileStart)

    const handleIncomingChunks = (p: FileChunk, ack?: (r: any) => void) => {
      const state = inflight.get(p.fileId)
      if (!state) {
        ack?.({ error: "unknown fileId" })
        return
      }

      const bytes =
        p.data instanceof ArrayBuffer
          ? new Uint8Array(p.data)
          : new Uint8Array(p.data.buffer, p.data.byteOffset, p.data.byteLength) // Node Buffer

      state.chunks[p.index] = bytes
      state.received++
      console.log(state.received)
      if (state.received === state.meta.totalChunks) {
        const blob = new Blob(state.chunks as BlobPart[], {
          type: state.meta.mimeType,
        })
        const url = URL.createObjectURL(blob)
        console.log(url)
        setOnComplete((prev) => [
          ...prev,
          {
            fileId: p.fileId,
            ...state.meta,
            url,
          },
        ])
        inflight.delete(p.fileId)

      }
      ack?.({ ok: true })
    }

    socket.on("file_chunk", handleIncomingChunks)

    return () => {
      socket.off("file_start", handleFileStart)
      socket.off("file_chunk", handleIncomingChunks)
    }
  }, [])

  return (
    <div>
      <p>Videos</p>
      {onComplete.map((onComplete, index) => {
        if (onComplete?.mimeType.includes("image")) {
          return (
            <div key={index}>
              <img
                src={onComplete?.url}
                alt={onComplete?.fileName}
                width={"200px"}
                height={"auto"}
              />
              <p>File: {onComplete?.fileName}</p>
            </div>
          )
        }
        if (onComplete?.mimeType.includes("video")) {
          return (
            <div key={index} className="my-4 flex flex-col items-center rounded border bg-black p-4">
              <video ref={videoRef} className="w-full max-w-2xl" controls>
                <source src={onComplete?.url} />
              </video>
            </div>
          )
        }
        if (onComplete.mimeType.includes("application/pdf")) {
          return (
            <div key={index}>
              <object
                data={onComplete?.url}
                type="application/pdf"
                width="100%"
                height="500px"
              >
                <p>
                  Your browser does not support PDFs.{" "}
                  <a href={onComplete?.url}>Download instead</a>.
                </p>
              </object>
            </div>
          )
        }
      })}
    </div>
  )
}
