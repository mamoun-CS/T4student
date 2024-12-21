import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import env from "dotenv";
import multer from "multer";
import path from "path";
import e from "express";
import { randomInt } from "crypto";

const saltRound = 3;
const app = express();
env.config();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/img/Q"); // Directory to save uploaded files
    },
    filename: (req, file, cb) => {
        console.log(file);
        cb(null, Date.now() + path.extname(file.originalname)); // Create a unique filename
    }
});
const upload = multer({ storage:storage });


const db = new pg.Client({
    user: process.env.PG_USER, // Correct username
    host: process.env.PG_HOST,
    database: process.env.PG_DB, // Ensure the database name is correct
    password: process.env.PG_PD,
    port: process.env.PG_PORT,
  });
db.connect()
  
app.use(
    session({
        id_q:0,
        mid_final:0,
        t:0,
        numberq :'0',
        user :"name , email",
        listdata:"",
secret: process.env.BOSS_CLICK,
resave: false , 
saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());


app.use(express.static("public")); 
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true })); // For parsing form data
// Define routes

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
        });
    })(req, res, next);
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
                const checkresultstu = await db.query("SELECT * FROM student WHERE email = $1",[email],); 
                const checkresulttea = await db.query("SELECT * FROM teacher WHERE email = $1",[email],); 
            if (checkresultstu.rows.length > 0   && checkresulttea.rows.length > 0)
                {
                    res.render("start/sing-up.ejs", { 
                        validpas: "invaled Email please change Email." 
                    });
                }
          else{
            if (state === 'T')
                {
                    const result = await db.query(
                    "INSERT INTO teacher(fname, lname, email,  password,cv_doctor) VALUES ($1, $2, $3, $4,$5)",
                    [fname, lname, email, hash,cv_doc]
                 );
    
                }
            else {
                  const result = await db.query(
            "INSERT INTO student(fname, lname, email,password,id_student) VALUES ($1, $2, $3, $4,$5)",
            [fname, lname, email, hash,id_student]
         );
        console.log(result); 
            }
        res.render("start/sing-in.ejs"); 
         }

        }
        });
    
     
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
imgop1: row.op1,
imgop2: row.op2,
imgop3: row.op3,
imgop4: row.op4,
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
const listdata = quize.rows.map((row, index) => ({  Q: row.qustion,imgq: row.imagequstion,op1: row.choise1,        op2: row.choise2,        op3: row.choise3,        op4: row.choise4,        imgop1: row.op1,        imgop2: row.op2,        imgop3: row.op3,        imgop4: row.op4,        cop: row.true_c,
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
    
        console.log("Rows updated:", count.rowCount);
        


        const listdataString = encodeURIComponent(JSON.stringify(listdata));
        res.redirect(`/submitquize-stu?listdata=${listdataString}&avg=${avg}&id_q=${submit}`);
     
   });
//-----------------------------------------------------------




app.get("/page1Serach-stu" , (req ,res)=>
    {if ( req.isAuthenticated())
        {
         res.render("student//page1Serach-stu.ejs");
        }
        else  {res.redirect("/sing-in");}
       
    });
app.post("/page1serach-stu" , async(req,res)=>{
    console.log('enter to post page 1 search ');
 const fname = req.body.fname; 
 const course = req.body.course; 
 const type = req.body.quizType;
 console.log(fname , course ,type);
 const quize = await db.query(
    "SELECT * FROM quize WHERE fname = $1 AND course=$2 AND mid_final=$3;",
  [fname , course , type ]
    );
   
    const listdataString = encodeURIComponent(JSON.stringify(quize.rows));
   res.redirect(`/pagetablesearch?list=${listdataString}`);
   

   });
app.get('/pagetablesearch',(req,res)=>{
    if (req.isAuthenticated())
        {    
    const listdata = JSON.parse(decodeURIComponent(req.query.list));
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

app.get("/submitquize-stu",(req,res)=>{
    console.log("enter get submit quiz stu");
    if (req.isAuthenticated())
        {    
    try {
        const avg = req.query.avg || 0 ;
        const listdata = JSON.parse(decodeURIComponent(req.query.listdata));
        const id_q = req.query.id_q;

        console.log("List Data:", listdata);
        res.render("student/submit-quiz.ejs", {
            avg: avg,
            listdata: listdata, // Pass as-is for rendering
            id_q: id_q,
        });
    } catch (error) {
        console.error("Error in GET /submitquize-stu:", error.message);
        res.status(500).send("Server Error");
    }
}else {res.redirect("/sing-in");}
});

app.post("/submitquize-stu", (req, res) => {
    console.log("Incoming data:", req.body);
        const listdata = JSON.parse(req.body.score); // Parse the JSON string
        const id_q = req.body.id_q; // Access the value
        console.log("List Data:", listdata);
        console.log("ID:", id_q);
        





        res.render("student/take-quize-stu.ejs", { 
            listdata: listdata,
            id_q: id_q,
            show :1 ,
        });
    
});



//teahcer url 
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

let Qpre = "e";
//let imageurl;
app.post("/startCreatequiz",upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 },
     ]), (req, res) => {
    console.log("Enter POST /startCreatequiz"); 
    let saveoredit = req.body.save; 
    const { question, option1, option2, option3, option4, correctAnswer } = req.body;   
   let t = req.session.t;
   
   
   
    //imageurl= req.file.filename;
   const fileInputmain = req.files.image;
   const fileinput = req.files;
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
 // after made any oparetion on this data   
     if (Qpre != question || t == 0 )
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
        t++;
        }
        else if(saveoredit === 'submit')
        {
            console.log("you can write database -_-\n");
        }
   else {
    console.log("5");
          let raound = req.body;
          let nu = raound.save.slice(12);
          console.log(fileInputmain +" "+saveoredit);
         
       if (Qpre != question && t != 0 )
        {
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
         

   }
  
        //console.log(listdata);
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

passport.use(
    new Strategy(
        { usernameField: "email", passwordField: "password" }, // Map fields
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

                if (resultstu.rows.length > 0) {
                    const user = resultstu.rows[0];
                    console.log("enter user "+ user);
                    const storedpassword = user.password;
                    const isPasswordValid = await bcrypt.compare(password, storedpassword);
                    if (isPasswordValid) {
                        return cd(null, user, { state: "S" }); // Attach role for later use
                    } else {
                        return cd(null, false, { message: "Invalid password" });
                    }
                } else if (resulttea.rows.length > 0) {
                    const user = resulttea.rows[0];
                   
                    const storedpassword = user.password;
                    const isPasswordValid = await bcrypt.compare(password, storedpassword);
                    if (isPasswordValid) {
                        return cd(null, user, { state: "T" }); // Attach role for later use
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

        return cb(null, false); // User not found
    } catch (err) {
        return cb(err);
    }
});







// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});