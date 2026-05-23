

const toggle = document.getElementById("toggle");
const body = document.body;

const savedTheme = localStorage.getItem("portfolio-theme") || "dark";
body.classList.remove("light", "dark");
body.classList.add(savedTheme);

let initVisits = localStorage.getItem("portfolio-visits");
if (!initVisits) {
  initVisits = 1280;
}
localStorage.setItem("portfolio-visits", parseInt(initVisits, 10) + 1);

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

  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      toggleMobileMenu(false);
    });
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav") && navLinks.classList.contains("active")) {
      toggleMobileMenu(false);
    }
  });
}

const canvas = document.getElementById("bubbleCanvas");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 80;
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
const particleCount = 2000;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const initialPositions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount * 3; i += 3) {
  const x = (Math.random() - 0.5) * 160;
  const y = (Math.random() - 0.5) * 160;
  const z = (Math.random() - 0.5) * 100;
  positions[i] = x;
  positions[i+1] = y;
  positions[i+2] = z;
  initialPositions[i] = x;
  initialPositions[i+1] = y;
  initialPositions[i+2] = z;
}
geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
const material = new THREE.PointsMaterial({
  size: 1.6,
  color: 0xff7aa2,
  transparent: true,
  opacity: 0.55,
  blending: THREE.NormalBlending,
  depthWrite: false
});
const particlesMesh = new THREE.Points(geometry, material);
scene.add(particlesMesh);
let mouse3D = { x: 0, y: 0, targetX: 0, targetY: 0 };
window.addEventListener("mousemove", (event) => {
  mouse3D.targetX = (event.clientX / window.innerWidth) * 2 - 1;
  mouse3D.targetY = -(event.clientY / window.innerHeight) * 2 + 1;
});
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
let clock = new THREE.Clock();
function animateParticles() {
  const isLight = document.body.classList.contains("light");
  const targetColor = isLight ? 0xd81b60 : 0xff7aa2;
  if (material.color.getHex() !== targetColor) {
    material.color.setHex(targetColor);
    material.opacity = isLight ? 0.45 : 0.55;
  }
  const elapsedTime = clock.getElapsedTime();
  const positionAttr = geometry.attributes.position;
  const array = positionAttr.array;
  mouse3D.x += (mouse3D.targetX - mouse3D.x) * 0.05;
  mouse3D.y += (mouse3D.targetY - mouse3D.y) * 0.05;
  let currentScroll = window.scrollY || 0;
  for (let i = 0; i < particleCount; i++) {
    const idx = i * 3;
    const initX = initialPositions[idx];
    const initY = initialPositions[idx+1];
    const initZ = initialPositions[idx+2];
    let waveX = Math.sin(elapsedTime * 0.4 + initY * 0.08) * 2.2;
    let waveY = Math.cos(elapsedTime * 0.4 + initX * 0.08) * 2.2;
    initialPositions[idx+1] += 0.035;
    if (initialPositions[idx+1] > 80) {
      initialPositions[idx+1] = -80;
    }
    let x = initX + waveX;
    let y = initY + waveY - (currentScroll * 0.035);
    let z = initZ;
    const mX3D = mouse3D.x * 60;
    const mY3D = mouse3D.y * 40;
    let dx = x - mX3D;
    let dy = y - mY3D;
    let dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 18) {
      let force = (18 - dist) / 18;
      x += (dx / dist) * force * 7.5;
      y += (dy / dist) * force * 7.5;
    }
    array[idx] = x;
    array[idx+1] = y;
    array[idx+2] = z;
  }
  positionAttr.needsUpdate = true;
  particlesMesh.rotation.y = elapsedTime * 0.015;
  renderer.render(scene, camera);
  requestAnimationFrame(animateParticles);
}
animateParticles();

const inquiryModal = document.getElementById("inquiryModal");
const modalProjectName = document.getElementById("modalProjectName");
const inquiryForm = document.getElementById("inquiryForm");
const closeModal = document.getElementById("closeModal");

document.querySelectorAll(".inquire-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const project = btn.getAttribute("data-project");
    modalProjectName.textContent = project;
    inquiryModal.classList.add("active");
    inquiryModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  });
});

const hideModal = () => {
  inquiryModal.classList.remove("active");
  inquiryModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  inquiryForm.reset();
};

if (closeModal) closeModal.addEventListener("click", hideModal);

if (inquiryModal) {
  inquiryModal.addEventListener("click", (e) => {
    if (e.target === inquiryModal) hideModal();
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && inquiryModal.classList.contains("active")) {
    hideModal();
  }
});

if (inquiryForm) {
  inquiryForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const submitBtn = inquiryForm.querySelector(".submit-btn");
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Sending Inquiry...`;

    const clientName = document.getElementById("clientName").value.trim();
    const project = modalProjectName.textContent;
    const inquirySelect = document.getElementById("inquiryType");
    const inquiryTypeText = inquirySelect.options[inquirySelect.selectedIndex].text;
    const clientMsg = document.getElementById("clientMsg").value.trim();

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

        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
      });
  });
}

function showToast(message, type = "success") {
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

  toast.offsetHeight;

  toast.style.opacity = "1";
  toast.style.transform = "translateY(0)";

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-20px)";
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 4000);
}



const statsSection = document.querySelector(".stats-container");
const counters = document.querySelectorAll(".stat-number");

if (statsSection && counters.length > 0) {
  const precalculateStats = () => {
    counters.forEach(counter => {
      const statBox = counter.closest(".stat-box");
      if (!statBox) return;
      const labelElement = statBox.querySelector(".stat-label");
      if (!labelElement) return;
      const label = labelElement.textContent.toLowerCase();

      if (label.includes("projects")) {
        const count = document.querySelectorAll(".project").length;
        counter.setAttribute("data-target", count || 6);
      } else if (label.includes("tech stack") || label.includes("modules")) {
        const skillChips = document.querySelectorAll(".chips span");
        const uniqueChips = new Set();
        skillChips.forEach(chip => {
          const text = chip.textContent.trim().toLowerCase();
          if (text) uniqueChips.add(text);
        });
        counter.setAttribute("data-target", uniqueChips.size || 14);
      } else if (label.includes("seo") || label.includes("a11y")) {
        const images = document.querySelectorAll("img");
        let validImages = 0;
        images.forEach(img => {
          if (img.getAttribute("alt") && img.getAttribute("alt").trim().length > 0) {
            validImages++;
          }
        });

        const anchors = document.querySelectorAll('a[target="_blank"]');
        let secureAnchors = 0;
        anchors.forEach(a => {
          const rel = a.getAttribute("rel") || "";
          if (rel.includes("noopener") && rel.includes("noreferrer")) {
            secureAnchors++;
          }
        });

        const imgRatio = images.length > 0 ? (validImages / images.length) : 1;
        const anchorRatio = anchors.length > 0 ? (secureAnchors / anchors.length) : 1;
        const calculatedScore = Math.round(((imgRatio + anchorRatio) / 2) * 100);
        counter.setAttribute("data-target", calculatedScore || 100);
      } else if (label.includes("visits")) {
        let visits = localStorage.getItem("portfolio-visits");
        if (!visits) {
          visits = 1280;
        }
        counter.setAttribute("data-target", parseInt(visits, 10));
      } else if (label.includes("appreciations")) {
        let likes = localStorage.getItem("portfolio-likes");
        if (!likes) {
          likes = 326;
          localStorage.setItem("portfolio-likes", likes);
        }
        counter.setAttribute("data-target", parseInt(likes, 10));
      }
    });
  };

  const runCounters = () => {
    precalculateStats();
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute("data-target"), 10);
      if (isNaN(target)) return;
      const statBox = counter.closest(".stat-box");
      const labelEl = statBox ? statBox.querySelector(".stat-label") : null;
      const isSEO = labelEl && (labelEl.textContent.toLowerCase().includes("seo") || labelEl.textContent.toLowerCase().includes("a11y"));
      const suffix = isSEO ? "" : "+";
      const duration = 1600;
      const startTime = performance.now();
      const animate = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const easeProgress = progress * (2 - progress);
        const currentValue = Math.floor(easeProgress * target);
        counter.textContent = currentValue + suffix;
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          counter.textContent = target + suffix;
        }
      };
      requestAnimationFrame(animate);
    });
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        runCounters();
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.25
  });

  observer.observe(statsSection);
}

const likeBtn = document.getElementById("likeBtn");
if (likeBtn) {
  likeBtn.addEventListener("click", () => {
    let likes = parseInt(localStorage.getItem("portfolio-likes") || "326", 10);
    likes++;
    localStorage.setItem("portfolio-likes", likes);

    const likeCounter = document.getElementById("likeCounter");
    if (likeCounter) {
      likeCounter.setAttribute("data-target", likes);
      likeCounter.textContent = likes + "+";
    }

    likeBtn.classList.add("liked");
    setTimeout(() => {
      likeBtn.classList.remove("liked");
    }, 400);

    const statBox = likeBtn.closest(".stat-box");
    for (let i = 0; i < 4; i++) {
      const heart = document.createElement("span");
      heart.className = "floating-heart";
      heart.textContent = "❤️";

      const xOffset = Math.random() * 30 - 15;
      const yOffset = Math.random() * 10 - 5;
      const rot = Math.random() * 40 - 20;

      heart.style.left = `${likeBtn.offsetLeft + likeBtn.offsetWidth / 2 + xOffset}px`;
      heart.style.top = `${likeBtn.offsetTop + yOffset}px`;
      heart.style.setProperty("--rot", `${rot}deg`);

      if (statBox) {
        statBox.appendChild(heart);
        setTimeout(() => {
          heart.remove();
        }, 800);
      }
    }
  });
}

const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: "vertical",
  gestureOrientation: "vertical",
  smoothWheel: true,
  wheelMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false
});
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

gsap.registerPlugin(ScrollTrigger);
lenis.on("scroll", ScrollTrigger.update);

gsap.from(".role", {
  opacity: 0,
  y: -30,
  duration: 1,
  ease: "power3.out",
  delay: 0.2
});
gsap.from(".drop-text span", {
  opacity: 0,
  y: 50,
  stagger: 0.1,
  duration: 1.2,
  ease: "power4.out",
  delay: 0.4
});
gsap.from(".desc", {
  opacity: 0,
  y: 30,
  duration: 1,
  ease: "power3.out",
  delay: 0.8
});
gsap.from(".hero-btns a", {
  opacity: 0,
  scale: 0.9,
  stagger: 0.15,
  duration: 0.8,
  ease: "back.out(1.7)",
  delay: 1
});
gsap.from(".social-links-grid a", {
  opacity: 0,
  scale: 0.8,
  stagger: 0.1,
  duration: 0.8,
  ease: "back.out(1.7)",
  delay: 1.2,
  clearProps: "transform,opacity"
});
gsap.from("#about > *", {
  scrollTrigger: {
    trigger: "#about",
    start: "top 85%",
    toggleActions: "play none none none"
  },
  opacity: 0,
  y: 40,
  stagger: 0.12,
  duration: 1,
  ease: "power3.out"
});
gsap.from(".project", {
  scrollTrigger: {
    trigger: ".project-grid",
    start: "top 85%",
    toggleActions: "play none none none"
  },
  opacity: 0,
  y: 50,
  scale: 0.96,
  stagger: 0.15,
  duration: 1.2,
  ease: "power3.out",
  clearProps: "transform"
});
gsap.from(".info-card", {
  scrollTrigger: {
    trigger: ".contact-grid-info",
    start: "top 85%",
    toggleActions: "play none none none"
  },
  opacity: 0,
  y: 40,
  stagger: 0.15,
  duration: 1,
  ease: "power3.out",
  clearProps: "transform"
});


document.querySelectorAll(".project").forEach(card => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const percentX = (x - centerX) / centerX;
    const percentY = (y - centerY) / centerY;
    gsap.to(card, {
      rotationY: percentX * 8,
      rotationX: -percentY * 8,
      y: -8,
      transformPerspective: 1000,
      ease: "power1.out",
      duration: 0.3
    });
  });
  card.addEventListener("mouseleave", () => {
    gsap.to(card, {
      rotationY: 0,
      rotationX: 0,
      y: 0,
      ease: "power3.out",
      duration: 0.8
    });
  });
});

document.querySelectorAll(".menu-btn, #likeBtn, .social-links-grid a, .nav nav a").forEach(btn => {
  btn.addEventListener("mousemove", (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(btn, {
      x: x * 0.35,
      y: y * 0.35,
      ease: "power1.out",
      duration: 0.3
    });
  });
  btn.addEventListener("mouseleave", () => {
    gsap.to(btn, {
      x: 0,
      y: 0,
      ease: "elastic.out(1.1, 0.4)",
      duration: 0.8
    });
  });
});

window.addEventListener("load", () => {
  ScrollTrigger.refresh();
});

