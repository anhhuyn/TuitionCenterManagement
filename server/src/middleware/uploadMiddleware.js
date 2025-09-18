import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Thư mục lưu ảnh
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars'); // Nên dùng path.join để tránh lỗi đường dẫn
console.log('Upload directory:', uploadDir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Folder uploadDir created:', uploadDir);
} else {
  console.log('Folder uploadDir already exists:', uploadDir);
}


// Cấu hình lưu file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Saving file to:', uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    console.log('Generated filename:', fileName);
    cb(null, fileName);
  }
});

// Filter chỉ cho phép upload ảnh
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const isValid = allowedTypes.test(file.mimetype);
  if (isValid) {
    console.log('File mimetype allowed:', file.mimetype);
    cb(null, true);
  } else {
    console.log('File mimetype NOT allowed:', file.mimetype);
    cb(new Error('Chỉ cho phép upload ảnh (jpeg, jpg, png, gif)'));
  }
};


const upload = multer({ storage, fileFilter });

export default upload;
