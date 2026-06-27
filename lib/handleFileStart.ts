import type { Socket } from "socket.io"

export const handleFileChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  roomId: string,
  username: string,
  socket: Socket,
  fileInputRef: React.RefObject<HTMLInputElement>
) => {
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

  reader.readAsDataURL(file)
}
