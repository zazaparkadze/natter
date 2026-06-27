"use client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { handleForgot } from "@/lib/actions/auth"

export default function page() {
  const ref = useRef<HTMLInputElement>(null)
  const router = useRouter()
  useEffect(() => {
    ref.current?.focus()
  })
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center  bg-slate-900">
      <form
        action={async (formData) => {
          const result : User = await handleForgot(formData)
          if (result) {
            router.push(`/changePassword/${(result.id).toString()}`)
          } else {
            router.refresh()
          }
        }}
      >
        <p className="text-center text-2xl text-amber-600 brightness-150">
          All Fields are required
        </p>
        <div className="m-3">
          <Label className="text-xl">First Name</Label>
          <Input name="firstname" ref={ref}></Input>
        </div>
        <div className="m-3">
          <Label className="text-xl">Last Name</Label>
          <Input name="lastname" className="w-100"></Input>
        </div>
        <div className="m-3">
          <Label className="text-xl">Email</Label>
          <Input name="email"></Input>
        </div>
        <div className="m-3">
          <Label className="text-xl">Phone Number</Label>
          <Input name="phone"></Input>
        </div>
        <div className="m-3">
          <Label className="text-xl">Date of Birth</Label>
          <Input name="dob"></Input>
        </div>
        <div className="m-3">
          <Label className="text-xl">Place of Birth</Label>
          <Input name="pob"></Input>
        </div>
        <div className="m-3">
          <Label className="text-xl">First Car</Label>
          <Input name="firstcar"></Input>
        </div>
        <div className="m-3">
          <Label className="text-xl">First School</Label>
          <Input name="firstschool"></Input>
        </div>
        <div className="m-3">
          <Label className="text-xl">First Job</Label>
          <Input name="firstjob"></Input>
        </div>
        <div className="mx-3 my-10 flex w-100 flex-col">
          <Button className="h-10 text-xl" type="submit">
            submit
          </Button>
          <p className="text-center text-xl text-amber-600 brightness-150 mt-3"> Must contain correct information!</p>
        </div>
      </form>
    </div>
  )
}
