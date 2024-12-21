// Get the image element and the hidden file input
const imgElementQ = document.getElementById('upQ');
const imgElement1 = document.getElementById('up1');
const imgElement2 = document.getElementById('up2');
const imgElement3 = document.getElementById('up3');
const imgElement4 = document.getElementById('up4');

const fileInput1 = document.getElementById('fileInput1');
const fileInput2 = document.getElementById('fileInput2');
const fileInput3 = document.getElementById('fileInput3');
const fileInput4 = document.getElementById('fileInput4');
const fileInputmain = document.getElementById('fileInputmain');

// When the image is clicked, trigger the file input click
imgElement1.addEventListener('click', function() {
    fileInput1.click(); // Corrected: use fileInput1 here
    
});

imgElement2.addEventListener('click', function() {
    fileInput2.click(); // Corrected: use fileInput2 here
});

imgElement3.addEventListener('click', function() {
    fileInput3.click(); // Corrected: use fileInput3 here
});

imgElement4.addEventListener('click', function() {
    fileInput4.click(); // Corrected: use fileInput4 here
});
imgElementQ.addEventListener('click', function() {
    fileInputmain.click(); // Corrected: use fileInput4 here
});
// When a file is selected, replace the existing image with the uploaded one
fileInput1.addEventListener('change', function(event) {
    const file = event.target.files[0]; // Get the selected file
    if (file) {
        const reader = new FileReader();
        
        // When the file is read, update the src of the existing image
        reader.onload = function(e) {
            imgElement1.src = e.target.result; // Set the image source to the uploaded image
        };
        
        reader.readAsDataURL(file); // Read the file as a data URL
    }
});

fileInput2.addEventListener('change', function(event) {
    const file = event.target.files[0]; // Get the selected file
    if (file) {
        const reader = new FileReader();
        
        // When the file is read, update the src of the existing image
        reader.onload = function(e) {
            imgElement2.src = e.target.result; // Set the image source to the uploaded image
        };
        
        reader.readAsDataURL(file); // Read the file as a data URL
    }
});

fileInput3.addEventListener('change', function(event) {
    const file = event.target.files[0]; // Get the selected file
    if (file) {
        const reader = new FileReader();
        
        // When the file is read, update the src of the existing image
        reader.onload = function(e) {
            imgElement3.src = e.target.result; // Set the image source to the uploaded image
        };
        
        reader.readAsDataURL(file); // Read the file as a data URL
    }
});

fileInput4.addEventListener('change', function(event) {
    const file = event.target.files[0]; // Get the selected file
    if (file) {
        const reader = new FileReader();
        
        // When the file is read, update the src of the existing image
        reader.onload = function(e) {
            imgElement4.src = e.target.result; // Set the image source to the uploaded image
        };
        
        reader.readAsDataURL(file); // Read the file as a data URL
    }
});
fileInputmain.addEventListener('change', function(event) {
    const file = event.target.files[0]; // Get the selected file
    if (file) {
        const reader = new FileReader();
        
        // When the file is read, update the src of the existing image
        reader.onload = function(e) {
            imgElementQ.src = e.target.result; // Set the image source to the uploaded image
        };
        
        reader.readAsDataURL(file); // Read the file as a data URL
    }
});