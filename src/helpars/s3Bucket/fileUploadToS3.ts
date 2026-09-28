import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import fs from "fs";
import multer from "multer";
import path from "path";
import config from "../../config";
import { fileFilter } from "../file/fileFilter";

// Initialize S3 client (DigitalOcean Spaces / AWS S3 compatible)
export const s3Client = new S3Client({
  region: config.aws.region || "us-east-1",
  endpoint: config.aws.endpoint
    ? `https://${config.aws.endpoint}`
    : undefined,
  credentials: {
    accessKeyId: config.aws.accessKeyId as string,
    secretAccessKey: config.aws.secretAccessKey as string,
  },
});

/**
 * Upload a file to S3 / DigitalOcean Spaces
 * @param folder - Folder/prefix inside the bucket
 * @param title - Custom title/prefix for the filename
 * @param originalName - Original filename
 * @param mimeType - File MIME type
 * @param filePath - Temp local file path (will be deleted after upload)
 * @returns Public URL of the uploaded file
 */
export const fileUploadToS3 = async (
  folder: string,
  title: string,
  originalName: string,
  mimeType: string,
  filePath: string
): Promise<string> => {
  const bucketName = config.aws.bucketName;
  if (!bucketName) {
    throw new Error("S3 bucket name is not defined in the configuration.");
  }

  const fileName = `${folder}/${title}_${Date.now()}_${originalName}`;
  const fileStream = fs.createReadStream(filePath);

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: fileStream,
    ContentType: mimeType,
    ACL: "public-read",
  });

  try {
    await s3Client.send(command);
    const endpoint = config.aws.endpoint || `s3.amazonaws.com`;
    return `https://${bucketName}.${endpoint}/${fileName}`;
  } catch (error) {
    console.error("S3 Upload Error:", error);
    throw new Error("Failed to upload file to S3");
  } finally {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // Remove temporary file
    }
  }
};

/**
 * Multer middleware using disk storage (for temp upload before S3)
 */
export const s3Uploader = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueSuffix);
    },
  }),
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
  },
});
