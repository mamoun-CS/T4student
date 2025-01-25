let imageContent; // Variable to store the image content

// Function to load image from a path or URL
async function readImageFromPath(imagePath) {
    try {
        // Fetch the image as a Blob
        const response = await fetch(imagePath);
        const blob = await response.blob();

        // Read the Blob using FileReader
        const reader = new FileReader();
        reader.onload = () => {
            imageContent = reader.result; // Base64 content of the image
            console.log('Image content set in variable:', imageContent);
        };
        reader.readAsDataURL(blob); // Read the Blob as a data URL
    } catch (error) {
        console.error('Error reading image from path:', error);
    }
}
//readImageFromPath(imagePath);


// Define the OCR processing function
async function processImage(selectedFile) {
    if (!selectedFile) {
        alert('Please select an image first.');
        return;
    }
    const progress = document.getElementById('progress');
    progress.innerText = 'Processing...';

    try {
        // Perform OCR using Tesseract.js
        const result = await Tesseract.recognize(
            selectedFile,
            'eng',
            {
                logger: (message) => {
                    if (message.status === 'recognizing text') {
                        progress.innerText = `${message.status}: ${(message.progress * 100).toFixed(2)}%`;
                    }
                },
            }
        );

        // Update the textarea with the extracted text
       
        progress.innerText = 'Done!'; 
        alert(result.data.text);
        return result.data.text;
    } catch (error) {
        console.error('Error during OCR processing:', error);
        progress.innerText = 'Error: Unable to process the image.';
    }
}

// Add event listener to the start button
//startButton.addEventListener('click', processImage);
