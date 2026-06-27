"use server"
import connectDB from "@/lib/connectBD"
import bcrypt from "bcrypt"
import User from "@/model/User"
import UserData from "@/model/UserData"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

export async function handleLogin(formData: FormData) {
  await connectDB()

  const usr = formData.get("username") as string
  const pwd = formData.get("password") as string

  if (!usr || !pwd) {
    return {
      serverResponse: "noCredentials",
    }
  }

  const foundUser = await User.findOne({
    username: usr,
  }).exec()

  if (!foundUser) {
    return {
      serverResponse: "unauthorised",
    }
  }

  const match = await bcrypt.compare(pwd, foundUser.password)

  if (!match) {
    return {
      serverResponse: "forbidden",
    }
  } else {
    const accessToken = jwt.sign(
      { id: foundUser.id, username: foundUser.username, roles: foundUser.roles },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "5m" }
    )
    const refreshToken = jwt.sign(
      {
        id: foundUser.id,
        username: foundUser.username,
        roles: foundUser.roles,
      },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "12hours" }
    )
    try {
      foundUser.refreshToken = refreshToken
      await foundUser.save()
      const response = {
        username: foundUser.username,
        id: foundUser.id,
      }

      // SET HTTPONLY COOKIE
      const cookieStore = await cookies()

      cookieStore.set("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 12, // half a day
        path: "/",
      })

      cookieStore.set("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 5, // 5 minutes
        path: "/",
      })

      return JSON.parse(JSON.stringify(response))
    } catch (error) {
      console.error("LOGIN ERROR---:", error)
      return {
        error: "Internal Server Error from catch block",
      }
    }
  }
}

export async function handleRegister(formData: FormData) {
  await connectDB()
  const username = formData.get("username") as string
  const password = formData.get("password") as string
  const email = formData.get("email") as string

  if (!username || !password) {
    return JSON.stringify({ message: "no credentials supplied" })
  }

  const users: User[] = await User.find({}).lean()

  const duplicate = await User.findOne({ username: username })
  if (duplicate) {
    return JSON.stringify({ message: "choose another username" })
  }
  const hashedPwd = await bcrypt.hash(password, 10)

  const newRegister = {
    id: users.length ? users[users.length - 1].id + 1 : 1,
    username: username,
    password: hashedPwd,
    email: email,
  }
  const result = await User.create(newRegister)
  return JSON.stringify(result)
}

export async function handleForgot(formData: FormData) {
  await connectDB()
  const firstname = formData.get("firstname")
  const lastname = formData.get("lastname")
  const phone = formData.get("phone")
  const dob = formData.get("dob")
  const pob = formData.get("pob")
  const firstcar = formData.get("firstcar")
  const firstschool = formData.get("firstschool")
  const firstjob = formData.get("firstjob")
  const email = formData.get("email")

  const UserDataObj = {
    firstname,
    lastname,
    email,
    phone,
    dob,
    pob,
    firstcar,
    firstschool,
    firstjob,
  }

  const userData = await UserData.findOne(UserDataObj).lean()

  if (userData) {
    return JSON.parse(JSON.stringify(userData))
  } else {
    return null
  }
}

//change forgotten password

export async function changeUserPwd(formData: FormData) {
  await connectDB()
  const newPwd = formData.get("newPwd") as string
  const id = formData.get("id")

  const newHashedPwd = await bcrypt.hash(newPwd, 10)
  const updatedUser: User | null = await User.findOneAndUpdate(
    { id: Number(id) },
    { password: newHashedPwd },
    { returnDocument: "after" }
  )
  
  if (updatedUser) {
    //console.log("updated user", updatedUser)
    return JSON.parse(JSON.stringify(updatedUser))
  } else {
    return null
  }
}

export async function handleSaveUserData(formData: FormData) {
  await connectDB()
  const username = formData.get("username") as string
  const firstname = formData.get("firstname")
  const lastname = formData.get("lastname")
  const phone = formData.get("phone")
  const dob = formData.get("dob")
  const pob = formData.get("pob")
  const firstcar = formData.get("firstcar")
  const firstschool = formData.get("firstschool")
  const firstjob = formData.get("firstjob")
  const email = formData.get("email")

  const foundUser: User | null = await User.findOne({ username }).lean()

  if (!foundUser) {
    return null
  }
  const UserDataObj = {
    id: foundUser.id,
    firstname,
    lastname,
    email,
    phone,
    dob,
    pob,
    firstcar,
    firstschool,
    firstjob,
  }

  const userData: User = await UserData.create(UserDataObj)

  if (userData) {
    return JSON.parse(JSON.stringify(userData))
  } else {
    return null
  }
}

