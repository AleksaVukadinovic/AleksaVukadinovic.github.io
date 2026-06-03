(function () {
  "use strict";

  /* --------------------------------------------------------------------------
     Theme registry
     -------------------------------------------------------------------------- */
  const THEME_IDS = [
    "dark",
    "light",
    "frost",
    "ember",
    "moss",
    "dusk",
    "phosphor",
    "coral",
    "ink",
    "toxic",
    "dust",
  ];

  const THEMES = {
    dark: {
      label: "void",
      tagline: "pure monochrome",
      preview: ["#000000", "#ffffff", "#888888"],
      ship: "fighter",
      stars: { divisor: 8000, max: 220, big: 0.15, shape: "pixel" },
    },
    light: {
      label: "sol",
      tagline: "solar inversion",
      preview: ["#ffffff", "#000000", "#666666"],
      ship: "fighter",
      stars: { divisor: 10000, max: 150, big: 0.08, shape: "pixel" },
    },
    frost: {
      label: "frost",
      tagline: "cold drift",
      preview: ["#0a1219", "#dceaf5", "#7eb8dc"],
      ship: "glider",
      shipSpeed: 0.48,
      effect: "snow",
      stars: { divisor: 9500, max: 170, big: 0.22, shape: "diamond" },
    },
    ember: {
      label: "ember",
      tagline: "burning edge",
      preview: ["#120808", "#f5dcc8", "#e85a3a"],
      ship: "wedge",
      effect: "meteors",
      stars: { divisor: 6500, max: 260, big: 0.12, shape: "pixel" },
    },
    moss: {
      label: "moss",
      tagline: "orbital grove",
      preview: ["#0a110c", "#d8ead9", "#6ecf7a"],
      ship: "cargo",
      stars: { divisor: 9000, max: 190, big: 0.18, shape: "diamond" },
    },
    dusk: {
      label: "dusk",
      tagline: "violet hour",
      preview: ["#100818", "#ead8f0", "#c07ad8"],
      ship: "probe",
      shipSpeed: 0.52,
      stars: { divisor: 5500, max: 300, big: 0.06, shape: "pixel" },
    },
    phosphor: {
      label: "phos",
      tagline: "crt ghost",
      preview: ["#020a04", "#b8ffb8", "#5cff5c"],
      ship: "probe",
      stars: { divisor: 7000, max: 240, big: 0.04, shape: "cross" },
    },
    coral: {
      label: "coral",
      tagline: "warm nebula",
      preview: ["#140a0c", "#fde8ea", "#ff7a8a"],
      ship: "fighter",
      stars: { divisor: 8500, max: 200, big: 0.2, shape: "diamond" },
    },
    ink: {
      label: "ink",
      tagline: "midnight paper",
      preview: ["#0c0e14", "#e8e4d8", "#c8b890"],
      ship: "cargo",
      effect: "squid",
      stars: { divisor: 12000, max: 120, big: 0.25, shape: "pixel" },
    },
    toxic: {
      label: "toxic",
      tagline: "acid rain",
      preview: ["#080a04", "#e8ffb0", "#c8ff20"],
      ship: "crystal",
      stars: { divisor: 6000, max: 280, big: 0.1, shape: "cross" },
    },
    dust: {
      label: "dust",
      tagline: "mars wind",
      preview: ["#141008", "#e8dcc8", "#d4a050"],
      ship: "wedge",
      shipEnabled: false,
      effect: "wind",
      stars: { divisor: 14000, max: 70, big: 0.2, shape: "pixel" },
    },
  };

  const SHIP_SVGS = {
    fighter:
      '<rect x="6" y="0" width="4" height="2" fill="currentColor"/>' +
      '<rect x="4" y="2" width="8" height="4" fill="currentColor"/>' +
      '<rect x="2" y="6" width="12" height="2" fill="currentColor"/>' +
      '<rect x="0" y="8" width="4" height="2" fill="currentColor"/>' +
      '<rect x="12" y="8" width="4" height="2" fill="currentColor"/>' +
      '<rect x="6" y="8" width="4" height="4" fill="currentColor"/>',
    glider:
      '<rect x="7" y="0" width="2" height="2" fill="currentColor"/>' +
      '<rect x="5" y="2" width="6" height="2" fill="currentColor"/>' +
      '<rect x="3" y="4" width="10" height="2" fill="currentColor"/>' +
      '<rect x="1" y="6" width="14" height="2" fill="currentColor"/>' +
      '<rect x="6" y="8" width="4" height="3" fill="currentColor"/>',
    wedge:
      '<rect x="7" y="0" width="2" height="2" fill="currentColor"/>' +
      '<rect x="5" y="2" width="6" height="2" fill="currentColor"/>' +
      '<rect x="3" y="4" width="10" height="4" fill="currentColor"/>' +
      '<rect x="6" y="8" width="4" height="3" fill="currentColor"/>',
    cargo:
      '<rect x="2" y="2" width="12" height="6" fill="currentColor"/>' +
      '<rect x="0" y="4" width="2" height="2" fill="currentColor"/>' +
      '<rect x="14" y="4" width="2" height="2" fill="currentColor"/>' +
      '<rect x="4" y="8" width="8" height="3" fill="currentColor"/>' +
      '<rect x="1" y="9" width="2" height="2" fill="currentColor" opacity="0.7"/>' +
      '<rect x="13" y="9" width="2" height="2" fill="currentColor" opacity="0.7"/>',
    probe:
      '<rect x="7" y="0" width="2" height="2" fill="currentColor"/>' +
      '<rect x="7" y="2" width="2" height="6" fill="currentColor"/>' +
      '<rect x="5" y="8" width="6" height="3" fill="currentColor"/>' +
      '<rect x="7" y="4" width="2" height="2" fill="currentColor" opacity="0.5"/>',
    crystal:
      '<rect x="7" y="0" width="2" height="2" fill="currentColor"/>' +
      '<rect x="5" y="2" width="6" height="2" fill="currentColor"/>' +
      '<rect x="3" y="4" width="10" height="2" fill="currentColor"/>' +
      '<rect x="5" y="6" width="6" height="2" fill="currentColor"/>' +
      '<rect x="7" y="8" width="2" height="3" fill="currentColor"/>',
  };

  function getThemeId() {
    return document.documentElement.getAttribute("data-theme") || "dark";
  }

  function getThemeMeta() {
    return THEMES[getThemeId()] || THEMES.dark;
  }

  function paintStar(star, alpha) {
    const x = Math.floor(star.x);
    const y = Math.floor(star.y);
    ctx.fillStyle = starColor(alpha);

    if (star.shape === "diamond") {
      ctx.fillRect(x, y, 1, 1);
      ctx.fillRect(x - 1, y, 1, 1);
      ctx.fillRect(x + 1, y, 1, 1);
      ctx.fillRect(x, y - 1, 1, 1);
      ctx.fillRect(x, y + 1, 1, 1);
      return;
    }

    if (star.shape === "cross") {
      ctx.fillRect(x, y, 1, 1);
      ctx.fillRect(x - 1, y, 1, 1);
      ctx.fillRect(x + 1, y, 1, 1);
      ctx.fillRect(x, y - 1, 1, 1);
      ctx.fillRect(x, y + 1, 1, 1);
      return;
    }

    ctx.fillRect(x, y, star.size, star.size);
  }

  /* --------------------------------------------------------------------------
     Per-theme canvas effects (snow, meteors, wind)
     -------------------------------------------------------------------------- */
  let themeFxState = null;
  let windGustTimer = null;

  function clearWindGustTimer() {
    if (windGustTimer) {
      clearTimeout(windGustTimer);
      windGustTimer = null;
    }
  }

  function initThemeFx() {
    clearWindGustTimer();
    const effect = getThemeMeta().effect;
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (effect === "snow") {
      const count = 14 + Math.floor(Math.random() * 10);
      themeFxState = {
        kind: "snow",
        flakes: Array.from({ length: count }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          vy: 0.25 + Math.random() * 0.45,
          vx: (Math.random() - 0.5) * 0.25,
          size: Math.random() > 0.75 ? 2 : 1,
          phase: Math.random() * Math.PI * 2,
        })),
      };
      return;
    }

    if (effect === "meteors") {
      themeFxState = { kind: "meteors", meteors: [], spawnAcc: 0 };
      return;
    }

    if (effect === "wind") {
      themeFxState = { kind: "wind", gusts: [] };
      if (!prefersReducedMotion) scheduleWindGust();
      return;
    }

    themeFxState = null;
  }

  function scheduleWindGust() {
    clearWindGustTimer();
    if (getThemeMeta().effect !== "wind" || prefersReducedMotion) return;
    windGustTimer = setTimeout(() => {
      spawnWindGust();
      scheduleWindGust();
    }, 2200 + Math.random() * 4800);
  }

  function spawnWindGust() {
    if (!themeFxState || themeFxState.kind !== "wind") return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const fromLeft = Math.random() > 0.5;
    const dotCount = 6 + Math.floor(Math.random() * 14);
    const dots = [];

    for (let i = 0; i < dotCount; i++) {
      dots.push({
        ox: i * (2 + Math.random() * 2),
        oy: (Math.random() - 0.5) * 10,
        alpha: 0.25 + Math.random() * 0.45,
      });
    }

    themeFxState.gusts.push({
      x: fromLeft ? -20 : w + 20,
      y: Math.random() * h,
      dir: fromLeft ? 1 : -1,
      speed: 6 + Math.random() * 10,
      life: 1,
      dots,
    });
  }

  function spawnMeteor() {
    if (!themeFxState || themeFxState.kind !== "meteors") return;
    const w = window.innerWidth;
    const angle = ((Math.random() * 40 + 15) * Math.PI) / 180;
    const speed = 4 + Math.random() * 5;
    themeFxState.meteors.push({
      x: Math.random() * w,
      y: -8 - Math.random() * 40,
      vx: Math.sin(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
      vy: Math.cos(angle) * speed,
      len: 4 + Math.floor(Math.random() * 6),
      life: 1,
    });
  }

  function paintSnowflake(flake) {
    const x = Math.floor(flake.x + Math.sin(flake.phase) * 0.6);
    const y = Math.floor(flake.y);
    const alpha = 0.18 + Math.sin(flake.phase) * 0.1;
    ctx.fillStyle = starColor(alpha);
    ctx.fillRect(x, y, 1, 1);
    ctx.fillRect(x - 1, y, 1, 1);
    ctx.fillRect(x + 1, y, 1, 1);
    ctx.fillRect(x, y - 1, 1, 1);
    ctx.fillRect(x, y + 1, 1, 1);
    if (flake.size > 1) {
      ctx.fillRect(x - 1, y - 1, 1, 1);
      ctx.fillRect(x + 1, y + 1, 1, 1);
    }
  }

  function paintMeteor(m) {
    for (let i = 0; i < m.len; i++) {
      const t = i / Math.max(1, m.len - 1);
      const px = Math.floor(m.x - m.vx * i * 1.4);
      const py = Math.floor(m.y - m.vy * i * 1.4);
      ctx.fillStyle = starColor((1 - t) * 0.75 * m.life);
      ctx.fillRect(px, py, 2, 2);
    }
    ctx.fillStyle = starColor(0.95 * m.life);
    ctx.fillRect(Math.floor(m.x), Math.floor(m.y), 2, 2);
  }

  function paintWindGust(gust) {
    for (const dot of gust.dots) {
      const x = Math.floor(gust.x + dot.ox * gust.dir);
      const y = Math.floor(gust.y + dot.oy);
      ctx.fillStyle = starColor(dot.alpha * gust.life * 0.7);
      ctx.fillRect(x, y, 1, 1);
      if (dot.alpha > 0.45) {
        ctx.fillRect(x + gust.dir, y, 1, 1);
      }
    }
  }

  function updateAndDrawThemeFx() {
    if (!themeFxState || prefersReducedMotion) return;
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (themeFxState.kind === "snow") {
      for (const flake of themeFxState.flakes) {
        flake.phase += 0.015;
        flake.x += flake.vx;
        flake.y += flake.vy;
        if (flake.y > h + 4) {
          flake.y = -4;
          flake.x = Math.random() * w;
        }
        if (flake.x < -4) flake.x = w + 4;
        if (flake.x > w + 4) flake.x = -4;
        paintSnowflake(flake);
      }
      return;
    }

    if (themeFxState.kind === "meteors") {
      themeFxState.spawnAcc += 1;
      if (themeFxState.spawnAcc > 28 && themeFxState.meteors.length < 5) {
        if (Math.random() > 0.55) spawnMeteor();
        themeFxState.spawnAcc = 0;
      }

      themeFxState.meteors = themeFxState.meteors.filter((m) => {
        m.x += m.vx;
        m.y += m.vy;
        m.life = Math.min(1, m.life + 0.02);
        const alive = m.y < h + 30 && m.x > -40 && m.x < w + 40;
        if (alive) paintMeteor(m);
        return alive;
      });
      return;
    }

    if (themeFxState.kind === "wind") {
      themeFxState.gusts = themeFxState.gusts.filter((gust) => {
        gust.x += gust.speed * gust.dir;
        gust.life -= 0.012;
        const alive =
          gust.life > 0 &&
          gust.x > -80 &&
          gust.x < w + 80;
        if (alive) paintWindGust(gust);
        return alive;
      });
    }
  }

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
    initThemeFx();
  }

  function initStars() {
    const cfg = getThemeMeta().stars;
    const count = Math.floor((window.innerWidth * window.innerHeight) / cfg.divisor);
    stars = Array.from({ length: Math.min(count, cfg.max) }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() < cfg.big ? 2 : 1,
      shape: cfg.shape,
      opacity: Math.random(),
      twinkleSpeed: 0.008 + Math.random() * 0.02,
      twinklePhase: Math.random() * Math.PI * 2,
      driftX: (Math.random() - 0.5) * 0.08,
      driftY: (Math.random() - 0.5) * 0.05,
    }));
  }

  function refreshStarfield() {
    cancelAnimationFrame(animationId);
    initStars();
    initThemeFx();
    if (!prefersReducedMotion) {
      drawStars();
    } else {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const star of stars) {
        paintStar(star, 0.6);
      }
    }
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

      paintStar(star, alpha);
    }

    updateAndDrawThemeFx();

    animationId = requestAnimationFrame(drawStars);
  }

  document.documentElement.addEventListener("themechange", refreshStarfield);

  resizeCanvas();
  if (!prefersReducedMotion) {
    drawStars();
  } else {
    initStars();
    for (const star of stars) {
      paintStar(star, 0.6);
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
  const themeFxContainer = document.getElementById("theme-fx");
  const hero = document.getElementById("hero");

  const SQUID_SVG =
    '<svg class="ink-squid__svg" viewBox="0 0 20 16" width="36" height="28" aria-hidden="true">' +
    '<rect x="7" y="0" width="6" height="3" fill="currentColor"/>' +
    '<rect x="5" y="3" width="10" height="4" fill="currentColor"/>' +
    '<rect x="6" y="7" width="8" height="2" fill="currentColor"/>' +
    '<rect x="4" y="9" width="2" height="3" fill="currentColor" opacity="0.85"/>' +
    '<rect x="3" y="12" width="2" height="2" fill="currentColor" opacity="0.6"/>' +
    '<rect x="8" y="9" width="2" height="4" fill="currentColor" opacity="0.75"/>' +
    '<rect x="7" y="13" width="2" height="2" fill="currentColor" opacity="0.5"/>' +
    '<rect x="11" y="9" width="2" height="3" fill="currentColor" opacity="0.8"/>' +
    '<rect x="12" y="12" width="2" height="2" fill="currentColor" opacity="0.55"/>' +
    '<rect x="14" y="9" width="2" height="3" fill="currentColor" opacity="0.85"/>' +
    '<rect x="15" y="12" width="2" height="2" fill="currentColor" opacity="0.6"/>' +
    "</svg>";

  if (!hero) {
    spaceship && (spaceship.style.display = "none");
    trailCanvas && (trailCanvas.style.display = "none");
  } else {
  const SHIP_COOLDOWN = 10000;
  const SHIP_MARGIN = 64;
  const TRAIL_SPACING = 18;
  const TRAIL_MAX = 12;
  const TRAIL_BRIGHT = 5;
  const SQUID_MARGIN = 48;

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
  let pathBaseSpeed = 0;
  let pathLength = 1;
  let squids = [];
  let squidSpawnTimer = null;
  let shipSpawnTimer = null;

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

  function buildFlightPath(margin) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    let attempts = 0;
    let start;
    let end;

    do {
      start = randomEdgePoint(margin);
      end = randomEdgePoint(margin);
      attempts++;
    } while (
      attempts < 20 &&
      Math.hypot(end.x - start.x, end.y - start.y) < Math.min(w, h) * 0.45
    );

    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.hypot(dx, dy) || 1;
    const bend =
      (Math.random() > 0.5 ? 1 : -1) *
      (100 + Math.random() * Math.min(w, h) * 0.22);

    return {
      start,
      end,
      control: {
        x: midX + (-dy / len) * bend,
        y: midY + (dx / len) * bend,
      },
      length: len,
    };
  }

  function bezierPointFrom(path, t) {
    const u = 1 - t;
    return {
      x:
        u * u * path.start.x +
        2 * u * t * path.control.x +
        t * t * path.end.x,
      y:
        u * u * path.start.y +
        2 * u * t * path.control.y +
        t * t * path.end.y,
    };
  }

  function bezierTangentFrom(path, t) {
    const u = 1 - t;
    return {
      x:
        2 * u * (path.control.x - path.start.x) +
        2 * t * (path.end.x - path.control.x),
      y:
        2 * u * (path.control.y - path.start.y) +
        2 * t * (path.end.y - path.control.y),
    };
  }

  function isShipEnabled() {
    return getThemeMeta().shipEnabled !== false;
  }

  function getShipSpeedMult() {
    return getThemeMeta().shipSpeed ?? 1;
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

  function scheduleShipSpawn(delay) {
    if (shipSpawnTimer) clearTimeout(shipSpawnTimer);
    if (!isShipEnabled() || prefersReducedMotion) return;
    shipSpawnTimer = setTimeout(() => {
      shipSpawnTimer = null;
      if (shipState === "idle") spawnShip();
    }, delay);
  }

  function spawnShip() {
    if (!isShipEnabled()) return;

    const flight = buildFlightPath(SHIP_MARGIN);
    pathStart = flight.start;
    pathEnd = flight.end;
    pathControl = flight.control;
    pathLength = flight.length;
    pathT = 0;
    pathBaseSpeed = 1.1 + Math.random() * 1.4;

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

    if (!isShipEnabled()) return;

    if (cooldownTimer) clearTimeout(cooldownTimer);
    cooldownTimer = setTimeout(() => {
      cooldownTimer = null;
      spawnShip();
    }, SHIP_COOLDOWN);
  }

  function updateShip() {
    if (shipState === "flying") {
      pathT += (pathBaseSpeed * getShipSpeedMult()) / pathLength;

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

    updateSquids();
    requestAnimationFrame(updateShip);
  }

  function fireLaser(clientX, clientY) {
    if (prefersReducedMotion || shipState !== "flying" || !isShipEnabled()) return;

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

  function destroySquids() {
    squids = [];
    if (squidSpawnTimer) {
      clearTimeout(squidSpawnTimer);
      squidSpawnTimer = null;
    }
    if (themeFxContainer) themeFxContainer.innerHTML = "";
  }

  function spawnSquid() {
    if (!themeFxContainer || getThemeMeta().effect !== "squid") return;

    const flight = buildFlightPath(SQUID_MARGIN);
    const el = document.createElement("div");
    el.className = "ink-squid";
    el.innerHTML = SQUID_SVG;
    themeFxContainer.appendChild(el);

    squids.push({
      el,
      path: flight,
      t: 0,
      baseSpeed: 0.45 + Math.random() * 0.35,
      active: true,
    });
  }

  function initSquids() {
    destroySquids();
    if (getThemeMeta().effect !== "squid" || prefersReducedMotion) return;

    spawnSquid();
    squidSpawnTimer = setTimeout(() => {
      spawnSquid();
      squidSpawnTimer = setTimeout(spawnSquid, 3500 + Math.random() * 2500);
    }, 1800 + Math.random() * 2000);
  }

  function isSquidOffScreen(x, y) {
    return (
      x < -SQUID_MARGIN ||
      x > window.innerWidth + SQUID_MARGIN ||
      y < -SQUID_MARGIN ||
      y > window.innerHeight + SQUID_MARGIN
    );
  }

  function updateSquids() {
    if (getThemeMeta().effect !== "squid" || squids.length === 0) return;

    for (const squid of squids) {
      if (!squid.active) continue;

      squid.t += squid.baseSpeed / squid.path.length;
      const pos = bezierPointFrom(squid.path, squid.t);
      if (squid.t >= 1 || isSquidOffScreen(pos.x, pos.y)) {
        squid.active = false;
        squid.el.remove();
        continue;
      }

      const tangent = bezierTangentFrom(squid.path, squid.t);
      const angle = Math.atan2(tangent.y, tangent.x) * (180 / Math.PI) + 90;
      squid.el._x = pos.x;
      squid.el._y = pos.y;
      squid.el.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%) rotate(${angle}deg)`;
    }

    squids = squids.filter((squid) => squid.active);

    if (
      squids.length < 3 &&
      getThemeMeta().effect === "squid" &&
      !squidSpawnTimer &&
      Math.random() > 0.992
    ) {
      spawnSquid();
    }
  }

  function syncShipForTheme() {
    if (!spaceship) return;

    if (!isShipEnabled()) {
      shipState = "idle";
      spaceship.classList.remove("is-active");
      spaceship.style.display = "none";
      trail = [];
      drawTrail();
      if (cooldownTimer) {
        clearTimeout(cooldownTimer);
        cooldownTimer = null;
      }
      if (shipSpawnTimer) {
        clearTimeout(shipSpawnTimer);
        shipSpawnTimer = null;
      }
      if (trailCanvas) trailCanvas.style.display = "none";
    } else {
      spaceship.style.display = "";
      if (trailCanvas) trailCanvas.style.display = "";
      if (!prefersReducedMotion && shipState === "idle") {
        scheduleShipSpawn(1500 + Math.random() * 2500);
      }
    }

    if (getThemeMeta().effect === "squid") {
      initSquids();
    } else {
      destroySquids();
    }
  }

  document.documentElement.addEventListener("themechange", syncShipForTheme);

  if (!prefersReducedMotion) {
    resizeTrailCanvas();
    window.addEventListener("resize", resizeTrailCanvas);
    syncShipForTheme();
    scheduleShipSpawn(2000 + Math.random() * 4000);
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
     Theme tuner — spectrum channel picker
     -------------------------------------------------------------------------- */
  const THEME_KEY = "theme";
  const themeTuner = document.getElementById("theme-tuner");
  const themeTrigger = document.getElementById("theme-tuner-trigger");
  const themeMenu = document.getElementById("theme-tuner-menu");
  const themeLabel = document.getElementById("theme-tuner-label");
  const shipSvg = document.querySelector(".spaceship__svg");
  let themeMenuOpen = false;

  function getTheme() {
    return document.documentElement.getAttribute("data-theme") || "dark";
  }

  function updateShipVariant(shipKey) {
    if (!shipSvg || getThemeMeta().shipEnabled === false) return;
    shipSvg.innerHTML = SHIP_SVGS[shipKey] || SHIP_SVGS.fighter;
  }

  function syncThemeTuner(themeId) {
    const meta = THEMES[themeId] || THEMES.dark;
    if (themeLabel) {
      themeLabel.textContent = "ch:" + meta.label;
    }
    themeMenu?.querySelectorAll(".theme-tuner__option").forEach((btn) => {
      const active = btn.dataset.theme === themeId;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", String(active));
    });
  }

  function applyTheme(themeId) {
    if (!THEMES[themeId]) return;
    document.documentElement.setAttribute("data-theme", themeId);
    localStorage.setItem(THEME_KEY, themeId);
    if (THEMES[themeId].shipEnabled !== false) {
      updateShipVariant(THEMES[themeId].ship);
    }
    syncThemeTuner(themeId);
    document.documentElement.dispatchEvent(
      new CustomEvent("themechange", { detail: { theme: themeId } })
    );
  }

  function closeThemeMenu() {
    if (!themeMenu || !themeTrigger) return;
    themeMenu.hidden = true;
    themeMenuOpen = false;
    themeTrigger.setAttribute("aria-expanded", "false");
    themeTuner?.classList.remove("is-open");
  }

  function openThemeMenu() {
    if (!themeMenu || !themeTrigger) return;
    themeMenu.hidden = false;
    themeMenuOpen = true;
    themeTrigger.setAttribute("aria-expanded", "true");
    themeTuner?.classList.add("is-open");
    themeMenu.querySelector(".theme-tuner__option.is-active")?.focus();
  }

  function toggleThemeMenu() {
    if (themeMenuOpen) closeThemeMenu();
    else openThemeMenu();
  }

  function buildThemeMenu() {
    if (!themeMenu) return;

    const header = document.createElement("p");
    header.className = "theme-tuner__header pixel-accent";
    header.textContent = "// tune carrier wave";

    const grid = document.createElement("div");
    grid.className = "theme-tuner__grid";

    THEME_IDS.forEach((id) => {
      const meta = THEMES[id];
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "theme-tuner__option";
      btn.role = "option";
      btn.dataset.theme = id;
      btn.setAttribute("aria-selected", "false");

      const swatch = document.createElement("span");
      swatch.className = "theme-tuner__swatch";
      swatch.setAttribute("aria-hidden", "true");
      meta.preview.forEach((color) => {
        const band = document.createElement("span");
        band.style.background = color;
        swatch.appendChild(band);
      });

      const metaWrap = document.createElement("span");
      metaWrap.className = "theme-tuner__meta";
      metaWrap.innerHTML =
        '<span class="theme-tuner__name">' +
        meta.label +
        '</span><span class="theme-tuner__tag">' +
        meta.tagline +
        "</span>";

      btn.append(swatch, metaWrap);
      btn.addEventListener("click", () => {
        applyTheme(id);
        closeThemeMenu();
      });
      grid.appendChild(btn);
    });

    themeMenu.append(header, grid);
  }

  buildThemeMenu();
  applyTheme(getTheme());

  themeTrigger?.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleThemeMenu();
  });

  document.addEventListener("click", (e) => {
    if (!themeMenuOpen || !themeTuner) return;
    if (!themeTuner.contains(e.target)) closeThemeMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && themeMenuOpen) {
      closeThemeMenu();
      themeTrigger?.focus();
    }
  });

  if (!hero) {
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
      case "themes":
        openThemeMenu();
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
      if (key === "t") {
        e.preventDefault();
        openThemeMenu();
        closeCmdPalette();
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

    if (e.key === "t" || e.key === "T") {
      e.preventDefault();
      toggleThemeMenu();
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
