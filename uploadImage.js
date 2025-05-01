// var cloudinary = require("cloudinary").v2;

// const cloud_name = process.env.CLOUD_NAME;
// const api_key = process.env.API_KEY;
// const api_secret = process.env.API_SECRET;
const dotenv = require("dotenv");
const uuidv4 = require("uuid").v4;

const pinataSDK = require("@pinata/sdk");
dotenv.config();
const { Readable } = require("stream");

const pinata = new pinataSDK(
	process.env.PINATA_API_KEY,
	process.env.PINATA_SECRET_API_KEY
);



module.exports.uploadImage = async (image) => {
  try {
       // Extract extension from base64 string
       const matches = image.match(/^data:image\/(\w+);base64,/);
       if (!matches) {
         throw new Error("Invalid base64 image format.");
       }
       const extension = matches[1]; // e.g., "png", "jpeg"
    // Convert base64 to buffer
    const base64Image = image.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Image, "base64");
    const stream = Readable.from(imageBuffer);
    const randomId = uuidv4();

    // Upload to IPFS via Pinata
    const imageResult = await pinata.pinFileToIPFS(stream, {
      pinataMetadata: {
        name: `zentrafi-${randomId}.${extension}`, // use dynamic extension
      },
      pinataOptions: {
        cidVersion: 0,
      },
    });

    const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageResult.IpfsHash}`;
    console.log({imageUrl})
    return imageUrl;

  } catch (error) {
    console.error("Image upload failed:", error.message);
    throw new Error("Failed to upload image to IPFS.");
  }
};
// module.exports = (image) => {
//   //imgage = > base64
//   return new Promise((resolve, reject) => {
//     cloudinary.uploader.upload(image, opts, (error, result) => {
//       if (result && result.secure_url) {
//         console.log(result.secure_url);
//         return resolve(result.secure_url);
//       }
//       console.log(error.message);
//       return reject({ message: error.message });
//     });
//   });
// };

// module.exports.uploadMultipleImages = (images) => {
//   return new Promise((resolve, reject) => {
//     const uploads = images.map((base) => uploadImage(base));
//     Promise.all(uploads)
//       .then((values) => resolve(values))
//       .catch((err) => reject(err));
//   });
// };