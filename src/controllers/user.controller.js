const User = require("../models/user.model.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");
const { uploadOnCloudinary } = require("../utils/cloudinary.js");
const wrapAsyncHandler = require("../utils/wrapAsyncHandler.js");
const jwt = require("jsonwebtoken");

const generateAccessAndRefreshToken = async (userId) => {
  const user = await User.findOne(userId);
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();
  //   console.log("tokeeen",accessToken,refreshToken);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false }); //To bypass the validations for token generation
  return { accessToken, refreshToken };
};

const registerUser = wrapAsyncHandler(async (req, res, next) => {
  //get the user info from frontend
  //perform validation--not empty
  //check if user already exits:username ,email
  // get the local url and store it on the cloudinary
  // create user obj and save in db
  //remove password and refresh token from the respone
  //check for the user creation
  //return respone

  const { username, email, password, fullName } = req.body;
  if (
    [username, email, password, fullName].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  const exitedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (exitedUser) {
    throw new ApiError(409, "User with username or email already exits");
  }
  console.log(req.files);
  const avatarLocalPath = req.files?.avatar[0]?.path;

  let coverImageLocalPath;
  if (req.files && req.files.coverImage && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files?.coverImage[0]?.path || "";
  }
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  console.log(avatar);
  if (!avatar) {
    throw new ApiError(400, "Avatar url is required");
  }
  const user = await User.create({
    username: username.toLowerCase(),
    fullName,
    email,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    password,
  });
  const createdUser = await User.findById(user._id).select(
    "-password  -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Successfully"));
});

const loginUser = wrapAsyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  console.log(username, email, password);
  if (!username && !email) {
    throw new ApiError(400, "Username and Email is required");
  }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiError(404, "User does not exits do signup first");
  }
  //console.log(user);
  const isPasswordValid = await user.isPasswordCorrect(password);
  console.log(isPasswordValid);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid User Credentails");
  }
  console.log("checking pass");
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  console.log("checking pass2");
  //   console.log("tokken",accessToken,refreshToken);
  const loggedInUser = await User.findOne(user._id).select(
    "-password -refreshToken"
  );
  console.log("checking pass3");
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, { loggedInUser }, "User Logged In Successfully")
    );
});

const logoutUser = wrapAsyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out Successfully!"));
});

const refreshAccessToken = async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(400, "Unauthorized token");
  }
  try {
    const decodedToken = await jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    if (!decodedToken) {
      throw new ApiError(400, "Unauthorized token");
    }
    const user = await User.findById(decodedToken._id);
    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(400, "refresh token expired");
    }
    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);
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
          "Tokens are refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(
      400,
      error?.message || "something happening wrong invalid refresh token"
    );
  }
};

const changeCurrentPassword = wrapAsyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(user.req?._id);
  if (!user) {
    throw new ApiError(404, "Current User is not login");
  }
  const currPassword = await user.isPasswordCorrect(oldPassword);

  if (!currPassword) {
    throw new ApiError(400, "Invalid password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res.status(200).json(new ApiResponse(200, {}, "Password Changed"));
});

const getCurrentUser = wrapAsyncHandler((req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current User fetched Successfully"));
});

const updateAccountDetails = wrapAsyncHandler(async(req,res) => {
  const { username, email } = req.body;
  if (!username || !email) {
    throw new ApiError(400, "username or email required");
  }
  const user=await User.findById(req.user?._id
    ,{
        $set:{username,email}
    },{
        new:true,
    }).select("-password");
    return res
    .status(200)
    .json(new ApiResponse(200,user,"User Account detail updated"))

});

const updateUserAvatar=wrapAsyncHandler((req,res)=>{
    const localAvatarPath=req.file?.path;
    if(localAvatarPath){
        throw new ApiError(404,"Avatar is not found");

    }
    const avatar=uploadOnCloudinary(avatarLocalPath);
   const user= User.findByIdAndUpdate(req.user?._id,{
       $set:{
        avatar:avatar.url
       } 
    },{
        new:true
    }).select("-password");
    return res
    .status(200)
    .json(new ApiResponse(200,user,"Avatar Image Updated"));

})
const updateUserCoverImage=wrapAsyncHandler((req,res)=>{
    const localCoverImagePath=req.file?.path;
    if(localCoverImagePath){
        throw new ApiError(404,"Avatar is not found");

    }
    const coverImagePath=uploadOnCloudinary(localCoverImagePath);
    const user=User.findByIdAndUpdate(req.user?._id,{
       $set:{
        coverImage:coverImagePath.url
       } 
    },{
        new:true
    }).select("-password");
    return res
    .status(200)
    .json(new ApiResponse(200,user,"Cover Image Updated"));

})
module.exports = { registerUser, loginUser, logoutUser,
     refreshAccessToken ,
     updateAccountDetails,
     getCurrentUser,
     getCurrentUser,
    updateUserCoverImage,
    updateUserAvatar};
