import { Router } from "express";
import { getUserProfile, loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getUserItems } from "../controllers/item.controller.js";

const router = Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);   

router.route("/getuserprofile").get(verifyJWT,getUserProfile);

router.route("/logout").post(verifyJWT,logoutUser);

export default router;