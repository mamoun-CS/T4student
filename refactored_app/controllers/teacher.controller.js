import UserModel from "../models/user.model.js";
import QuizModel from "../models/quiz.model.js";

export const getProfileTec = async (req, res, next) => {
    const name = req.session.user.fname + " " + req.session.user.lname;
    const email = req.session.user.email;

    try {
        const r = await QuizModel.getTeacherQuizzes(req.session.user.fname, req.session.user.lname, email);
        const result = await QuizModel.getTotalQuizScores();

        res.render("teacher/profile-teacher.ejs", {
            NAME: name,
            EmailNAME: email,
            avg: result.total_score,
            count: r.length,
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

export const getCreateQuizTec = (req, res) => res.render("teacher/createquiz-tea.ejs");

export const postCreateQuizTec = (req, res) => {
    req.session.t = 0;
    req.session.major = req.body.major;
    req.session.course = req.body.course;
    req.session.numberq = 0;

    if (req.body.quizType == 'Midterm') req.session.mid_final = 'midterm';
    else req.session.mid_final = 'final';

    req.session.listdata = [{ Q: "", imgq: "", op1: "", op2: "", op3: "", op4: "", imgop1: "", imgop2: "", imgop3: "", imgop4: "", cop: 0, numstr: 0 }];
    res.redirect('/startCreatequiz');
};

export const getStartCreateQuiz = (req, res) => {
    res.render("teacher/add-writeQ.ejs", { numberQ: req.session.numberq, listdata: req.session.listdata });
};

export const postStartCreateQuiz = (req, res) => {
    let Qpre = req.session.qpre;
    const saveoredit = req.body.save;
    let { question, option1, option2, option3, option4, correctAnswer } = req.body;

    if (!option1) option1 = 'T4s';
    option1 = option1 === "T4s" ? null : option1;
    option2 = option2 === "T4s" ? null : option2;
    option3 = option3 === "T4s" ? null : option3;
    option4 = option4 === "T4s" ? null : option4;

    const fileInputmain = req.files?.image;
    let fileinput1 = req.files?.image1;
    let fileinput2 = req.files?.image2;
    let fileinput3 = req.files?.image3;
    let fileinput4 = req.files?.image4;

    if (saveoredit === 'save') {
        if (Qpre != question) {
            let urlimg, img1, img2, img3, img4;
            if (fileInputmain) urlimg = fileInputmain[0].path.slice(7);
            else urlimg = fileInputmain;

            if (fileinput1) img1 = fileinput1[0].path.slice(7); else img1 = fileinput1;
            if (fileinput2) img2 = fileinput2[0].path.slice(7); else img2 = fileinput2;
            if (fileinput3) img3 = fileinput3[0].path.slice(7); else img3 = fileinput3;
            if (fileinput4) img4 = fileinput4[0].path.slice(7); else img4 = fileinput4;

            req.session.listdata[req.session.numberq] = {
                Q: question, imgq: urlimg, op1: option1, imgop1: img1,
                op2: option2, imgop2: img2, op3: option3, imgop3: img3,
                op4: option4, imgop4: img4, cop: correctAnswer, numstr: req.session.numberq,
            };
            req.session.numberq++;
        }

        res.render("teacher/add-writeQ.ejs", {
            numberQ: req.session.numberq,
            listdata: req.session.listdata,
            pathimg: "img/images.svg",
        });

        Qpre = question;
        req.session.qpre = Qpre;
    } else if (saveoredit === 'submit') {
        // Just allow pass-through if submit. Handled in submitQ
    } else {
        let raound = req.body;
        let nu = raound.save.slice(12);
        let urlimg, img1, img2, img3, img4;

        if (fileInputmain) urlimg = fileInputmain[0].path.slice(7); else urlimg = fileInputmain;
        if (fileinput1) img1 = fileinput1[0].path.slice(7); else img1 = fileinput1;
        if (fileinput2) img2 = fileinput2[0].path.slice(7); else img2 = fileinput2;
        if (fileinput3) img3 = fileinput3[0].path.slice(7); else img3 = fileinput3;
        if (fileinput4) img4 = fileinput4[0].path.slice(7); else img4 = fileinput4;

        req.session.listdata[nu] = {
            Q: question, imgq: urlimg, op1: option1, imgop1: img1,
            op2: option2, imgop2: img2, op3: option3, imgop3: img3,
            op4: option4, imgop4: img4, cop: correctAnswer, numstr: req.session.numberq,
        };

        res.render("teacher/add-writeQ.ejs", {
            numberQ: req.session.numberq,
            listdata: req.session.listdata,
            pathimg: "img/images.svg",
        });
    }
};

export const getSubmitQ = (req, res) => res.render('teacher//submitQ.ejs');

export const postSubmitQ = async (req, res, next) => {
    let id_q = req.query.id_q;
    const listdata = req.session.listdata.map((row, index) => ({
        Q: row.qustion || row.Q, imgq: row.imagequstion || row.imgq,
        op1: row.choise1 || row.op1, op2: row.choise2 || row.op2,
        op3: row.choise3 || row.op3, op4: row.choise4 || row.op4,
        imgop1: row.imgeop1 || row.imgop1, imgop2: row.imgeop2 || row.imgop2,
        imgop3: row.imgeop3 || row.imgop3, imgop4: row.imgeop4 || row.imgop4,
        cop: row.true_c || row.cop, numstr: index + 1, yourc: 0
    }));
    const note = req.body.submit;
    let fname = req.session.user.fname;
    let lname = req.session.user.lname;
    const email = req.session.user.email;
    let sub = req.body.about;

    try {
        const idObj = await QuizModel.findQuizById(id_q);

        if (idObj) {
            if (note === 'submit') {
                await QuizModel.deleteQuestions(id_q);
                for (let i = 0; i < listdata.length; i++) {
                    await QuizModel.createQuestion(
                        id_q, listdata[i].cop, listdata[i].Q, listdata[i].imgq, listdata[i].imgop1, listdata[i].imgop2,
                        listdata[i].imgop3, listdata[i].imgop4, listdata[i].op1, listdata[i].op2, listdata[i].op3, listdata[i].op4
                    );
                }
                if (sub) await QuizModel.updateQuizAbout(sub, id_q);
                req.session.listdata = [];
                req.session.numberq = 0;
                res.redirect('/createquiz-tec');
            } else {
                res.redirect('/startCreatequiz');
            }
        } else {
            if (note === 'submit') {
                const result = await QuizModel.createQuiz(fname, lname, req.session.major, req.session.course, req.session.mid_final, sub, email);
                const new_id_q = result.id_q;

                for (let i = 0; i < listdata.length; i++) {
                    await QuizModel.createQuestion(
                        new_id_q, listdata[i].cop, listdata[i].Q, listdata[i].imgq, listdata[i].imgop1, listdata[i].imgop2,
                        listdata[i].imgop3, listdata[i].imgop4, listdata[i].op1, listdata[i].op2, listdata[i].op3, listdata[i].op4
                    );
                }

                req.session.listdata = [];
                req.session.numberq = 0;
                res.redirect('/createquiz-tec');
            } else {
                res.redirect('/startCreatequiz');
            }
        }
    } catch (error) {
        next(error);
    }
};

export const getEditQuizTec = async (req, res, next) => {
    const fname = req.session.user.fname;
    const lname = req.session.user.lname;
    const email = req.session.user.email;

    if (fname && lname) {
        try {
            const quizzes = await QuizModel.getTeacherQuizzes(fname, lname, email);
            res.render('teacher/editquiz-tea.ejs', { list: quizzes });
        } catch (err) {
            next(err);
        }
    }
};

export const postEditQuizTec = async (req, res, next) => {
    const id_q = req.body.id_q;
    try {
        const questions = await QuizModel.findQuestionsByQuizId(id_q);
        const quiz = await QuizModel.findQuizById(id_q);

        req.session.numberq = questions.length;
        req.session.listdata = questions;
        req.session.major = quiz.major;
        req.session.course = quiz.course;
        req.session.mid_final = quiz.mid_final;

        res.redirect(`/startCreatequiz?id_q=${quiz.id_q}`);
    } catch (err) {
        next(err);
    }
};

export const getAboutQuiz = async (req, res, next) => {
    const fname = req.session.user.fname;
    const lname = req.session.user.lname;
    const email = req.session.user.email;
    if (fname && lname) {
        try {
            const quizzes = await QuizModel.getTeacherQuizzes(fname, lname, email);
            res.render("teacher/about-quize.ejs", { list: quizzes });
        } catch (err) {
            next(err);
        }
    }
};

export const postAboutQuiz = async (req, res, next) => {
    const id_q = req.body.id_q;
    if (/^\d+$/.test(id_q)) {
        try {
            const studentQuestions = await QuizModel.getStudentQuizRecords(id_q);
            let list = [];
            for (let i = 0; i < studentQuestions.length; i++) {
                const student = await UserModel.findStudentByEmail(studentQuestions[i].email);
                if (student) {
                    list.push({
                        name: student.fname + " " + student.lname,
                        score: studentQuestions[i].score,
                        email: studentQuestions[i].id
                    });
                }
            }
            res.render("teacher/about-quize.ejs", { list2: list });
        } catch (err) {
            next(err);
        }
    } else {
        const id = id_q.slice(1,);
        res.redirect(`/show-what-do-stu?id=${id}`);
    }
};

export const getShowWhatDoStu = async (req, res, next) => {
    const id = req.query.id;
    try {
        const studentQuizMsg = await QuizModel.getStudentQuizRecordById(id);
        const id_q = studentQuizMsg.id_q;
        const questions = await QuizModel.findQuestionsByQuizId(id_q);

        const listdata = questions.map((row, index) => ({
            Q: row.qustion, imgq: row.imagequstion,
            op1: row.choise1, op2: row.choise2, op3: row.choise3, op4: row.choise4,
            imgop1: row.op1, imgop2: row.op2, imgop3: row.op3, imgop4: row.op4,
            cop: row.true_c, numstr: index + 1, yourc: 0
        }));

        const yourc = studentQuizMsg.stu_chose;
        for (let i = 0; i < listdata.length; i++) {
            let v = yourc.slice(i, i + 1);
            if (questions[i].true_c == v) {
                listdata[i].valid = 'correct answer';
            } else {
                listdata[i].valid = 'invalid answer';
                listdata[i].yourc = v;
            }
        }

        res.render("teacher/showtakestu.ejs", { listdata: listdata, id_q: id_q, show: 1 });
    } catch (err) {
        next(err);
    }
};
