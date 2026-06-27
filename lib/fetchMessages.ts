export function fetchMessages(roomId: string) {
    const roomMessages = fetch(`/api/messages?roomId=${roomId}`)
      .then((r) => r.json())
      .then((data) =>
        data.map((msg: any) => ({
          ...msg,
          createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
        }))
      )
      .catch((err) => {
        console.error("Failed fetching history:", err)
        return []
      })

    return roomMessages
}