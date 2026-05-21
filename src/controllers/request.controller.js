import { Item } from "../models/items.model.js";
import { Request } from "../models/request.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

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

const getMySwap = asyncHandler(async(req,res)=>{
    const user = req.user._id
        const swapReqReceived = await Request.aggregate([
            {
                $match:{
                    requestedTo: user
                }
            },
            {
                $project:{
                    requestedTo: 1,
                    requestedBy:1,
                    requestedItem:1,
                    offeredItem:1,
                    requestStatus:1
                }
            }
    
        ])
    
        const swapReqMade = await Request.aggregate([
            {
                $match:{
                    requestedBy: user
                }
            },
            {
                $project:{
                    requestedTo: 1,
                    requestedBy:1,
                    requestedItem:1,
                    offeredItem:1,
                    requestStatus:1
                }
            }
    
        ])

    res.status(200).json(
        new ApiResponse(200,{swapReqReceived,swapReqMade},"swap request fetched successfully")
    )

    
})

const cancelSwap = asyncHandler(async(req,res)=>{
    const {swapId} = req.params
    const swap = await Request.findById(swapId)
    if(!swap)
    {
        throw new ApiError(404,"swap request not found")
    }

    if(swap.requestedBy.toString() !== req.user._id.toString())
    {
        throw new ApiError(403,"unauthorized req")
    }

    if(swap.requestStatus !== "pending")
    {
        throw new ApiError(400, "swap request already processed")
    }

    const deletedSwap = await Request.findByIdAndDelete(swapId)

    res.status(200).json(
        new ApiResponse(200,deletedSwap,"swap request cancelled successfully")
    )
})
export {
    createSwapRequest,
    acceptSwap,
    rejectSwap,
    getMySwap,
    cancelSwap

}