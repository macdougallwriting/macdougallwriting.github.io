document.addEventListener("DOMContentLoaded", () => {

  const output = document.getElementById("output");
  const input = document.getElementById("commandInput");

  let essays = {};
  let currentSubject = null;

  // =========================
  // TYPING SYSTEM (UPGRADED)
  // =========================
  let typingTimeout = null;
  let isTyping = false;
  let fullText = "";

  function typeText(text, speed = 10) {
    if (typingTimeout) clearTimeout(typingTimeout);
    isTyping = true;
    fullText = text;
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

  function skipTyping() {
    if (isTyping) {
      clearTimeout(typingTimeout);
      output.textContent = fullText;
      isTyping = false;
    }
  }

  // =========================
  // COMMAND HISTORY
  // =========================
  let commandHistory = [];
  let historyIndex = -1;

  function handleInput(e) {
    // Only handle Enter and arrow keys — do NOT skip typing
    if (e.key === "Enter") {
      e.preventDefault();
      const cmd = e.target.value.trim();
      if (cmd) {
        commandHistory.push(cmd);
        historyIndex = commandHistory.length;
      }
      runCommand(cmd);
      e.target.value = "";
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        e.target.value = commandHistory[historyIndex];
      }
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        e.target.value = commandHistory[historyIndex];
      } else {
        e.target.value = "";
      }
    }
  }

  // Attach handler to main input
  input.addEventListener("keydown", handleInput);

  // =========================
  // GLOBAL ESC KEY
  // =========================
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      e.preventDefault();

      if (isTyping) {
        skipTyping();
        return;
      }

      if (typingTimeout) {
        clearTimeout(typingTimeout);
        isTyping = false;
      }

      input.value = "";
      showMenu();
      input.focus();
    }
  });

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

    setTimeout(() => {
      showMenu();
    }, 3000);
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
  // MENUS
  // =========================
  function showMenu() {
    currentSubject = null;

    typeText(`
PORTFOLIO TERMINAL

Commands:

${Object.keys(essays).join("\n")}

help
`);
    removeTopInput();
  }

  function showSubjectMenu(subject) {
    currentSubject = subject;
    const list = essays[subject].join("\n- ");

    typeText(`
${subject.toUpperCase()} ESSAYS

Type one of the following:

- ${list}

Type 'help' to return
`);
    removeTopInput();
  }

  // =========================
  // LOAD ESSAY (WITH TYPING)
  // =========================
  function loadEssay(subject, essayName) {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      isTyping = false;
    }

    // Add top input for essays
    addTopInput();

    output.textContent = "Loading...\n";

    fetch(`essays/${subject}/${essayName}.txt`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.text();
      })
      .then(text => {
        typeText(`Type 'back' to return.\n\n${text}\n\nType 'back' to return.`, 0.125);
      })
      .catch(() => {
        typeText(`Error: file not found\n\nType 'back' to return`);
      });
  }

  // =========================
  // COMMAND HANDLER
  // =========================
  function runCommand(cmd) {
    if (!cmd) return;

    cmd = cmd.toLowerCase().trim();

    if (cmd === "help") {
      showMenu();
      return;
    }

    if (cmd === "back") {
      showMenu();
      return;
    }

    // Inside subject
    if (currentSubject) {
      if (essays[currentSubject].includes(cmd)) {
        loadEssay(currentSubject, cmd);
      } else {
        typeText(`Invalid entry\n\nType 'back' to return`);
      }
      return;
    }

    // Main menu
    if (essays.hasOwnProperty(cmd)) {
      showSubjectMenu(cmd);
    } else {
      typeText(`Unknown command\n\nType 'help' to return`);
    }
  }

  input.focus();

  // =========================
  // TOP INPUT MANAGEMENT FOR ESSAYS
  // =========================
  function addTopInput() {
    removeTopInput();
    const topInputContainer = document.createElement("div");
    topInputContainer.id = "topInputLine";
    topInputContainer.className = "inputLineContainer";

    const promptSpan = document.createElement("span");
    promptSpan.className = "prompt";
    promptSpan.textContent = ">";

    const topInput = document.createElement("input");
    topInput.type = "text";
    topInput.placeholder = "Type command + ENTER";
    topInput.className = "essayTopInput";
    topInput.addEventListener("keydown", handleInput);

    topInputContainer.appendChild(promptSpan);
    topInputContainer.appendChild(topInput);

    document.body.insertBefore(topInputContainer, document.getElementById("terminal"));
  }

  function removeTopInput() {
    const existing = document.getElementById("topInputLine");
    if (existing) existing.remove();
  }

});
