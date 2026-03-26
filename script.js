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
  function typeText(text, speed = 10, targetElement = output) {
    if (typingTimeout) clearTimeout(typingTimeout);

    isTyping = true;
    targetElement.textContent = "";
    let i = 0;

    function type() {
      if (i < text.length) {
        targetElement.textContent += text.charAt(i);
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

    if (currentSubject !== null) {
      if (cmd === "back") {
        showMenu();
        return;
      }

      if (essays[currentSubject].includes(cmd)) {
        loadEssay(currentSubject, cmd);
      } else {
        typeText(`Unknown command\n\nType 'back'`);
      }
      return;
    }

    if (cmd === "back") {
      showMenu();
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
  // DISPLAY ESSAY
  // =========================
  function displayEssay(text) {
    output.innerHTML = "";

    const inputLine = createEssayInput();
    output.appendChild(inputLine);

    const essayText = document.createElement("pre");
    output.appendChild(essayText);

    let i = 0;
    isTyping = true;

    function type() {
      if (i < text.length) {
        essayText.textContent += text.charAt(i);
        i++;
        typingTimeout = setTimeout(type, 1);
      } else {
        isTyping = false;
      }
    }

    setTimeout(type, 0);

    setTimeout(() => {
      inputLine.querySelector("input").focus();
    }, 50);
  }

  function createEssayInput() {
    const div = document.createElement("div");
    div.classList.add("inputLineEssay");

    const span = document.createElement("span");
    span.classList.add("prompt");
    span.textContent = "> ";
    div.appendChild(span);

    const inp = document.createElement("input");
    inp.type = "text";
    inp.classList.add("commandInput");
    inp.placeholder = "Type command + ENTER";
    inp.autocomplete = "off";

    inp.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        runCommand(inp.value);
        inp.value = "";
      }
    });

    div.appendChild(inp);
    return div;
  }

  // =========================
  // MENUS (FIXED)
  // =========================
  function showMenu() {
    currentSubject = null;

    output.innerHTML = "";

    const inputLine = createEssayInput();
    output.appendChild(inputLine);

    const textBlock = document.createElement("pre");
    output.appendChild(textBlock);

    typeText(`
PORTFOLIO TERMINAL

Commands:

${Object.keys(essays).join("\n")}

Type 'back' anytime to return here
`, 10, textBlock);

    setTimeout(() => {
      inputLine.querySelector("input").focus();
    }, 50);
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
    }
  });

  // =========================
  // MENU INPUT (kept, but optional now)
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
