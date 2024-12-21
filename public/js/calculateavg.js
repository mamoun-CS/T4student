
function updateProgressBar(value) {
    // Ensure the value is within 0-100
    var progress = Math.max(0, Math.min(100, value));

    // Calculate stroke-dasharray for the circle
    var x = document.querySelector('.progress-circle-prog');
    x.style.strokeDasharray = ((progress/100) * 251.2) + ' 999'; // 4.67 is based on circle circumference for 100%
        alert(x.style.strokeDasharray);
    // Update the text inside the progress circle
    var el = document.querySelector('.progress-text');
    el.textContent = progress + '%';
}
// Event listener for the button click
document.getElementById('calculateBtn').addEventListener('click', function() {
    // Get the value from the input field
    var inputValue = document.getElementById('avg').value;
     
    // Update the progress bar with the input value
    updateProgressBar(inputValue);
});
