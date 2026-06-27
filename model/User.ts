import mongoose from "mongoose"

const Schema = mongoose.Schema

const UserSchema = new Schema({
  id: Number,
  username: String,
  password: String,
  email: String,
  refreshToken: { type: String, default: "" },
  roles: {
    type: Object,
    default: {
      user: 2001,
    },
  },
})

const User = mongoose.models.User ||  mongoose.model('User', UserSchema)

export default User 