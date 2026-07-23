// Cloudinary config for uploading proof-of-payment screenshots directly
// from the customer's browser. The upload preset is "unsigned," meaning
// no secret key is needed here — that's what makes this safe to keep
// in client-side code (unlike the Telegram bot token, which is not safe
// client-side and lives in a serverless function instead).

const CLOUDINARY_CLOUD_NAME = "tvj7qspg";
const CLOUDINARY_UPLOAD_PRESET = "Unsign";

/**
 * Uploads a File object to Cloudinary and returns its public URL.
 * Throws if the upload fails.
 */
async function uploadProofOfPayment(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  const result = await response.json();
  if (!result.secure_url) {
    throw new Error(result.error?.message || 'Cloudinary upload failed');
  }
  return result.secure_url;
}
