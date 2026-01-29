
import { onObjectFinalized } from "firebase-functions/v2/storage";
import * as admin from "firebase-admin";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import sharp from "sharp";

// Initialize the Admin SDK if it hasn't been already
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const storage = admin.storage();

/**
 * Cloud Function that triggers when a new image is uploaded to Firebase Storage.
 * It creates a thumbnail version of the image.
 */
export const generateThumbnail = onObjectFinalized(async (event) => {
  const object = event.data;
  const fileBucket = object.bucket; // The Storage bucket that contains the file.
  const filePath = object.name; // File path in the bucket.
  const contentType = object.contentType; // File content type.

  // Exit if this is triggered on a file that isn't an image.
  if (!contentType || !contentType.startsWith('image/')) {
    console.log('This is not an image.');
    return;
  }

  // Exit if the image is already a thumbnail.
  if (filePath && path.basename(filePath).startsWith('thumb_')) {
    console.log('Already a Thumbnail.');
    return;
  }

  // Get the file name.
  const fileName = path.basename(filePath || '');
  const bucket = storage.bucket(fileBucket);
  const tempFilePath = path.join(os.tmpdir(), fileName);
  const metadata = {
    contentType: contentType,
  };

  // Download file from bucket.
  await bucket.file(filePath || '').download({ destination: tempFilePath });
  console.log('Image downloaded locally to', tempFilePath);

  try {
    // Define the thumbnail size.
    const thumbWidth = 200;
    const thumbHeight = 200;

    // Generate a thumbnail using sharp
    const thumbFileName = `thumb_${fileName}`;
    const thumbFilePath = path.join(os.tmpdir(), thumbFileName);
    
    await sharp(tempFilePath)
      .resize(thumbWidth, thumbHeight)
      .toFile(thumbFilePath);
    
    // Uploading the thumbnail.
    const thumbUploadPath = path.join(path.dirname(filePath || ''), thumbFileName);
    await bucket.upload(thumbFilePath, {
      destination: thumbUploadPath,
      metadata: metadata,
    });
    console.log('Thumbnail uploaded to', thumbUploadPath);

    // Once the thumbnail has been uploaded delete the local files to free up disk space.
    fs.unlinkSync(tempFilePath);

  } catch (error) {
    console.error("Error creating thumbnail:", error);
  }
});
