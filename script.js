
/* ===========================
    THEME TOGGLER
=========================== */


const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

menuBtn.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});



const toggle = document.getElementById("toggle");
const body = document.body;

const savedTheme = localStorage.getItem("theme");
if (savedTheme) body.className = savedTheme;

toggle.addEventListener("click", () => {
  body.classList.toggle("light");
  body.classList.toggle("dark");

  toggle.textContent = body.classList.contains("dark") ? "🌙" : "☀️";

  localStorage.setItem(
    "theme",
    body.classList.contains("dark") ? "dark" : "light"
  );
});






/* ===========================
   HERO BUBBLE FLOW ANIMATION
=========================== */

const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");

let bubbles = [];
let bubbleCount = 35;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = document.getElementById("home").offsetHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

class Bubble {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + Math.random() * 100;
    this.radius = Math.random() * 6 + 2;
    this.speed = Math.random() * 0.8 + 0.4;
    this.opacity = Math.random() * 0.4 + 0.2;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 122, 162, ${this.opacity})`;
    ctx.fill();
  }

  update() {
    this.y -= this.speed;

    if (this.y + this.radius < 0) {
      this.reset();
    }
  }
}

function initBubbles() {
  bubbles = [];
  for (let i = 0; i < bubbleCount; i++) {
    bubbles.push(new Bubble());
  }
}

let animationId;

function animateBubbles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  bubbles.forEach(bubble => {
    bubble.update();
    bubble.draw();
  });
  animationId = requestAnimationFrame(animateBubbles);
}


initBubbles();
animateBubbles();


document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    cancelAnimationFrame(animationId);
  } else {
    animateBubbles();
  }
});


/* ===========================
   CONTACT FORM HANDLING
=========================== */


document.querySelector(".contact-form").addEventListener("submit", e => {
  e.preventDefault();
  alert("Thank you! Your message has been sent.");
  e.target.reset();
});
