import Link from "next/link"

export default function page() {
  return (
    <div className="grid h-screen place-content-center bg-slate-900 text-center">
      <h1 className="text-xl">You are registered</h1>
      <h1 className="text-3xl text-amber-500">
        <Link href={"/login"}>Please Log In</Link>
      </h1>
      <h2>
        You may provide additional information about Yourself, which will be
        used to reset a new password in case of lost/forgotten
      </h2>
      <h3 className="text-xl">
        Follow the link
        <Link href={"/privateInformation"}>
          <span className="inline-block h-2 px-5 pt-1.5 text-xl text-fuchsia-600 hover:-translate-y-0.5 hover:scale-110">
            private information{" "}
          </span>
        </Link>
      </h3>
    </div>
  )
}
