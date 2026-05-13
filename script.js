// --- UI Interactions ---

// Scroll Progress
window.addEventListener("scroll", () => {
  const winScroll =
    document.body.scrollTop || document.documentElement.scrollTop;
  const height =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;
  const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
  document.getElementById("scrollProgress").style.width = scrolled + "%";
});

// Music Controller
let audio = null;
const musicBtn = document.getElementById("musicToggle");
const musicIcon = document.getElementById("musicIcon");

musicBtn.addEventListener("click", () => {
  // Lazy load only on first click
  if (!audio) {
    audio = new Audio("assets/music/music.mp3");
    audio.loop = true;
    audio.volume = 0.5;

    audio.addEventListener(
      "ended",
      function () {
        this.currentTime = 0;
        this.play();
      },
      false,
    );
  }

  // Check the actual state of the audio element instead of tracking boolean
  if (audio.paused) {
    audio
      .play()
      .then(() => {
        musicBtn.classList.add("playing");
        musicIcon.className = "ph-fill ph-speaker-high";
        musicBtn.setAttribute("title", "Pause Music");
      })
      .catch((err) => {
        console.error("Audio playback failed.", err);
      });
  } else {
    audio.pause();
    musicBtn.classList.remove("playing");
    musicIcon.className = "ph-fill ph-music-note";
    musicBtn.setAttribute("title", "Play Music");
  }
});

// Tech Ticker Loop
const tickerContainer = document.getElementById("tech-ticker-container");
if (tickerContainer) {
  const clone = tickerContainer.innerHTML;
  tickerContainer.innerHTML += clone;
}

// Custom Cursor
const cursorDot = document.querySelector("[data-cursor-dot]");
const cursorOutline = document.querySelector("[data-cursor-outline]");

if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  window.addEventListener("mousemove", (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    cursorOutline.animate(
      {
        left: `${posX}px`,
        top: `${posY}px`,
      },
      { duration: 400, fill: "forwards" },
    );
  });

  const interactables = document.querySelectorAll(
    "a, button, .grid-item, .navbar-toggler, input",
  );
  interactables.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      cursorOutline.style.width = "60px";
      cursorOutline.style.height = "60px";
      cursorOutline.style.backgroundColor = "rgba(0, 243, 255, 0.1)";
      cursorOutline.style.borderColor = "var(--primary)";
    });
    el.addEventListener("mouseleave", () => {
      cursorOutline.style.width = "40px";
      cursorOutline.style.height = "40px";
      cursorOutline.style.backgroundColor = "transparent";
      cursorOutline.style.borderColor = "rgba(0, 243, 255, 0.4)";
    });
  });
}

// Packery Grid
window.onload = function () {
  const grid = document.querySelector(".grid");

  if (grid) {
    const pckry = new Packery(grid, {
      itemSelector: ".grid-item",
      columnWidth: ".grid-item",
      percentPosition: true,
      transitionDuration: "0.4s",
    });

    const items = grid.querySelectorAll(".grid-item");
    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      let draggie = new Draggabilly(item);
      pckry.bindDraggabillyEvents(draggie);
    }

    pckry.on("layoutComplete", function () {
      grid.classList.add("loaded");
    });
    pckry.layout();
  }
};

// Scrollspy
const sections = document.querySelectorAll("section, header, footer");
const navLinks = document.querySelectorAll(".nav-link");

window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (window.scrollY >= sectionTop - sectionHeight / 3) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((a) => {
    a.classList.remove("active");
    if (a.getAttribute("href").includes(current)) {
      a.classList.add("active");
    }
  });
});

// --- Fun Stuff: Click Ripples ---
document.addEventListener("click", function (e) {
  // Avoid rippling on interactive elements
  if (
    e.target.closest("button") ||
    e.target.closest("a") ||
    e.target.closest("#terminal-container")
  )
    return;

  const ripple = document.createElement("div");
  ripple.className = "click-ripple";

  const size = 60;
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${e.pageX - size / 2}px`;
  ripple.style.top = `${e.pageY - size / 2}px`;

  document.body.appendChild(ripple);

  setTimeout(() => ripple.remove(), 600);
});

// --- Fun Stuff: Dynamic Page Title ---
let originalTitle = document.title;
window.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    document.title = "Hey, come back! 😭";
  } else {
    document.title = originalTitle;
  }
});

// --- Fun Stuff: Konami Code ---
const konamiCode = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];
let konamiIndex = 0;
document.addEventListener("keydown", (e) => {
  if (
    e.key === konamiCode[konamiIndex] ||
    e.key.toLowerCase() === konamiCode[konamiIndex]
  ) {
    konamiIndex++;
    if (konamiIndex === konamiCode.length) {
      konamiIndex = 0;
      document.body.style.filter = "hue-rotate(90deg) contrast(1.2)";
      const btn = document.querySelector(".btn-primary-custom");
      const oldText = btn ? btn.innerHTML : "";
      if (btn) btn.innerHTML = "CHEAT MODE ACTIVATED";

      setTimeout(() => {
        document.body.style.filter = "none";
        if (btn) btn.innerHTML = oldText;
      }, 4000);
    }
  } else {
    konamiIndex = 0;
  }
});
