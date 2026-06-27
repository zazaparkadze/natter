"use client"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { handleRegister } from "@/lib/actions/auth"
import { useData } from "@/context/dataContext"
import clsx from "clsx"

export default function page() {
  const router = useRouter()
  const ref = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [registered, setRegistered] = useState<string>("true")
  const [usr, setUsr] = useState("")
  const [pass, setPass] = useState("")
  const [rptPass, setRptPass] = useState("")
  const [passMatch, setPassMatch] = useState(false)
  const { isLoggedin } = useData()
  useEffect(() => {
    inputRef.current?.focus()
    setPassMatch(pass === rptPass && pass !== "" ? true : false)
  }, [pass, rptPass])

  const valPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])[^\s]{8,}$/.test(
    pass
  )
  const valUsr = /^[a-zA-Z][a-zA-Z0-9_]{2,20}$/.test(usr)
  return (
    <div className="flex h-screen max-w-full flex-col items-center justify-center bg-slate-900">
      <form
        className="flex h-fit w-120 flex-col items-center justify-center gap-4 rounded-3xl border-2 bg-slate-900 px-3 py-8"
        ref={ref}
        action={async (formData) => {
          // check passwords
          if (passMatch) {
            const result = await handleRegister(formData)
            if (JSON.parse(result).username === formData.get("username")) {
              router.push("feedback/reg")
            } else if (
              JSON.parse(result).message === "no credentials supplied"
            ) {
              setRegistered("noCredentials")
              ref.current?.reset()
            } else if (
              JSON.parse(result).message === "choose another username"
            ) {
              setRegistered("choose another username")
              ref.current?.reset()
            } else if (
              JSON.parse(result).message === "choose another password"
            ) {
              setRegistered("choose another password")
              ref.current?.reset()
            } else {
              setRegistered("error")
              ref.current?.reset()
            }
          } else {
            router.refresh()
            setPass("")
            setRptPass("")
            setRegistered("false")
          }
        }}
      >
        <Label className="flex w-full justify-start pl-3 text-2xl">
          Username
        </Label>
        {!valUsr && (
          <span className="flex w-full justify-start pl-3 text-amber-400">
            At least 4 characters, max 20, starting with a letter
          </span>
        )}
        {valUsr && <span className="text-green-400">Valid Username</span>}

        <Input
          name="username"
          type="text"
          value={usr}
          onChange={(e) => setUsr(e.target.value)}
          /* ref={inputRef} */
          className={clsx(
            !valUsr && usr !== "" && "text-red-500",
            valUsr && "text-green-500"
          )}
        />
        <Label className="flex w-full justify-start pl-3 text-2xl">
          Password
        </Label>
        {!valPass ? (
          <span className="pl-3 text-amber-400">
            Must contain at least one uppercase and lowercase letter, one digit
            and special character, 8 tokens minimum
          </span>
        ) : (
          <span className="text-green-400">Valid Password</span>
        )}
        <Input
          name="password"
          type="text"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          className={clsx(
            passMatch && "text-green-500",
            !valPass && "text-red-500",
            valPass && "text-amber-500"
          )}
        />
        <Label className="flex w-full justify-start pl-3 text-2xl">
          Repeat Password
        </Label>
        {!passMatch && pass !== "" && (
          <span className="text-red-500">Passwords do not match</span>
        )}
        {passMatch && pass !== "" && (
          <span className="text-green-500">Passwords match</span>
        )}
        <Input
          name="rpt-password"
          value={rptPass}
          type="text"
          onChange={(e) => setRptPass(e.target.value)}
          className={clsx(
            !passMatch && "text-red-500",
            passMatch && "text-green-500"
          )}
        />
        {registered === "choose another password" && (
          <p className="text-amber-300">
            Password must contain at least one uppercase and lowercase letter,
            one degit and special character, 8 tokens minimum
          </p>
        )}
        <Label className="flex w-full justify-start pl-3 text-2xl">Email</Label>
        <Input name="email" />
        <Button
          type="submit"
          size="lg"
          className="w-full text-xl hover:scale-102"
        >
          submit
        </Button>
        {registered === "choose another username" && (
          <p>Choose another username</p>
        )}
        {registered === "noCredentials" && <p> credentials missing</p>}
        {registered === "error" && <p>unknown error</p>}
        {!passMatch && rptPass && <p className="text-red-700">no match</p>}
        {passMatch && valPass && (
          <p className="text-xl text-green-700">VALID PASSWORD</p>
        )}
        {isLoggedin === "unauthorised" && (
          <p className="text-2xl text-red-500">no account, register</p>
        )}
      </form>
    </div>
  )
}
