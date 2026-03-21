import formidable from 'formidable';
import path from 'path';
import fs from 'fs';

// Create uploads directory
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware for file uploads
export const uploadMiddleware = (req, res, next) => {
  const form = formidable({
    uploadDir: uploadsDir,
    maxFileSize: 10 * 1024 * 1024,
    keepExtensions: true,
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(400).json({ error: 'File upload failed: ' + err.message });
    }

    const fileArray = Array.isArray(files.file) ? files.file : [files.file];
    const file = fileArray?.[0];
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!file.originalFilename || !file.originalFilename.toLowerCase().endsWith('.pdf')) {
      fs.unlink(file.filepath, () => {});
      return res.status(400).json({ error: 'Only PDF files allowed' });
    }

    req.file = {
      path: file.filepath,
      originalname: file.originalFilename,
      size: file.size,
      mimetype: file.mimetype,
    };

    next();
  });
};

export default uploadMiddleware;