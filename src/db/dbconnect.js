import mongoose from "mongoose"
import DBname from "../constant.js"
import dotenv from "dotenv"
dotenv.config({path: "./.env"});

const connectDB = async()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DBname}`);
        console.log(`\n MongoDB.connected !! DBhost: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.error("Error", error)
        throw error
    }
}

export default connectDB