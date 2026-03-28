import { Schema } from "mongoose";
import mongoose from "mongoose";

const itemSchema = new Schema({
    owner:{
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },

    itemName:{
        type: String,
        required: true,
        trim: true,
        index: true
    },

    description:{
        type:String,
        trim: true
    },

    condition:{
        type: String,
        enum: ["new", "good", "used"],
        default: "good",
        required: true
    },

    images:[{
        type: String,
        required: true
    }],

    itemStatus:{
        type: String,
        enum: ["available", "requested", "swapped"],
        default: "available"
    },

    category:{
    type: String,
    enum: ["books", "clothes", "electronics", "others"],
    required: true
    }

},{timestamps: true})

export const Item = mongoose.model("Item", itemSchema);