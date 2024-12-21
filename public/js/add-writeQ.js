// click on add write
function onclickQW() {
   
  var QW = document.getElementsByClassName('center-squareQ1')[0];  // Correct typo and use class
  var QI = document.getElementsByClassName('center-squareimg')[0]; // Correct typo and use class
  QW.style.display = 'none';
  QI.style.display = 'none';

  var mainstyle =document.getElementById('mainstyle');
    mainstyle.style.display = 'none';
   var Qs= document.getElementById('wquiz')[0];
   
    Qs.style.display= 'flex';
    if (window.innerWidth < 700)
      {
       Qs.style.boxShadow = '0 4px 8px'; 
       Qs.style.padding = '20px';
      }
    
  
  
      
  var Qplus; 
  var Qnum; 
  var submit ; 
 }
 
 // click on add img 
 function onclickQI() {
    var QW = document.getElementsByClassName('center-squareQ1')[0];  // Correct typo and use class
    var QI = document.getElementsByClassName('center-squareimg')[0]; // Correct typo and use class
    QW.style.display = 'none';
    QI.style.display = 'none';

    var Qi = true
  var Qs ;
  var Qplus; 
  var Qnum; 
  var submit ; 
 }
 // click on Qs 
 function onclickQstart() {
     // Get the element by ID
    var QW = document.getElementsByClassName('center-squareQ1')[0];  // Get the first element by class
    var QI = document.getElementsByClassName('center-squareimg')[0]; // Get the first element by class
    
      QW.style.display = 'block';  
      QI.style.display = 'block';
      
    QI.classList.add('center-squareimg');  // Add class to image container
    QW.classList.add('center-squareQ1');   // Add class to question container
  }
  function onclickQs()
  {
    //window.open ('/website Qize/first-bage/home-page.html','_blank')
  }
 
 //run code 

 document.addEventListener('DOMContentLoaded', function() {
     const button = document.getElementsByClassName('center-squareQ1')[0];  // Use class instead of ID
     button.addEventListener('click', onclickQW);     // Attach the click event listener
 });
 document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementsByClassName('center-squareimg')[0];  // Use class instead of ID
    button.addEventListener('click', onclickQI);     // Attach the click event listener
});
document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('Q1');  
    button.addEventListener('click', onclickQs);     
});
 
