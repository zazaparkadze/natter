declare module "*.css"
declare module "bcrypt"

type User = {
  id: number
  username: string
  password: string
  refreshToken: string
  roles: object
}

type UserData = {
  id: number
  firstname: string
  lastname: string
  phone: string
  dob: string
  pob: string
  firstcar: string
  firstschool: string
  firstjob: string
  email: string
}

interface FormData {
  name: string
  email: string
  phone: string
  service: string
  date: string
  time: string
  notes: string
}

////////////////////////////
interface MyJwtPayload extends JwtPayload {
  [index: string]: {
    [index: string]: number
  }
  roles: {
    root?: number
    admin?: number
    editor?: number
    user: number
  }
}
type Message = {
  body: string
  id: number
  username: string
  roomId: string
  createdAt: Date
  updatedAt?: Date
  fileName?: string
  size?: number
  fileData?: string
  type?: string
  fileId?: string
}

type FileChunk = {
  fileId: string
  index: number
  data: ArrayBuffer | Buffer
  roomId: string
}

type ReceivedFiles = {
  fileName: string
  fileData: string
  size: number
  type: string
  fileLastModified: number
  roomId: string
}

type Meta = {
  fileName: string
  size: number
  mimeType: string
  totalChunks: number
  username: string
  roomId: string
}

type OnFileComplete = {
  fileName: string
  size: number
  mimeType: string
  totalChunks: number
  username: string
  fileId: string
  url: string
  roomId: string
}
