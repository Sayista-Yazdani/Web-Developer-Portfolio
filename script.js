
/* ===========================
    THEME TOGGLER & PERSISTENCE
=========================== */
const toggle = document.getElementById("toggle");
const body = document.body;

// Load saved theme or default to system dark preference
const savedTheme = localStorage.getItem("portfolio-theme") || "dark";
body.classList.remove("light", "dark");
body.classList.add(savedTheme);

if (toggle) {
  toggle.textContent = savedTheme === "dark" ? "🌙" : "☀️";

  toggle.addEventListener("click", () => {
    const isCurrentlyDark = body.classList.contains("dark");
    const newTheme = isCurrentlyDark ? "light" : "dark";
    
    body.classList.replace(isCurrentlyDark ? "dark" : "light", newTheme);
    localStorage.setItem("portfolio-theme", newTheme);
    toggle.textContent = newTheme === "dark" ? "🌙" : "☀️";
  });
}


/* ===========================
    MOBILE NAV CONTROLLER
=========================== */
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

const toggleMobileMenu = (forceState) => {
  const willBeActive = typeof forceState === "boolean" ? forceState : !navLinks.classList.contains("active");
  navLinks.classList.toggle("active", willBeActive);
  menuBtn.setAttribute("aria-expanded", willBeActive ? "true" : "false");
};

if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMobileMenu();
  });

  // Collapse menu automatically when clicking any link
  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      toggleMobileMenu(false);
    });
  });

  // Close menu if user clicks outside the header bar
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav") && navLinks.classList.contains("active")) {
      toggleMobileMenu(false);
    }
  });
}


/* ===========================
   HERO BUBBLE FLOW ANIMATION (Retina-Crisp & Debounced)
=========================== */
const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");

let bubbles = [];
let bubbleCount = 45;

let mouse = {
  x: null,
  y: null,
  radius: 120 // Interaction circle
};

window.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = event.clientX - rect.left;
  mouse.y = event.clientY - rect.top;
});

window.addEventListener("mouseleave", () => {
  mouse.x = null;
  mouse.y = null;
});

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const homeSection = document.getElementById("home");
  const logicalWidth = window.innerWidth;
  const logicalHeight = homeSection ? homeSection.offsetHeight : 500;

  // Scale backing store coordinates to match screen quality
  canvas.width = logicalWidth * dpr;
  canvas.height = logicalHeight * dpr;

  // Scale back visual sizing with CSS
  canvas.style.width = `${logicalWidth}px`;
  canvas.style.height = `${logicalHeight}px`;

  ctx.resetTransform();
  ctx.scale(dpr, dpr);
}

// Debounced Window Resize Handler for Fluid Performance
let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    resizeCanvas();
  }, 150);
});

resizeCanvas();

class Bubble {
  constructor() {
    this.reset();
  }

  reset() {
    const dpr = window.devicePixelRatio || 1;
    const logicalWidth = canvas.width / dpr;
    const logicalHeight = canvas.height / dpr;

    this.x = Math.random() * logicalWidth;
    this.y = logicalHeight + Math.random() * 100;
    this.radius = Math.random() * 5 + 2;
    this.baseSpeed = Math.random() * 0.7 + 0.3;
    this.speed = this.baseSpeed;
    this.opacity = Math.random() * 0.35 + 0.15;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 122, 162, ${this.opacity})`;
    ctx.fill();
  }

  update() {
    this.y -= this.speed;
    const dpr = window.devicePixelRatio || 1;
    const logicalWidth = canvas.width / dpr;

    // Interactive repulsion engine
    if (mouse.x !== null && mouse.y !== null) {
      let dx = this.x - mouse.x;
      let dy = this.y - mouse.y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < mouse.radius) {
        let force = (mouse.radius - distance) / mouse.radius;
        let directionX = dx / distance;
        let directionY = dy / distance;

        // Smooth physics-based deflection
        this.x += directionX * force * 3;
        this.y += directionY * force * 3;
      }
    }

    if (this.y + this.radius < 0 || this.x < 0 || this.x > logicalWidth) {
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
  const dpr = window.devicePixelRatio || 1;
  const logicalWidth = canvas.width / dpr;
  const logicalHeight = canvas.height / dpr;

  ctx.clearRect(0, 0, logicalWidth, logicalHeight);
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
   INQUIRY MODAL CONTROLLER
=========================== */
const inquiryModal = document.getElementById("inquiryModal");
const modalProjectName = document.getElementById("modalProjectName");
const inquiryForm = document.getElementById("inquiryForm");
const closeModal = document.getElementById("closeModal");

// Open modal on Inquire click
document.querySelectorAll(".inquire-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const project = btn.getAttribute("data-project");
    modalProjectName.textContent = project;
    inquiryModal.classList.add("active");
    inquiryModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden"; // Prevent body scroll
  });
});

// Close modal
const hideModal = () => {
  inquiryModal.classList.remove("active");
  inquiryModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = ""; // Restore body scroll
  inquiryForm.reset();
};

if (closeModal) closeModal.addEventListener("click", hideModal);

// Close on overlay click
if (inquiryModal) {
  inquiryModal.addEventListener("click", (e) => {
    if (e.target === inquiryModal) hideModal();
  });
}

// Close on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && inquiryModal.classList.contains("active")) {
    hideModal();
  }
});

// Form Submission (Generate serverless Web3Forms background API request)
if (inquiryForm) {
  inquiryForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // Get the submit button and show loading state
    const submitBtn = inquiryForm.querySelector(".submit-btn");
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Sending Inquiry...`;
    
    const clientName = document.getElementById("clientName").value.trim();
    const project = modalProjectName.textContent;
    const inquirySelect = document.getElementById("inquiryType");
    const inquiryTypeText = inquirySelect.options[inquirySelect.selectedIndex].text;
    const clientMsg = document.getElementById("clientMsg").value.trim();
    
    // Web3Forms configuration
    const accessKey = "1b27b77f-514c-474f-94b1-61bbe3c3c9ef";
    
    const formData = {
      access_key: accessKey,
      name: clientName,
      subject: `Project Inquiry: ${project} - From ${clientName}`,
      project: project,
      inquiry_type: inquiryTypeText,
      message: clientMsg || "No custom message provided.",
      from_name: "Portfolio Inquiry System"
    };
    
    // Send background POST request
    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(formData)
    })
    .then(async (response) => {
      let json = await response.json();
      if (response.status === 200 || json.success) {
        showToast("Success! Your inquiry has been sent directly to Sayista. 🚀", "success");
        hideModal();
      } else {
        console.log(response);
        showToast(json.message || "Failed to send inquiry! Please check Access Key.", "error");
      }
    })
    .catch((error) => {
      console.log(error);
      showToast("Network error! Please try again later.", "error");
    })
    .finally(() => {
      // Restore button state
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHTML;
    });
  });
}

// Elegant Toast Notification System
function showToast(message, type = "success") {
  // Create toast container if not exists
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.style.position = "fixed";
    container.style.bottom = "24px";
    container.style.right = "24px";
    container.style.zIndex = "9999";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "12px";
    container.style.pointerEvents = "none";
    document.body.appendChild(container);
  }
  
  const toast = document.createElement("div");
  toast.className = `toast-alert ${type}`;
  toast.style.background = type === "success" ? "rgba(25, 135, 84, 0.95)" : "rgba(220, 53, 69, 0.95)";
  toast.style.color = "#fff";
  toast.style.padding = "14px 24px";
  toast.style.borderRadius = "12px";
  toast.style.fontSize = "13.5px";
  toast.style.fontWeight = "500";
  toast.style.boxShadow = "0 10px 30px rgba(0,0,0,0.3)";
  toast.style.backdropFilter = "blur(8px)";
  toast.style.webkitBackdropFilter = "blur(8px)";
  toast.style.opacity = "0";
  toast.style.transform = "translateY(20px)";
  toast.style.transition = "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
  toast.style.pointerEvents = "auto";
  toast.style.display = "flex";
  toast.style.alignItems = "center";
  toast.style.gap = "10px";
  
  toast.innerHTML = `<i class="${type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-triangle-exclamation'}"></i> <span>${message}</span>`;
  
  container.appendChild(toast);
  
  // Trigger animation reflow
  toast.offsetHeight;
  
  toast.style.opacity = "1";
  toast.style.transform = "translateY(0)";
  
  // Auto remove toast
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-20px)";
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 4000);
}


