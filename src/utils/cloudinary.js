const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const fileResponse = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log(fileResponse);
    console.log("file uploaded on cloudinary");
    return fileResponse;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null
    // delete locally saved temporary 
    //file as cloudinary upload operation failed
  }
};

module.exports = {
  cloudinary,
  uploadOnCloudinary,
};
