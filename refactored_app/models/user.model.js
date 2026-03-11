import pool from '../config/database.js';

class UserModel {
    // Find users by email
    static async findStudentByEmail(email) {
        const res = await pool.query('SELECT * FROM student WHERE email = $1', [email]);
        return res.rows[0];
    }

    static async findTeacherByEmail(email) {
        const res = await pool.query('SELECT * FROM teacher WHERE email = $1', [email]);
        return res.rows[0];
    }

    static async findUnverifiedTeacherByEmail(email) {
        const res = await pool.query('SELECT * FROM teacher_ver WHERE email = $1', [email]);
        return res.rows[0];
    }

    // Create users
    static async createUnverifiedTeacher(fname, lname, email, hash, cv_doc, ver) {
        return pool.query(
            `INSERT INTO teacher_ver(fname, lname, email, password, cv_doc, ver) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
            [fname, lname, email, hash, cv_doc, ver]
        );
    }

    static async createTeacher(fname, lname, email, password, cv_doctor) {
        return pool.query(
            `INSERT INTO teacher(fname, lname, email, password, cv_doctor) 
       VALUES ($1, $2, $3, $4, $5)`,
            [fname, lname, email, password, cv_doctor]
        );
    }

    static async createStudent(fname, lname, email, hash, id_student) {
        return pool.query(
            `INSERT INTO student(fname, lname, email, password, id_student) 
       VALUES ($1, $2, $3, $4, $5)`,
            [fname, lname, email, hash, id_student]
        );
    }

    // Update operations
    static async deleteUnverifiedTeacher(email) {
        return pool.query('DELETE FROM teacher_ver WHERE email= $1', [email]);
    }

    static async updateStudentLastTry(email, time) {
        return pool.query('UPDATE student SET lasttry = $2 WHERE email = $1', [email, time]);
    }

    static async updatePassword(table, email, hashedPassword) {
        const validTables = ['student', 'teacher', 'teacher_ver'];
        if (!validTables.includes(table)) throw new Error("Invalid table name");

        return pool.query(`UPDATE ${table} SET password = $1 WHERE email = $2`, [hashedPassword, email]);
    }

    static async updateStudentStats(email, newAvgStr) {
        return pool.query(
            `UPDATE student 
       SET count_test = count_test + 1, 
           avgteststu = (avgteststu + $2) / (count_test + 1)
       WHERE email = $1`,
            [email, newAvgStr]
        );
    }
}

export default UserModel;
