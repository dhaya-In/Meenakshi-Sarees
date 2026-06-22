// src/routes/product.routes.js
import { Router } from "express";
import {
  getProducts, getProductById, createProduct,
  updateProduct, deleteProduct, toggleStock,
} from "../controllers/product.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";
import { productValidator, validate } from "../middleware/validate.middleware.js";

const router = Router();

router.get   ("/",              getProducts);
router.get   ("/:id",           getProductById);
router.post  ("/",              protect, adminOnly, productValidator, validate, createProduct);
router.patch ("/:id",           protect, adminOnly, updateProduct);
router.delete("/:id",           protect, adminOnly, deleteProduct);
router.patch ("/:id/stock",     protect, adminOnly, toggleStock);

export default router;
