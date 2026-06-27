"use client"
import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { handleLogin } from "@/lib/actions/auth"
import { useData } from "@/context/dataContext"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function page() {
  const { isLoggedin, setIsLoggedin, setUsername, username } = useData()
  const router = useRouter()
  const ref = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  useEffect(() => {
    ref.current?.focus()
  })

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-slate-900">
      <form
        // className="flex h-100 w-100 flex-col items-center justify-center gap-4 rounded-3xl border-2 bg-stone-800 p-3"
        className="flex h-100 w-100 flex-col gap-6 rounded-[2rem] border-2 border-white/10 bg-slate-900/70 p-8 text-xl shadow-[0_40px_120px_-60px_rgba(255,255,255,0.2)] backdrop-blur-xl"
        action={async (formData) => {
          const response = await handleLogin(formData)
          if (response.serverResponse === "noCredentials") {
            router.push(`/login`)
            setIsLoggedin("noCredentials")
            return
          }
          if (response.serverResponse === "unauthorised") {
            router.push("/register")
            setIsLoggedin("unauthorised")
            return
          }
          if (response.serverResponse === "forbidden") {
            setIsLoggedin("forbidden")
            router.refresh()
            formRef.current?.reset()
            return
          }

          if (response.username) {
            setUsername(response.username)
            router.push(`account/${response.username}`)
            setIsLoggedin("true")
          } else {
            setIsLoggedin("forbidden")
            router.refresh()
            formRef.current?.reset()
          }
        }}
      >
        <Label className="flex w-full justify-start pl-3 text-xl">
          Username
        </Label>
        <Input name="username" ref={ref} />
        <Label className="flex w-full justify-start pl-3 text-xl">
          Password
        </Label>
        <Input name="password" />

        <Button type="submit" className="w-fit capitalize">
          submit
        </Button>

        <div className="my-[-4] flex h-fit w-full flex-col items-end gap-2 px-6">
          <Tooltip key={"left1"}>
            <TooltipTrigger>
              <p className="hover:scale-110 hover:text-green-500">
                <Link href={"/forgot-password"}>Forgot Password</Link>
              </p>
            </TooltipTrigger>
            <TooltipContent side={"top"}>
              Click if you forgot your password
            </TooltipContent>
          </Tooltip>
          <Tooltip key={"left"}>
            <TooltipTrigger>
              <p className="hover:scale-110 hover:text-green-500">
                <Link href={"/register"}>Register</Link>
              </p>
            </TooltipTrigger>
            <TooltipContent side={"bottom"}>Click to Register</TooltipContent>
          </Tooltip>
          {isLoggedin === "forbidden" && (
            <p className="text-2xl text-red-500">incorrect password</p>
          )}
          {isLoggedin === "noCredentials" && (
            <p className="text-2xl text-red-500">username/password missing</p>
          )}
        </div>
      </form>
    </div>
  )
}
