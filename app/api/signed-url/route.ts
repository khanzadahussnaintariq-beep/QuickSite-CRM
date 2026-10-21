import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.RAILWAY_BUCKET_REGION ?? process.env.NEXT_PUBLIC_RAILWAY_BUCKET_REGION ?? 'auto',
  endpoint: process.env.RAILWAY_BUCKET_ENDPOINT ?? process.env.NEXT_PUBLIC_RAILWAY_BUCKET_ENDPOINT,
  credentials: {
    accessKeyId: (process.env.RAILWAY_BUCKET_ACCESS_KEY_ID ?? process.env.NEXT_PUBLIC_RAILWAY_BUCKET_ACCESS_KEY_ID)!,
    secretAccessKey: (process.env.RAILWAY_BUCKET_SECRET_ACCESS_KEY ?? process.env.NEXT_PUBLIC_RAILWAY_BUCKET_SECRET_ACCESS_KEY)!,
  },
  forcePathStyle: true,
});

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key');
  if (!key) {
    return NextResponse.json({ error: 'Missing key' }, { status: 400 });
  }

  const bucket = process.env.RAILWAY_BUCKET_NAME ?? process.env.NEXT_PUBLIC_RAILWAY_BUCKET_NAME;
  if (!bucket) {
    return NextResponse.json({ error: 'S3 bucket not configured' }, { status: 500 });
  }

  try {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const url = await getSignedUrl(s3Client, command, { expiresIn: 604800 });
    return NextResponse.json({ url });
  } catch (err) {
    console.error('Failed to generate signed URL:', err);
    return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 });
  }
}
