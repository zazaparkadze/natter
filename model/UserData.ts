import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UserDataSchema = new Schema({
    id: Number,
    firstname: String,
    lastname: String,
    email: String,
    phone: String,
    dob: String,
    pob: String,
    firstcar: String,
    firstschool: String,
    firstjob: String
})

const UserData = mongoose.models.UserData || mongoose.model('UserData', UserDataSchema)

export default UserData;