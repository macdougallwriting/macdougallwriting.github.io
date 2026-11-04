document.addEventListener("DOMContentLoaded", () => {
  const output = document.getElementById("output");
  const menuInput = document.getElementById("commandInput");

  const AI_ENDPOINT =
    "https://ai-terminal-backend.zander0506.workers.dev";

  let essays = {};
  let currentSubject = null;
  let currentMode = null;

  let typingTimeout = null;
  let isTyping = false;

  let conversationHistory = [];
  let chatTranscript = [];

  // =========================
  // TYPING SYSTEM
  // =========================
  function typeText(text, speed = 10) {
    if (typingTimeout) clearTimeout(typingTimeout);

    isTyping = true;
    output.textContent = "";
    let i = 0;

    function type() {
      if (i < text.length) {
        output.textContent += text.charAt(i);
        i++;
        typingTimeout = setTimeout(type, speed);
      } else {
        isTyping = false;
      }
    }

    type();
  }

  // =========================
  // COMMAND HANDLER
  // =========================
  function runCommand(cmd) {
    if (!cmd.trim()) return;

    const rawCmd = cmd.trim();

    // AI CHAT MODE
    if (currentMode === "ai") {
      if (rawCmd.toLowerCase() === "back") {
        showMenu();
      } else {
        sendAIMessage(rawCmd);
      }
      return;
    }

    cmd = rawCmd.toLowerCase();

    if (cmd === "back") {
      showMenu();
      return;
    }

    if (cmd === "ai test" || cmd === "ai") {
      showAIChat();
      return;
    }

    if (currentSubject !== null) {
      if (essays[currentSubject].includes(cmd)) {
        loadEssay(currentSubject, cmd);
      } else {
        typeText("Unknown command\n\nType 'back'");
      }
      return;
    }

    if (essays.hasOwnProperty(cmd)) {
      showSubjectMenu(cmd);
    } else {
      typeText("Unknown command\n\nType 'back'");
    }
  }

  // =========================
  // LOAD ESSAY
  // =========================
  function loadEssay(subject, essayName) {
    if (typingTimeout) clearTimeout(typingTimeout);
    isTyping = false;
    output.textContent = "";

    fetch(`essays/${subject}/${essayName}.txt`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.text();
      })
      .then(text => {
        currentSubject = subject;
        displayEssay(text);
      })
      .catch(() => {
        typeText("Error: file not found\n\nType 'back'");
      });
  }

  // =========================
  // DISPLAY ESSAY
  // =========================
  function displayEssay(text) {
    output.textContent = "";

    let i = 0;
    isTyping = true;

    function type() {
      if (i < text.length) {
        output.textContent += text.charAt(i);
        i++;
        typingTimeout = setTimeout(type, 1);
      } else {
        isTyping = false;
      }
    }

    type();
  }

  // =========================
  // AI CHAT INTERFACE
  // =========================
  function showAIChat() {
    currentSubject = null;
    currentMode = "ai";

    conversationHistory = [];
    chatTranscript = [];

    menuInput.placeholder = "Type message + ENTER";

    output.textContent =
`AI TEST TERMINAL

Connection established.
Model: GLM 4.7 Flash

You are now connected to the AI.

Type a message and press ENTER.
Type 'back' to return to the main menu.

----------------------------------------

`;

    menuInput.focus();
  }

  // =========================
  // DISPLAY CHAT HISTORY
  // =========================
  function renderChat(status = "") {
    let text = `AI TEST TERMINAL

Model: GLM 4.7 Flash

----------------------------------------

`;

    text += chatTranscript.join("\n\n");

    if (status) {
      text += "\n\n" + status;
    }

    output.textContent = text;
  }

  // =========================
  // SEND MESSAGE TO AI
  // =========================
  async function sendAIMessage(message) {
    if (!message.trim()) return;

    conversationHistory.push({
      role: "user",
      content: message
    });

    chatTranscript.push("YOU: " + message);

    renderChat("AI is thinking...");

    menuInput.disabled = true;

    try {
      const response = await fetch(AI_ENDPOINT, {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          messages: conversationHistory
        })
      });

      const data = await response.json();

      if (!response.ok || !data.reply) {
        throw new Error(data.details || data.error || "Invalid AI response.");
      }

      conversationHistory.push({
        role: "assistant",
        content: data.reply
      });

      chatTranscript.push("AI: " + data.reply);

      renderChat();

    } catch (error) {
      chatTranscript.push(
        "SYSTEM ERROR: " + error.message
      );

      // Remove the unanswered message from conversation history.
      conversationHistory.pop();

      renderChat();

    } finally {
      menuInput.disabled = false;
      menuInput.focus();
    }
  }

  // =========================
  // MENUS
  // =========================
  function showMenu() {
    currentSubject = null;
    currentMode = null;

    menuInput.disabled = false;
    menuInput.placeholder = "Type command + ENTER";

    typeText(`
PORTFOLIO TERMINAL

Commands:

${Object.keys(essays).join("\n")}

ai test

Type 'back' anytime to return here
`);

    menuInput.focus();
  }

  function showSubjectMenu(subject) {
    currentSubject = subject;
    currentMode = null;

    const list = essays[subject].join("\n- ");

    typeText(`
${subject.toUpperCase()}

Type one of the following:

- ${list}

Type 'back' to return
`);

    menuInput.focus();
  }

  // =========================
  // BOOT SEQUENCE
  // =========================
  function bootSequence() {
    const bootText = `
Initializing system...
Loading kernel modules...
Establishing secure connection...
Decrypting archives...
Mounting drives...
Access granted.

Welcome, user.
`;

    typeText(bootText, 20);

    setTimeout(() => showMenu(), 3000);
  }

  // =========================
  // LOAD JSON INDEX
  // =========================
  fetch("essays/index.json")
    .then(res => res.json())
    .then(data => {
      essays = data;
      bootSequence();
    })
    .catch(() => {
      output.textContent = "Failed to load essays index.";
    });

  // =========================
  // ESC KEY
  // =========================
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      e.preventDefault();
      showMenu();
      menuInput.focus();
    }
  });

  // =========================
  // MENU / AI INPUT
  // =========================
  menuInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();

      runCommand(menuInput.value);

      menuInput.value = "";
    }
  });

  menuInput.focus();
});
