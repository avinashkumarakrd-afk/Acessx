// Ensure you have an element to track your button
const sendBtn = document.getElementById('sendBtn').addEventListener('click', handleSend);

async function handleSend() {
    // 1. Match your HTML: id="textInput"
    const inputField = document.getElementById('textInput'); 
    const message = inputField.value;
    
    if (!message) return;

    // 2. Match your HTML: id="sendBtn"
    const sendBtn = document.getElementById('sendBtn');
    sendBtn.disabled = true;
    sendBtn.innerText = "Sending...";

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: "user", content: message }],
                model: "openai/gpt-4o-mini" // Matches one of your dropdown options
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "API call failed");
        }

        console.log("AI Response:", data);
        inputField.value = ""; 
        alert("AI Responded!");

    } catch (err) {
        console.error("Fetch Error:", err);
        alert("Error: " + err.message);
    } finally {
        sendBtn.disabled = false;
        sendBtn.innerText = "Send";
    }
}

// 3. THIS LINE IS CRITICAL: It connects your button to the function!
document.getElementById('sendBtn').addEventListener('click', handleSend);
