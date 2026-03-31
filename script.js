document.addEventListener("DOMContentLoaded", () => {
  const output = document.getElementById("output");
  const menuInput = document.getElementById("commandInput");

  let essays = {};
  let currentSubject = null;
  let typingTimeout = null;
  let isTyping = false;

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
    if (!cmd) return;
    cmd = cmd.toLowerCase().trim();

    if (cmd === "back") {
      showMenu();
      return;
    }

    if (currentSubject !== null) {
      if (essays[currentSubject].includes(cmd)) {
        loadEssay(currentSubject, cmd);
      } else {
        typeText(`Unknown command\n\nType 'back'`);
      }
      return;
    }

    if (essays.hasOwnProperty(cmd)) {
      showSubjectMenu(cmd);
    } else {
      typeText(`Unknown command\n\nType 'back'`);
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
        typeText(`Error: file not found\n\nType 'back'`);
      });
  }

  // =========================
  // DISPLAY ESSAY (no top input)
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
  // MENUS
  // =========================
  function showMenu() {
    currentSubject = null;

    typeText(`
PORTFOLIO TERMINAL

Commands:

${Object.keys(essays).join("\n")}

Type 'back' anytime to return here
`);

    menuInput.focus();
  }

  function showSubjectMenu(subject) {
    currentSubject = subject;

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
  // MENU INPUT (ONLY INPUT NOW)
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
