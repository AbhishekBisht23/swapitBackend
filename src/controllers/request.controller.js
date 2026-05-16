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

const acceptSwap = asyncHandler(async(req,res)=>{
    const {swapId} = req.params
    const swap = await Request.findById(swapId)
    if(!swap)
    {
        throw new ApiError(404,"swap request not found")
    }

    if(swap.requestedItem.owner.toString() !== req.user._id.toString())
    {
        throw new ApiError(400,"unauthorized to accept request")
    }
    if(swap.requestStatus !== "pending")
    {
        throw new ApiError(400,"swap is already processed")
    }

    swap.requestStatus = "accepted"

    swap.requestedItem.itemStatus = "swapped"
    swap.offeredItem.itemStatus = "swapped"

    await swap.save()
    await swap.requestedItem.save()
    await swap.offeredItem.save()

    res.status(200).json(
        new ApiResponse(200,swap,"swap request accepted succesfully")
    )
})

const rejectSwap = asyncHandler(async(req,res)=>{
    const {swapId} = req.params
    const swap = await Request.findById(swapId)

    if(!swap)
    {
        throw new ApiError(404,"swap request not found")
    }

    if(swap.requestedBy.toString() !== req.user._id)
    {
        throw new ApiError(400, "unauthorized")
    }

    if(swap.requestStatus !== "pending")
    {
        throw new ApiError(400, "swap request already processed")
    }

    swap.requestStatus = "rejected"

    await swap.save()

    res.status(200).json(
        new ApiResponse(200,swap,"swap request rejected succefully")
    )
})
export {
    createSwapRequest,
    acceptSwap,
    rejectSwap
}