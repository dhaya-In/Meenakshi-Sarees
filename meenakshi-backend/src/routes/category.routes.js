// src/routes/category.routes.js
import { Router } from "express";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../controllers/category.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = Router();
router.get   ("/",     getCategories);
router.post  ("/",     protect, adminOnly, createCategory);
router.patch ("/:id",  protect, adminOnly, updateCategory);
router.delete("/:id",  protect, adminOnly, deleteCategory);
export default router;
