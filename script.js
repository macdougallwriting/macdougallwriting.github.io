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

  input.addEventListener("keydown", e => {

    // If typing → skip instead of processing input
    if (isTyping) {
      e.preventDefault();
      skipTyping();
      return;
    }

    // ENTER
    if (e.key === "Enter") {
      e.preventDefault();

      const cmd = input.value.trim();
      if (cmd) {
        commandHistory.push(cmd);
        historyIndex = commandHistory.length;
      }

      runCommand(cmd);
      input.value = "";
    }

    // UP ARROW
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        input.value = commandHistory[historyIndex];
      }
    }

    // DOWN ARROW
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        input.value = commandHistory[historyIndex];
      } else {
        input.value = "";
      }
    }
  });

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
  }

  function showSubjectMenu(subject) {
    currentSubject = subject;
    const list = essays[subject].join("\n- ");

    typeText(`
${subject.toUpperCase()} ESSAYS

Type one of the following:

- ${list}

Type 'back' to return
`);
  }

  // =========================
  // LOAD ESSAY (WITH TOP-BACK PROMPT)
  // =========================
  function loadEssay(subject, essayName) {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      isTyping = false;
    }

    output.textContent = "Loading...\n";

    fetch(`essays/${subject}/${essayName}.txt`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.text();
      })
      .then(text => {
        const fullEssay = `Type 'back' to return\n\n${text}`;
        typeText(fullEssay, 0.125);
      })
      .catch(() => {
        typeText(`Error: file not found\n\nType 'back'`);
      });
  }

  // =========================
  // COMMAND HANDLER
  // =========================
  function runCommand(cmd) {
    if (!cmd) return;

    cmd = cmd.toLowerCase().trim();

    if (isTyping && typingTimeout) {
      clearTimeout(typingTimeout);
      isTyping = false;
    }

    // HELP command → show instructions
    if (cmd === "help") {
      typeText(`
PORTFOLIO TERMINAL HELP

Navigation:

- Type a subject name to see essays in that category.
- Type the essay name to open it.
- While reading an essay, type 'back' to return to the main menu.
- On mobile, tap outside the input field to return.
- On desktop, press ESC to return.
`);
      return;
    }

    // BACK command → return to main menu
    if (cmd === "back") {
      showMenu();
      return;
    }

    // Inside subject menu
    if (currentSubject) {
      if (essays[currentSubject].includes(cmd)) {
        loadEssay(currentSubject, cmd);
      } else {
        typeText(`Invalid entry\n\nType 'back'`);
      }
      return;
    }

    // Main menu command → show subject menu
    if (essays.hasOwnProperty(cmd)) {
      showSubjectMenu(cmd);
    } else {
      typeText(`Unknown command\n\nType 'help'`);
    }
  }

  input.focus();

  // =========================
  // MOBILE TOUCH NAVIGATION
  // =========================
  function mobileBackHandler(e) {
    // Ignore taps on input
    if (e.target === input) return;

    // If typing → finish text
    if (isTyping) {
      skipTyping();
      return;
    }

    // Otherwise go home
    showMenu();
    input.focus();
  }

  if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    document.addEventListener("touchstart", mobileBackHandler, { passive: true });
  }

});
