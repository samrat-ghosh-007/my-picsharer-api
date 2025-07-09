// config/cloudinary.js
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD,   // put these three in .env
  api_key:    process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true,
  debug: true,
});

module.exports = cloudinary;
