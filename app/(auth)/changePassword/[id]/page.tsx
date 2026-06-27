"use client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, use } from "react"
import { changeUserPwd } from "@/lib/actions/auth"
import { useRouter } from "next/navigation"
import { useData } from "@/context/dataContext"
import Link from "next/link"

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const [newPwd, setNewPwd] = useState("")
  const router = useRouter()
  const { id } = use(params)
  const { success, setSuccess } = useData()

  const valPass= /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])[^\s]{8,}$/.test(newPwd)
  return (
    <div className="mx-auto flex h-screen max-w-4xl flex-col items-center justify-center  bg-slate-900">
      <form
        className="mx-auto flex h-screen flex-col items-center justify-center gap-5 text-amber-500"
        action={async (formData) => {

          if (valPass) {
            const result: User | null = await changeUserPwd(formData)
            if (result?.id === Number(id)) {
              console.log("password changed successfully")
              setNewPwd("")
              setSuccess(true)
              router.refresh()
            }
            if (result === null) {
              console.log("no user found")
              router.refresh();
            }
          }
        }}
      >
        <h1 className="text-4xl">Change Password</h1>
        <h3>your id is {id}</h3>
        <Input readOnly value={id} name={"id"} className="flexmax-w-2xl" />
        <Input
          placeholder="new password"
          value={newPwd}
          name={"newPwd"}
          onChange={(e) => setNewPwd(e.target.value)}
          className="max-w-2xl"
        />
        <Button type="submit">submit</Button>
        {!valPass && newPwd !== "" ? (
          <p className="text-red-500">Password is too weak</p>
        ) 
        : newPwd !== "" ? (
          <p className="text-green-500">Password is Strong</p>
        ) : null}
        {success && (
          <div className="flex max-w-2xl flex-col items-center gap-7 rounded-2xl border border-green-200/30 bg-green-950/30 px-30 py-15 text-green-200 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.45)]">
            <p className="text-green-500">Password changed successfully!</p>
            <Link href="/login">
              <Button className="hovertext-green-200 hover:bg-green-700">
                Log in with new password
              </Button>
            </Link>
          </div>
        )}
       
      </form>
    </div>
  )
}
