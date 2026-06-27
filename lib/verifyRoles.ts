import jwt, { JwtPayload } from "jsonwebtoken"
import { allowedRoles } from "@/config/allowedRoles"
import { NextRequest } from "next/server"

interface MyJwtPayload extends JwtPayload {
  roles: {
    root?: number
    admin?: number
    editor?: number
    user: number
  }
}

export function verifyRoles(request: NextRequest) {
  // both tokens have roles in payload, refresh chosen
  try {
    const refreshToken = request.cookies.get("refreshToken")?.value as string

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!)
    const userRoles = (decoded as MyJwtPayload).roles

    const allowedToSecrets = Object.values(userRoles)
      .map((value) => Object.values(allowedRoles).indexOf(value) !== -1)
      .find((e) => e === true)

    if (!allowedToSecrets) {
      return false
    }

    return true
  } catch {
    return false
  }
}
