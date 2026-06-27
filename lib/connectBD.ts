import mongoose from "mongoose"

export default async function connectDB() {
  if (mongoose.connection?.readyState === 1) {
     console.log("✅ MongoDB already connected")
    return
  }

  if (mongoose.connection?.readyState === 2) {
    console.log("⏳ MongoDB connection in progress...")
    return
  }

  try {
    await mongoose
      .connect(process.env.DATABASE_URI as string)
      .then(() => console.log("connected to mongoDB"))
  } catch (error) {
    console.log(error)
  }
}
