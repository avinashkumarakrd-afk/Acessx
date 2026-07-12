// Ensure you have an element to track your button
const sendBtn = document.getElementById('send-btn'); 

async function handleSend() {
    // 1. Get the message from your input box
    const inputField = document.getElementById('user-input'); // Ensure this ID matches your HTML
    const message = inputField.value;
    
    if (!message) return; // Don't send empty messages

    // 2. Grey out button and show loading
    const sendBtn = document.querySelector('button'); // Or your specific button ID
    sendBtn.disabled = true;
    sendBtn.innerText = "Sending...";

    try {
        // 3. This is the FETCH block that sends data to your chat.js
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: "user", content: message }],
                model: "openrouter/auto"
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "API call failed");
        }

        // 4. Success: Log it and clear the input
        console.log("AI Response:", data);
        inputField.value = ""; 
        alert("AI Responded! Check console.");

    } catch (err) {
        // 5. This will pop up on your phone if there is an error
        console.error("Error:", err);
        alert("Error: " + err.message);
    } finally {
        // 6. Always un-grey the button
        sendBtn.disabled = false;
        sendBtn.innerText = "Send";
    }
}
