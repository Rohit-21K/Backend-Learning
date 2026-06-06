import mongoose, { Schema } from "mongoose";

const viedoSchema = new mongoose.Schema(
  {
    videoFile: {
      type: String, // cloudinary url
      required: true,
    },
    thumbnail: {
      type: String, // cloudinary url,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// video model
export const Video = mongoose.model("Video", viedoSchema);
