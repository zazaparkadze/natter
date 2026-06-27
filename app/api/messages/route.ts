import { NextRequest, NextResponse } from "next/server"
import Message from "@/model/Message"
import connectDB from "@/lib/connectBD"

export async function GET(request: NextRequest) {
  await connectDB()
  const roomId = await request.nextUrl.searchParams.get("roomId")

  const roomIdArray = [roomId, roomId?.split("-").reverse().join("-")]

  const allMessages = roomId
    ? await Message.find({ roomId: { $in: roomIdArray } }).lean()
    : await Message.find().lean()

  return NextResponse.json(allMessages, {
    status: 200,
    statusText: "Ok",
  })
}
export async function DELETE(request: NextRequest) {
  await connectDB()
  const deleteRequest = await request.json()

  if (deleteRequest.id) {
    const result = await Message.deleteOne({ id: Number(deleteRequest.id) })
    return NextResponse.json(result.deletedCount, {
      status: 200,
      statusText: "Ok",
    })
  } else if (deleteRequest.roomId) {
    const roomIdArray = [
      deleteRequest.roomId,
      deleteRequest.roomId?.split("-").reverse().join("-"),
    ]
    const result = await Message.deleteMany({ roomId: { $in: roomIdArray } })

    return NextResponse.json(result.deletedCount, {
      status: 200,
      statusText: "Ok",
    })
  } else {
    return NextResponse.json(
      { error: "Missing id and roomId" },
      {
        status: 400,
        statusText: "Bad Request",
      }
    )
  }
}
export async function POST(request: NextRequest) {
  const newMessages = await request.json()
  await connectDB()
  await Message.insertMany(newMessages)

  return NextResponse.json(
    { message: "Messages saved successfully" },
    {
      status: 200,
      statusText: "Ok",
    }
  )
}
