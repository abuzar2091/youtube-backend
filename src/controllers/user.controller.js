const  User  = require("../models/user.model.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");
const { uploadOnCloudinary } = require("../utils/cloudinary.js");
const wrapAsyncHandler = require("../utils/wrapAsyncHandler.js");
const registerUser = wrapAsyncHandler(async (req, res,next) => {
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
  const exitedUser =await User.findOne({
    $or: [{ username }, { email }],
  });
  if (exitedUser) {
    throw new ApiError(409, "User with username or email already exits");
  }
//   req.files
  console.log(req.files);
  const avatarLocalPath = req.files?.avatar[0]?.path;
  

 let coverImageLocalPath;
 if(req.files && req.files.coverImage && req.files.coverImage.length>0){
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
  const createdUser =await User.findById(user._id).select(
    "-password  -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  res.status(201).json(new ApiResponse(200,createdUser,"User Registered Successfully"));
});

module.exports = registerUser;
