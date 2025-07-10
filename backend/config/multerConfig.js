const fs = require("fs");
const path = require("path");
const multer = require("multer");
const crypto = require("crypto");
const logger = require("../utils/logger");

// Create uploads directory structure
const createUploadDirectories = () => {
    const uploadDir = path.join(__dirname, "../uploads");
    const subDirs = ["campaign", "company", "profile", "ngo"];
    
    try {
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
            logger.info("✅ Upload directory created:", uploadDir);
        }
        
        subDirs.forEach(subDir => {
            const subDirPath = path.join(uploadDir, subDir);
            if (!fs.existsSync(subDirPath)) {
                fs.mkdirSync(subDirPath, { recursive: true });
                logger.info(`✅ Sub-directory created: ${subDirPath}`);
            }
        });
    } catch (err) {
        logger.error("❌ Error creating upload directories:", err);
        throw err;
    }
};

// Initialize upload directories
createUploadDirectories();

// Generate secure filename
const generateSecureFilename = (originalName) => {
    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalName);
    const sanitizedName = path.basename(originalName, extension)
        .replace(/[^a-zA-Z0-9]/g, '_')
        .substring(0, 20);
    
    return `${sanitizedName}_${timestamp}_${randomBytes}${extension}`;
};

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "../uploads");
        let subDir = "general";
        
        // Determine subdirectory based on file field or route
        if (file.fieldname === 'companyLogo' || req.route?.path?.includes('company')) {
            subDir = "company";
        } else if (file.fieldname === 'campaignImage' || req.route?.path?.includes('campaign')) {
            subDir = "campaign";
        } else if (file.fieldname === 'profileImage' || req.route?.path?.includes('profile')) {
            subDir = "profile";
        } else if (file.fieldname === 'ngoLogo' || req.route?.path?.includes('ngo')) {
            subDir = "ngo";
        }
        
        const destinationPath = path.join(uploadDir, subDir);
        cb(null, destinationPath);
    },
    filename: (req, file, cb) => {
        try {
            const secureFilename = generateSecureFilename(file.originalname);
            cb(null, secureFilename);
        } catch (error) {
            cb(error, null);
        }
    }
});

// Enhanced File Filter
const fileFilter = (req, file, cb) => {
    try {
        const allowedMimeTypes = [
            "image/jpeg",
            "image/jpg", 
            "image/png",
            "image/gif",
            "image/webp",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];
        
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx'];
        const fileExtension = path.extname(file.originalname).toLowerCase();
        
        // Check both mime type and extension
        if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
            cb(null, true);
        } else {
            const error = new Error(`Invalid file type. Only ${allowedExtensions.join(', ')} files are allowed.`);
            error.code = 'INVALID_FILE_TYPE';
            cb(error, false);
        }
    } catch (error) {
        logger.error("File filter error:", error);
        cb(error, false);
    }
};

// Multer Upload Configuration
const upload = multer({
    storage,
    fileFilter,
    limits: { 
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
        files: 5, // Maximum 5 files per request
        fields: 10 // Maximum 10 fields
    },
    onError: (err, next) => {
        logger.error("Multer error:", err);
        next(err);
    }
});

// Error handling for multer
const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 5MB.'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Maximum 5 files allowed.'
            });
        }
        if (error.code === 'LIMIT_FIELD_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many fields.'
            });
        }
    }
    
    if (error.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    
    next(error);
};

// Utility function to clean up uploaded files on error
const cleanupUploadedFiles = (files) => {
    if (!files) return;
    
    const fileArray = Array.isArray(files) ? files : [files];
    
    fileArray.forEach(file => {
        if (file && file.path) {
            fs.unlink(file.path, (err) => {
                if (err) {
                    logger.error("Error deleting file:", err);
                } else {
                    logger.info("Cleaned up file:", file.path);
                }
            });
        }
    });
};

module.exports = {
    upload,
    handleMulterError,
    cleanupUploadedFiles,
    generateSecureFilename
};
