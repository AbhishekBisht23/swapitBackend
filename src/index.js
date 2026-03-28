import dotenv from "dotenv"
dotenv.config({path:"./env"})
import app from "./app.js"
import connectDB from "./db/dbconnect.js"
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 3000,
        ()=>{
            console.log("app is listening");
            
        }
    )
})
.catch((err)=>{
    console.log("failed to connect with database");
    
})