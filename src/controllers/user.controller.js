import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req,res)=>{
    //retrive all imformation
    //check for empty
    //check if user already exist
    //create entry in database
    //remove password and refreshtoken field from response
    //return res
    
    const {username, email, password, fullname, phoneNo, location} = req.body;
    console.log("heeeeeeeeeeeeeeeeeeeeeeee");
    

    // if(!(username && email && password && fullname && phoneNo && location)){
    //     throw new ApiError(400,"all fields are required")
    // }

    if ([username, email, password, fullname, phoneNo, location].some(field => !field || field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({$or:[{email},{phoneNo}]})
    if(existedUser){
        throw new ApiError(400,"user already exists")
    }
    
    const user = await User.create({
        username: username.toLowerCase().trim(),
        email: email,
        password: password,
        fullname: fullname,
        phoneNo: phoneNo,
        location: location,
        avatar: "https://res.cloudinary.com/dcd5feovd/image/upload/v1773772067/wprtcqhaa64g2qt0j0dm.jpg"
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser){
        throw new ApiError(500,"failed to register")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201,createdUser,"User registered succesfully")
    )
    
    
})

const loginUser = asyncHandler(async (req,res)=>{
    const generateAccessAndRefreshToken = async(userId)=>{
        try {
            const user = await User.findById(userId);
            const accessToken = await user.generateAccessToken();
            const refreshToken = await user.generateRefreshToken();
    
            user.refreshToken = refreshToken;
            await user.save({validateBeforeSave: false});
            return {accessToken, refreshToken}
        } catch (error) {
            throw new ApiError(500,"failed to generate access and refresh token")
        }
    }

    const {username , email , password} = req.body;
    if(!((username || email) && password)){
        throw new ApiError(400,"Username and password required");
    }

    const user = await User.findOne(
        {
            $or:[{email}, {username: username.toLowerCase()}]
        }
    ).select("-password -refreshToken")

    if(!user){
        throw new ApiError(404,"User not found");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if(!isPasswordCorrect){
        throw new ApiError(400,"password is incorrect");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-refreshToken -password")

    const option = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken", refreshToken,option)
    .json(
        new ApiResponse(200,{User: loggedInUser},"user successfully login")
    )

})

const logoutUser = asyncHandler(async (req,res)=>{
    // const user = req.user;
    await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            refreshToken: undefined
        }
    },
    {
        new: true
    })
    const option ={
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken",option)
    .clearCookie("refreshToken",option)
    .json(
        new ApiResponse(200,{},"user loggedOut successfully")
    )
})

const getUserProfile = asyncHandler(async (req,res)=>{
    return res
    .status(200)
    .json(
        new ApiResponse(200,req.user,"successfully fetched user profile")
    )
})

export {
    registerUser,
    loginUser,
    logoutUser
}