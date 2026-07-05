import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

// generate Token function

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    // storing refresh token in database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log("error in generating token", error);
    throw new ApiError(500, "Something went wrong while generating token");
  }
};

//1. Register user

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  //empty fields validation
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // check user exists already
  const existedUser = await User.findOne({ $or: [{ username }, { email }] });

  if (existedUser) {
    throw new ApiError(409, "User with email and username already exists");
  }

  // check images

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }
  // console.log("Avatar Path:", avatarLocalPath);

  // upload images on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  // add user to database
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  // send response

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

//2. Login user

const loginUser = asyncHandler(async (req, res) => {
  /* 
  1. get username , email , password from req.body
  2. check  username or email alreay exists or not 
  3. after checking match password with existing password in database
  4. if password not matched send error if matched then login successfully 
  5. generate access and refresh token
  6. send token using cookie
  */

  const { email, password } = req.body;

  if (!email && !password) {
    throw new ApiError(400, "All fields are reqired!");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "No user found with this email");
  }

  // if user found then match password

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // if password is ok generate access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password - refreshToken"
  );

  // send token in cookies

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

// 3. Logout user

const logoutUser = asyncHandler(async (req, res) => {
  const loggedOutUser = await findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  // clear cookies
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      new ApiResponse(200, { loggedOutUser }, "User logged Out successfully")
    );
});

// 4. Access token using refresh token

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incommingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incommingRefreshToken) {
    throw new ApiError("401", "Unauthorized request");
  }

  try {
    // if we have token
    const decodedToken = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new ApiError("401", "Invalid refresh token");
    }

    // if we get the user then

    if (incommingRefreshToken !== user?.refreshToken) {
      throw new ApiError("401", "Refresh token is expired or used");
    }

    // if everything is ok then generate new tokens

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    // send cookies

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    console.log("error in refreshing access  ", error);
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

// 5. Update user password

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old password and new password are required");
  }

  const user = await User.findById(req.user._id);

  const isPasswordMatched = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordMatched) {
    throw new ApiError(401, "Invalid old password");
  }
  // if password matched then update user with new Password

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password updated successfully"));
});

// 6. Getting current user

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"));
});

// 7. updating user Profile

const updateUserProfile = asyncHandler(async (req, res) => {
  const { username, fullName } = req.body;

  if (!username && !fullName) {
    throw new ApiError(404, "Fields are missing");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  // after update
  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User updated successfully"));
});

// 8. updating user avatar image

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalUrl = req.file?.path;

  if (!avatarLocalUrl) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalUrl);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Avatar updated successfully"));
});

// 9. Updating user cover image

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalUrl = req.file?.path;

  if (!coverLocalUrlImage) {
    throw new ApiError(400, "Cover image file is missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalUrl);

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading on cover image");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Cover image updated successfully")
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateUserProfile,
  updateUserAvatar,
  updateUserCoverImage
};
