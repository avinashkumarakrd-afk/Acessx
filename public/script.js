console.log("Script loaded successfully!");

const sendBtn = document.getElementById('sendBtn');

sendBtn.addEventListener('click', async () => {
    alert("Button clicked!"); // 1. The immediate test
    
    const inputField = document.getElementById('user-input');
    const message = inputField.value;

    sendBtn.innerText = "Processing...";

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: "user", content: message }],
                model: "openai/gpt-4o-mini"
            })
        });

        const data = await response.json();
        alert("Response received! Check console for data.");
        console.log("Data from API:", data);
        
    } catch (err) {
        alert("Fetch failed: " + err.message);
    } finally {
        sendBtn.innerText = "Send";
    }
});
