const sing_out = document.getElementById('singout');
sing_out.addEventListener('click',handleSignOut);

function handleSignOut() {
    fetch("/sing-out", {
      method: "POST",
      credentials: "include", // Include cookies if using sessions
    })
      .then((response) => {
        if (response.ok) {
          localStorage.removeItem("authToken");
          window.location.href = "/sing-in";
        } else {
          console.error("Failed to log out");
        }
      })
      .catch((error) => console.error("Error:", error));
  }
  