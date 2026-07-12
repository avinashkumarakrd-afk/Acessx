try {
  // ... your fetch logic ...
} catch (err) {
  console.error("Caught error:", err); // Always log to console
  
  // Create a safe error message
  let errorMessage = "An unknown error occurred.";
  if (err instanceof Error) {
    errorMessage = err.message;
  } else if (typeof err === 'string') {
    errorMessage = err;
  } else if (typeof err === 'object') {
    try {
      errorMessage = JSON.stringify(err);
    } catch (e) {
      errorMessage = "Error object could not be parsed.";
    }
  }

  // Safely update history
  history[history.length - 1] = {
    type: "assistant",
    label: "Error",
    content: errorMessage
  };
} finally {
  setIsLoading(false); // <--- THIS IS THE MOST IMPORTANT PART
}
