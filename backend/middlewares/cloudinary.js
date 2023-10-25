import cloudinary from "cloudinary";
import dotenv from "dotenv";

dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const saveImage = async (image) => {
  try {
    const response = await cloudinary.uploader.upload(image);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const saveVideo = async (video) => {
  try {
    console.log("2",video)
    const response = await cloudinary.v2.uploader.upload(video, {
      resource_type: "video",
    });
    console.log("nithin",response)
    return response;
  } catch (error) {
    console.log(error);
  }
};
