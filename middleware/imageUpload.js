var multer = require("multer");
require('dotenv').config()
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
cloudinary.config({ cloud_name: process.env.cloud_name, api_key: process.env.api_key, api_secret: process.env.api_secret, });


const storage = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "UdayanStock/companyImage", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const companyImage = multer({ storage: storage });




module.exports = { companyImage, }