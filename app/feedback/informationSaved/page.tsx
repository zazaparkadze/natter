import Link from "next/link"
export default function page() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-5 bg-slate-900">
      <div>information saved successfully</div>
      <div>
        <Link href="/login">Go to login page</Link>
      </div>
    </div>
  )
}
