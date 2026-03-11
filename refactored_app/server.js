import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import env from "dotenv";
import path from "path";

// Configuration and Middleware
import passport from "./config/passport.js";
import errorHandler from "./middleware/error.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import studentRoutes from "./routes/student.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
import aiRoutes from "./routes/ai.routes.js";

// Load Environment variables
env.config();

const app = express();

// Session setup
app.use(
    session({
        verify: '0',
        id_q: '0',
        sec: '0',
        mid_final: '0',
        numberq: '0',
        user: "name , email",
        cuser: "fname,lname , email,id_student,hash,cv_doc",
        listdata: "",
        avg: '0',
        flag: '0',
        data_Ai: "Q , imgq ",
        lis: "",
        h: 0,
        data3: "",
        email: "",
        qpre: "",
        secret: process.env.BOSS_CLICK || 'supersecret',
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 1000 * 60 * 60 },
    })
);

// Initialize Passport for Auth
app.use(passport.initialize());
app.use(passport.session());

// Middleware Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

// Serve Static Assets Publicly (Original code pointed to "public")
// To ensure correct pathing within refactored_app if run from root:
app.use(express.static(path.join(process.cwd(), "public")));

// --- Mounted Routes ---
// Default home page view
app.get("/", (req, res) => {
    res.render("start/home.ejs");
});

// App Feature Routes
app.use("/", authRoutes);
app.use("/", studentRoutes);
app.use("/", teacherRoutes);
app.use("/", aiRoutes);

// --- Error Handling ---
// Catch-all for API errors (must be last middleware)
app.use(errorHandler);

// --- Server Initialization ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Refactored Server is running on http://localhost:${PORT}`);
});
