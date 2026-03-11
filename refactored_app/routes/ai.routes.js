import { Router } from "express";
import * as aiController from "../controllers/ai.controller.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = Router();

// data3 is not protected in the original logic, or mixed in routes
router.post("/data3", aiController.postData3);

// Protect AI capabilities
router.use(isAuthenticated);

router.get("/AI-Assist", aiController.getAiAssist);
router.post("/AI-Assist", aiController.postAiAssist);

export default router;
