const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const logger = require('../utils/logger');

/**
 * Ensure upload directory exists
 */
const ensureUploadDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logger.info(`Upload directory created: ${dir}`);
    }
};

/**
 * Generate secure filename
 */
const generateSecureFilename = (originalName) => {
    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalName);
    const sanitizedName = path.basename(originalName, extension)
        .replace(/[^a-zA-Z0-9]/g, '_')
        .substring(0, 20);
    
    return `${sanitizedName}_${timestamp}_${randomBytes}${extension}`;
};

/**
 * Create multer configuration for specific upload type
 */
const createUploadConfig = (uploadType) => {
    const uploadDir = path.join(__dirname, `../uploads/${uploadType}`);
    ensureUploadDir(uploadDir);

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
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

    const fileFilter = (req, file, cb) => {
        const allowedMimeTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx'];
        const fileExtension = path.extname(file.originalname).toLowerCase();

        if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
            cb(null, true);
        } else {
            const error = new Error(`Invalid file type. Only ${allowedExtensions.join(', ')} files are allowed.`);
            error.code = 'INVALID_FILE_TYPE';
            cb(error, false);
        }
    };

    return multer({
        storage,
        fileFilter,
        limits: {
            fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
            files: 5,
            fields: 10
        }
    });
};

/**
 * Upload configurations for different types
 */
const uploadConfigs = {
    profile: createUploadConfig('profile'),
    company: createUploadConfig('company'),
    ngo: createUploadConfig('ngo'),
    campaign: createUploadConfig('campaign')
};

/**
 * Error handling middleware for multer
 */
const handleUploadError = (error, req, res, next) => {
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
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Unexpected file field.'
            });
        }
    }

    if (error.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }

    logger.error('Upload error:', error);
    return res.status(500).json({
        success: false,
        message: 'File upload failed.'
    });
};

/**
 * Utility function to clean up uploaded files
 */
const cleanupUploadedFiles = (files) => {
    if (!files) return;

    const fileArray = Array.isArray(files) ? files : [files];

    fileArray.forEach(file => {
        if (file && file.path) {
            fs.unlink(file.path, (err) => {
                if (err) {
                    logger.error('Error deleting file:', err);
                } else {
                    logger.info('Cleaned up file:', file.path);
                }
            });
        }
    });
};

/**
 * Middleware to handle single file upload
 */
const singleUpload = (uploadType, fieldName) => {
    return [
        uploadConfigs[uploadType].single(fieldName),
        handleUploadError
    ];
};

/**
 * Middleware to handle multiple file upload
 */
const multipleUpload = (uploadType, fieldName, maxCount = 5) => {
    return [
        uploadConfigs[uploadType].array(fieldName, maxCount),
        handleUploadError
    ];
};

/**
 * Middleware to handle mixed file upload
 */
const fieldsUpload = (uploadType, fields) => {
    return [
        uploadConfigs[uploadType].fields(fields),
        handleUploadError
    ];
};

module.exports = {
    singleUpload,
    multipleUpload,
    fieldsUpload,
    handleUploadError,
    cleanupUploadedFiles,
    generateSecureFilename
};
