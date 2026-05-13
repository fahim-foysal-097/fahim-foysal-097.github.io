// ==========================================
// ---      GAMES & TERMINAL LOGIC        ---
// ==========================================

// --- Snake Game Logic ---
const SnakeGame = (function () {
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas ? canvas.getContext("2d") : null;
  const box = 20;
  let snake = [];
  let food = {};
  let score = 0;
  let d;
  let gameLoopId;
  let changingDirection = false;

  if (!canvas) return { init: () => {}, start: () => {}, stop: () => {} };

  function init() {
    document.addEventListener("keydown", direction);

    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        document.getElementById("game-modal").classList.contains("active")
      ) {
        document.getElementById("game-modal").classList.remove("active");
        stop();
      }
    });

    document.getElementById("close-game").addEventListener("click", () => {
      document.getElementById("game-modal").classList.remove("active");
      stop();
    });
  }

  function direction(event) {
    if (!document.getElementById("game-modal").classList.contains("active"))
      return;
    // Prevent default scrolling for arrow keys while playing
    if ([37, 38, 39, 40].includes(event.keyCode)) event.preventDefault();

    if (changingDirection) return;

    if (event.keyCode == 37 && d != "RIGHT") {
      d = "LEFT";
      changingDirection = true;
    } else if (event.keyCode == 38 && d != "DOWN") {
      d = "UP";
      changingDirection = true;
    } else if (event.keyCode == 39 && d != "LEFT") {
      d = "RIGHT";
      changingDirection = true;
    } else if (event.keyCode == 40 && d != "UP") {
      d = "DOWN";
      changingDirection = true;
    }
  }

  function spawnFood() {
    food = {
      x: Math.floor(Math.random() * 19 + 1) * box,
      y: Math.floor(Math.random() * 19 + 1) * box,
    };
  }

  function draw() {
    changingDirection = false;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < snake.length; i++) {
      ctx.fillStyle = i == 0 ? "#00f3ff" : "rgba(0, 243, 255, 0.5)";
      ctx.fillRect(snake[i].x, snake[i].y, box, box);
      ctx.strokeStyle = "#000";
      ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }

    ctx.fillStyle = "#ff0055";
    ctx.fillRect(food.x, food.y, box, box);

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (d == "LEFT") snakeX -= box;
    if (d == "UP") snakeY -= box;
    if (d == "RIGHT") snakeX += box;
    if (d == "DOWN") snakeY += box;

    if (snakeX == food.x && snakeY == food.y) {
      score++;
      spawnFood();
    } else {
      snake.pop();
    }

    let newHead = { x: snakeX, y: snakeY };

    if (
      snakeX < 0 ||
      snakeX >= canvas.width ||
      snakeY < 0 ||
      snakeY >= canvas.height ||
      collision(newHead, snake)
    ) {
      clearInterval(gameLoopId);
      ctx.fillStyle = "white";
      ctx.font = "24px 'Fira Code', monospace";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
      ctx.font = "16px 'Fira Code', monospace";
      ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 + 30);
      return;
    }

    snake.unshift(newHead);

    ctx.fillStyle = "white";
    ctx.font = "16px monospace";
    ctx.textAlign = "left";
    ctx.fillText("Score: " + score, box, 1.5 * box);
  }

  function collision(head, array) {
    for (let i = 0; i < array.length; i++) {
      if (head.x == array[i].x && head.y == array[i].y) return true;
    }
    return false;
  }

  function start() {
    snake = [];
    snake[0] = { x: 9 * box, y: 10 * box };
    score = 0;
    d = null;
    spawnFood();
    if (gameLoopId) clearInterval(gameLoopId);
    gameLoopId = setInterval(draw, 100);
  }

  function stop() {
    if (gameLoopId) clearInterval(gameLoopId);
  }

  return { init, start, stop };
})();

SnakeGame.init();

// --- Terminal Game Logic ---
const TerminalGame = (function () {
  const outputDiv = document.getElementById("terminal-output");
  const inputField = document.getElementById("cmd-input");
  const container = document.getElementById("terminal-container");

  // Game State
  let currentRoom = "start";
  let inventory = [];
  let commandHistory = [];
  let historyIndex = 0;

  // Map Data
  const map = {
    start: {
      description:
        "You are in a dark server room. Servers hum quietly. There is a door to the 'north'.",
      exits: { north: "hallway" },
      items: ["usb_drive"],
    },
    hallway: {
      description:
        "A brightly lit hallway. Doors lead 'south' back to the server room and 'east' to an office.",
      exits: { south: "start", east: "office" },
      items: [],
    },
    office: {
      description:
        "A messy office. There's a computer terminal here. The hallway is to the 'west'.",
      exits: { west: "hallway" },
      items: ["keycard"],
    },
  };

  const print = (text, className = "") => {
    const div = document.createElement("div");
    div.className = `terminal-output ${className}`;
    div.innerHTML = text;
    outputDiv.appendChild(div);
    container.scrollTop = container.scrollHeight;
  };

  const handleCommand = (cmdStr) => {
    const fullCmd = cmdStr.trim().toLowerCase();
    const args = fullCmd.split(/\s+/);
    const command = args[0];

    if (!command) return;

    print(`guest@fahim:~$ ${cmdStr}`);

    // Easter eggs
    if (
      fullCmd === "sudo rm -rf /" ||
      fullCmd === "sudo rm -rf /*" ||
      fullCmd === "rm -rf /"
    ) {
      print("WARNING: Root privileges escalated.", "error");
      print("Initiating system purge...", "error");

      let count = 0;
      const deleteInterval = setInterval(() => {
        const files = [
          "/boot/vmlinuz",
          "/etc/passwd",
          "/var/log/syslog",
          "/home/guest/secrets.txt",
          "System32... wait wrong OS",
        ];
        if (count < files.length) {
          print(`Deleting ${files[count]}... [OK]`, "warning");
          count++;
        } else {
          clearInterval(deleteInterval);
          document.getElementById("matrix-canvas").classList.add("active");
          if (!window.matrixInterval) startMatrix();
          print("Critical Failure. Entering the Matrix.", "success");
        }
      }, 600);
      return;
    }

    if (fullCmd === "do a barrel roll") {
      document.body.classList.add("spin-animation");
      setTimeout(() => document.body.classList.remove("spin-animation"), 2000);
      print("Wheeeeeee!", "success");
      return;
    }

    switch (command) {
      case "help":
        print("Available commands:");
        print("  look        - Inspect current surroundings");
        print("  go [dir]    - Move (north, south, east, west)");
        print("  take [item] - Pick up an item");
        print("  inventory   - Check carried items");
        print("  clear       - Clear terminal");
        print("  whoami      - Display user info");
        print("  neofetch    - Display system info");
        print("  hack        - [TARGET] Initiate bypass");
        print("  game        - Launch secret game module");
        print("  matrix      - Toggle visual interface");
        print("  sudo        - Execute as superuser");
        print("");
        print("--- SECRETS & HINTS ---", "warning");
        print(" * Try standard linux commands like 'ls' or 'cat'.", "info");
        print(" * What happens if you try to delete everything?", "info");
        print(" * Want a spin? Tell me to 'do a barrel roll'.", "info");
        print(
          " * Use your keyboard keys: Up Up Down Down Left Right Left Right B A",
          "info",
        );
        break;

      case "game":
        print("Launching secret SNAKE.EXE module...", "success");
        document.getElementById("game-modal").classList.add("active");
        SnakeGame.start();
        break;

      case "look":
        print(map[currentRoom].description, "info");
        if (map[currentRoom].items.length > 0) {
          print(`You see: ${map[currentRoom].items.join(", ")}`, "warning");
        }
        break;

      case "go":
        const dir = args[1];
        if (!dir) {
          print("Go where? (e.g., 'go north')", "error");
        } else if (map[currentRoom].exits[dir]) {
          currentRoom = map[currentRoom].exits[dir];
          print(`Moving ${dir}...`);
          handleCommand("look");
        } else {
          print("You can't go that way.", "error");
        }
        break;

      case "take":
        const item = args[1];
        if (!item) {
          print("Take what?", "error");
        } else if (map[currentRoom].items.includes(item)) {
          inventory.push(item);
          map[currentRoom].items = map[currentRoom].items.filter(
            (i) => i !== item,
          );
          print(`Picked up ${item}.`, "success");
        } else {
          print("I don't see that here.", "error");
        }
        break;

      case "inventory":
        if (inventory.length === 0) {
          print("You are not carrying anything.");
        } else {
          print(`Inventory: ${inventory.join(", ")}`, "info");
        }
        break;

      case "clear":
        outputDiv.innerHTML = "";
        break;

      case "whoami":
        print("╭──────────────────────────────────────────╮", "info");
        print("│ NAME: Fahim Foysal                       │", "success");
        print("│ ROLE: Developer & Problem Solver         │", "success");
        print("│ CODE: C, Python, Flutter, JS/TS, Bash    │", "warning");
        print("│ STATUS: Building the future...           │", "info");
        print("╰──────────────────────────────────────────╯", "info");
        break;

      case "neofetch":
        const art = `<span style="color: var(--primary);">      ██████      </span> guest@fahim-os
<span style="color: var(--primary);">    ██      ██    </span> ------------
<span style="color: var(--primary);">   ██        ██   </span> OS: Quantum Linux x86_64
<span style="color: var(--primary);">   ██        ██   </span> Host: Zero
<span style="color: var(--primary);">   ██        ██   </span> Kernel: 6.9.1-zen
<span style="color: var(--primary);">   ██        ██   </span> Uptime: 1337 days
<span style="color: var(--primary);">    ██      ██    </span> Packages: 404 (not found)
<span style="color: var(--primary);">      ██████      </span> Shell: zsh 5.9`;
        print(art);
        break;

      case "hack":
        const target = args[1] || "the mainframe";
        print(`Connecting to ${target}...`, "info");
        setTimeout(() => print("Bypassing firewalls...", "warning"), 1000);
        setTimeout(() => print("Injecting SQL payloads...", "warning"), 2000);
        setTimeout(
          () => print(`Access granted to ${target}. We're in.`, "success"),
          3000,
        );
        break;

      case "matrix":
        const cvs = document.getElementById("matrix-canvas");
        if (cvs.classList.contains("active")) {
          cvs.classList.remove("active");
          print("Matrix effect disabled.", "info");
        } else {
          cvs.classList.add("active");
          if (!window.matrixInterval) startMatrix();
          print("Matrix effect enabled. Follow the white rabbit.", "success");
        }
        break;

      case "sudo":
        print("Nice try. This incident will be reported.", "error");
        document.body.style.transform = "translate(2px, 2px)";
        setTimeout(() => (document.body.style.transform = "none"), 100);
        break;

      case "ls":
        print("total 42");
        print("drwxr-xr-x 2 root root 4096 Jan 1 1970 secrets");
        print("-rw-r--r-- 1 user user   42 May 13 03:39 readme.txt");
        break;

      case "cat":
        if (args[1] === "readme.txt") {
          print(
            "Welcome to my portfolio! Hope you like the terminal.",
            "success",
          );
        } else if (args[1] === "secrets") {
          print("cat: secrets: Is a directory", "error");
        } else {
          print(`cat: ${args[1] || ""}: No such file or directory`, "error");
        }
        break;

      default:
        print(
          `Command not found: ${command}. Type 'help' for a list of commands.`,
          "error",
        );
    }
  };

  inputField.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      const cmd = this.value;
      this.value = "";
      if (cmd.trim() !== "") {
        commandHistory.push(cmd);
        historyIndex = commandHistory.length;
      }
      handleCommand(cmd);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        this.value = commandHistory[historyIndex];
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        this.value = commandHistory[historyIndex];
      } else if (historyIndex === commandHistory.length - 1) {
        historyIndex++;
        this.value = "";
      }
    }
  });

  container.addEventListener("click", function (e) {
    // Only focus if the user isn't actively highlighting text
    if (window.getSelection().toString() === "") {
      inputField.focus();
    }
  });

  return {
    init: () => {
      // Initialization done via HTML markup
    },
  };
})();

TerminalGame.init();

// --- Matrix Rain Effect ---
function startMatrix() {
  const canvas = document.getElementById("matrix-canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const letters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%""\'#&_(),.;:?!\\|{}<>[]^~';
  const fontSize = 16;
  const columns = canvas.width / fontSize;

  const drops = [];
  for (let x = 0; x < columns; x++) {
    drops[x] = 1;
  }

  window.matrixInterval = setInterval(() => {
    ctx.fillStyle = "rgba(5, 5, 5, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#0F0"; // Terminal Green
    ctx.font = fontSize + "px monospace";

    for (let i = 0; i < drops.length; i++) {
      const text = letters.charAt(Math.floor(Math.random() * letters.length));
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }, 33);

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const newColumns = canvas.width / fontSize;
    for (let x = drops.length; x < newColumns; x++) {
      drops[x] = 1;
    }
  });
}
