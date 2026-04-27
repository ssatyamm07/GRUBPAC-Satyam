import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { isS3Configured } from '../utils/s3Upload.js';

const uploadDir = 'uploads/';

if (!isS3Configured() && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif/;

  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);

  if (!ext || !mime) {
    return cb(new Error('Only JPG, PNG, GIF allowed'));
  }

  cb(null, true);
};

const diskStorage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, name + ext);
  },
});

const storage = isS3Configured() ? multer.memoryStorage() : diskStorage;

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});
