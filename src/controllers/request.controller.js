import { Item } from "../models/items.model";
import { Request } from "../models/request.model";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";

const createSwapRequest = asyncHandler(async (req , res)=>{
    const {requestedItemId , offeredItemId} = req.body
    const requestedItem = await Item.findById(requestedItemId)
    const offeredItem = await Item.findById(offeredItemId)
    
    if(!requestedItem || !offeredItem){
        throw new ApiError(404,"item not found")
    }

    if(requestedItem.itemStatus === "swapped" ||  offeredItem.itemStatus ==="swapped"){
        throw new ApiError(400,"item already swapped")
    }

    if(requestedItem.owner.toString() === req.user._id.toString()){
        throw new ApiError(400,"you cannot swap with your own item")
    }

    const swapRequest = await Request.create({
        requestedTo : requestedItem.owner,
        requestedBy: req.user._id,
        requestedItem,
        offeredItem,
        requestStatus: "pending"

    })

    if(!swapRequest){
        throw new ApiError(500,"failed to create swap request")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201,swapRequest,"successfully created swap request")
    )

})

export {
    createSwapRequest
}