const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { v2: cloudinary } = require('cloudinary');

// Configure Cloudinary from individual env vars
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ===========================================================================
// 1. RESUME UPLOAD — existing config, unchanged
// ===========================================================================

const resumeStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'pms-resumes',
    allowed_formats: ['pdf'],
    resource_type: 'raw',
    public_id: (req, file) => `resume-${req.user.id}-${Date.now()}`
  }
});

const resumeFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const resumeUpload = multer({ // NEW — renamed from `upload` to `resumeUpload` for clarity
  storage: resumeStorage,
  fileFilter: resumeFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Keep the old `upload` export name for backward compatibility with existing routes
const upload = resumeUpload; // NEW — alias so studentRoutes.js doesn't need changes

// ===========================================================================
// 2. PROFILE PICTURE UPLOAD — student headshots // NEW
// ===========================================================================

const profilePictureStorage = new CloudinaryStorage({ // NEW
  cloudinary,
  params: {
    folder: 'pms-profile-pictures', // NEW
    resource_type: 'image', // NEW
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // NEW
    // 400×400 face-aware crop, auto quality & format (WebP served to browsers that support it)
    transformation: [{ // NEW
      width: 400,
      height: 400,
      crop: 'fill',
      gravity: 'face',
      quality: 'auto',
      fetch_format: 'auto'
    }],
    public_id: (req, file) => `profile-${req.user.id}-${Date.now()}` // NEW
  }
});

const profilePictureFilter = (req, file, cb) => { // NEW
  const allowed = ['image/jpeg', 'image/png', 'image/webp']; // NEW
  if (allowed.includes(file.mimetype)) { // NEW
    cb(null, true); // NEW
  } else { // NEW
    cb(new Error('Only JPG, PNG, WEBP images allowed'), false); // NEW
  } // NEW
}; // NEW

const profilePictureUpload = multer({ // NEW
  storage: profilePictureStorage, // NEW
  fileFilter: profilePictureFilter, // NEW
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB // NEW
}); // NEW

// ===========================================================================
// 3. COMPANY LOGO UPLOAD // NEW
// ===========================================================================

const companyLogoStorage = new CloudinaryStorage({ // NEW
  cloudinary,
  params: {
    folder: 'pms-company-logos', // NEW
    resource_type: 'image', // NEW
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'svg'], // NEW
    // pad = letterbox / pillarbox — preserves aspect ratio with white fill
    // This prevents logos from being distorted or cropped
    transformation: [{ // NEW
      width: 300,
      height: 300,
      crop: 'pad',
      background: 'white',
      quality: 'auto',
      fetch_format: 'auto'
    }],
    public_id: (req, file) => `logo-${req.user.id}-${Date.now()}` // NEW
  }
});

const companyLogoFilter = (req, file, cb) => { // NEW
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']; // NEW
  if (allowed.includes(file.mimetype)) { // NEW
    cb(null, true); // NEW
  } else { // NEW
    cb(new Error('Only JPG, PNG, WEBP, SVG allowed'), false); // NEW
  } // NEW
}; // NEW

const companyLogoUpload = multer({ // NEW
  storage: companyLogoStorage, // NEW
  fileFilter: companyLogoFilter, // NEW
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB // NEW
}); // NEW

// ===========================================================================
// 4. CLOUDINARY DELETE HELPERS
// ===========================================================================

/**
 * Delete a resume from Cloudinary by its secure URL.
 * Extracts the public_id from the URL and destroys the resource.
 * @param {string} url - The Cloudinary secure_url to delete
 */
const deleteCloudinaryFile = async (url) => {
  if (!url || !url.includes('cloudinary')) return;
  try {
    const parts = url.split('/');
    const folderIndex = parts.indexOf('pms-resumes');
    if (folderIndex === -1) return;
    const filenameWithExt = parts.slice(folderIndex).join('/');
    const publicId = filenameWithExt.replace(/\.[^/.]+$/, '');
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
  } catch (err) {
    console.error('Cloudinary delete error (non-fatal):', err.message);
  }
};

/**
 * Delete any image (profile picture or company logo) from Cloudinary
 * using its stored public_id.
 *
 * multer-storage-cloudinary stores the public_id in req.file.filename.
 * We store that value in DB as profilePicture.publicId / logo.publicId
 * and pass it here when the user replaces their image.
 *
 * @param {string} publicId  - The Cloudinary public_id (stored in DB)
 * @param {string} resourceType - 'image' | 'raw' | 'video'
 */ // NEW
const deleteFromCloudinary = async (publicId, resourceType = 'image') => { // NEW
  if (!publicId) return; // NEW
  try { // NEW
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType }); // NEW
    console.log(`Cloudinary: deleted ${resourceType} → ${publicId}`); // NEW
  } catch (err) { // NEW
    // Non-fatal: log but don't crash the upload flow
    console.error('Cloudinary delete error (non-fatal):', err.message); // NEW
  } // NEW
}; // NEW

module.exports = {
  upload,                   // backward-compat alias for resume upload
  resumeUpload,             // explicit named export
  profilePictureUpload,     // NEW
  companyLogoUpload,        // NEW
  deleteCloudinaryFile,     // existing URL-based deleter for resumes
  deleteFromCloudinary      // NEW — publicId-based deleter for images
};
