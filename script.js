(function () {
  "use strict";

  /* --------------------------------------------------------------------------
     Twinkling starfield
     -------------------------------------------------------------------------- */
  const canvas = document.getElementById("starfield");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let stars = [];
  let animationId = null;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function getStarRgb() {
    return (
      getComputedStyle(document.documentElement).getPropertyValue("--star-rgb").trim() ||
      "255, 255, 255"
    );
  }

  function starColor(alpha) {
    return `rgba(${getStarRgb()}, ${alpha})`;
  }

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initStars();
  }

  function initStars() {
    const count = Math.floor((window.innerWidth * window.innerHeight) / 8000);
    stars = Array.from({ length: Math.min(count, 220) }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() > 0.85 ? 2 : 1,
      opacity: Math.random(),
      twinkleSpeed: 0.008 + Math.random() * 0.02,
      twinklePhase: Math.random() * Math.PI * 2,
      driftX: (Math.random() - 0.5) * 0.08,
      driftY: (Math.random() - 0.5) * 0.05,
    }));
  }

  function drawStars() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (const star of stars) {
      star.twinklePhase += star.twinkleSpeed;
      const twinkle = 0.35 + Math.sin(star.twinklePhase) * 0.35;
      const alpha = Math.min(1, star.opacity * twinkle + 0.25);

      if (!prefersReducedMotion) {
        star.x += star.driftX;
        star.y += star.driftY;

        if (star.x < 0) star.x = window.innerWidth;
        if (star.x > window.innerWidth) star.x = 0;
        if (star.y < 0) star.y = window.innerHeight;
        if (star.y > window.innerHeight) star.y = 0;
      }

      ctx.fillStyle = starColor(alpha);
      ctx.fillRect(
        Math.floor(star.x),
        Math.floor(star.y),
        star.size,
        star.size
      );
    }

    animationId = requestAnimationFrame(drawStars);
  }

  resizeCanvas();
  if (!prefersReducedMotion) {
    drawStars();
  } else {
    initStars();
    for (const star of stars) {
      ctx.fillStyle = starColor(0.6);
      ctx.fillRect(Math.floor(star.x), Math.floor(star.y), star.size, star.size);
    }
  }

  window.addEventListener("resize", () => {
    cancelAnimationFrame(animationId);
    resizeCanvas();
    if (!prefersReducedMotion) drawStars();
  });

  /* --------------------------------------------------------------------------
     Autonomous spaceship + dotted trail + hero laser easter egg
     -------------------------------------------------------------------------- */
  const spaceship = document.getElementById("spaceship");
  const trailCanvas = document.getElementById("ship-trail");
  const lasersContainer = document.getElementById("lasers");
  const hero = document.getElementById("hero");

  if (!hero) {
    spaceship && (spaceship.style.display = "none");
    trailCanvas && (trailCanvas.style.display = "none");
  } else {
  const SHIP_COOLDOWN = 10000;
  const SHIP_MARGIN = 64;
  const TRAIL_SPACING = 18;
  const TRAIL_MAX = 12;
  const TRAIL_BRIGHT = 5;

  let trailCtx = null;
  let shipState = "idle";
  let shipX = 0;
  let shipY = 0;
  let trail = [];
  let lastTrailX = 0;
  let lastTrailY = 0;
  let cooldownTimer = null;
  let pathStart = null;
  let pathControl = null;
  let pathEnd = null;
  let pathT = 0;
  let pathDelta = 0;

  function resizeTrailCanvas() {
    if (!trailCanvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    trailCanvas.width = window.innerWidth * dpr;
    trailCanvas.height = window.innerHeight * dpr;
    trailCanvas.style.width = window.innerWidth + "px";
    trailCanvas.style.height = window.innerHeight + "px";
    trailCtx = trailCanvas.getContext("2d");
    trailCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawTrail();
  }

  function drawTrail() {
    if (!trailCtx) return;
    trailCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    const count = trail.length;
    for (let i = 0; i < count; i++) {
      const age = count - 1 - i;
      let opacity;

      if (age < TRAIL_BRIGHT) {
        opacity = 1 - age * 0.08;
      } else {
        opacity = Math.max(0, 0.45 - (age - TRAIL_BRIGHT) * 0.18);
      }

      const point = trail[i];
      trailCtx.fillStyle = starColor(opacity * 0.5);
      trailCtx.fillRect(Math.floor(point.x) - 1, Math.floor(point.y) - 1, 3, 3);
    }
  }

  function randomEdgePoint(margin) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const edge = Math.floor(Math.random() * 4);

    switch (edge) {
      case 0:
        return { x: Math.random() * w, y: -margin };
      case 1:
        return { x: w + margin, y: Math.random() * h };
      case 2:
        return { x: Math.random() * w, y: h + margin };
      default:
        return { x: -margin, y: Math.random() * h };
    }
  }

  function bezierPoint(t) {
    const u = 1 - t;
    return {
      x:
        u * u * pathStart.x +
        2 * u * t * pathControl.x +
        t * t * pathEnd.x,
      y:
        u * u * pathStart.y +
        2 * u * t * pathControl.y +
        t * t * pathEnd.y,
    };
  }

  function bezierTangent(t) {
    const u = 1 - t;
    return {
      x:
        2 * u * (pathControl.x - pathStart.x) +
        2 * t * (pathEnd.x - pathControl.x),
      y:
        2 * u * (pathControl.y - pathStart.y) +
        2 * t * (pathEnd.y - pathControl.y),
    };
  }

  function spawnShip() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    let attempts = 0;

    do {
      pathStart = randomEdgePoint(SHIP_MARGIN);
      pathEnd = randomEdgePoint(SHIP_MARGIN);
      attempts++;
    } while (
      attempts < 20 &&
      Math.hypot(pathEnd.x - pathStart.x, pathEnd.y - pathStart.y) <
        Math.min(w, h) * 0.45
    );

    const midX = (pathStart.x + pathEnd.x) / 2;
    const midY = (pathStart.y + pathEnd.y) / 2;
    const dx = pathEnd.x - pathStart.x;
    const dy = pathEnd.y - pathStart.y;
    const len = Math.hypot(dx, dy) || 1;
    const bend =
      (Math.random() > 0.5 ? 1 : -1) *
      (100 + Math.random() * Math.min(w, h) * 0.22);

    pathControl = {
      x: midX + (-dy / len) * bend,
      y: midY + (dx / len) * bend,
    };

    pathT = 0;
    const speed = 1.1 + Math.random() * 1.4;
    pathDelta = speed / len;

    shipX = pathStart.x;
    shipY = pathStart.y;
    lastTrailX = shipX;
    lastTrailY = shipY;
    trail = [];

    const tangent = bezierTangent(0);
    const angle = Math.atan2(tangent.y, tangent.x) * (180 / Math.PI) + 90;
    spaceship.style.transform = `translate(${shipX}px, ${shipY}px) translate(-50%, -50%) rotate(${angle}deg)`;
    spaceship.classList.add("is-active");
    shipState = "flying";
  }

  function isOffScreen(x, y) {
    return (
      x < -SHIP_MARGIN ||
      x > window.innerWidth + SHIP_MARGIN ||
      y < -SHIP_MARGIN ||
      y > window.innerHeight + SHIP_MARGIN
    );
  }

  function endFlight() {
    shipState = "cooldown";
    spaceship.classList.remove("is-active");
    trail = [];
    drawTrail();

    if (cooldownTimer) clearTimeout(cooldownTimer);
    cooldownTimer = setTimeout(() => {
      cooldownTimer = null;
      spawnShip();
    }, SHIP_COOLDOWN);
  }

  function updateShip() {
    if (shipState === "flying") {
      pathT += pathDelta;

      if (pathT >= 1 || isOffScreen(shipX, shipY)) {
        endFlight();
      } else {
        const pos = bezierPoint(pathT);
        shipX = pos.x;
        shipY = pos.y;

        if (Math.hypot(shipX - lastTrailX, shipY - lastTrailY) >= TRAIL_SPACING) {
          trail.push({ x: shipX, y: shipY });
          if (trail.length > TRAIL_MAX) trail.shift();
          lastTrailX = shipX;
          lastTrailY = shipY;
        }

        const tangent = bezierTangent(pathT);
        const angle = Math.atan2(tangent.y, tangent.x) * (180 / Math.PI) + 90;
        spaceship.style.transform = `translate(${shipX}px, ${shipY}px) translate(-50%, -50%) rotate(${angle}deg)`;
        drawTrail();
      }
    }

    requestAnimationFrame(updateShip);
  }

  function fireLaser(clientX, clientY) {
    if (prefersReducedMotion || shipState !== "flying") return;

    const laser = document.createElement("span");
    laser.className = "laser";
    laser.style.left = clientX - 2 + "px";
    laser.style.top = clientY + "px";

    const angle =
      Math.atan2(clientY - shipY, clientX - shipX) * (180 / Math.PI) + 90;
    laser.style.transform = `rotate(${angle}deg)`;

    lasersContainer.appendChild(laser);
    laser.addEventListener("animationend", () => laser.remove());
  }

  if (!prefersReducedMotion) {
    resizeTrailCanvas();
    window.addEventListener("resize", resizeTrailCanvas);
    setTimeout(spawnShip, 2000 + Math.random() * 4000);
    updateShip();
  } else {
    spaceship.style.display = "none";
    if (trailCanvas) trailCanvas.style.display = "none";
  }

  hero.addEventListener("click", (e) => {
    if (e.target.closest("a, button")) return;
    fireLaser(e.clientX, e.clientY);
  });
  }

  /* --------------------------------------------------------------------------
     Navigation
     -------------------------------------------------------------------------- */
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelectorAll('.site-nav a, a[href^="#"]');

  if (navToggle && header) {
    navToggle.addEventListener("click", () => {
      const isOpen = header.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#") || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
      header?.classList.remove("is-open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });

  /* --------------------------------------------------------------------------
     Scroll reveal (main page only)
     -------------------------------------------------------------------------- */
  if (hero) {
  const revealElements = document.querySelectorAll(
    ".about__bio, .about__skills, .project-card, .contact-link, .section__header"
  );

  revealElements.forEach((el) => el.classList.add("reveal"));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  revealElements.forEach((el) => revealObserver.observe(el));
  }

  window.addEventListener(
    "scroll",
    () => {
      header?.classList.toggle("is-scrolled", window.scrollY > 40);
    },
    { passive: true }
  );

  /* --------------------------------------------------------------------------
     Footer year
     -------------------------------------------------------------------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* --------------------------------------------------------------------------
     Theme relay — orbital eclipse switch
     -------------------------------------------------------------------------- */
  const themeToggle = document.getElementById("theme-toggle");
  const THEME_KEY = "theme";
  const BASE_THEME_KEY = "baseTheme";

  function getTheme() {
    return document.documentElement.getAttribute("data-theme") || "dark";
  }

  function getBaseTheme() {
    const saved = localStorage.getItem(BASE_THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
    const current = getTheme();
    return current === "light" ? "light" : "dark";
  }

  function syncThemeToggle(theme) {
    if (!themeToggle) return;
    const base = theme === "frost" ? getBaseTheme() : theme;
    themeToggle.setAttribute("aria-pressed", base === "light" ? "true" : "false");
    themeToggle.setAttribute(
      "aria-label",
      base === "light"
        ? "Switch to dark theme (void signal)"
        : "Switch to light theme (solar signal)"
    );
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    if (theme === "dark" || theme === "light") {
      localStorage.setItem(BASE_THEME_KEY, theme);
    }
    syncThemeToggle(theme);
  }

  function toggleRelayTheme() {
    if (getTheme() === "frost") {
      applyTheme(getBaseTheme() === "dark" ? "light" : "dark");
      return;
    }
    applyTheme(getTheme() === "dark" ? "light" : "dark");
  }

  function toggleFrost() {
    if (getTheme() === "frost") {
      applyTheme(getBaseTheme());
      return;
    }
    const base = getTheme() === "light" ? "light" : "dark";
    localStorage.setItem(BASE_THEME_KEY, base);
    applyTheme("frost");
  }

  syncThemeToggle(getTheme());

  if (themeToggle) {
    themeToggle.addEventListener("click", toggleRelayTheme);
  }

  function onFrostKey(e) {
    const el = document.activeElement;
    if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) {
      return;
    }
    if (e.key === "v" || e.key === "V") {
      e.preventDefault();
      toggleFrost();
    }
  }

  if (!hero) {
    document.addEventListener("keydown", onFrostKey);
    return;
  }

  /* --------------------------------------------------------------------------
     Command palette & keyboard shortcuts (main page)
     -------------------------------------------------------------------------- */
  const cmdPalette = document.getElementById("cmd-palette");
  const cmdItems = document.querySelectorAll("[data-cmd]");
  let cmdOpen = false;
  let goPending = false;
  let goTimer = null;

  function isTypingTarget() {
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
  }

  function scrollToSection(id) {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
    header?.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
    closeCmdPalette();
  }

  function openCmdPalette() {
    if (!cmdPalette) return;
    cmdPalette.hidden = false;
    cmdOpen = true;
    cmdPalette.querySelector(".cmd-palette__item")?.focus();
  }

  function closeCmdPalette() {
    if (!cmdPalette) return;
    cmdPalette.hidden = true;
    cmdOpen = false;
  }

  function toggleCmdPalette() {
    if (cmdOpen) closeCmdPalette();
    else openCmdPalette();
  }

  function runCommand(cmd) {
    switch (cmd) {
      case "hero":
        scrollToSection("hero");
        break;
      case "about":
        scrollToSection("about");
        break;
      case "projects":
        scrollToSection("projects");
        break;
      case "contact":
        scrollToSection("contact");
        break;
      case "frost":
        toggleFrost();
        closeCmdPalette();
        break;
      default:
        break;
    }
  }

  function handleGoChord(key) {
    const map = {
      h: "hero",
      a: "about",
      p: "projects",
      c: "contact",
    };
    const cmd = map[key];
    if (cmd) {
      runCommand(cmd);
      goPending = false;
      if (goTimer) clearTimeout(goTimer);
    }
  }

  cmdItems.forEach((item) => {
    item.addEventListener("click", () => runCommand(item.dataset.cmd));
  });

  cmdPalette?.querySelector("[data-cmd-close]")?.addEventListener("click", closeCmdPalette);

  document.addEventListener("keydown", (e) => {
    if (isTypingTarget()) return;

    if (e.key === "Escape") {
      if (cmdOpen) {
        e.preventDefault();
        closeCmdPalette();
      }
      goPending = false;
      return;
    }

    if (e.key === "?" || (e.shiftKey && e.key === "/")) {
      e.preventDefault();
      toggleCmdPalette();
      return;
    }

    if (cmdOpen) {
      const key = e.key.toLowerCase();
      if (key === "v") {
        e.preventDefault();
        toggleFrost();
        return;
      }
      if (goPending) {
        e.preventDefault();
        handleGoChord(key);
        return;
      }
      if (key === "g") {
        e.preventDefault();
        goPending = true;
        if (goTimer) clearTimeout(goTimer);
        goTimer = setTimeout(() => {
          goPending = false;
        }, 1200);
        return;
      }
      if (key === "h") runCommand("hero");
      if (key === "a") runCommand("about");
      if (key === "p") runCommand("projects");
      if (key === "c") runCommand("contact");
      return;
    }

    if (e.key === "v" || e.key === "V") {
      e.preventDefault();
      toggleFrost();
      return;
    }

    if (e.key === "g" || e.key === "G") {
      goPending = true;
      if (goTimer) clearTimeout(goTimer);
      goTimer = setTimeout(() => {
        goPending = false;
      }, 1200);
      return;
    }

    if (goPending) {
      e.preventDefault();
      handleGoChord(e.key.toLowerCase());
    }
  });
})();
