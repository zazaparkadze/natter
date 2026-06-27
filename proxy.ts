import { NextRequest, NextResponse } from "next/server"
import jwt, { JwtPayload } from "jsonwebtoken"


interface MyJwtPayload extends JwtPayload {
  roles: {
    root?: number
    admin?: number
    editor?: number
    user: number
  }
}

export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value as string
  const refreshToken = request.cookies.get("refreshToken")?.value as string

  if (!accessToken && !refreshToken) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (accessToken) {
    try {
      jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!)
     
      return NextResponse.next()
    } catch {
      //create new accessToken
      const accessToken = jwt.sign(
        { token: "new" },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "5m" }
      )
      const response = NextResponse.json(null, {
        status: 200,
        statusText: "new accessToken created ",
      })
      response.cookies.set({
        name: "accessToken",
        value: accessToken,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 5,
        path: "/",
      })
      return response
    }
  }

  if (refreshToken) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET!
      ) as MyJwtPayload

      const accessToken = jwt.sign(
        {
          id: decoded.id,
          username: decoded.username,
        },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "5m" }
      )

      const response = NextResponse.next()

      response.cookies.set("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 5,
      })
//
      return response
    } catch {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/account/:path*", "/api/messages/:path*"],
}
