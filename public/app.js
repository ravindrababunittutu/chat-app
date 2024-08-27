const socket = io();

const sendButton = document.getElementById('send-button');
const messageInput = document.getElementById('message-input');
const chatWindow = document.getElementById('chat-window');
const logoutButton = document.getElementById('logout-button'); // Add this line

// Event listener for sending messages
sendButton.addEventListener('click', function() {
    const message = messageInput.value;
    if (message.trim() !== '') {
        socket.emit('chat message', message);
        messageInput.value = '';
    }
});

// Event listener for logging out
logoutButton.addEventListener('click', function() {
    window.location.href = '/logout';
});

// Listen for loaded messages from the server
socket.on('load messages', function(messages) {
    messages.forEach(function(msg) {
        displayMessage(msg);
    });
});

// Listen for chat messages from the server
socket.on('chat message', function(msg) {
    displayMessage(msg);
});

// Function to display a message in the chat window
function displayMessage(msg) {
    const messageElement = document.createElement('p');
    messageElement.textContent = msg.text; // Assuming msg.text contains the message content
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Error handling for socket events
socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err);
});

socket.on('disconnect', () => {
    console.warn('Disconnected from the server');
});
