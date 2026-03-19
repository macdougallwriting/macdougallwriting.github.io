document.addEventListener("DOMContentLoaded", () => {

  const output = document.getElementById("output");
  const input = document.getElementById("commandInput");
  let essays = {}; // will be loaded from JSON
  let currentSubject = null;

  // Load the index JSON dynamically
  fetch("essays/index.json")
    .then(response => response.json())
    .then(data => {
      essays = data;
      showMenu();
    })
    .catch(err => {
      output.textContent = "Failed to load essays index.";
      console.error(err);
    });

  // Show main menu
  function showMenu() {
    currentSubject = null;
    output.textContent = `
PORTFOLIO TERMINAL

Commands:

${Object.keys(essays).join("\n")}

help
`;
  }

  // Show essay list for a subject
  function showSubjectMenu(subject) {
    currentSubject = subject;
    const list = essays[subject].join("\n- ");
    output.textContent = `
${subject.toUpperCase()} ESSAYS

Type one of the following to view the essay:

- ${list}

Type 'help' to return
`;
  }
function typeText(text, speed = 10) {
  output.textContent = "";
  let i = 0;

  function type() {
    if (i < text.length) {
      output.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }

  type();
}
  // Load essay
  function loadEssay(subject, essayName) {
    output.textContent = "Loading...\n";

    const filePath = `essays/${subject}/${essayName}.txt`;

    fetch(filePath)
      .then(response => {
        if (!response.ok) throw new Error("File not found");
        return response.text();
      })
      .then(text => {
        output.textContent = text + "\n\nType help to return";
      })
      .catch(err => {
        output.textContent = `Essay not found: ${subject} ${essayName}\n\nType help`;
        console.error(err);
      });
  }

  // Handle commands
  function runCommand(cmd) {
    if (!cmd) return;

    cmd = cmd.toLowerCase().trim();

    if (cmd === "help") {
      showMenu();
      return;
    }

    // Second-level menu
    if (currentSubject) {
      if (essays[currentSubject].includes(cmd)) {
        loadEssay(currentSubject, cmd);
      } else {
        output.textContent = `Invalid essay for ${currentSubject}: ${cmd}\n\nType help to return`;
      }
      return;
    }

    // Main menu
    if (essays.hasOwnProperty(cmd)) {
      showSubjectMenu(cmd);
    } else {
      output.textContent = `Invalid command: ${cmd}\n\nType help to return`;
    }
  }

  // Listen for Enter key
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      runCommand(input.value);
      input.value = "";
    }
  });

});







