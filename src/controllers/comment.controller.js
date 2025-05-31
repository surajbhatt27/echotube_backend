import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //get all comments for a video

    const {videoId} = req.params
    let {page = 1, limit = 10} = req.query

    
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"videoId is uncorrect or missing")
    }

    const comments = await Comment.aggregate([
        {
            $match:{
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $skip: (Number(page) - 1) * Number(limit)
        },
        {
            $limit: Number(limit)
        },
        {
            $project:{
                content:1,
                owner:1
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            avatar:1
                        }
                    }
                ]
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"comment",
                as:"likes"
            }
        },
        {
            $addFields:{
                owner:{
                    $arrayElemAt: ["$owner", 0] 
                },
                likes:{
                    $size:"$likes"
                }
            }
        },
    ])

    if(!comments){
        throw new ApiError(400, "comments are not fetched")
    }
    return res.status(200).json(
        new ApiResponse(200,comments,"Video comments fetched successfully")
    )

})

const addComment = asyncHandler(async (req, res) => {
    //add a comment to the video

    const {videoId} = req.params
    const {content} = req.body

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"videoId is uncorrect or missing")
    }
    
    if(!content){
        throw new ApiError(400,"content is missing")
    }

    const comment = await Comment.create({
        content,
        video:videoId,
        owner:req.user._id
    })

    if(!comment){
        throw new ApiError(400, "comment is not added")
    }

    return res.status(200).json
    (
        new ApiResponse(200, comment ,"Comment added successfully")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    //update a comment
    
    const {commentId} = req.params
    const {content} = req.body

    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"commentId is incorrect or missing")
    }
    if(!content){
        throw new ApiError(400,"content is missing")
    }

    const comment = await Comment.findByIdAndUpdate(commentId, {
        content
    }, {
        new: true,
        runValidators: true
    })

    if(!comment){
        throw new ApiError(400, "comment is not updated")
    }  


    return res.status(200).json
    (
        new ApiResponse(200, comment ,"Comment is updated successfully")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    //delete a comment

    const {commentId} = req.params
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"commentId is incorrect or missing")
    }

    const comment = await Comment.findByIdAndDelete(commentId)

    if(!comment){
        throw new ApiError(400, "comment not found")
    }

    return res.status(200).json
    (
        new ApiResponse(200,"Comment deleted successfully")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }