history[history.length - 1] = {
  type: "assistant",
  label: "Error",
  content: typeof err === 'object' ? JSON.stringify(err) : err.message || String(err)
};
