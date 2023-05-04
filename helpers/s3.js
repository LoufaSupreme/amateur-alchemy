require('dotenv').config();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new S3Client({
  region,
  credentials: {
    secretAccessKey,
    accessKeyId,
  }
})

// uploads a file to s3
exports.uploadFile = async (file) => {
  
  const uploadParams = {
    Bucket: bucketName,
    Key: file.newFileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const putCommand = new PutObjectCommand(uploadParams);
  s3.send(putCommand);
}