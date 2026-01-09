const cloudinary = require("cloudinary").v2;
const { API_KEY, API_SECRET, CLOUD_NAME } = require('../config/env');

cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET
});

//  Upload Image
exports.cloudinaryImageUpload = async (url, imgId) => {
  try {
    // Upload image
    const uploadResult = await cloudinary.uploader.upload(url, {
      folder: "hopsnchopsModel/products",
      public_id: imgId,
      overwrite: true,
      resource_type: "image",
    });

    if (!uploadResult) throw new Error("Image upload failed");

    const optimizedUrl = cloudinary.url(uploadResult.public_id, {
      fetch_format: "auto",
      quality: "auto",
    });

    const croppedUrl = cloudinary.url(uploadResult.public_id, {
      crop: "auto",
      gravity: "auto",
      width: 500,
      height: 500,
    });

    return {
      original: uploadResult.secure_url,
      optimized: optimizedUrl,
      cropped: croppedUrl,
      public_id: uploadResult.public_id,
    };
  } catch (error) {
    console.error(" Cloudinary Upload Error:", error.message);
    throw error;
  }
};

//  Delete Image
exports.cloudinaryImageDelete = async (publicId) => {
  try {
    if (!publicId) throw new Error("Missing Cloudinary publicId");

    const result = await cloudinary.uploader.destroy(publicId);
    console.log("🗑️ Cloudinary delete result:", result);
    return result;
  } catch (error) {
    console.error(" Cloudinary Delete Error:", error.message);
    throw error;
  }
};
