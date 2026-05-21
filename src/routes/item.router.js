import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { createItem, deleteItem, getAllItems, getSingleItem, getUserItems, updateItem, updateItemImages } from "../controllers/item.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create-item").post(verifyJWT, upload.array("images", 5),createItem);
router.route("/itemlist").get(verifyJWT,getAllItems);
router.route("/c/:itemId").get(verifyJWT,getSingleItem);
router.route("/getuseritems").get(verifyJWT,getUserItems);
router.route("/updateItem/:itemId").put(verifyJWT,updateItem);
router.route("/updateItemImages/:itemId").patch(verifyJWT, upload.array("images",5), updateItemImages);
router.route("/deleteItem/:itemId").delete(verifyJWT, deleteItem);

export default router;