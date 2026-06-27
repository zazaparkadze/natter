"use client"
import { useData } from "@/context/dataContext"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function SelectroomId() {
  const { roomId, setRoomId } = useData()

  return (
    <Select value={roomId} onValueChange={setRoomId}>
      <SelectTrigger className="w-full">
        <SelectValue
          placeholder="roomId"
          onChange={(e) => e.preventDefault()}
        />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="coworkers">coworkers</SelectItem>
          <SelectItem value="family">family</SelectItem>
          <SelectItem value="neighbors">neighbors</SelectItem>
          <SelectItem value="friends">friends</SelectItem>
          <SelectItem value="secret">secret</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
