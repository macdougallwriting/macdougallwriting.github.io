document.addEventListener("DOMContentLoaded", () => {

  const output = document.getElementById("output");

  // Two input elements: top and bottom (bottom always exists)
  const bottomInput = document.getElementById("commandInput");
  let topInput = null; // will be created dynamically for essays

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
    // Only handle Enter and Arrow keys
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

  bottomInput.addEventListener("keydown", handleInput);

  // =========================
  // GLOBAL ESC KEY
  // =========================
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      e.preventDefault();
      // Return to main menu
      if (typingTimeout) clearTimeout(typingTimeout);
      isTyping = false;
      removeTopInput();
      bottomInput.value = "";
      showMenu();
      bottomInput.focus();
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
    removeTopInput();
    typeText(`
PORTFOLIO TERMINAL

Commands:

${Object.keys(essays).join("\n")}

help
`);
    bottomInput.focus();
  }

  function showSubjectMenu(subject) {
    currentSubject = subject;
    removeTopInput();
    const list = essays[subject].join("\n- ");
    typeText(`
${subject.toUpperCase()} ESSAYS

Type one of the following:

- ${list}

Type 'help' to return
`);
    bottomInput.focus();
  }

  // =========================
  // ESSAY INPUT MANAGEMENT
  // =========================
  function addTopInput() {
    if (!topInput) {
      topInput = document.createElement("input");
      topInput.type = "text";
      topInput.placeholder = "Type command + ENTER";
      topInput.className = "command-input-top";
      topInput.style.background = "black";
      topInput.style.color = "#00ff00";
      topInput.style.border = "none";
      topInput.style.outline = "none";
      topInput.style.fontFamily = "monospace";
      topInput.style.fontSize = "18px";
      topInput.style.width = "100%";
      topInput.style.marginBottom = "10px";
      output.parentNode.insertBefore(topInput, output);
      topInput.addEventListener("keydown", handleInput);
    }
    topInput.focus();
  }

  function removeTopInput() {
    if (topInput) {
      topInput.removeEventListener("keydown", handleInput);
      topInput.remove();
      topInput = null;
    }
  }

  // =========================
  // LOAD ESSAY
  // =========================
  function loadEssay(subject, essayName) {
    if (typingTimeout) clearTimeout(typingTimeout);
    isTyping = false;

    output.textContent = "Loading...\n";
    addTopInput();

    fetch(`essays/${subject}/${essayName}.txt`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.text();
      })
      .then(text => {
        typeText(`Type back to return.\n\n${text}\n\nType back to return`, 0.125);
      })
      .catch(() => {
        typeText(`Error: file not found\n\nType back to return`);
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

    if (currentSubject) {
      if (essays[currentSubject].includes(cmd)) {
        loadEssay(currentSubject, cmd);
      } else if (cmd === "back") {
        removeTopInput();
        showSubjectMenu(currentSubject);
      } else {
        typeText(`Invalid entry\n\nType help`);
      }
      return;
    }

    if (essays.hasOwnProperty(cmd)) {
      showSubjectMenu(cmd);
    } else {
      typeText(`Unknown command\n\nType help`);
    }
  }

  // =========================
  // MOBILE BACK BUTTON HANDLING
  // =========================
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    window.addEventListener("popstate", () => {
      if (currentSubject && !isTyping) {
        removeTopInput();
        showMenu();
        bottomInput.focus();
      }
    });
  }

  bottomInput.focus();
});
