"use client"
import { useEffect, useState, useRef } from "react"
import { useData } from "@/context/dataContext"
import { socket } from "@/lib/socket"
import { getDay, isSameDay, isSameWeek } from "date-fns"
import ChatForm from "./chat-form"
import Image from "next/image"

const inflight = new Map<
  string,
  {
    meta: Meta
    chunks: (Uint8Array | null)[]
    received: number
  }
>()

export default function ChatRoom({
  username,
  roomId,
}: {
  roomId: string
  username: string
}) {
  const { messages, setMessages } = useData()
  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const r = await fetch(`/api/messages?roomId=${roomId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
        const data = await r.json()
        const formattedData = data.map((msg: any) => {
          const parsedDate = msg.createdAt
            ? new Date(msg.createdAt)
            : new Date()
          return {
            ...msg,
            createdAt: isNaN(parsedDate.getTime()) ? new Date() : parsedDate,
          }
        })

        setMessages(formattedData)
      } catch (err) {
        console.error("Failed fetching history:", err)
      }
    }
    fetchMessages()
  }, [])

  const isValidDate =
    messages.length > 0 && messages[0]?.createdAt instanceof Date

  useEffect(() => {
    if (!socket.connected) {
      socket.connect()
    }
    socket.emit("join_room", roomId)

    const handleIncomingMessage = (
      username: string,
      msg: string,
      roomId: string
    ) => {
      setMessages((prev) => [
        ...prev,
        {
          body: msg,
          id: Date.now(),
          username: username,
          roomId: roomId,
          createdAt: new Date(),
        },
      ])
    }

    const handleGreetingMessage = (msg: string, roomId: string) => {
      setMessages((prev) => [
        ...prev,
        {
          body: msg,
          id: Date.now(),
          username: "",
          roomId: roomId.split("-").reverse().join("-"),
          createdAt: new Date(),
        },
      ])
      setTimeout(() => {
        setMessages((prev) => prev.filter((message) => message.body !== msg))
      }, 15000)
    }
    const handleIncomingfile = ({
      username,
      fileName,
      size,
      fileData,
      roomId,
    }: {
      username: string
      fileName: string
      size: number
      fileData: string
      roomId: string
      type: "file" | "text" | "video"
    }) => {
      setMessages((prev) => [
        ...prev,
        {
          body: `File received: ${fileName} (${(size / 1024).toFixed(2)} KB)`,
          id: Date.now(),
          username: username,
          roomId: roomId,
          createdAt: new Date(),
          fileData, // Store the Base64 data for rendering
          type: fileData ? "file" : "text", // Distinguish between file and text messages
          fileName, // Store the file name for download link
        },
      ])
    }

    const handleFileStart = (meta: Meta & { fileId: string }) => {
      console.log(meta)
      inflight.set(meta.fileId, {
        meta,
        chunks: new Array(meta.totalChunks).fill(null),
        received: 0,
      })
    }

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

        inflight.delete(p.fileId)

        setMessages((prev) => [
          ...prev,
          {
            body: `File received: ${state.meta.fileName} (${(state.meta.size / 1024).toFixed(2)} KB)`,
            id: Date.now(),
            username: username,
            roomId: state.meta.roomId,
            createdAt: new Date(),
            fileData: url,
            type: state.meta.mimeType,
            fileName: state.meta.fileName, // Store the file name for download link
            fileId: p.fileId,
          },
        ])
      }
      ack?.({ ok: true })
    }

    socket.emit(
      "greeting_message",
      `Hi from ${username} from room ${roomId}`,
      roomId
    )
    socket.on("file_start", handleFileStart)
    socket.on("file_chunk", handleIncomingChunks)
    socket.on("chat_message", handleIncomingMessage)
    socket.on("chat_file", handleIncomingfile)
    socket.on("greeting_message", handleGreetingMessage)

    return () => {
      socket.emit("leave_room", roomId)
      socket.off("chat_message", handleIncomingMessage)
      socket.off("chat_file", handleIncomingfile)
      socket.off("greeting_message", handleGreetingMessage)
      socket.off("file_start", handleFileStart)
      socket.off("file_chunk", handleIncomingChunks)

      socket.disconnect()
    }
  }, [roomId])

  return (
    <div className="flex h-screen w-100 flex-col gap-2 bg-slate-900">
      <p className="fixed top-2 right-4 text-2xl text-amber-400 uppercase">
        {roomId.split("-")[1]}
      </p>
      {isValidDate || messages.length === 0 ? (
        <ul
          className="flex grow flex-col justify-end gap-1 bg-transparent"
          id="message-list"
        >
          {messages.map((msg, index) => (
            <div key={index}>
              {msg?.type === "file" &&
                msg?.fileName?.match(/\.(jpeg|jpg|gif|png|bmp|webp)$/i) && (
                  <div className="flex w-full justify-center bg-transparent py-4 text-amber-400">
                    <Image
                      src={msg.fileData!}
                      alt={msg.body}
                      width={200}
                      height={200}
                    />
                  </div>
                )}
              {msg.type?.includes("image") && (
                <div key={index} className="flex flex-col items-center">
                  <img
                    src={msg?.fileData}
                    alt={msg?.fileName}
                    width={"200px"}
                    height={"auto"}
                  />
                  <p>File: {msg?.fileName}</p>
                </div>
              )}
              {msg.type?.includes("video") && (
                <div
                  key={index}
                  className="my-4 flex flex-col items-center rounded border bg-black p-4"
                >
                  <video ref={videoRef} className="w-full max-w-2xl" controls>
                    <source src={msg?.fileData} />
                  </video>
                  <p>fileId: {msg?.fileId}</p>
                </div>
              )}
              {msg.type?.includes("application/pdf") && (
                <div key={index}>
                  <object
                    data={msg?.fileData}
                    type="application/pdf"
                    width="100%"
                    height="500px"
                  >
                    <p>
                      Your browser does not support PDFs.{" "}
                      <a href={msg?.fileData}>Download instead</a>.
                    </p>
                  </object>
                </div>
              )}
              <li className="flex w-full justify-between rounded-full border px-3 py-1 text-amber-500 odd:bg-slate-700 hover:bg-slate-600">
                <span>
                  {" "}
                  {msg.username === "" || roomId.includes("-") ? null : (
                    <span>{msg.username}: </span>
                  )}
                  {msg?.type === "file" ? (
                    <a
                      href={msg.fileData}
                      download={msg.body.split(": ")[1].split(" (")[0]}
                      className="text-amber-400 hover:underline"
                      id="file-img"
                    >
                      {msg.body}
                    </a>
                  ) : (
                    msg.body
                  )}
                </span>

                <span>
                  {isSameDay(msg.createdAt, new Date())
                    ? ""
                    : isSameWeek(msg.createdAt, new Date())
                      ? [
                          "Sunday",
                          "Monday",
                          "Tuesday",
                          "Wednesday",
                          "Thursday",
                          "Friday",
                          "Saturday",
                        ][getDay(msg.createdAt)]
                      : msg.createdAt.toLocaleDateString()}{" "}
                  {msg.createdAt.getHours() < 10
                    ? "0" + msg.createdAt.getHours()
                    : msg.createdAt.getHours()}
                  :
                  {msg.createdAt.getMinutes()! < 10
                    ? "0" + msg.createdAt?.getMinutes()
                    : msg.createdAt.getMinutes()}
                  :
                  {msg.createdAt.getSeconds()! < 10
                    ? "0" + msg.createdAt.getSeconds()
                    : msg.createdAt.getSeconds()}
                </span>
              </li>
            </div>
          ))}
        </ul>
      ) : (
        <p className="flex grow flex-col justify-center gap-1 bg-transparent text-center text-3xl text-amber-400">
          loading...
        </p>
      )}
      <ChatForm username={username} roomId={roomId} />
    </div>
  )
}
