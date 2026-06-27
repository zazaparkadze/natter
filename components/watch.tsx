"use client"

import { useEffect, useState } from "react"

export function Watch() {
  const [time, setTime] = useState<string | null>(null)
  const [date, setDate] = useState<string | null>(null)

  useEffect(() => {
    function updateDateTime() {
      const now = new Date()
      
      // Formatting time smoothly without accidental whitespace/newlines
      const hours = now.getHours().toString().padStart(2, "0")
      const minutes = now.getMinutes().toString().padStart(2, "0")
      const seconds = now.getSeconds().toString().padStart(2, "0")
      
      // Changed dashes to colons for a standard clock look (e.g., 14:05:09)
      setTime(`${hours}:${minutes}:${seconds}`)
      setDate(now.toDateString())
    }

    // Run once immediately so the clock isn't blank for the first second
    updateDateTime()

    const intervalId = setInterval(updateDateTime, 1000)

    return () => clearInterval(intervalId)
  }, [])

  // Avoid rendering text on the server to completely eliminate hydration errors
  if (time === null || date === null) {
    return <div className="h-7" /> // Empty placeholder with matching height
  }

  return (
    <p className="flex w-fit justify-between pl-5 text-xl text-amber-400 gap-4">
      <span className="w-24 tabular-nums">{time}</span>
      <span>{date}</span>
    </p>
  )
}
