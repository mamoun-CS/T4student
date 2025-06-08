import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcryptjs";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import env from "dotenv";
import multer from "multer";
import path from "path";
import nodemailer from "nodemailer";
import { verify } from "crypto";

const saltRound = 3;
const app = express();
env.config();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/img/Q"); 
    },
    filename: (req, file, cb) => {
        console.log(file);
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});
const upload = multer({ storage:storage });

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS
    }
  });

// Send email function
const sendVerificationEmail = async (toEmail, verificationCode) => {
    try {
      const info = await transporter.sendMail({
        from: '"T4Student" ', 
        to: toEmail,
        subject: 'Email Verification', 
        text: `Your verification code is: ${verificationCode}`, 
      });
  
      console.log('Email sent: %s', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  };
  export default sendVerificationEmail;

let db;

if (process.env.DATABASE_URL) {
  db = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DB,
    password: process.env.PG_PD,
    port: process.env.PG_PORT,
  });
}
//db.connect();


  
app.use(
    session({
        verify:'0',
        id_q:'0',
        sec:'0',
        mid_final:'0',
        numberq :'0',
        user :"name , email",
        cuser :"fname,lname , email,id_student,hash,cv_doc",
        listdata:"",
        avg:'0',
        flag :'0',
        data_Ai:"Q , imgq ",
        lis:"",
        h: 0 ,
        data3:"",
        email:"",qpre:"",
secret: process.env.BOSS_CLICK,
resave: false , 
saveUninitialized: true,
 cookie: {  maxAge: 1000 * 60 * 60, },
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());


app.use(express.static("public")); 
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true })); 





app.get("/sing-in", (req, res) => {
    res.render("start/sing-in.ejs"); 
});
app.post("/sing-in", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            console.error("Error:", err);
            return next(err);
        }
        if (!user) {
            return res.render("start/sing-in.ejs", { valid: info.message });
        }
        req.login(user, (loginErr) => {
            if (loginErr) {
                console.error("Login Error:", loginErr);
                return next(loginErr);
            }
            if (info.state === "S") {
               
              req.session.user={fname: user.fname.trimEnd(),lname:user.lname.trimEnd(), email :user.email};
                return res.redirect(`/profile-stu`); // Redirect students
            } else if (info.state === "T") {
                
                req.session.user={fname: user.fname.trimEnd(),lname:user.lname.trimEnd(), email :user.email};
                return res.redirect(`/profile-tec`); // Redirect teachers
            }
            else if (info.state === "ver")
                {
                    let s = 'T'
                    req.session.user={fname: user.fname.trimEnd(),lname:user.lname.trimEnd(), email :user.email,state : s };
                    return res.redirect(`/verify`); 
                }
        });
    })(req, res, next);
});
app.post("/sing-out",async (req, res) => {
    const now = Date.now();
    const rtime = Math.ceil((3600000 - (now - req.session.now)) / 1000);
    if ( rtime >0 )
        {
    const stu = await db.query(
        "UPDATE student SET lasttry = $2 WHERE email = $1;",
        [req.session.user.email, req.session.now]
      );
    }
    else {
        const stu = await db.query(
            "UPDATE student SET lasttry = $2 WHERE email = $1;",
            [req.session.user.email, 0]
          );
    }
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
      }
     
      console.log(req.session);
     res.redirect('/sing-in');
    });
  });
app.get("/change-password", (req,res)=>{
    //console.log(req.session.user.email);
    const email = req.query.email;
    const load = req.query.load ||0;
    console.log(email);
    res.render('start/changeps.ejs', { email ,load:load});

});
app.post("/change-password", async(req,res)=> {
     try {
    const [passwordpre, passwordnew, passwordnew2 ]= req.body.password;
    console.log(req.body.password);  
    console.log(passwordpre, passwordnew, passwordnew2  );
    const email = req.session?.user?.email || req.query.email; // Get email from session or query
    console.log(email);
    if (!email || !passwordpre || !passwordnew || !passwordnew2) {
        return res.render("start/changeps.ejs", { valid: "All fields are required." ,email:email });
    }

    if (passwordnew !== passwordnew2) {
        return res.render("start/changeps.ejs", { valid: "Passwords do not match. Please try again." ,email:email });
    }

    // Fetch user data
    const [student, teacher, teacher_ver] = await Promise.all([
        db.query("SELECT * FROM student WHERE email = $1", [email]),
        db.query("SELECT * FROM teacher WHERE email = $1", [email]),
        db.query("SELECT * FROM teacher_ver WHERE email = $1", [email])
    ]);

    let user = null;
    let userType = '';

    if (student.rows.length > 0) {
        user = student.rows[0];
        userType = 'student';
    } else if (teacher.rows.length > 0) {
        user = teacher.rows[0];
        userType = 'teacher';
    } else if (teacher_ver.rows.length > 0) {
        user = teacher_ver.rows[0];
        userType = 'teacher_ver';
    } else {
        return res.render("start/changeps.ejs", { valid: "Invalid email. User not found." ,email:email });
    }
    
    // Compare old password 
    const isMatch = await bcrypt.compare(passwordpre, user.password);
    if (!isMatch) {
        return res.render("start/changeps.ejs", { valid: "Incorrect current password. Please try again." ,email:email });
    }

    // Hash new password
    const newHashedPassword = await bcrypt.hash(passwordnew, saltRound);

    // Update password in the correct table
    if (userType === 'student') {
        await db.query("UPDATE student SET password = $1 WHERE email = $2", [newHashedPassword, email]);
    } else if (userType === 'teacher') {
        await db.query("UPDATE teacher SET password = $1 WHERE email = $2", [newHashedPassword, email]);
    } else if (userType === 'teacher_ver') {
        await db.query("UPDATE teacher_ver SET password = $1 WHERE email = $2", [newHashedPassword, email]);
    }

    res.redirect('/sing-in'); 
} catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Internal server error" });
}
});

app.post("/change-passwordr", async(req,res)=>{
    const [passwordnew, passwordnew2 ]= req.body.password;
    const email = req.session.email ; 
    let user ='';let userType ='';
    console.log(passwordnew, passwordnew2)
    if (passwordnew !== passwordnew2) {
        return res.render("start/changeps.ejs", { valid: "Passwords do not match. Please try again." ,email:email ,load:1});
    }
    try{
        const [student, teacher, teacher_ver] = await Promise.all([
            db.query("SELECT * FROM student WHERE email = $1", [email]),
            db.query("SELECT * FROM teacher WHERE email = $1", [email]),
            db.query("SELECT * FROM teacher_ver WHERE email = $1", [email])
        ]);

        if (student.rows.length > 0) {
            user = student.rows[0];
            userType = 'student';
        } else if (teacher.rows.length > 0) {
            user = teacher.rows[0];
            userType = 'teacher';
        } else if (teacher_ver.rows.length > 0) {
            user = teacher_ver.rows[0];
            userType = 'teacher_ver';
        } else {
            return res.render("start/changeps.ejs", { valid: "Invalid email. User not found." ,email:email,load:1 });
        }
        const newHashedPassword = await bcrypt.hash(passwordnew, saltRound);
        if (userType === 'student') {
            await db.query("UPDATE student SET password = $1 WHERE email = $2", [newHashedPassword, email]);
        } else if (userType === 'teacher') {
            await db.query("UPDATE teacher SET password = $1 WHERE email = $2", [newHashedPassword, email]);
        } else if (userType === 'teacher_ver') {
            await db.query("UPDATE teacher_ver SET password = $1 WHERE email = $2", [newHashedPassword, email]);
        }
       
        res.redirect('/sing-in'); 
    }catch{
      console.error("Error changing password:", error);
    res.status(500).json({ error: "Internal server error" });
    }

});

app.get('/forget-password',(req,res)=>{
    res.render('start/forgetpass.ejs');
})

app.post('/forget-password' , async (req,res) => { 
     let email = req.body.email; 

     if (!email) {
        return res.render('start/forgetpass.ejs', { valid: "Please enter your email." });
    }
try{      
     const [student, teacher, teacher_ver] = await Promise.all([
        db.query("SELECT * FROM student WHERE email = $1", [email]),
        db.query("SELECT * FROM teacher WHERE email = $1", [email]),
        db.query("SELECT * FROM teacher_ver WHERE email = $1", [email])
    ]); 
    if( student.rows.length > 0 || teacher.rows.length  > 0  || teacher_ver.rows.length > 0)
        {
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            req.session.verify = verificationCode;
          const emailSent = await sendVerificationEmail(email, verificationCode);
          req.session.email= email;
          res.render('start/forgetpass.ejs',{load: 1});
        }
    else {
        res.render('start/forgetpass.ejs',{ valid : "Email not found "});
    }
} catch (error) {
    console.error("Error in forget-password:", error);
    return res.status(500).send("Internal Server Error");
}

});

app.post('/verforget-password' , (req,res)=>{
    const code = req.body.code;
    const email = req.session.email;
    let codev = req.session.verify;
    if (code === codev)
    {
   res.redirect(`/change-password?email=${email}&&load=${1}`);
    }
    else{
        res.render('start/forgetpass.ejs',{valid:"error in code verfiy",load :1 });
    }

});

app.get("/sing-up", (req, res) => {
    res.render("start/sing-up.ejs"); 
});

app.post("/sing-up",async (req, res) => {
    const {fname ,lname,email,user,password,cpassword } = req.body;
    let id_student;
    let state; 
    let cv_doc;
    
    if (user == "student")
    {
     id_student = req.body.id_student;
    console.log(id_student);
    state = 'S';
    }
    else if (user == "teacher")
    {
       cv_doc = req.body.cv_doc; 
        console.log(cv_doc);
        state = 'T';
    }


     if(password != cpassword)
     {
        res.render("start/sing-up.ejs", { 
        validpas: "Invalid password Please try again." 
    });
     }
     else
     {
         bcrypt.hash(password , saltRound , async (err,hash) =>
        { 
            if(err)
                { console.log("error in password \n ");}
           else
           {
            const [checkresultstu, checkresulttea, checkresulttea_ver] = await Promise.all([
                db.query("SELECT * FROM student WHERE email = $1", [email]),
                db.query("SELECT * FROM teacher WHERE email = $1", [email]),
                db.query("SELECT * FROM teacher_ver WHERE email = $1", [email])
            ]);

             if ( checkresultstu.rows.length > 0   || checkresulttea.rows.length > 0 || checkresulttea_ver.rows.length > 0 )
                {
                    res.render("start/sing-up.ejs", { 
                        validpas: "invaled Email please change Email." 
                    });
                }
          else{
           
            if (state === 'T')
                {
                    const ver = Math.floor(100000 + Math.random() * 900000).toString();
              
                    const checkresulttea = await db.query("SELECT * FROM teacher WHERE email = $1",[email],); 
                    const checkresulttea_ver = await db.query("SELECT * FROM teacher_ver WHERE email = $1",[email],); 


                   const result = await db.query(
                    "INSERT INTO teacher_ver(fname, lname, email,  password,cv_doc,ver) VALUES ($1, $2, $3, $4,$5,$6)",
                    [fname, lname, email, hash,cv_doc,ver]
                 );
                 const verificationCode = cv_doc +"/n email =" +email + "/n verify code : "+ver ;
                 const emailSent = await sendVerificationEmail(process.env.EMAIL_USER, verificationCode);
                 console.log(emailSent);
                res.redirect("/sing-in");
            }
            else { 
                const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
                req.session.verify = verificationCode;
                const emailSent = await sendVerificationEmail(email, verificationCode);
                console.log(emailSent);
           req.session.cuser = {
            fname: fname,
            lname: lname,
            email: email,
            id_student: id_student,
            hash: hash,
          }; 
          res.redirect(`/verify`);
         }
         
        }

        }
        });
    
     
     }
});
app.get("/verify",(req,res)=>
    {
        const  valid  = req.query.valid ;
        res.render("start/verify-code.ejs", {
          valid,
        });
    });
 app.post("/verify",async(req,res)=>
    {
        
        console.log(r,req.query.load);
       const state = req.session.user.state ||0 ; 
       const email = req.session.user.email ||0 ; 
       console.log(state , email );
       const code = req.body.code; 
        if (state === 'T'){
            const result_ver = await db.query("SELECT * FROM teacher_ver WHERE email = $1",[email]);
            console.log(code);
            const codeStr = String(code);
            const rr = String(result_ver.rows[0].ver);
            if (rr === codeStr ){
            const result = await db.query(
                "INSERT INTO teacher(fname, lname, email, password, cv_doctor) VALUES ($1, $2, $3, $4, $5)",
                [result_ver.rows[0].fname, result_ver.rows[0].lname, result_ver.rows[0].email, result_ver.rows[0].password, result_ver.rows[0].cv_doc]
              );
              const result_delete_ver = await db.query("DELETE FROM teacher_ver WHERE email= $1",[email]);
            
              req.session.user.fname= result_ver.rows[0].fname;
              req.session.user.lname= result_ver.rows[0].lname;
              req.session.user.email= result_ver.rows[0].email;
              res.redirect("profile-tec");
            }
            else {
                let s = state ; 
                let email = result_ver.rows[0].email; 
                return res.redirect(`/verify?email=${email}&state=${s}&valid=code+is+not+correct+please+try+again`);
             }
            }
             else {
    
        const {fname , lname , email , hash , id_student} = req.session.cuser||0;
        let codev = req.session.verify;
        if (code === codev)
        {
            console.log('correct code verify');
            try {
                const result = await db.query(
                  "INSERT INTO student(fname, lname, email, password, id_student) VALUES ($1, $2, $3, $4, $5)",
                  [fname, lname, email, hash, id_student]
                );
                res.redirect("/sing-in");
            }catch (error) {
                console.error("Database Error:", error);
                res.redirect("/sing-in",{
                    valid:"There was an error with the database. Please try again."
                });
               
              }
        }
        else {
            res.redirect(`/verify?fname=${fname}&lname=${lname}&email=${email}&hash=${hash}&id_student=${id_student}&valid=code+is+not+correct+please+try+again`);
        }
    }
    });   

app.get("/", (req, res) => {
    res.render("start/home.ejs"); 
});



// student url 
app.get("/profile-stu" , async (req ,res) => 
    {
        console.log("enter get profile student ");
        if ( req.isAuthenticated())
            {
                const name =  req.session.user.fname+" "+req.session.user.lname;
                const email = req.session.user.email;
            console.log(name); 
            console.log(email);
         const r = await db.query("SELECT * FROM student WHERE email =$1",[email]);
                console.log(r.rows[0]);
            res.render("student/profile-stu.ejs" ,
    {
        NAME : name,
        EmailNAME: email,
        avg : r.rows[0].avgteststu.toFixed(1),
        count : r.rows[0].count_test,
        id_student : r.rows[0].id_student,
    });
            }
        else 
        {res.redirect("/sing-in");}
     
    });

app.post("/profile-stu", async(req,res)=>{
    console.log("Entered POST /profilestudent");
    const name =  req.session.user.name;
    const email = req.session.user.email;
    
    const r = await db.query("SELECT * FROM student WHERE email =$1",[email]);
  console.log(name +"\n"); 
  console.log(email);
   res.render("student/profile-stu.ejs" ,
    {
        NAME : name,
        Emailname: email,
        avg : r.rows[0].avgteststu,
        count : r.rows[0].count_test,
        id_student : r.rows[0].id_student,
    });

});

app.get("/page1quiz-stu" , (req ,res)=>
{
    if (req.isAuthenticated()) {
      
            res.render("student/page1quiz-std.ejs");
    } else {
        res.redirect("/sing-in");
    }
});

app.post("/page1quiz-stu" ,async (req,res)=>
    {
    const majoru = req.body.major;
    const courseu = req.body.course;
    const type = req.body.quizType;
  //  
    if(majoru&& courseu) {
        try {
            const resultstu = await db.query(
                "SELECT * FROM quize WHERE major = $1 AND course = $2 AND mid_final = $3;",
                [majoru,courseu,type]
            );
            if(resultstu.rowCount > 0){
             console.log(resultstu.rowCount);
             let r = resultstu.rows;
             const randomIndex = Math.floor(Math.random() * r.length);
             const e = r[randomIndex];
              console.log(e);         
           // console.log("Updated listdata:", listdata);
               res.redirect(`/take-quiz-stu?id_q=${e.id_q}&type=${e.mid_final}`);
            }
            else {
                res.render("student/page1quiz-std.ejs",{valid:"can not found this quiz"});
            }
           // console.log(r);
        } catch (err) {
            console.error("Error in strategy:", err);
            return cd(err);
        }
        return;
    }



   });
    
app.get("/take-quiz-stu" , async (req,res)=>{
        if (req.isAuthenticated()) {
      
            
    
        console.log('enter take quiz\n');
        const id_q = req.query.id_q;
        const type = req.query.type;
        console.log(id_q);
        const quize = await db.query(
            "SELECT * FROM qustion WHERE id_q = $1;",
          [id_q]
        );

         console.log("Database rows:", quize.rows);

// Populate listdata dynamically
const listdata = quize.rows.map((row, index) => ({
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
numstr: index + 1, // Assign a sequence number starting from 1
yourc : 0
           }));
           let time ;
          let type1 = type.trim();
           if (type1 == 'midterm'){
            time = 30*60 ; 
           }
           else {time = 90 * 60 ;}
        res.render("student/take-quize-stu.ejs", { 
            listdata:listdata,
            id_q : id_q,
            time : time ,
          }); 
        } else {
            res.redirect("/sing-in");
        }
    });
//------------------------------------------
app.post("/take-quiz-stu",async (req,res)=> { 
    console.log('enter post take quiz stu \n');
   let r = `quizType${0}`;
   const submit = req.body.submit; 
   
   const quize = await db.query(
    "SELECT * FROM qustion WHERE id_q = $1;",
  [submit]
    );
    let time =0 ; 
    if(time == 0 ){const q = await db.query(
        "UPDATE quize SET num_take_stu = num_take_stu + 1 WHERE id_q = $1",
        [submit]
    );time++;}
      let avg =0 ; 
const listdata = quize.rows.map((row, index) => ({ 
     Q: row.qustion,imgq: row.imagequstion,op1: row.choise1,    
         op2: row.choise2,        op3: row.choise3,      
           op4: row.choise4,        imgop1: row.imageop1,    
               imgop2: row.imageop2,        imgop3: row.imageop3,  
                     imgop4: row.imageop4,   
                          cop: row.true_c,
        numstr: index + 1, valid:'data'
                   }));
   for(let i =0 ; i<quize.rowCount; i++ )
   {
     r = `quizType${i}`; 
    let v = req.body[r];
    console.log(`Key: ${r}, Value: ${v}`);
   

    if(quize.rows[i].true_c == v )
        {avg++ ;
            let valid = 'correct answer';
            listdata[i].valid = valid;
           
         }
   else {
       let valid1 = 'invalid answer';
      listdata[i].valid = valid1 ; 
      listdata[i].yourc = v ;
   }
   }
  
        avg = (avg / quize.rowCount)*100 ;
        const email = req.session.user.email;
        console.log(avg , email );
        const count = await db.query(
            `UPDATE student 
             SET count_test = count_test + 1, 
                 avgteststu = (avgteststu + $2) / (count_test + 1)
             WHERE email = $1`, 
            [email, avg.toFixed(1)]
        );
        let chose = ""; 
        for (let i = 0; i < listdata.length; i++) {
            if (typeof listdata[i].yourc === "undefined") {
                chose = chose + '0';
            } else {
                chose = chose + listdata[i].yourc;
            }
        }
        console.log("this is new line");
        console.log(chose,submit);
        const add = await db.query(
            "INSERT INTO student_qustion(email , id_q ,score ,stu_chose) VALUES ($1,$2,$3,$4)",
            [email , submit ,avg.toFixed(1) ,chose]
        );

        console.log("Rows updated:", count.rowCount);
        
       // console.log("data AI :",JSON.parse(req.body.data_Ai));
             req.session.listdata = listdata;
             req.session.avg= avg.toFixed(1);
           //  req.session.data_Ai = JSON.parse(req.body.data_Ai); 
        console.log('ok');
        res.redirect(`/submitquize-stu?id_q=${submit }`);

     
   });
//-----------------------------------------------------------




app.get("/page1Serach-stu" , (req ,res)=>
    {if ( req.isAuthenticated())
        {
         res.render("student//page1Serach-stu.ejs");
        }
        else  {res.redirect("/sing-in");}
       
    });
app.post("/page1Serach-stu" , async(req,res)=>{
    console.log('enter to post page 1 search ');
 const fname = req.body.fname; 
 const course = req.body.course ? req.body.course.trim() : null;
 const type = req.body.quizType;
 console.log(fname , course ,type);
 let quize;

 try {
if (!course){
    quize = await db.query(
        "SELECT * FROM quize WHERE fname = $1 AND mid_final=$2;",
      [fname  , type ]
        );
}
else if (!fname){
    quize = await db.query(
    "SELECT * FROM quize WHERE course=$1 AND mid_final=$2;",
  [ course , type ]
    );}
else{
  quize = await db.query(
    "SELECT * FROM quize WHERE fname = $1 AND course=$2 AND mid_final=$3;",
  [fname , course , type ]
    );
}
    req.session.lis = quize.rows;
    res.redirect(`/pagetableSearch`);
   } catch (error) {
        console.error("Error querying the database:", error);
        res.status(500).send("Internal Server Error");
    }

   });
app.get('/pagetablesearch',(req,res)=>{
    if (req.isAuthenticated())
        {    
    const listdata = req.session.lis;
    console.log(listdata);
    res.render("student/pagesearch.ejs",{
        list : listdata,
    });}else{res.redirect("/sing-in");}
//send id_q and type 
 });
app.post('/pagetablesearch',async(req,res)=>{
console.log('enter for post search table ');
console.log(req.body);
const id_q = req.body.id_q;
console.log(id_q);
const quize = await db.query(
    "SELECT * FROM quize WHERE id_q=$1;",
  [id_q]
    );
    console.log(quize.rows[0].mid_final);
    res.redirect(`/take-quiz-stu?id_q=${id_q}&type=${quize.rows[0].mid_final}`);
});

app.get("/submitquize-stu",async(req,res)=>{
    console.log("enter get submit quiz stu");
    if (req.isAuthenticated())
        {    
      
        const avg = req.session.avg;
        const listdata = req.session.listdata;
        const id_q = req.query.id_q;
        req.session.id_q = id_q ; 
        console.log("List Data:", avg,listdata);
       
        res.render("student/submit-quiz.ejs", {
            avg: avg,
            listdata: listdata, // Pass as-is for rendering
            id_q: id_q,
        });
   
}else {res.redirect("/sing-in");}
});

app.post("/submitquize-stu", async(req, res) => {
    console.log("Incoming data:", req.query);
        const listdata = JSON.parse(req.body.score); // Parse the JSON string
        const id_q = req.query.id_q; // Access the value
        
        console.log("List Data:", listdata);
        console.log("avg:", id_q, req.session.avg );

        res.render("student/take-quize-stu.ejs", { 
            listdata: listdata,
            id_q: id_q,
            show :1 ,
            avg :req.session.avg,
        });
    
});

app.get('/AI-Assist', async(req,res)=>{
    console.log("enter AI-Assist");
     if (req.isAuthenticated())
        {  
            const now = Date.now();

       const timeResult = await db.query(
        "SELECT * FROM student WHERE email = $1;",
      [req.session.user.email]
        );  
        const time = timeResult.rows[0];
        let h = req.session.h||0;
        const r1time = Math.ceil((3600000 - (now -time.lasttry)) / 1000);
        if (time.lasttry != 0 && r1time >= 0  )
             {
                req.session.now = time.lasttry;
                h=1 ; req.session.sec= 0;
            }
        else { 
            req.session.now =now ;
        }
       console.log( "this is all time ",now , req.session.now );
       const rtime = Math.ceil((3600000 - (now - req.session.now)) / 1000);
        
            console.log(rtime);

        const avg = req.session.avg || 0 ;
        const list = req.session.listdata; 
        const id_q = req.session.id_q;
        let data_Ai = [];
        for (let i =0 ; i< list.length ; i++)
         {
        if (list[i].valid == 'invalid answer')
            {
           data_Ai.push(list[i]);
            }
        }
        req.session.data_Ai = data_Ai;
        console.log("this is data for ai assist",data_Ai);
        console.log(avg , "    " , id_q , "wait for data" ,h);
        if ( h == 0 ){ 
            req.session.h =1;
            req.session.sec = id_q;
        res.render("student/AI-assist.ejs", {
            avg: avg,
            data_Ai: data_Ai,
            id_q: id_q,
            sec:id_q, 
            time:0,
        });
    }
    else {
        let sec = req.session.sec;
        console.log(sec, id_q );
        res.render("student/AI-assist.ejs", {
            avg: avg,
            data_Ai: data_Ai,
            id_q: id_q,
            wait : h , 
            sec:sec,
            time :rtime,
        });
     
    }
    }
    else
    {res.redirect("/sing-in");}
});

async function generateContentWithGoogleAI(prompt) {
    const apiKey = process.env.GOOGLE_AI1;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const requestBody = {
        contents: [
            {
                parts: [
                    { text: `what topic for ${prompt} in three world at most & give me qustion on same topic you have 1000 token at most` }
                ]
            }
        ]
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            console.error('Google AI API Error Response:', errorResponse);
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error calling Google AI API:', error.message);
        throw error;
    }
}

async function generateContentWithGoogleAI2(prompt) {
    const apiKey =process.env.GOOGLE_AI2; 
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
    const requestBody = {
        contents: [
            {
                parts: [
                    { text: `what topic for ${prompt} in three world at most && give me qustion on same topic  you have 1000 token at most` }
                ]
            }
        ]
    };
  
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });
  
        if (!response.ok) {
            const errorResponse = await response.json();
            console.error('Google AI API Error Response:', errorResponse);
            throw new Error(`API request failed with status ${response.status}`);
        }
  
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error calling Google AI API:', error.message);
        throw error;
    }
  }
  
  async function generateContentWithGoogleAI3(prompt) {
    const apiKey = process.env.GOOGLE_AI3; 
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
    const requestBody = {
        contents: [
            {
                parts: [
                    { text: `what topic for ${prompt} in three world at most && give me qustion on same topic  you have 1000 token at most` }
                ]
            }
        ]
    };
  
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });
  
        if (!response.ok) {
            const errorResponse = await response.json();
            console.error('Google AI API Error Response:', errorResponse);
            throw new Error(`API request failed with status ${response.status}`);
        }
  
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error calling Google AI API:', error.message);
        throw error;
    }
  }
  

app.post('/AI-Assist', async (req, res) => {
    
    const userMessage = req.body.r;
    req.session.h =1 ; 
    let flag = req.session.flag ||0;
    if (!userMessage) {
        return res.status(400).json({ error: 'Message is required' });
    }
    console.log('Current flag (before):', flag);
    // Define a mapping of flag values to corresponding functions
    const flagActions = {
        0: generateContentWithGoogleAI,
        1: generateContentWithGoogleAI2,
        2: generateContentWithGoogleAI3,
    };
    const generateContent = flagActions[flag];
    try {

        if (!generateContent) {
            throw new Error('Invalid flag value');
        }
    
        

        flag = (flag + 1) % 3;
        req.session.flag = flag;
        console.log('Updated flag (after):', flag);
        

        const assistantResponse = await generateContent(userMessage);
        
        const responseText = await assistantResponse.candidates[0].content.parts[0].text;
       console.log('Response generated successfully:', responseText);
        res.json({ response: await responseText });
    } catch (error) {
        console.error('Error occurred:', error.message);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }

});
app.post('/data3', async(req, res) => {
    const { action, data } = req.body;
   const now = Date.now();
    if (action === 'save') {
       
        req.session.now = now;
      req.session.data3 = data;
      res.json({ message: `Data3 saved successfully ${now}` });
    } else if (action === 'load') {
      
      if (req.session.data3) {
      res.json({ data: req.session.data3 });

      } else {
        res.status(404).json({ message: 'No data3 found in session' });
      }
    } else {
      res.status(400).json({ message: 'Invalid action' });
    }
    
  });

app.get("/profile-tec" , async(req ,res) => 
    { console.log("enter get profile teacher");
        if ( req.isAuthenticated())
        {
         const name =  req.session.user.fname + " " +req.session.user.lname ;
         const email = req.session.user.email;
        console.log(name +"\n"); 
        console.log(email);
        const r = await db.query("SELECT * FROM quize WHERE fname =$1 AND lname=$2 AND email =$3;",[req.session.user.fname , req.session.user.lname,email]);
        const result = await db.query("SELECT SUM(num_take_stu) AS total_score FROM quize");
        console.log(r.rows[0]);
        res.render("teacher/profile-teacher.ejs" ,
          {
        NAME : name,
        EmailNAME: email,
        avg : result.rows[0].total_score,
        count : r.rowCount,
          });
        }
     else 
    {res.redirect("/sing-in");}
    });


app.get("/createquiz-tec" , (req ,res)=>
{ if ( req.isAuthenticated())
        {
   res.render("teacher/createquiz-tea.ejs")
        }
        else  {res.redirect("/sing-in");}
});
app.post("/createquiz-tec",(req,res)=>{
    req.session.t = 0 ;
   req.session.major = req.body.major; 
   req.session.course = req.body.course; 
   req.session.numberq = 0 ;
   console.log('enter create quiz post \n'); 
   console.log(req.body);
   if (req.body.quizType == 'Midterm')
    {req.session.mid_final = 'midterm';}
   else {req.session.mid_final = 'final';} 
   req.session.listdata =  [
    {
        Q: "",
        imgq: "",
        op1: "",
        op2: "",
        op3: "",
        op4: "",
        imgop1:"",
        imgop2:"",
        imgop3:"",
        imgop4:"",
        cop: 0,
        numstr: 0
    }
];
   res.redirect('/startCreatequiz');
});

app.get("/startCreatequiz", (req ,res)=> 
{ if (req.isAuthenticated())
    { 
      
        res.render("teacher/add-writeQ.ejs",{numberQ:req.session.numberq, listdata:req.session.listdata})
        console.log(req.session.numberq) ;
        
    }
    else{ res.redirect("/sing-in");}
});

app.post("/startCreatequiz",upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 },
     ]), (req, res) => {
      let Qpre = req.session.qpre ;  
    console.log("Enter POST /startCreatequiz"); 
    const saveoredit = req.body.save; 
    let { question, option1, option2, option3, option4, correctAnswer } = req.body;  
    console.log('pre data ',option1);
    if (!option1){
        option1 = 'T4s'; console.log('this is no datas wfwugvui');}


    option1 = option1 === "T4s" ? null : option1;
    option2 = option2 === "T4s" ? null : option2;
    option3 = option3 === "T4s" ? null : option3;
    option4 = option4 === "T4s" ? null : option4;
    //imageurl= req.file.filename;
   const fileInputmain = req.files.image;
   //const fileinput = req.files;
   let fileinput1 =req.files.image1 ;
   let fileinput2 =req.files.image2  ;
   let fileinput3 =req.files.image3 ;
   let fileinput4=req.files.image4  ;
 //  console.log( fileinput);
   console.log(fileinput1+'\n'+fileinput2+'\n'+fileinput3+'\n'+fileinput4+'\n');
   // console.log(fileInputmain);
   
    console.log(req.body);
    console.log('\n saveoredit -_- => '+req.body.save+'\n');
    if(saveoredit === 'save')
        {
            console.log ("qpre =>" + Qpre , "numberq => " + req.session.numberq , (Qpre != question && req.session.numberq) )
 // after made any oparetion on this data   
     if ( Qpre != question )
    {
        let urlimg,img1,img2,img3,img4;
        if (fileInputmain)
            {
                console.log("err => "+ fileInputmain[0].path);
                urlimg = fileInputmain[0].path.slice(7);     
            }
        else{
            urlimg = fileInputmain;
        }
        if (fileinput1){img1 = fileinput1[0].path.slice(7);}
        else {img1=fileinput1;}
        if (fileinput2){img2 = fileinput2[0].path.slice(7);}
        else {img2=fileinput2;}
        if (fileinput3){img3 = fileinput3[0].path.slice(7);}
        else {img3=fileinput3;}
        if (fileinput4){img4 = fileinput4[0].path.slice(7);}
        else {img4=fileinput4;}
        console.log(`${img1}\n${img2}\n${img3}\n${img4}\n`);

        console.log("1",req.session.numberq);
        req.session.listdata[req.session.numberq] = {
            Q: question,
             imgq : urlimg,
            op1: option1,
            imgop1:img1,
            op2: option2,
            imgop2:img2,
            op3: option3,
            imgop3:img3,
            op4: option4,
            imgop4:img4,
            cop: correctAnswer,
            numstr:req.session.numberq ,
        }; 

    console.log("2");
    req.session.numberq++;                
    }
    console.log("3");
    
    res.render("teacher/add-writeQ.ejs", 
        {
              numberQ:req.session.numberq,
              listdata:req.session.listdata,
              pathimg:"img/images.svg",
        });

        console.log("4");
        console.log(req.session.numberq) ;  
        Qpre = question;
        req.session.qpre = Qpre;
        console.log("-_- " + Qpre);
        }
    else if(saveoredit === 'submit')
        {
            console.log("you can write database -_-\n");
        }
   else {
    console.log("5");
          let raound = req.body;
          let nu = raound.save.slice(12);
          console.log(fileInputmain +" "+saveoredit, Qpre);
            let urlimg,img1,img2,img3,img4;
        if (fileInputmain)  {  console.log("err => "+ fileInputmain[0].path);
                urlimg = fileInputmain[0].path.slice(7);      }
        else{   urlimg = fileInputmain;}
        if (fileinput1){img1 = fileinput1[0].path.slice(7);}
        else {img1=fileinput1;}
        if (fileinput2){img2 = fileinput2[0].path.slice(7);}
        else {img2=fileinput2;}
        if (fileinput3){img3 = fileinput3[0].path.slice(7);}
        else {img3=fileinput3;}
        if (fileinput4){img4 = fileinput4[0].path.slice(7);}
        else {img4=fileinput4;}
        console.log(`${img1}\n${img2}\n${img3}\n${img4}\n`);

        console.log("6");
       req.session.listdata[nu] = {
            Q: question,
             imgq : urlimg,
            op1: option1,
            imgop1:img1,
            op2: option2,
            imgop2:img2,
            op3: option3,
            imgop3:img3,
            op4: option4,
            imgop4:img4,
            cop: correctAnswer,
            numstr:req.session.numberq ,
        }; 
     
    console.log("7");
    
        res.render("teacher/add-writeQ.ejs", 
        {
              numberQ:req.session.numberq,
              listdata:req.session.listdata,
              pathimg:"img/images.svg",
        });

       
         

   }
  

        //fileInputmain = null ; 
});

app.get('/submitQ', (req,res)=>{
if (req.isAuthenticated())
    {    
        res.render('teacher//submitQ.ejs')
        console.log(req.session.numberq) ;  
    }
    else{ res.redirect("/sing-in");}


});
app.post('/submitQ',async (req, res) => {
    console.log('Enter POST /submitQ');
    console.log('Request body:', req.body);
   let id_q = req.query.id_q;
    const listdata = req.session.listdata.map((row, index) => ({
        Q: row.qustion|| row.Q,
        imgq: row.imagequstion || row.imgq,
        op1: row.choise1 || row.op1,
        op2: row.choise2 || row.op2,
        op3: row.choise3 || row.op3,
        op4: row.choise4 || row.op4,
        imgop1: row.imgeop1 || row.imgop1,
        imgop2: row.imgeop2 || row.imgop2,
        imgop3: row.imgeop3 || row.imgop3,
        imgop4: row.imgeop4 || row.imgop4,
        cop: row.true_c || row.cop,
        numstr: index + 1, // Assign a sequence number starting from 1
        yourc : 0
              }));
    const note = req.body.submit;
      let fname = req.session.user.fname;
      let lname = req.session.user.lname;
      const email = req.session.user.email;
      console.log("list data -_- => ",listdata);
      console.log(id_q)
      const id = await db.query(
        "SELECT id_q FROM quize WHERE id_q=$1 ",[id_q]
      );
      console.log(id.rows);

      let sub = req.body.about; 
     
      if (id.rowCount != 0 ){
        if (note === 'submit') {
            console.log('updata');
            const del = await db.query(
                "DELETE FROM qustion WHERE id_q = $1;",[id_q]
              );
            for(let i =0 ; i<listdata.length ; i++)
                {
                  console.log(listdata[i]);
                     const result2= await db.query(
                         `INSERT INTO qustion(id_q , true_c , qustion , imagequstion ,imageop1,imageop2,imageop3,imageop4,choise1,choise2,choise3,choise4)
                          VALUES ($1, $2, $3, $4,$5,$6,$7,$8,$9,$10,$11,$12)`,
                         [ id_q,listdata[i].cop,listdata[i].Q,listdata[i].imgq,listdata[i].imgop1,listdata[i].imgop2,
                             listdata[i].imgop3,listdata[i].imgop4,listdata[i].op1,listdata[i].op2,listdata[i].op3,listdata[i].op4
                         ]
                      );
                }
                if (sub) {
                    const qur = await db.query(
                        "UPDATE quize SET about_quiz = $1 WHERE id_q = $2;", 
                        [sub, id_q]
                    );
                    console.log('corroect about of data for this quiz',sub);
                }
                console.log('finsh him \n');
                req.session.listdata = [] ; 
                  req.session.numberq =0 ;
             res.redirect('/createquiz-tec');
             
        }else {
                console.log('Redirecting to /startCreatequiz');
                res.redirect('/startCreatequiz');
            }
      }
      else{
            if (note === 'submit') {
        console.log('insert');
        //fname,lname,major,course,mid_final
        const result = await db.query(
            "INSERT INTO quize(fname, lname, major,  course,mid_final,about_quiz,email) VALUES ($1, $2, $3, $4,$5,$6,$7) RETURNING id_q",
            [ fname, lname, req.session.major, req.session.course,req.session.mid_final,sub,email]
         );
           console.log(result);
         const id_q = result.rows[0].id_q;
         let id_c=1;
         console.log('quiz succsefull\n');
       //id_q , id_c , true_c , quistioin , imagequstion , imageop1,imageop2,
       //imageop3 , imageop4 , choise1,choise2,choise3,choise4 
       for(let i =0 ; i<listdata.length ; i++)
       {
         console.log(listdata[i]);
            const result2= await db.query(
                `INSERT INTO qustion(id_q , true_c , qustion , imagequstion ,imageop1,imageop2,imageop3,imageop4,choise1,choise2,choise3,choise4)
                 VALUES ($1, $2, $3, $4,$5,$6,$7,$8,$9,$10,$11,$12)`,
                [ id_q,listdata[i].cop,listdata[i].Q,listdata[i].imgq,listdata[i].imgop1,listdata[i].imgop2,
                    listdata[i].imgop3,listdata[i].imgop4,listdata[i].op1,listdata[i].op2,listdata[i].op3,listdata[i].op4
                ]
             );
       }
        
         console.log('finsh him \n');
            req.session.listdata = [] ; 
              req.session.numberq =0 ;
         res.redirect('/createquiz-tec');
    } else {
        console.log('Redirecting to /startCreatequiz');
        res.redirect('/startCreatequiz');
    }
    }
});


app.get("/editquiz-tec" , async(req ,res)=>
    { if ( req.isAuthenticated())
            {
                console.log('enter edit page') ;  
                //take fname and lastname 
              const fname = req.session.user.fname; 
              const lname = req.session.user.lname;
              const email = req.session.user.email;
              console.log(fname , lname );
              if (fname && lname){
                  const quize = await db.query(
               "SELECT * FROM quize WHERE fname = $1 AND lname = $2 AND email=$3 ;",
               [fname,lname,email]
              );
            res.render('teacher/editquiz-tea.ejs',{
                list : quize.rows,
            })
           }
            }
            else  {res.redirect("/sing-in");}
    });
app.post("/editquiz-tec", async(req,res)=>{
    console.log('enter for post search table teacher');
    console.log(req.body);
    const id_q = req.body.id_q;
    console.log(id_q);
    //req.session.id_q = id_q;
    const quize = await db.query(
        "SELECT * FROM qustion WHERE id_q=$1;",
      [id_q]
        );
        const q = await db.query(
            "SELECT * FROM quize WHERE id_q=$1;",
          [id_q]
            );
        console.log(quize.rows[0]);
        req.session.numberq = quize.rowCount;
        req.session.listdata = quize.rows;
        req.session.major = q.rows[0].major; 
        req.session.course = q.rows[0].course;
        req.session.mid_final = q.rows[0].mid_final;
       
        res.redirect(`/startCreatequiz?id_q=${q.rows[0].id_q}`);
});

app.get("/about-quiz", async (req,res)=>{
    if (req.isAuthenticated())
        {   const fname = req.session.user.fname; 
            const lname = req.session.user.lname;
            const email = req.session.user.email;
            if (fname && lname){
                const quize = await db.query(
             "SELECT * FROM quize WHERE fname = $1 AND lname = $2 AND email=$3 ;",
             [fname,lname,email]
            );
             res.render("teacher/about-quize.ejs",{
              list : quize.rows,
          })
         }  

        }
        else{ res.redirect("/sing-in");}
});

app.post("/about-quiz", async(req,res)=>{
    console.log('enter for post search table teacher');

    const id_q = req.body.id_q;
    console.log(id_q);
if (/^\d+$/.test(id_q)){
    const quize = await db.query(
        "SELECT * FROM student_qustion WHERE id_q=$1 ;",
        [id_q]
       );
       let list=[] ;
       for ( let i =0 ; i <quize.rowCount ; i++ )
       {
        const quize2 = await db.query(
        "SELECT * FROM student WHERE email=$1 ;",
        [quize.rows[i].email]
       );
       list.push({
        name: quize2.rows[0].fname + " " + quize2.rows[0].lname, // Access the first row
        score: quize.rows[i].score,
        email: quize.rows[i].id
    });
        }
        res.render("teacher/about-quize.ejs",{
            list2 : list,
        })
}
else 
{
     console.log(id_q.slice(1,));
     const id = id_q.slice(1,);
    
     res.redirect(`/show-what-do-stu?id=${id}`)
}
});
 
app.get("/show-what-do-stu" , async (req,res)=>{
    if (req.isAuthenticated()) {
  
        
     const id = req.query.id;
    console.log('enter take quiz\n');
    const quizes = await db.query(
        "SELECT * FROM student_qustion WHERE id=$1 ;",
        [id]
       );
    const id_q = quizes.rows[0].id_q;
    
  
    console.log(id_q);
    const quize = await db.query(
        "SELECT * FROM qustion WHERE id_q = $1;",
      [id_q]
    );

     console.log("Database rows:", quize.rows);


const listdata = quize.rows.map((row, index) => ({
Q: row.qustion,
imgq: row.imagequstion,
op1: row.choise1,
op2: row.choise2,
op3: row.choise3,
op4: row.choise4,
imgop1: row.op1,
imgop2: row.op2,
imgop3: row.op3,
imgop4: row.op4,
cop: row.true_c,
numstr: index + 1, // Assign a sequence number starting from 1
yourc : 0
       }));
       const quize2 = await db.query(
        "SELECT * FROM student_qustion WHERE id = $1;",
      [id]
    );
    const yourc = quize2.rows[0].stu_chose;
    console.log(yourc);
    console.log(quize2.rows);
    for (let i =0 ; i< listdata.length ; i++)
        {
            let v= yourc.slice(i,i+1);          
        if(quize.rows[i].true_c == v )
            { 
                let valid = 'correct answer';
                listdata[i].valid = valid;
               
             }
       else {
           let valid1 = 'invalid answer';
          listdata[i].valid = valid1 ; 
          listdata[i].yourc = v ;
       }
     }
    res.render("teacher/showtakestu.ejs", { 
        listdata:listdata,
        id_q : id_q,
        show :1 ,
      }); 
    } else {
        res.redirect("/sing-in");
    }
});



passport.use(
    new Strategy(
        { usernameField: "email", passwordField: "password" }, 
        async function verify(email, password, cd) {
            try {
                const resultstu = await db.query(
                    "SELECT * FROM student WHERE email = $1",
                    [email]
                );
                const resulttea = await db.query(
                    "SELECT * FROM teacher WHERE email = $1",
                    [email]
                );
                const resulttea_ver = await db.query(
                    "SELECT * FROM teacher_ver WHERE email = $1",
                    [email]
                );

                if (resultstu.rows.length > 0) {
                    const user = resultstu.rows[0];
                    console.log("enter user "+ user);
                    const storedpassword = user.password;
                    const isPasswordValid = await bcrypt.compare(password, storedpassword);
                    if (isPasswordValid) {
                        return cd(null, user, { state: "S" });
                    } else {
                        return cd(null, false, { message: "Invalid password" });
                    }
                } else if (resulttea.rows.length > 0) {
                    const user = resulttea.rows[0];
                   
                    const storedpassword = user.password;
                    const isPasswordValid = await bcrypt.compare(password, storedpassword);
                    if (isPasswordValid) {
                        return cd(null, user, { state: "T" }); 
                    } else {
                        return cd(null, false, { message: "Invalid password" });
                    }
                }else if(resulttea_ver.rows.length>0){
                    const user = resulttea_ver.rows[0];
                   
                    const storedpassword = user.password;
                    const isPasswordValid = await bcrypt.compare(password, storedpassword);
                    if (isPasswordValid) {
                        return cd(null, user, {state:'ver' }); 
                    } else {
                        return cd(null, false, { message: "Invalid password" });
                    }
                } else {
                    return cd(null, false, { message: "Email not found" });
                }
            } catch (err) {
                console.error("Error in strategy:", err);
                return cd(err);
            }
        }
    )
);
passport.serializeUser((user, cb) => {
    cb(null, user.email); // Serialize email only
});

passport.deserializeUser(async (email, cb) => {
    try {
        const resultstu = await db.query("SELECT * FROM student WHERE email = $1", [email]);
        if (resultstu.rows.length > 0) {
            return cb(null, resultstu.rows[0]);
        }

        const resulttea = await db.query("SELECT * FROM teacher WHERE email = $1", [email]);
        if (resulttea.rows.length > 0) {
            return cb(null, resulttea.rows[0]);
        }

        return cb(null, false); 
    } catch (err) {
        return cb(err);
    }
});







// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
