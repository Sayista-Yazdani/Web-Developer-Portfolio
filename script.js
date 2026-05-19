
/* ===========================
    THEME TOGGLER
=========================== */


const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

menuBtn.addEventListener("click", () => {
  const isActive = navLinks.classList.toggle("active");
  menuBtn.setAttribute("aria-expanded", isActive ? "true" : "false");
});



const toggle = document.getElementById("toggle");
const body = document.body;

// Force dark mode on every load and refresh
body.className = "dark";
if (toggle) toggle.textContent = "🌙";

if (toggle) {
  toggle.addEventListener("click", () => {
    body.classList.toggle("light");
    body.classList.toggle("dark");

    toggle.textContent = body.classList.contains("dark") ? "🌙" : "☀️";
  });
}






/* ===========================
   HERO BUBBLE FLOW ANIMATION
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

    if (this.y + this.radius < 0 || this.x < 0 || this.x > canvas.width) {
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


