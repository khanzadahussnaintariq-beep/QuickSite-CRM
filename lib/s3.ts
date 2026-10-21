import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_RAILWAY_BUCKET_REGION ?? "auto",
  endpoint: process.env.NEXT_PUBLIC_RAILWAY_BUCKET_ENDPOINT,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_RAILWAY_BUCKET_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_RAILWAY_BUCKET_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});


export async function uploadFile(file: File): Promise<string> {
  const randomId = Math.random().toString(36).substring(2, 10);
  const fileKey = `${randomId}_${file.name.replace(/\s+/g, '_')}`;
  const body = new Uint8Array(await file.arrayBuffer());
  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.NEXT_PUBLIC_RAILWAY_BUCKET_NAME!,
    Key: fileKey,
    Body: body,
    ContentType: file.type,
  }));
  return fileKey;
}

export async function getSignedImageUrl(fileName: string, expiresIn = 604800) { // 7 days
  const command = new GetObjectCommand({
    Bucket: process.env.NEXT_PUBLIC_RAILWAY_BUCKET_NAME!,
    Key: fileName,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}
