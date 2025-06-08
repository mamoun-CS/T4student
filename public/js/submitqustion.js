let number = 1; 
let numstr = 1;

function onMenuClick() {
    var navbar = document.getElementById("navigation-bar");
    var responsive_class_name = "responsive";

    navbar.classList.toggle(responsive_class_name);
}


function isempty() {
    const question = document.getElementById("qustion");
    const option1 = document.getElementById("option1");
    const option2 = document.getElementById("option2");
    const option3 = document.getElementById("option3");
    const option4 = document.getElementById("option4");
    const correctOption = document.getElementById("correct-answer");
    return question.value === "" || option1.value === "" || option2.value === "" ||
           option3.value === "" || option4.value === "" || correctOption.value === "";
}




let p = 0 ;
let tw= true ;

function print() {


    let nu = parseInt(this.id.slice(1)); 
    const sty = document.getElementById("save");
    const setdata = document.getElementById(`S${nu}`);
    const question = document.getElementById("question");
    const img1 = document.getElementById('up1');
    const img2 = document.getElementById('up2');
    const img3 = document.getElementById('up3');
    const img4 = document.getElementById('up4');

    const fileInput1 = document.getElementById('fileInput1');
    const fileInput2 = document.getElementById('fileInput2');
    const fileInput3 = document.getElementById('fileInput3');
    const fileInput4 = document.getElementById('fileInput4');
    const option1 = document.getElementById("option1");
    const option2 = document.getElementById("option2");
    const option3 = document.getElementById("option3");
    const option4 = document.getElementById("option4");
    const correctOption = document.getElementById("correct-answer");

    const fileInputmain = document.getElementById('fileInputmain');
    const imgq= document.getElementById('upQ');

    if (setdata) {
        let data;
        try {
            data = JSON.parse(setdata.textContent);
        } catch (err) {
            console.error("Invalid JSON data:", err);
            return; 
        }
        if(data.imgq  != 'undefined' || data.imagequstion != 'undefined') {
        imgq.src ='img/images.svg';
         }
         if(data.imgop1 != 'undefined'|| data.imageop1 != 'undefined') {
            img1.src ='img/images.svg';
             }
             if(data.imgop2 != 'undefined'|| data.imageop2 != 'undefined') {
                img2.src ='img/images.svg';
                 } if(data.imgop3 != 'undefined'|| data.imageop3 != 'undefined') {
                    img3.src ='img/images.svg';
                     } if(data.imgop4 != 'undefined'|| data.imageop4 != 'undefined') {
                        img4.src ='img/images.svg';
                         }  
             
        Object.entries(data).forEach(([key, value]) => {
            switch (key) {
                case "Q":
                case "qustion":
                    question.value = value;
                    break;
                case "op1":
                case "choise1":
                    option1.value = value;
                    break;
                case "op2":
                case "choise2":
                    option2.value = value;
                    break;
                case "op3":
                case "choise3":
                    option3.value = value;
                    break;
                case "op4":
                case "choise4":
                    option4.value = value;
                    break;
                case "imgq":
                case "imagequstion":
                    imgq.src = value;
                    break;
                case "imgop1":
                case "imgeop1":
                    img1.src = value;
                    break;
                case "imgop2":
                case "imgeop2":
                    img2.src = value;
                    break;
                case "imgop3":
                case "imgeop3":
                    img3.src = value;
                    break;
                case "imgop4":
                case "imgeop4":
                    img4.src = value;
                    break;
                case "cop":
                case "true_c":
                    correctOption.value = value;
                    sty.value = `edit-Qustion${nu}`;
                    sty.classList = "btn btn-outline-primary w-100 py-3";
                    sty.textContent = "Edit Question";
                    break;
                default:
                    console.warn(`Unhandled key: ${key}`);
            }
            
           
        });          
    } else {
        const styy = document.getElementById('save');
        styy.value = "save";
        styy.classList = "btn btn-primary w-100 py-3";
        styy.textContent = "Save & Next";
        question.value = "";
        option1.value = "";
        option2.value = "";
        option3.value = "";
        option4.value = "";
        correctOption.value = "";
        imgq.src = "img/images.svg";
        img1.src = "img/images.svg"; 
        img2.src ="img/images.svg" ; 
        img3.src = "img/images.svg"; 
        img4.src= "img/images.svg";
        
    }
}



document.addEventListener('DOMContentLoaded', function () {
    const nextButton = document.getElementById('save');
    {
        nextButton.addEventListener('click', () => { 
              
                 window.location.reload();        
               });
       
    }

    const Qshow = document.getElementsByClassName('start');
    for (let i = 0; i < Qshow.length; i++) {
        Qshow[i].addEventListener('click', print);    
    }
   const submittion = document.getElementById('submitt');
   {
    submittion.addEventListener('click', submittion);
   }
});