import { Router } from "express";
import * as teacherController from "../controllers/teacher.controller.js";
import upload from "../middleware/upload.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = Router();

// Protect all routes with authentication middleware
router.use(isAuthenticated);

router.get("/profile-tec", teacherController.getProfileTec);

router.get("/createquiz-tec", teacherController.getCreateQuizTec);
router.post("/createquiz-tec", teacherController.postCreateQuizTec);

router.get("/startCreatequiz", teacherController.getStartCreateQuiz);
router.post("/startCreatequiz", upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 },
]), teacherController.postStartCreateQuiz);

router.get("/submitQ", teacherController.getSubmitQ);
router.post("/submitQ", teacherController.postSubmitQ);

router.get("/editquiz-tec", teacherController.getEditQuizTec);
router.post("/editquiz-tec", teacherController.postEditQuizTec);

router.get("/about-quiz", teacherController.getAboutQuiz);
router.post("/about-quiz", teacherController.postAboutQuiz);

router.get("/show-what-do-stu", teacherController.getShowWhatDoStu);

export default router;
