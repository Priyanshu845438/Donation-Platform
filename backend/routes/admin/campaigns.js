const express = require("express");
const AdminController = require("../../controllers/adminController");
const authMiddleware = require("../../middleware/auth");
const { campaignImageUpload, campaignDocumentUpload, campaignProofUpload } = require("../../middleware/upload");

const router = express.Router();

// Campaign Management Routes
router.get("/", authMiddleware(["admin"]), AdminController.getAllCampaigns);
router.get("/:id", authMiddleware(["admin"]), AdminController.getCampaignDetails);
router.put("/:id", authMiddleware(["admin"]), AdminController.updateCampaign);
// Delete campaign
router.delete("/:id", authMiddleware(["admin"]), AdminController.deleteCampaign);

// Get campaign files
router.get("/:campaignId/files", authMiddleware(["admin"]), AdminController.getCampaignFiles);

// Get campaign images
router.get("/:campaignId/images", authMiddleware(["admin"]), AdminController.getCampaignImages);

// Get campaign documents
router.get("/:campaignId/documents", authMiddleware(["admin"]), AdminController.getCampaignDocuments);

// Get campaign proof
router.get("/:campaignId/proof", authMiddleware(["admin"]), AdminController.getCampaignProof);

// Campaign File Upload Routes
router.post(
    "/:campaignId/images",
    authMiddleware(["admin"]),
    campaignImageUpload.array("image", 10),
    AdminController.uploadCampaignImages
);

router.post(
    "/:campaignId/documents",
    authMiddleware(["admin"]),
    campaignDocumentUpload.array("documents", 10),
    AdminController.uploadCampaignDocuments
);

router.post(
    "/:campaignId/proof",
    authMiddleware(["admin"]),
    campaignProofUpload.array("proof", 10),
    AdminController.uploadCampaignProof
);

module.exports = router;