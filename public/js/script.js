document.getElementById('sendButton').addEventListener('click', async () => {
    const chatBox = document.getElementById('chatBox');
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value;

    // Append user message to the chat
    chatBox.innerHTML += `<div>User: ${message}</div>`;

    // Send message to the API
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
    });

    const data = await response.json();

    // Append ChatGPT reply to the chat
    chatBox.innerHTML += `<div>ChatGPT: ${data.reply}</div>`;
    chatInput.value = ''; // Clear input field
});
