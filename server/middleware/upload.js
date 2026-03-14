const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.memoryStorage();

// File filter — basic extension check (magic byte validation done in controller)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['application/pdf'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

// Multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

/**
 * Validate file using magic bytes (file-type library)
 * and save to disk. Call this after multer processes the file.
 * @param {Buffer} buffer - file buffer
 * @param {string} userId - user ID string (req.user.id)
 * @returns {Promise<string>} relative file path
 */
const validateAndSaveFile = async (buffer, userId) => {
  // Dynamic import for ESM file-type library
  const { fileTypeFromBuffer } = await import('file-type');

  const type = await fileTypeFromBuffer(buffer);

  if (!type || !['application/pdf'].includes(type.mime)) {
    throw new Error('Invalid file type. Only PDF files are allowed.');
  }

  const filename = `resume-${userId}-${Date.now()}.pdf`;
  const filepath = path.join(uploadDir, filename);

  fs.writeFileSync(filepath, buffer);

  return `/uploads/resumes/${filename}`;
};

module.exports = { upload, validateAndSaveFile };
