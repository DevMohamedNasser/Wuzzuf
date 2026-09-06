import { v2 as cloudinary } from "cloudinary";
import env from "../../Config/config.service";

cloudinary.config({
  cloud_name: env.CLOUD_NAME,
  api_key: env.API_KEY,
  api_secret: env.API_SECRET,
});

export default cloudinary; 
