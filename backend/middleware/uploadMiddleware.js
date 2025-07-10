const { upload, handleMulterError } = require('../config/multerConfig');
const logger = require('../utils/logger');

/**
 * Single file upload middleware
 */
const singleFileUpload = (fieldName) => {
    return [
        upload.single(fieldName),
        handleMulterError,
        (req, res, next) => {
            if (req.file) {
                logger.info(`File uploaded: ${req.file.filename}`);
            }
            next();
        }
    ];
};

/**
 * Multiple files upload middleware
 */
const multipleFilesUpload = (fieldName, maxCount = 5) => {
    return [
        upload.array(fieldName, maxCount),
        handleMulterError,
        (req, res, next) => {
            if (req.files && req.files.length > 0) {
                logger.info(`${req.files.length} files uploaded`);
            }
            next();
        }
    ];
};

/**
 * Fields upload middleware for mixed file types
 */
const fieldsUpload = (fields) => {
    return [
        upload.fields(fields),
        handleMulterError,
        (req, res, next) => {
            if (req.files) {
                const fileCount = Object.keys(req.files).reduce((total, key) => {
                    return total + req.files[key].length;
                }, 0);
                logger.info(`${fileCount} files uploaded across multiple fields`);
            }
            next();
        }
    ];
};

/**
 * Profile image upload middleware
 */
const profileImageUpload = singleFileUpload('profileImage');

/**
 * Company logo upload middleware
 */
const companyLogoUpload = singleFileUpload('companyLogo');

/**
 * NGO logo upload middleware
 */
const ngoLogoUpload = singleFileUpload('ngoLogo');

/**
 * Campaign images upload middleware
 */
const campaignImagesUpload = multipleFilesUpload('campaignImages', 5);

/**
 * Campaign documents upload middleware
 */
const campaignDocumentsUpload = multipleFilesUpload('campaignDocuments', 3);

/**
 * Mixed campaign files upload middleware
 */
const campaignFilesUpload = fieldsUpload([
    { name: 'campaignImages', maxCount: 5 },
    { name: 'campaignDocuments', maxCount: 3 }
]);

module.exports = {
    singleFileUpload,
    multipleFilesUpload,
    fieldsUpload,
    profileImageUpload,
    companyLogoUpload,
    ngoLogoUpload,
    campaignImagesUpload,
    campaignDocumentsUpload,
    campaignFilesUpload
};
