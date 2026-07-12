// Ensure you have an element to track your button
const sendBtn = document.getElementById('send-btn'); 

async function handleSend() {
  const userInput = document.getElementById('user-input').value; // Get the actual text
  
  // 1. Grey out the button
  sendBtn.disabled = true;
  sendBtn.innerText = "Sending...";

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: userInput }),
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error('Server responded with ' + response.status);
    }

    const data = await response.json();
    console.log("AI Response:", data);
    // Add your logic here to display the response in your chat history
    
  } catch (err) {
    console.error("Fetch error:", err);
    alert("Error: " + err.message); // This will show you exactly why it fails on mobile
  } finally {
    // 2. ALWAYS un-grey the button
    sendBtn.disabled = false;
    sendBtn.innerText = "Send";
  }
}
