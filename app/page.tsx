import Link from "next/link"

export default async function Page() {
  return (
    <div className="flex min-h-svh bg-slate-900 p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <Link href={"/login"}>
          <h1 className="font-medium">Click to enter Chat rooms!</h1>
        </Link>
        <Link href={"/videos"}>
          <h1 className="font-medium text-2xl">Videos!</h1>
        </Link>
        <Link href={"/uploadVideos"}>
          <h1 className="font-medium text-2xl">upload videos!</h1>
        </Link>
      </div>
      {/*  <div className="font-mono text-xs">
          (Press <kbd>d</kbd> to toggle dark mode)
        </div> */}
    </div>
  )
}
