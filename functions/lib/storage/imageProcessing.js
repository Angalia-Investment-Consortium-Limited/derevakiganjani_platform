"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateThumbnail = void 0;
const storage_1 = require("firebase-functions/v2/storage");
const admin = __importStar(require("firebase-admin"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const fs = __importStar(require("fs"));
const sharp_1 = __importDefault(require("sharp"));
// Initialize the Admin SDK if it hasn't been already
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const storage = admin.storage();
/**
 * Cloud Function that triggers when a new image is uploaded to Firebase Storage.
 * It creates a thumbnail version of the image.
 */
exports.generateThumbnail = (0, storage_1.onObjectFinalized)(async (event) => {
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
        await (0, sharp_1.default)(tempFilePath)
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
    }
    catch (error) {
        console.error("Error creating thumbnail:", error);
    }
});
//# sourceMappingURL=imageProcessing.js.map