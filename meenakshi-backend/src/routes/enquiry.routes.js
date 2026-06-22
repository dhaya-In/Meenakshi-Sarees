// src/routes/enquiry.routes.js
import { Router } from "express";
import { submitEnquiry, getEnquiries, updateEnquiryStatus } from "../controllers/enquiry.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";
import { enquiryValidator, validate } from "../middleware/validate.middleware.js";

const router = Router();
router.post  ("/",           enquiryValidator, validate, submitEnquiry);
router.get   ("/",           protect, adminOnly, getEnquiries);
router.patch ("/:id/status", protect, adminOnly, updateEnquiryStatus);
export default router;
