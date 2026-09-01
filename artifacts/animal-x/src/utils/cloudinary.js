const CLOUD_NAME = "x1ekanir";
const UPLOAD_PRESET = "ml_default";

/**
 * Upload directly from the browser to Cloudinary.
 * The unsigned endpoint returns permanent secure_url/public_id values that are
 * safe to store in Firestore. XHR is used so upload progress is available.
 */
export function uploadToCloudinary(file, { onProgress } = {}) {
  if (!file) return Promise.reject(new Error("Select a file first."));
  if (!file.type?.startsWith("image/") && !file.type?.startsWith("video/")) {
    return Promise.reject(new Error("Only image and video files are supported."));
  }

  return new Promise((resolve, reject) => {
    const resourceType = file.type.startsWith("video/") ? "video" : "image";
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
    );
    xhr.responseType = "json";
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onerror = () => reject(new Error("Cloudinary upload failed. Check your connection."));
    xhr.onabort = () => reject(new Error("Cloudinary upload was cancelled."));
    xhr.onload = () => {
      const data = xhr.response || {};
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(data.error?.message || "Cloudinary upload failed."));
        return;
      }
      if (!data.secure_url || !data.public_id) {
        reject(new Error("Cloudinary returned an incomplete media response."));
        return;
      }
      resolve({ url: data.secure_url, publicId: data.public_id, resourceType });
    };
    xhr.send(formData);
  });
}
