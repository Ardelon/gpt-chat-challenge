let token = localStorage.getItem("token"); // Assuming token is stored in Local Storage
const socket = io({ query: { token } });
const userList = document.getElementById("userList");

// DOM Elements
const messageInput = document.getElementById("messageInput");
const messageContainer = document.getElementById("messageContainer");
const sendButton = document.getElementById("sendButton");

// Listen for 'receive_message' event from the server
socket.on("receive_message", (message) => {
  const messageElement = document.createElement("div");
  messageElement.innerText = message;
  messageContainer.append(messageElement);
});

// Send message to the server
sendButton.addEventListener("click", () => {
  const message = messageInput.value;
  if (message.trim()) {
    const messageElement = document.createElement("div");
    messageElement.innerText = `You: ${message}`;
    messageContainer.append(messageElement);
    socket.emit("send_message", message);
  }
  messageInput.value = "";
});

// Assuming 'activeUsers' is an array of active user names sent from the server
socket.on("updateUserList", (activeUsers) => {
  // Clear existing list
  console.log(activeUsers);
  userList.innerHTML = "";

  // Populate new list
  activeUsers.forEach((username) => {
    const userItem = document.createElement("li");
    userItem.textContent = username;
    userList.appendChild(userItem);
  });
});
