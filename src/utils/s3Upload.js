import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export const isS3Configured = () =>
  Boolean(
    process.env.S3_BUCKET?.trim() &&
      process.env.AWS_REGION?.trim() &&
      process.env.AWS_ACCESS_KEY_ID?.trim() &&
      process.env.AWS_SECRET_ACCESS_KEY?.trim()
  );

export const uploadFileToS3 = async ({ buffer, mimetype, originalname }) => {
  if (!isS3Configured()) {
    throw new Error('S3 is not configured (missing env vars)');
  }

  const client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const ext = path.extname(originalname || '') || '.bin';
  const key = `uploads/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

  await client.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimetype || 'application/octet-stream',
    })
  );

  const base = process.env.S3_PUBLIC_BASE_URL?.replace(/\/$/, '');
  const encodedKey = key.split('/').map(encodeURIComponent).join('/');
  const url = base
    ? `${base}/${encodedKey}`
    : `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodedKey}`;

  return { url, key };
};
