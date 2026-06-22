// src/routes/auth.routes.js
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { register, login, getMe, updateProfile, changePassword } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { registerValidator, loginValidator, validate } from "../middleware/validate.middleware.js";

const router = Router();

// Strict limit ONLY on credential-guessing endpoints — NOT on /me, which fires
// on every page load/refresh to restore the session and would get throttled
// by normal browsing otherwise.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many login attempts, please try again later." },
});

router.post("/register", authLimiter, registerValidator, validate, register);
router.post("/login",    authLimiter, loginValidator,    validate, login);
router.get ("/me",       protect,           getMe);
router.patch("/me",      protect,           updateProfile);
router.patch("/password",protect,           changePassword);

export default router;