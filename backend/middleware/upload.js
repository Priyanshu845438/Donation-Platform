
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directories exist
const createUploadDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// Create upload directories
createUploadDir("uploads/Profile");
createUploadDir("uploads/campaign/image");
createUploadDir("uploads/campaign/documents");
createUploadDir("uploads/campaign/proof");
createUploadDir("uploads/branding");

// Storage configuration for profile images
const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        createUploadDir("uploads/Profile");
        cb(null, "uploads/Profile");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1E9);
        const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `${file.fieldname}_${uniqueSuffix}_${sanitizedFilename}`);
    }
});

// Storage configuration for campaign images
const campaignImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        createUploadDir("uploads/campaign/image");
        cb(null, "uploads/campaign/image");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1E9);
        const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `campaign_image_${uniqueSuffix}_${sanitizedFilename}`);
    }
});

// Storage configuration for campaign documents
const campaignDocumentStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        createUploadDir("uploads/campaign/documents");
        cb(null, "uploads/campaign/documents");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1E9);
        const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `campaign_doc_${uniqueSuffix}_${sanitizedFilename}`);
    }
});

// Storage configuration for campaign proof documents
const campaignProofStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        createUploadDir("uploads/campaign/proof");
        cb(null, "uploads/campaign/proof");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1E9);
        const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `campaign_proof_${uniqueSuffix}_${sanitizedFilename}`);
    }
});

// Storage configuration for branding assets
const brandingStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        createUploadDir("uploads/branding");
        cb(null, "uploads/branding");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1E9);
        let prefix = "";
        
        if (file.fieldname === "logo") {
            prefix = "logo";
        } else if (file.fieldname === "favicon") {
            prefix = "favicon";
        } else {
            prefix = file.fieldname;
        }
        
        const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `${prefix}_${uniqueSuffix}_${sanitizedFilename}`);
    }
});

// File filter for images
const imageFileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed"), false);
    }
};

// File filter for documents
const documentFileFilter = (req, file, cb) => {
    const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain"
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only document files (PDF, DOC, DOCX, XLS, XLSX, TXT) are allowed"), false);
    }
};

// File filter for branding assets
const brandingFileFilter = (req, file, cb) => {
    if (file.fieldname === "favicon") {
        const allowedTypes = ["image/x-icon", "image/vnd.microsoft.icon", "image/png"];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only ICO or PNG files are allowed for favicon"), false);
        }
    } else {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/svg+xml"];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only image files (JPEG, JPG, PNG, SVG) are allowed for logo"), false);
        }
    }
};

// Create multer instances
const profileUpload = multer({
    storage: profileStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

const campaignImageUpload = multer({
    storage: campaignImageStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

const campaignDocumentUpload = multer({
    storage: campaignDocumentStorage,
    fileFilter: documentFileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

const campaignProofUpload = multer({
    storage: campaignProofStorage,
    fileFilter: (req, file, cb) => {
        // Allow both images and documents for proof
        const allowedTypes = [
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only image and document files are allowed for proof"), false);
        }
    },
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

const brandingUpload = multer({
    storage: brandingStorage,
    fileFilter: brandingFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Export upload middleware
module.exports = {
    profileUpload,
    campaignImageUpload,
    campaignDocumentUpload,
    campaignProofUpload,
    brandingUpload
};
