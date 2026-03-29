import mongoose from "mongoose";
import { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        minlength: 3,
        maxlength: 20
    },

    email:{
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/,"please use a valid email"]
    },

    password:{
        type: String,
        required: [true, "password is required"]

    },

    fullname:{
        type: String,
        required: true,
        trim: true
    },

    phoneNo:{
        type: String,
        required: true,
        trim: true
    },

    avatar:{
        type: String,
        // required: true
    },

    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: {
            type: [Number] // [longitude, latitude]
        },
        address: {
            country: String,
            state: String,
            city: String,
            localArea: String
        }
    },

    refreshToken:{
        type:String
    }
},{timestamps: true})

userSchema.pre("save",async function(next){
    if(!(this.isModified("password")))return next;
    this.password = await bcrypt.hash(this.password,10)
    next()
})

userSchema.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname

        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            username: this.username
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.model("User",userSchema);