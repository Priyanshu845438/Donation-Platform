const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure directories exist
const createFolder = (folderPath) => {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
};

const imageStoragePath = "uploads/campaign/image/";
const proofStoragePath = "uploads/campaign/proof/";

createFolder(imageStoragePath);
createFolder(proofStoragePath);

// Multer storage for images
const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, imageStoragePath);
    },
    filename: function (req, file, cb) {
        const campaignId = req.body.campaignId || "temp"; // Use 'temp' if campaign ID is not available yet
        const ext = path.extname(file.originalname);
        cb(null, `campaign_${campaignId}_${Date.now()}${ext}`);
    }
});

// Multer storage for proof documents
const proofStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, proofStoragePath);
    },
    filename: function (req, file, cb) {
        const campaignId = req.body.campaignId || "temp";
        const ext = path.extname(file.originalname);
        cb(null, `proof_${campaignId}_${Date.now()}${ext}`);
    }
});

// Multer upload handlers
const uploadImage = multer({ storage: imageStorage }).array("campaignImages", 5); // Up to 5 images
const uploadProof = multer({ storage: proofStorage }).array("proofDocs", 5); // Up to 5 proof docs

module.exports = { uploadImage, uploadProof };
