import { Socket, io } from "socket.io-client"

const SERVER_URL =
  /* process.env.NODE_ENV === "production"
    ? "https://provider.com"
    : */ "http://localhost:3500"

export const socket: Socket = io(SERVER_URL, {
  autoConnect: false, // false = Prevents connecting before the user actually opens the chat
})
