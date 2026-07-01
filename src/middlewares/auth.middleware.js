import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "unauthorized request");
    }
    // if token exixts then get the information present in it

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const userExits = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!userExits) {
      throw new ApiError(401, "Invalid access token");
    }

    // if token is valid then add new object named (user) to req

    req.user = userExits;

    next();
  } catch (error) {
    console.log("error in auth middleware ", error);
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

export default verifyJWT;
