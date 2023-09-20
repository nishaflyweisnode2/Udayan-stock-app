var multer = require("multer");
require('dotenv').config()
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
cloudinary.config({ cloud_name: process.env.CLOUD_NAME, api_key: process.env.CLOUD_KEY, api_secret: process.env.CLOUD_SECRET, });


const storage = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "UdayanStock/companyImage", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const companyImage = multer({ storage: storage });

const storage1 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "UdayanStock/brokerImage", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const brokerImage = multer({ storage: storage1 });
const storage2 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "UdayanStock/brokerImage", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const storyImage = multer({ storage: storage2 });
const storage3 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "UdayanStock/brokerImage", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const strategyImage = multer({ storage: storage3 });
const storage4 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "UdayanStock/brokerImage", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const userImage = multer({ storage: storage4 });




module.exports = { companyImage, brokerImage, storyImage, strategyImage, userImage }