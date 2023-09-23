// Login form submission
document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    // Send a POST request to your server's login endpoint
    fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => {
        if (response.status === 200) {
          window.location.href = "/";
        }
      })
      .then((data) => {
        // Handle response (e.g., navigate to chat page)
      })
      .catch((error) => {
        console.error("Login failed:", error);
      });
  });
