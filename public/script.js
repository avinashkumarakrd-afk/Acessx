fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message: "your message" }),
    headers: { 'Content-Type': 'application/json' }
})
