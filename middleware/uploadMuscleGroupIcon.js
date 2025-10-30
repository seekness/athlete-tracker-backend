const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/muscle-groups");
    fs.promises
      .mkdir(uploadDir, { recursive: true })
      .then(() => cb(null, uploadDir))
      .catch((err) => cb(err));
  },
  filename: (req, file, cb) => {
    cb(null, "temp_" + Date.now() + path.extname(file.originalname));
  }
});

module.exports = multer({ storage });
