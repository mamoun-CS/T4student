function radiose() {
    var s1 = document.getElementById("studentRole");
    var s2 = document.getElementById("teacherRole");
    var t1 = document.getElementById("nstudent");
    var t2 = document.getElementById("cvdoctor").parentElement; 

    if (s1.checked) {
        t1.parentElement.style.display = "block";
        t2.style.display = "none";
    } else if (s2.checked) {
        t1.parentElement.style.display = "none";
        t2.style.display = "block"; 
    }
}
 
window.onload = radiose;
document.getElementById("studentRole").addEventListener("click", radiose);
document.getElementById("teacherRole").addEventListener("click", radiose);