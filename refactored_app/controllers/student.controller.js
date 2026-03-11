import UserModel from "../models/user.model.js";
import QuizModel from "../models/quiz.model.js";

export const getProfileStu = async (req, res) => {
    const name = req.session.user.fname + " " + req.session.user.lname;
    const email = req.session.user.email;

    try {
        const r = await UserModel.findStudentByEmail(email);
        res.render("student/profile-stu.ejs", {
            NAME: name,
            EmailNAME: email,
            avg: Number(r.avgteststu).toFixed(1),
            count: r.count_test,
            id_student: r.id_student,
        });
    } catch (error) {
        console.error(error);
        res.redirect("/sing-in");
    }
};

export const postProfileStu = async (req, res) => {
    const name = req.session.user.fname + " " + req.session.user.lname;
    const email = req.session.user.email;

    try {
        const r = await UserModel.findStudentByEmail(email);
        res.render("student/profile-stu.ejs", {
            NAME: name,
            Emailname: email,
            avg: r.avgteststu,
            count: r.count_test,
            id_student: r.id_student,
        });
    } catch (error) {
        console.error(error);
        res.redirect("/sing-in");
    }
};

export const getPage1QuizStu = (req, res) => {
    res.render("student/page1quiz-std.ejs");
};

export const postPage1QuizStu = async (req, res, next) => {
    const majoru = req.body.major;
    const courseu = req.body.course;
    const type = req.body.quizType;

    if (majoru && courseu) {
        try {
            const quizzes = await QuizModel.findQuizzesByParams(majoru, courseu, type);
            if (quizzes.length > 0) {
                const randomIndex = Math.floor(Math.random() * quizzes.length);
                const e = quizzes[randomIndex];
                return res.redirect(`/take-quiz-stu?id_q=${e.id_q}&type=${e.mid_final}`);
            } else {
                return res.render("student/page1quiz-std.ejs", { valid: "can not found this quiz" });
            }
        } catch (err) {
            console.error("Error querying quizzes:", err);
            return next(err);
        }
    }
};

export const getTakeQuizStu = async (req, res, next) => {
    const id_q = req.query.id_q;
    const type = req.query.type;

    try {
        const questions = await QuizModel.findQuestionsByQuizId(id_q);
        const listdata = questions.map((row, index) => ({
            Q: row.qustion,
            imgq: row.imagequstion,
            op1: row.choise1,
            op2: row.choise2,
            op3: row.choise3,
            op4: row.choise4,
            imgop1: row.imageop1,
            imgop2: row.imageop2,
            imgop3: row.imageop3,
            imgop4: row.imageop4,
            cop: row.true_c,
            numstr: index + 1,
            yourc: 0
        }));

        let time;
        let type1 = type.trim();
        if (type1 == 'midterm') time = 30 * 60;
        else time = 90 * 60;

        res.render("student/take-quize-stu.ejs", {
            listdata: listdata,
            id_q: id_q,
            time: time,
        });
    } catch (error) {
        next(error);
    }
};

export const postTakeQuizStu = async (req, res, next) => {
    const submit = req.body.submit;

    try {
        const questions = await QuizModel.findQuestionsByQuizId(submit);
        await QuizModel.incrementQuizTakes(submit);

        let avg = 0;
        const listdata = questions.map((row, index) => ({
            Q: row.qustion, imgq: row.imagequstion, op1: row.choise1,
            op2: row.choise2, op3: row.choise3, op4: row.choise4,
            imgop1: row.imageop1, imgop2: row.imageop2, imgop3: row.imageop3,
            imgop4: row.imageop4, cop: row.true_c, numstr: index + 1, valid: 'data'
        }));

        for (let i = 0; i < questions.length; i++) {
            let r = `quizType${i}`;
            let v = req.body[r];
            if (questions[i].true_c == v) {
                avg++;
                listdata[i].valid = 'correct answer';
            } else {
                listdata[i].valid = 'invalid answer';
                listdata[i].yourc = v;
            }
        }

        avg = (avg / questions.length) * 100;
        const email = req.session.user.email;

        await UserModel.updateStudentStats(email, avg.toFixed(1));

        let chose = "";
        for (let i = 0; i < listdata.length; i++) {
            if (typeof listdata[i].yourc === "undefined") chose += '0';
            else chose += listdata[i].yourc;
        }

        await QuizModel.createStudentQuizRecord(email, submit, avg.toFixed(1), chose);

        req.session.listdata = listdata;
        req.session.avg = avg.toFixed(1);

        res.redirect(`/submitquize-stu?id_q=${submit}`);
    } catch (error) {
        next(error);
    }
};

export const getPage1SearchStu = (req, res) => res.render("student//page1Serach-stu.ejs");

export const postPage1SearchStu = async (req, res, next) => {
    const fname = req.body.fname;
    const course = req.body.course ? req.body.course.trim() : null;
    const type = req.body.quizType;

    try {
        const quizzes = await QuizModel.findQuizzesBySearch(fname, course, type);
        req.session.lis = quizzes;
        res.redirect(`/pagetablesearch`);
    } catch (error) {
        console.error("Error querying the database:", error);
        next(error);
    }
};

export const getPageTableSearch = (req, res) => {
    const listdata = req.session.lis;
    res.render("student/pagesearch.ejs", { list: listdata });
};

export const postPageTableSearch = async (req, res, next) => {
    const id_q = req.body.id_q;
    try {
        const quiz = await QuizModel.findQuizById(id_q);
        res.redirect(`/take-quiz-stu?id_q=${id_q}&type=${quiz.mid_final}`);
    } catch (error) {
        next(error);
    }
};

export const getSubmitQuizStu = (req, res) => {
    const avg = req.session.avg;
    const listdata = req.session.listdata;
    const id_q = req.query.id_q;
    req.session.id_q = id_q;

    res.render("student/submit-quiz.ejs", { avg: avg, listdata: listdata, id_q: id_q });
};

export const postSubmitQuizStu = (req, res) => {
    const listdata = JSON.parse(req.body.score);
    const id_q = req.query.id_q;

    res.render("student/take-quize-stu.ejs", {
        listdata: listdata,
        id_q: id_q,
        show: 1,
        avg: req.session.avg,
    });
};
