import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({limit: "16kb"}));

app.use(express.urlencoded({extended:true, limit: "16kb"}));

app.use(express.static("../public/temp"));

app.use(cookieParser());


import userRouter from "./routes/user.routes.js"
import itemRouter from "./routes/item.router.js"
import swapRouter from "./routes/swap.router.js"

app.use("/users",userRouter);
app.use("/item",itemRouter);
app.use("/swap",swapRouter);
export default app;