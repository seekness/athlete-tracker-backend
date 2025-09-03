const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/exercises")); // ✅ nova lokacija
  },
  filename: (req, file, cb) => {
    cb(null, "temp_" + Date.now() + path.extname(file.originalname)); // privremeno ime
  }
});

const upload = multer({ storage });

module.exports = upload;