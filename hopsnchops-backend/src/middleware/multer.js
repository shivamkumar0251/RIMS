// middlewares/multer.js
const multer = require("multer");

const storage = multer.diskStorage({});
const fileFilter = (req, file, cb) => {
  // Allow images (for product/profile photos)
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
    return;
  }
  // Allow Excel files (.xlsx, .xls)
  const excelMimeTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-excel" // .xls
  ];
  if (excelMimeTypes.includes(file.mimetype)) {
    cb(null, true);
    return;
  }
  // Reject all others
  cb(new Error("Only image and Excel files are allowed!"), false);
};

module.exports = multer({ storage, fileFilter });
