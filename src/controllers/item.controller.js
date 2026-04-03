import { Item } from "../models/items.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler  from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const createItem = asyncHandler(async (req, res)=>{
    const {itemName, description , condition, category, itemStatus} = req.body
    
    if([itemName, condition, category].some((field)=> field?.trim()==="")){
        throw new ApiError(400,"All field are required")
    }
    const localfilepaths = req.files?.map((file)=>{
        return file?.path
    }) || [];

    if(!(Array.isArray(localfilepaths) && localfilepaths.length >0) ){
        throw new ApiError(400,"atleast One image is required")
    }

    const uploadsPromise = localfilepaths.map((filePath)=>{
        return uploadOnCloudinary(filePath)
    })

    const images = await Promise.all(uploadsPromise);

    const imagesUrl = images
    .filter(file => file !== null)
    .map(file => file.url);

    if (!imagesUrl.length) {
    throw new ApiError(400, "At least one image is required");
    }

    const item = await Item.create(
        {
            owner: req.user._id,
            images: imagesUrl,
            itemName,
            description,
            condition,
            itemStatus,
            category
        }
    )

    return res
    .status(201)
    .json(
        new ApiResponse(201,item,"item created succesfully")
    )

})

const getAllItems = asyncHandler(async (req,res)=>{
   try {
     const allItems = Item.aggregate([
         {
             $match:{
                 itemStatus: "available"
             }
         },
         {
             $limit: 50
         },
         {
             $sort:{
                 createdAt: -1
             }
         },
         {
             $lookup:{
                 from: "users",
                 localField: "owner",
                 foreignField: "_id",
                 as: ownerfield,
                 pipeline:[
                     {
                         $project:{
                             username: 1,
                             avatar: 1,
                         }
                     }
                 ]
             }
         },
         {
             $addFields:{
                 ownerfield:{$first:  "$ownerfield"}
             }
         },
         {
             $project:{
                 itemName: 1,
                 description: 1,
                 condition: 1,
                 images: 1,
                 itemStatus: 1,
                 category: 1,
                 ownerfield: 1
             }
         }
     ])
 
     if(!allItems || allItems.length ===0){
         throw new ApiError(500,"failed to fetch items")
     }
     return res
     .status(200)
     .json(
         new ApiResponse(200,allItems[0],"items fetched successfully")
     )
   } catch (error) {
        throw new ApiError(500,"failed to fetch items")
   }
})

const getSingleItem = asyncHandler(async (req, res)=>{
    const {itemId} = req.params
    const givenItem = await Item.findById(itemId)
    
    if(!givenItem){
        throw new ApiError(404,"item not found")
    }

    const item = await Item.aggregate([
        {
            $match:{
                _id: itemId
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerfield",
                pipeline:[
                    {
                        $project:{
                            username: 1,
                            avatar: 1,
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                ownerfield: {$first: "$ownerfield"}
            }
        },
        {
            $project:{
                itemName: 1,
                description: 1,
                condition: 1,
                images: 1,
                itemStatus: 1,
                category: 1,
                ownerfield: 1

            }
        }
    ])

    if(!item || item.length ===0){
        throw new ApiError(404,"item not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,item[0], "item found successfully")
    )
})

export {
    createItem,
    getAllItems,
    getSingleItem
}