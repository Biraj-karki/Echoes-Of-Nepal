// backend/utils/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file buffer to Cloudinary using upload_stream.
 * Returns: { secure_url, public_id, resource_type }
 */
export const uploadBufferToCloudinary = ({ buffer, mimetype, folder }) => {
  return new Promise((resolve, reject) => {
    if (!buffer || !(buffer instanceof Buffer)) {
      return reject(new Error("uploadBufferToCloudinary: buffer must be a Buffer"));
    }

    const isVideo = String(mimetype || "").startsWith("video/");
    const isImage = String(mimetype || "").startsWith("image/");
    const resource_type = isVideo ? "video" : (isImage ? "image" : "auto");

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder || process.env.CLOUDINARY_FOLDER || "echoes-of-nepal",
        resource_type,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Delete a Cloudinary asset by public_id.
 * For videos, resource_type must be "video".
 */
export const deleteFromCloudinary = async ({ public_id, media_type }) => {
  if (!public_id) return null;

  const resource_type = media_type === "video" ? "video" : "image";
  return cloudinary.uploader.destroy(public_id, { resource_type });
};
