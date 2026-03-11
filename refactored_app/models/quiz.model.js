import pool from '../config/database.js';

class QuizModel {
    // --- Quiz Management ---
    static async findQuizzesByParams(major, course, type) {
        const res = await pool.query(
            "SELECT * FROM quize WHERE major = $1 AND course = $2 AND mid_final = $3",
            [major, course, type]
        );
        return res.rows;
    }

    static async findQuizzesBySearch(fname, course, type) {
        let query = "SELECT * FROM quize WHERE mid_final=$1";
        let params = [type];

        if (fname && !course) {
            query += " AND fname=$2";
            params.push(fname);
        } else if (course && !fname) {
            query += " AND course=$2";
            params.push(course);
        } else if (fname && course) {
            query += " AND fname=$2 AND course=$3";
            params.push(fname, course);
        }

        const res = await pool.query(query, params);
        return res.rows;
    }

    static async findQuizById(id_q) {
        const res = await pool.query("SELECT * FROM quize WHERE id_q = $1", [id_q]);
        return res.rows[0];
    }

    static async incrementQuizTakes(id_q) {
        return pool.query("UPDATE quize SET num_take_stu = num_take_stu + 1 WHERE id_q = $1", [id_q]);
    }

    static async getTeacherQuizzes(fname, lname, email) {
        const res = await pool.query(
            "SELECT * FROM quize WHERE fname =$1 AND lname=$2 AND email =$3",
            [fname, lname, email]
        );
        return res.rows;
    }

    static async getTotalQuizScores() {
        const res = await pool.query("SELECT SUM(num_take_stu) AS total_score FROM quize");
        return res.rows[0];
    }

    static async createQuiz(fname, lname, major, course, mid_final, about_quiz, email) {
        const res = await pool.query(
            `INSERT INTO quize(fname, lname, major, course, mid_final, about_quiz, email) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_q`,
            [fname, lname, major, course, mid_final, about_quiz, email]
        );
        return res.rows[0];
    }

    static async updateQuizAbout(sub, id_q) {
        return pool.query("UPDATE quize SET about_quiz = $1 WHERE id_q = $2", [sub, id_q]);
    }

    // --- Question Management ---
    static async findQuestionsByQuizId(id_q) {
        const res = await pool.query("SELECT * FROM qustion WHERE id_q = $1", [id_q]);
        return res.rows;
    }

    static async deleteQuestions(id_q) {
        return pool.query("DELETE FROM qustion WHERE id_q = $1", [id_q]);
    }

    static async createQuestion(id_q, cop, Q, imgq, imgop1, imgop2, imgop3, imgop4, op1, op2, op3, op4) {
        return pool.query(
            `INSERT INTO qustion(id_q, true_c, qustion, imagequstion, imageop1, imageop2, imageop3, imageop4, choise1, choise2, choise3, choise4)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [id_q, cop, Q, imgq, imgop1, imgop2, imgop3, imgop4, op1, op2, op3, op4]
        );
    }

    // --- Student Submissions ---
    static async createStudentQuizRecord(email, id_q, score, stu_chose) {
        return pool.query(
            "INSERT INTO student_qustion(email, id_q, score, stu_chose) VALUES ($1, $2, $3, $4)",
            [email, id_q, score, stu_chose]
        );
    }

    static async getStudentQuizRecords(id_q) {
        const res = await pool.query("SELECT * FROM student_qustion WHERE id_q=$1", [id_q]);
        return res.rows;
    }

    static async getStudentQuizRecordById(id) {
        const res = await pool.query("SELECT * FROM student_qustion WHERE id=$1", [id]);
        return res.rows[0];
    }
}

export default QuizModel;
