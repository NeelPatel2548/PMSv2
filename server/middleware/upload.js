const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { v2: cloudinary } = require('cloudinary');

// Configure Cloudinary from individual env vars
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary storage for resume PDFs
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'pms-resumes',
    allowed_formats: ['pdf'],
    resource_type: 'raw',
    // Unique filename per upload to avoid collisions
    public_id: (req, file) => `resume-${req.user.id}-${Date.now()}`
  }
});

// File filter — reject anything that isn't PDF at the mimetype level
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

// Multer upload instance (same export name as before — no controller changes needed)
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

/**
 * Delete a resume from Cloudinary by its secure URL.
 * Extracts the public_id from the URL and destroys the resource.
 * @param {string} url - The Cloudinary secure_url to delete
 */
const deleteCloudinaryFile = async (url) => {
  if (!url || !url.includes('cloudinary')) return;
  try {
    // Extract public_id from URL: .../pms-resumes/resume-userId-timestamp.pdf
    const parts = url.split('/');
    const folderIndex = parts.indexOf('pms-resumes');
    if (folderIndex === -1) return;
    // public_id = pms-resumes/resume-userId-timestamp (without extension)
    const filenameWithExt = parts.slice(folderIndex).join('/');
    const publicId = filenameWithExt.replace(/\.[^/.]+$/, '');
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
  } catch (err) {
    console.error('Cloudinary delete error (non-fatal):', err.message);
  }
};

module.exports = { upload, deleteCloudinaryFile };
