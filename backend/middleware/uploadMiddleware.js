
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// Storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = 'uploads/';
        
        // Determine upload path based on file field and user role
        switch (file.fieldname) {
            case 'profileImage':
            case 'companyLogo':
            case 'ngoLogo':
                uploadPath += 'profile/';
                break;
            case 'campaignImage':
                uploadPath += 'campaign/image/';
                break;
            case 'campaignProof':
                uploadPath += 'campaign/proof/';
                break;
            case 'documents':
                uploadPath += 'documents/';
                break;
            default:
                uploadPath += 'general/';
        }

        ensureDirectoryExists(uploadPath);
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileName = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
        cb(null, fileName);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Define allowed file types for different fields
    const allowedTypes = {
        profileImage: /jpeg|jpg|png|gif/,
        companyLogo: /jpeg|jpg|png|gif|svg/,
        ngoLogo: /jpeg|jpg|png|gif|svg/,
        campaignImage: /jpeg|jpg|png|gif/,
        campaignProof: /jpeg|jpg|png|pdf/,
        documents: /pdf|doc|docx|jpeg|jpg|png/
    };

    const allowedType = allowedTypes[file.fieldname] || /jpeg|jpg|png|pdf/;
    const extname = allowedType.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedType.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error(`Invalid file type for ${file.fieldname}. Allowed types: ${allowedType}`));
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 5 // Maximum 5 files
    }
});

module.exports = upload;
