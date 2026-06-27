"use client"
import Link from "next/link"
import React from "react"
import { contacts } from "@/config/contacts"
import { fetchMessages } from "@/lib/fetchMessages"
import { getDay, isSameDay, isSameWeek } from "date-fns"

export default function Page({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = React.use(params)
  const contactsList = contacts
    .filter((contact) => contact.name.toLowerCase() !== username.toLowerCase())
    .map((contact) => {
      const [messages, setMessages] = React.useState<Message[]>([])
      const msg = messages[messages.length - 1]
      const roomId = `${[username, contact.name.toLocaleLowerCase()].join("-")}`
      React.useEffect(() => {
        fetchMessages(roomId).then((msgs) => setMessages(msgs))
      }, [roomId])

      return (
        <div
          key={contact.id}
          className="flex cursor-pointer items-center gap-4 rounded-md border p-2 hover:bg-slate-700"
        >
          <Link
            className="flex w-full flex-col"
            href={`/account/${username}/natter/${roomId}`}
          >
            <div className="flex w-full flex-col">
              <div className="flex w-full justify-between">
                <span className="font-medium">{contact.name}</span>{" "}
                {isSameDay(msg?.createdAt, new Date())
                  ? "Today"
                  : isSameWeek(msg?.createdAt!, new Date())
                    ? [
                        "Sunday",
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                      ][getDay(msg?.createdAt!)]
                    : msg?.createdAt?.toLocaleDateString()}{" "}
                {msg?.createdAt?.getHours()! < 10
                  ? "0" + msg?.createdAt?.getHours()
                  : msg?.createdAt?.getHours()}
                :
                {msg?.createdAt?.getMinutes()! < 10
                  ? "0" + msg?.createdAt?.getMinutes()
                  : msg?.createdAt?.getMinutes()}
                :
                {msg?.createdAt?.getSeconds()! < 10
                  ? "0" + msg?.createdAt?.getSeconds()
                  : msg?.createdAt?.getSeconds()}
              </div>
              <span className="font-medium">{contact.phone}</span>
              <span className="text-xs text-muted-foreground">
                {msg?.body || "No messages yet"}
              </span>
            </div>
          </Link>
        </div>
      )
    })
  return (
    <div className="flex min-h-svh items-center justify-center border bg-slate-900 p-6">
      <div className="flex min-h-screen min-w-100 flex-col gap-y-2 border px-1 text-sm leading-loose">
        <h1 className="border font-medium rounded-md py-1 mt-2 text-center">Welcome to Natter, {username}!</h1>

        {contactsList}
      </div>
    </div>
  )
}
