import Multer from "multer";
import path from "path";
const storage = new Multer.memoryStorage();
export const upload = Multer({
  storage,
});

const videoStorage = Multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = file.mimetype.split("/")[1];
    cb(null, file.fieldname + "-" + uniqueSuffix + "." + extension);
  },
});

export const videoUpload = Multer({
  storage: videoStorage,
  fileFilter: (req, file, cb) => {
    const filetypes = /webp|mp4|mov|avi|pdf/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
     
      return cb(null, false);
    }
  },
});
