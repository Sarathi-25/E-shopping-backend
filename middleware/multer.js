import multer from "multer";
import path from "path";
import fs from "fs";

const UPLOAD_DIR = "uploads";
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) =>
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname)
    ),
});

export const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const ok = /jpeg|jpg|png|webp/.test(
      path.extname(file.originalname).toLowerCase()
    );
    ok ? cb(null, true) : cb(new Error("Images only (jpg/png/webp)"));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
