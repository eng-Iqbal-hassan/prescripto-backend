import {v2 as cloudinary} from "cloudinary";

const connectCloudinary = async () => {

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY ,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    })

    console.log("CLOUDINARY VALUES:", {
  name: process.env.CLOUDINARY_NAME,
  key: process.env.CLOUDINARY_API_KEY,
  secret: process.env.CLOUDINARY_API_SECRET ? "Loaded" : "Missing"
});

}

export default connectCloudinary