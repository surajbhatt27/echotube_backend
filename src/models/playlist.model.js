import mongoose, { Schema } from "mongoose";

const playlistSchema = Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        videos: [
            {
                type: Schema.Types.ObjectId,
                ref: "Vidoes",
            },
        ],
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamp: true,
    }
);

export const Playlist = mongoose.model("Playlist", playlistSchema);
