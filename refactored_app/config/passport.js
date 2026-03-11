import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import pool from "./database.js";

// Passport initialization block
passport.use(
    new LocalStrategy(
        { usernameField: "email", passwordField: "password" },
        async (email, password, done) => {
            try {
                const [resultstu, resulttea, resulttea_ver] = await Promise.all([
                    pool.query("SELECT * FROM student WHERE email = $1", [email]),
                    pool.query("SELECT * FROM teacher WHERE email = $1", [email]),
                    pool.query("SELECT * FROM teacher_ver WHERE email = $1", [email])
                ]);

                let user = null;
                let state = '';

                if (resultstu.rows.length > 0) {
                    user = resultstu.rows[0];
                    state = 'S';
                } else if (resulttea.rows.length > 0) {
                    user = resulttea.rows[0];
                    state = 'T';
                } else if (resulttea_ver.rows.length > 0) {
                    user = resulttea_ver.rows[0];
                    state = 'ver';
                } else {
                    return done(null, false, { message: "Email not found" });
                }

                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (isPasswordValid) {
                    return done(null, user, { state });
                } else {
                    return done(null, false, { message: "Invalid password" });
                }
            } catch (err) {
                console.error("Error in passport strategy:", err);
                return done(err);
            }
        }
    )
);

passport.serializeUser((user, cb) => {
    cb(null, user.email); // Serialize email to session
});

passport.deserializeUser(async (email, cb) => {
    try {
        const [resultstu, resulttea, resulttea_ver] = await Promise.all([
            pool.query("SELECT * FROM student WHERE email = $1", [email]),
            pool.query("SELECT * FROM teacher WHERE email = $1", [email]),
            pool.query("SELECT * FROM teacher_ver WHERE email = $1", [email])
        ]);

        if (resultstu.rows.length > 0) return cb(null, resultstu.rows[0]);
        if (resulttea.rows.length > 0) return cb(null, resulttea.rows[0]);
        if (resulttea_ver.rows.length > 0) return cb(null, resulttea_ver.rows[0]);

        return cb(null, false);
    } catch (err) {
        return cb(err);
    }
});

export default passport;
