import { Router } from "express";
import { upload } from "../middlewares/multer.middleware";
import { createItem, getAllItems, getSingleItem } from "../controllers/item.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.route("/create-item").post(verifyJWT, upload.array("images", 5),createItem);
router.route("/itemlist").get(verifyJWT,getAllItems);

router.route("/c/:itemId").get(verifyJWT,getSingleItem);

export default router;