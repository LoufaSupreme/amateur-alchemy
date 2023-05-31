require('dotenv').config();
const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

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

// delete file in s3
exports.deleteFile = async (imgName) => {
  
  const params = {
    Bucket: bucketName,
    Key: imgName
  }

  const delCommand = new DeleteObjectCommand(params);
  s3.send(delCommand);
}

// request presigned URL for s3 file
exports.getImageURL = async (imgName) => {
  const params = {
    Bucket: bucketName,
    Key: imgName
  };

  const getCommand = new GetObjectCommand(params);
  const url = await getSignedUrl(s3, getCommand, { expiresIn: 3600 });

  return url;
}

// get image buffer from s3
exports.getImageBuffer = async (imgName) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: imgName
    };
  
    const getCommand = new GetObjectCommand(params);
    const data = await s3.send(getCommand);
    const imgBuffer = await data.Body.transformToByteArray();
    return imgBuffer;
  }
  catch(err){
    console.error(err);
    throw new Error(`Could not retrieve file from S3: ${err.message}`);
  }
}