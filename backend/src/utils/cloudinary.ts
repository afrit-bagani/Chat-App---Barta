import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const uploadOnCloudinary = async (localFilePath: string) => {
  try {
    if (!localFilePath) {
      console.error(
        "The provided localFilePath or originalFileName is null or undefined."
      );
      return null;
    }
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    fs.unlinkSync(localFilePath);
    return uploadResult;
  } catch (error) {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    console.error("Cloudinary upload failed: \n", error);
    return null;
  }
};

export const deleteOnCloudinary = async (public_id: string) => {
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    return result;
  } catch (error) {
    console.error("Error while deleting asset on cloudinary: \n", error);
  }
};
