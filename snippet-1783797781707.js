const chatFeed = document.getElementById("chatFeed");
const textInput = document.getElementById("textInput");
const sendBtn = document.getElementById("sendBtn");
const imagePrompt = document.getElementById("imagePrompt");
const imageBtn = document.getElementById("imageBtn");
const clearBtn = document.getElementById("clearBtn");

const modelSelect = document.getElementById("modelSelect");
const systemPrompt = document.getElementById("systemPrompt");
const temperature = document.getElementById("temperature");
const tempValue = document.getElementById("tempValue");
const maxTokens = document.getElementById("maxTokens");
const imageProvider = document.getElementById("imageProvider");
const imageSize = document.getElementById("imageSize");

const STORAGE_KEY = "ai_chat_image_history_v1";
const SETTINGS_KEY = "ai_chat_image_settings_v1";

let history = [];

function saveHistory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

function loadHistory() {
  const raw = localStorage.getItem(STORAGE_KEY);
  history = raw ? JSON.parse(raw) : [];
}

function saveSettings() {
  const settings = {
    model: modelSelect.value,
    systemPrompt: systemPrompt.value,
    temperature: temperature.value,
    maxTokens: maxTokens.value,
    imageProvider: imageProvider.value,
    imageSize: imageSize.value
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function loadSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return;
  const s = JSON.parse(raw);
  if (s.model) modelSelect.value = s.model;
  if (s.systemPrompt) systemPrompt.value = s.systemPrompt;
  if (s.temperature) temperature.value = s.temperature;
  if (s.maxTokens) maxTokens.value = s.maxTokens;
  if (s.imageProvider) imageProvider.value = s.imageProvider;
  if (s.imageSize) imageSize.value = s.imageSize;
  tempValue.textContent = temperature.value;
}

function addMessage(msg) {
  history.push(msg);
  saveHistory();
  renderHistory();
}

function renderHistory() {
  chatFeed.innerHTML = "";
  history.forEach((msg) => {
    const div = document.createElement("div");
    div.className = `message ${msg.type}`;

    const role = document.createElement("div");
    role.className = "role";
    role.textContent = msg.label || msg.type;
    div.appendChild(role);

    if (msg.type === "image") {
      const text = document.createElement("div");
      text.textContent = msg.prompt;
      div.appendChild(text);

      const img = document.createElement("img");
      img.src = msg.url;
      img.alt = msg.prompt;
      div.appendChild(img);
    } else {
      const text = document.createElement("div");
      text.textContent = msg.content;
      div.appendChild(text);
    }

    chatFeed.appendChild(div);
  });

  chatFeed.scrollTop = chatFeed.scrollHeight;
}

function buildChatMessages() {
  const messages = [];

  if (systemPrompt.value.trim()) {
    messages.push({
      role: "system",
      content: systemPrompt.value.trim()
    });
  }

  for (const msg of history) {
    if (msg.type === "user") {
      messages.push({ role: "user", content: msg.content });
    } else if (msg.type === "assistant") {
      messages.push({ role: "assistant", content: msg.content });
    }
  }

  return messages;
}

async function sendText() {
  const content = textInput.value.trim();
  if (!content) return;

  addMessage({
    type: "user",
    label: "You",
    content
  });

  textInput.value = "";

  const loadingMsg = {
    type: "assistant",
    label: "AI",
    content: "Thinking..."
  };
  history.push(loadingMsg);
  renderHistory();

  try {
    const messages = buildChatMessages();

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: modelSelect.value,
        messages,
        temperature: Number(temperature.value),
        max_tokens: Number(maxTokens.value)
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Chat request failed");
    }

    const reply =
      data.choices?.[0]?.message?.content ||
      "No response returned.";

    history[history.length - 1] = {
      type: "assistant",
      label: "AI",
      content: reply
    };
    saveHistory();
    renderHistory();
  } catch (err) {
    history[history.length - 1] = {
      type: "assistant",
      label: "Error",
      content: err.message
    };
    saveHistory();
    renderHistory();
  }
}

async function generateImage() {
  const prompt = imagePrompt.value.trim();
  if (!prompt) return;

  addMessage({
    type: "user",
    label: "You (image prompt)",
    content: prompt
  });

  imagePrompt.value = "";

  const loadingMsg = {
    type: "assistant",
    label: "AI Image",
    content: "Generating image..."
  };
  history.push(loadingMsg);
  renderHistory();

  try {
    const res = await fetch("/api/image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt,
        provider: imageProvider.value,
        size: imageSize.value
      })
    });

    if (imageProvider.value === "huggingface") {
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Image request failed");
      }

      const blob = await res.blob();
      const imageUrl = URL.createObjectURL(blob);

      history[history.length - 1] = {
        type: "image",
        label: "AI Image",
        prompt,
        url: imageUrl
      };
      saveHistory();
      renderHistory();
      return;
    }

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Image request failed");
    }

    const imageUrl =
      data.data?.[0]?.url ||
      data.output?.[0] ||
      data.url;

    if (!imageUrl) {
      throw new Error("No image URL returned");
    }

    history[history.length - 1] = {
      type: "image",
      label: "AI Image",
      prompt,
      url: imageUrl
    };
    saveHistory();
    renderHistory();
  } catch (err) {
    history[history.length - 1] = {
      type: "assistant",
      label: "Error",
      content: err.message
    };
    saveHistory();
    renderHistory();
  }
}

temperature.addEventListener("input", () => {
  tempValue.textContent = temperature.value;
  saveSettings();
});

[modelSelect, systemPrompt, maxTokens, imageProvider, imageSize].forEach((el) => {
  el.addEventListener("change", saveSettings);
  el.addEventListener("input", saveSettings);
});

sendBtn.addEventListener("click", sendText);
imageBtn.addEventListener("click", generateImage);

textInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendText();
});

imagePrompt.addEventListener("keydown", (e) => {
  if (e.key === "Enter") generateImage();
});

clearBtn.addEventListener("click", () => {
  history = [];
  saveHistory();
  renderHistory();
});

loadSettings();
loadHistory();
renderHistory();