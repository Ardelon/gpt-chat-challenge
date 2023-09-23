// Register form submission
document
  .getElementById("registerForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("registerUsername").value;
    const password = document.getElementById("registerPassword").value;
    console.log(username, password);
    // Send a POST request to your server's register endpoint
    fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({ username, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle response (e.g., navigate to chat page)
      })
      .catch((error) => {
        console.error("Registration failed:", error);
      });
  });
