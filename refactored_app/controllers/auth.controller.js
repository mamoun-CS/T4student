import passport from "passport";
import bcrypt from "bcryptjs";
import UserModel from "../models/user.model.js";
import sendVerificationEmail from "../utils/email.js";

const saltRound = 3;

export const getSignIn = (req, res) => res.render("start/sing-in.ejs");

export const postSignIn = (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            console.error("Error:", err);
            return next(err);
        }
        if (!user) return res.render("start/sing-in.ejs", { valid: info.message });

        req.login(user, (loginErr) => {
            if (loginErr) {
                console.error("Login Error:", loginErr);
                return next(loginErr);
            }

            req.session.user = {
                fname: user.fname.trimEnd(),
                lname: user.lname.trimEnd(),
                email: user.email,
                state: info.state === "ver" ? 'T' : info.state
            };

            if (info.state === "S") return res.redirect(`/profile-stu`);
            else if (info.state === "T") return res.redirect(`/profile-tec`);
            else if (info.state === "ver") return res.redirect(`/verify`);
        });
    })(req, res, next);
};

export const postSignOut = async (req, res) => {
    try {
        const now = Date.now();
        const rtime = Math.ceil((3600000 - (now - req.session.now)) / 1000);

        if (req.session.user && req.session.user.email) {
            if (rtime > 0) {
                await UserModel.updateStudentLastTry(req.session.user.email, req.session.now);
            } else {
                await UserModel.updateStudentLastTry(req.session.user.email, 0);
            }
        }

        req.session.destroy((err) => {
            if (err) console.error("Error destroying session:", err);
            res.redirect('/sing-in');
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error signing out");
    }
};

export const getSignUp = (req, res) => res.render("start/sing-up.ejs");

export const postSignUp = async (req, res) => {
    const { fname, lname, email, user, password, cpassword } = req.body;
    let id_student, state, cv_doc;

    if (user == "student") {
        id_student = req.body.id_student;
        state = 'S';
    } else if (user == "teacher") {
        cv_doc = req.body.cv_doc;
        state = 'T';
    }

    if (password != cpassword) {
        return res.render("start/sing-up.ejs", { validpas: "Invalid password Please try again." });
    }

    try {
        const hash = await bcrypt.hash(password, saltRound);
        const [student, teacher, teacher_ver] = await Promise.all([
            UserModel.findStudentByEmail(email),
            UserModel.findTeacherByEmail(email),
            UserModel.findUnverifiedTeacherByEmail(email)
        ]);

        if (student || teacher || teacher_ver) {
            return res.render("start/sing-up.ejs", { validpas: "invaled Email please change Email." });
        }

        if (state === 'T') {
            const ver = Math.floor(100000 + Math.random() * 900000).toString();
            await UserModel.createUnverifiedTeacher(fname, lname, email, hash, cv_doc, ver);

            const verificationCode = cv_doc + "/n email =" + email + "/n verify code : " + ver;
            await sendVerificationEmail(process.env.EMAIL_USER, verificationCode);
            return res.redirect("/sing-in");
        } else {
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            req.session.verify = verificationCode;
            await sendVerificationEmail(email, verificationCode);

            req.session.cuser = { fname, lname, email, id_student, hash };
            return res.redirect(`/verify`);
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send("Server Error");
    }
};

export const getVerify = (req, res) => {
    const valid = req.query.valid;
    res.render("start/verify-code.ejs", { valid });
};

export const postVerify = async (req, res) => {
    try {
        const state = req.session.user?.state || 0;
        const email = req.session.user?.email || 0;
        const code = req.body.code;

        if (state === 'T') {
            const result_ver = await UserModel.findUnverifiedTeacherByEmail(email);
            if (!result_ver) return res.redirect('/sing-in');

            const codeStr = String(code);
            const rr = String(result_ver.ver);

            if (rr === codeStr) {
                await UserModel.createTeacher(
                    result_ver.fname, result_ver.lname, result_ver.email,
                    result_ver.password, result_ver.cv_doc
                );
                await UserModel.deleteUnverifiedTeacher(email);

                req.session.user.fname = result_ver.fname;
                req.session.user.lname = result_ver.lname;
                req.session.user.email = result_ver.email;
                res.redirect("profile-tec");
            } else {
                return res.redirect(`/verify?email=${result_ver.email}&state=${state}&valid=code+is+not+correct+please+try+again`);
            }
        } else {
            const { fname, lname, email, hash, id_student } = req.session.cuser || {};
            if (!req.session.cuser) return res.redirect('/sing-in');

            let codev = req.session.verify;
            if (code === codev) {
                await UserModel.createStudent(fname, lname, email, hash, id_student);
                res.redirect("/sing-in");
            } else {
                res.redirect(`/verify?fname=${fname}&lname=${lname}&email=${email}&hash=${hash}&id_student=${id_student}&valid=code+is+not+correct+please+try+again`);
            }
        }
    } catch (error) {
        console.error("Database Error:", error);
        res.redirect("/sing-in", { valid: "There was an error with the database. Please try again." });
    }
};

export const getChangePassword = (req, res) => {
    const email = req.query.email;
    const load = req.query.load || 0;
    res.render('start/changeps.ejs', { email, load });
};

export const postChangePassword = async (req, res) => {
    try {
        const [passwordpre, passwordnew, passwordnew2] = req.body.password;
        const email = req.session?.user?.email || req.query.email;

        if (!email || !passwordpre || !passwordnew || !passwordnew2) {
            return res.render("start/changeps.ejs", { valid: "All fields are required.", email });
        }

        if (passwordnew !== passwordnew2) {
            return res.render("start/changeps.ejs", { valid: "Passwords do not match. Please try again.", email });
        }

        const [student, teacher, teacher_ver] = await Promise.all([
            UserModel.findStudentByEmail(email),
            UserModel.findTeacherByEmail(email),
            UserModel.findUnverifiedTeacherByEmail(email)
        ]);

        let user = null; let userType = '';
        if (student) { user = student; userType = 'student'; }
        else if (teacher) { user = teacher; userType = 'teacher'; }
        else if (teacher_ver) { user = teacher_ver; userType = 'teacher_ver'; }
        else return res.render("start/changeps.ejs", { valid: "Invalid email. User not found.", email });

        const isMatch = await bcrypt.compare(passwordpre, user.password);
        if (!isMatch) return res.render("start/changeps.ejs", { valid: "Incorrect current password. Please try again.", email });

        const newHashedPassword = await bcrypt.hash(passwordnew, saltRound);
        await UserModel.updatePassword(userType, email, newHashedPassword);

        res.redirect('/sing-in');
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const postChangePasswordR = async (req, res) => {
    try {
        const [passwordnew, passwordnew2] = req.body.password;
        const email = req.session.email;

        if (passwordnew !== passwordnew2) {
            return res.render("start/changeps.ejs", { valid: "Passwords do not match. Please try again.", email, load: 1 });
        }

        const [student, teacher, teacher_ver] = await Promise.all([
            UserModel.findStudentByEmail(email),
            UserModel.findTeacherByEmail(email),
            UserModel.findUnverifiedTeacherByEmail(email)
        ]);

        let userType = '';
        if (student) { userType = 'student'; }
        else if (teacher) { userType = 'teacher'; }
        else if (teacher_ver) { userType = 'teacher_ver'; }
        else return res.render("start/changeps.ejs", { valid: "Invalid email. User not found.", email, load: 1 });

        const newHashedPassword = await bcrypt.hash(passwordnew, saltRound);
        await UserModel.updatePassword(userType, email, newHashedPassword);

        res.redirect('/sing-in');
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getForgetPassword = (req, res) => res.render('start/forgetpass.ejs');

export const postForgetPassword = async (req, res) => {
    let email = req.body.email;
    if (!email) return res.render('start/forgetpass.ejs', { valid: "Please enter your email." });

    try {
        const [student, teacher, teacher_ver] = await Promise.all([
            UserModel.findStudentByEmail(email),
            UserModel.findTeacherByEmail(email),
            UserModel.findUnverifiedTeacherByEmail(email)
        ]);

        if (student || teacher || teacher_ver) {
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            req.session.verify = verificationCode;
            await sendVerificationEmail(email, verificationCode);
            req.session.email = email;
            res.render('start/forgetpass.ejs', { load: 1 });
        } else {
            res.render('start/forgetpass.ejs', { valid: "Email not found " });
        }
    } catch (error) {
        console.error("Error in forget-password:", error);
        return res.status(500).send("Internal Server Error");
    }
};

export const postVerForgetPassword = (req, res) => {
    const code = req.body.code;
    const email = req.session.email;
    let codev = req.session.verify;

    if (code === codev) {
        res.redirect(`/change-password?email=${email}&&load=${1}`);
    } else {
        res.render('start/forgetpass.ejs', { valid: "error in code verfiy", load: 1 });
    }
};
