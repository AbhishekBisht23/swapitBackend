import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { acceptSwap, cancelSwap, createSwapRequest, getMySwap, rejectSwap } from "../controllers/request.controller";

const router = Router();
router.route("/create-Swap-Request").post(verifyJWT,createSwapRequest);
router.route("/accept-Swap/:swapId").post(verifyJWT,acceptSwap);
router.route("/reject-Swap/:swapId").post(verifyJWT,rejectSwap);
router.route("/get-My-Swap").get(verifyJWT,getMySwap);
router.route("/cancel-Swap/:swapId").post(verifyJWT,cancelSwap);
export default router;