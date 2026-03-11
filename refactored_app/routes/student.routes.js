import { Router } from "express";
import * as studentController from "../controllers/student.controller.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = Router();

// Protect all routes with authentication middleware
router.use(isAuthenticated);

// Student Profile Access
router.get("/profile-stu", studentController.getProfileStu);
router.post("/profile-stu", studentController.postProfileStu);

// Quiz Page Views
router.get("/page1quiz-stu", studentController.getPage1QuizStu);
router.post("/page1quiz-stu", studentController.postPage1QuizStu);

// Take Quiz Handlers
router.get("/take-quiz-stu", studentController.getTakeQuizStu);
router.post("/take-quiz-stu", studentController.postTakeQuizStu);

// Search and Navigate Quizzes
router.get("/page1Serach-stu", studentController.getPage1SearchStu);
router.post("/page1Serach-stu", studentController.postPage1SearchStu);

router.get("/pagetablesearch", studentController.getPageTableSearch);
router.post("/pagetablesearch", studentController.postPageTableSearch);

// Quiz Submission Results
router.get("/submitquize-stu", studentController.getSubmitQuizStu);
router.post("/submitquize-stu", studentController.postSubmitQuizStu);

export default router;
