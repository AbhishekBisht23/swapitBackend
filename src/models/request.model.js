import mongoose from "mongoose";
import { Schema } from "mongoose";

const requestSchema = new Schema({
    requestedTo:{
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },

    requestedBy:{
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },

    requestedItem:{
        type:mongoose.Types.ObjectId,
        ref: "Item",
        required: true
    },

    offeredItem:{
        type:mongoose.Types.ObjectId,
        ref: "Item",
        required: true
    },

    requestStatus:{
        type: String,
        enum:["pending", "accepted", "rejected", "cancelled"]
    },
    
    conversation:{
    type: Schema.Types.ObjectId,
    ref: "Conversation"
    }
},{timestamps: true})

export const Request = mongoose.model("Request",requestSchema)