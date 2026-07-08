const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "products",
    resource_type:
      file.mimetype === "application/pdf" ? "raw" : "auto",
  }),
});

module.exports = multer({ storage });