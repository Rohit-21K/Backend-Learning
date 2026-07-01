// import multer from "multer";

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//         const uploadPath = path.join(process.cwd(), "..", "public", "temp");
//     cb(null, "./public/temp");
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   },
// });

// export const upload = multer({ storage });

import path from "path";
import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(process.cwd(), "..", "public", "temp");

    console.log("Upload Path:", uploadPath);

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
  
export const upload = multer({ storage });
  