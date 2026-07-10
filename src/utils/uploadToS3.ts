import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const uploadToS3 = async (buffer: Buffer, bucketName: string, key: string) => {
  const s3 = new S3Client({ region: process.env.AWS_REGION || "ap-east-1" });
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  await s3.send(command);
  console.log(`File ${key} uploaded to ${bucketName}`);
};

export default uploadToS3;
