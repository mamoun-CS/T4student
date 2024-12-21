 // Optional: If using session storage or a server-side session
 document.getElementById('signout').addEventListener('click', function(e) {
    e.preventDefault(); // Prevent default link behavior

    // Clear session storage if you're managing user sessions
    sessionStorage.clear();

    // Redirect to login page
    window.location.href = '/login';
});