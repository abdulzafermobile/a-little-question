/* ==========================================================
   Date Night — game logic
   ========================================================== */

/* ===== ✏️ CONFIG — edit these to personalise! ===== */
const CONFIG = {
  greeting: "Hey beautiful 💕",
  dateText: "Tonight · Thursday, October 22",
  timeText: "11:00 PM",
  place: "Your Favorite Restaurant",
  address: "Add the address here",
  dressCode: "Whatever makes you feel gorgeous ✨",
  message:
    "Every day with you is my favourite day — but tonight is just for us. " +
    "Candlelight, good food, and my favourite person across the table. " +
    "Get ready, I'm picking you up! 💖",
  // Put a photo in the repo (e.g. images/dinner.jpg) and set the path here.
  // Leave empty to show the cute illustrated placeholder.
  imageUrl: "",
  calendar: {
    title: "Romantic Date Night 💕",
    start: "2026-10-22T11:00", // local time, YYYY-MM-DDTHH:MM
    durationHours: 3,
  },
};

/* ===== Funny lines ===== */
const NO_TEXTS = [
  "No",
  "Are you sure?",
  "Really sure?",
  "Think again!",
  "Last chance!",
  "Nope 🙈",
  "Can't catch me!",
  "Pleeease? 🥺",
  "You're breaking my heart 💔",
  "I'll just wait here…",
  "Just click YES 😌",
];

const HINTS = [
  "Choose wisely… 😇",
  "Whoops! That button is a little shy 🙈",
  "Hmm, it seems to be running away 🏃‍♂️",
  "The YES button is looking extra cute now 👀",
  "Fun fact: 'No' is not on tonight's menu 🍝",
  "It's getting smaller… just like your excuses 😏",
  "Resistance is futile 💘",
  "Your mouse clearly wants to say YES 🖱️💕",
  "Okay, you're very persistent. I love that about you 🥰",
  "Pssst… the big pink one ➡️ YES!",
];

/* ===== Elements ===== */
const $ = (id) => document.getElementById(id);
const askScreen = $("askScreen");
const successScreen = $("successScreen");
const yesBtn = $("yesBtn");
const noBtn = $("noBtn");
const hint = $("hint");

/* ===== State ===== */
let attempts = 0;
let noScale = 1;
let yesScale = 1;
let lastDodge = 0;
let celebrated = false;
const pointer = { x: -9999, y: -9999 };

const MIN_NO_SCALE = 0.35;
const MAX_YES_SCALE = 2.2;
const DODGE_COOLDOWN_MS = 180; // stops one gesture counting as many attempts
const DANGER_ZONE_PX = 30;     // how close the cursor can get before No flees

/* ===== Init content from CONFIG ===== */
$("greeting").textContent = CONFIG.greeting;
$("message").textContent = CONFIG.message;
$("dDate").textContent = CONFIG.dateText;
$("dTime").textContent = CONFIG.timeText;
$("dPlace").textContent = CONFIG.place;
$("dAddress").textContent = CONFIG.address;
$("dDress").textContent = CONFIG.dressCode;

if (CONFIG.imageUrl) {
  const img = $("photoImg");
  imageUrl: "images/dinner.jpg",
  img.src = CONFIG.imageUrl;
  img.onload = () => {
    img.hidden = false;
    $("photoPlaceholder").hidden = true;
  };
}

/* ===== Background hearts ===== */
(function makeHearts() {
  const box = $("bgHearts");
  const emojis = ["💗", "💕", "💖", "🌸", "✨", "💞", "🩷"];
  const count = window.innerWidth < 600 ? 12 : 20;
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.textContent = emojis[i % emojis.length];
    s.style.left = Math.random() * 100 + "vw";
    s.style.fontSize = 14 + Math.random() * 22 + "px";
    s.style.animationDuration = 10 + Math.random() * 14 + "s";
    s.style.animationDelay = -Math.random() * 20 + "s";
    box.appendChild(s);
  }
})();

/* ==========================================================
   THE RUNAWAY "NO" BUTTON
   ========================================================== */

/** Distance from a point to the nearest edge of a rectangle (0 if inside). */
function distToRect(x, y, r) {
  const dx = Math.max(r.left - x, 0, x - r.right);
  const dy = Math.max(r.top - y, 0, y - r.bottom);
  return Math.hypot(dx, dy);
}

/** Called on every attempt to hover / tap / click "No". */
function dodge(e) {
  if (e) {
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
    if (e.touches && e.touches[0]) {
      pointer.x = e.touches[0].clientX;
      pointer.y = e.touches[0].clientY;
    } else if (typeof e.clientX === "number") {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    }
  }
  if (celebrated) return;

  const now = performance.now();
  if (now - lastDodge < DODGE_COOLDOWN_MS) return;
  lastDodge = now;

  attempts++;

  // Shrink "No", grow "YES!"
  noScale = Math.max(MIN_NO_SCALE, noScale * 0.88);
  yesScale = Math.min(MAX_YES_SCALE, yesScale + 0.12);
  noBtn.style.setProperty("--no-scale", noScale);
  document.documentElement.style.setProperty("--yes-scale", yesScale);

  // Cheeky text updates
  noBtn.textContent = NO_TEXTS[Math.min(attempts, NO_TEXTS.length - 1)];
  hint.textContent = HINTS[Math.min(attempts, HINTS.length - 1)];
  hint.classList.remove("flash");
  void hint.offsetWidth; // restart animation
  hint.classList.add("flash");

  moveNo();
}

/** Teleport the No button to a random spot away from the pointer and the YES button. */
function moveNo() {
  // First escape: lift the button out of the card so `position: fixed`
  // is relative to the viewport (the card has a transform animation).
  if (!noBtn.classList.contains("runaway")) {
    const r = noBtn.getBoundingClientRect();
    document.body.appendChild(noBtn);
    noBtn.classList.add("runaway");
    noBtn.style.left = r.left + "px";
    noBtn.style.top = r.top + "px";
    noBtn.getBoundingClientRect(); // force reflow so the next move animates
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const pad = 12;

  // offsetWidth ignores transform, so compute the visually scaled size.
  const bw = noBtn.offsetWidth;
  const bh = noBtn.offsetHeight;
  const w = bw * noScale;
  const h = bh * noScale;

  const yes = yesBtn.getBoundingClientRect();
  const margin = 24;

  let best = null;
  let bestScore = -Infinity;

  // Try many random spots; keep the one furthest from the pointer
  // that doesn't overlap YES.
  for (let i = 0; i < 40; i++) {
    const vx = pad + Math.random() * Math.max(1, vw - w - pad * 2);
    const vy = pad + Math.random() * Math.max(1, vh - h - pad * 2);

    const overlapsYes = !(
      vx + w < yes.left - margin ||
      vx > yes.right + margin ||
      vy + h < yes.top - margin ||
      vy > yes.bottom + margin
    );
    if (overlapsYes) continue;

    const cx = vx + w / 2;
    const cy = vy + h / 2;
    const fromPointer = Math.hypot(cx - pointer.x, cy - pointer.y);
    const score = Math.min(fromPointer, 450) + Math.random() * 60;

    if (score > bestScore) {
      bestScore = score;
      best = { vx, vy };
    }
  }
  if (!best) best = { vx: pad, vy: pad };

  // Convert visual top-left back to the element's untransformed top-left
  // (scale happens around the centre).
  noBtn.style.left = best.vx - (bw - w) / 2 + "px";
  noBtn.style.top = best.vy - (bh - h) / 2 + "px";
}

/* Desktop: hovering the button */
noBtn.addEventListener("mouseenter", dodge);

/* Desktop: getting too close (it flees before you even touch it) */
document.addEventListener("pointermove", (e) => {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  if (celebrated || e.pointerType !== "mouse") return;
  if (distToRect(e.clientX, e.clientY, noBtn.getBoundingClientRect()) < DANGER_ZONE_PX) {
    dodge();
  }
});

/* Mobile: tapping it */
noBtn.addEventListener("touchstart", dodge, { passive: false });
noBtn.addEventListener("pointerdown", dodge);

/* Keyboard / any click that sneaks through — still never accepted */
noBtn.addEventListener("click", dodge);

/* Keep it on-screen if the window resizes / phone rotates */
window.addEventListener("resize", () => {
  if (noBtn.classList.contains("runaway") && !celebrated) moveNo();
});

/* ==========================================================
   YES! → SUCCESS
   ========================================================== */
yesBtn.addEventListener("click", () => {
  if (celebrated) return;
  celebrated = true;

  noBtn.classList.add("gone");
  askScreen.classList.add("leaving");

  $("tries").textContent =
    attempts === 0
      ? "Straight to YES, no hesitation. I'm the luckiest! 🥹"
      : `You tried to say "No" ${attempts} time${attempts === 1 ? "" : "s"}… but your heart knew the answer 😏`;

  setTimeout(() => {
    askScreen.hidden = true;
    noBtn.remove();
    successScreen.hidden = false;
    confetti.celebrate();
  }, 450);
});

$("againBtn").addEventListener("click", () => confetti.celebrate());
$("calendarBtn").addEventListener("click", downloadICS);

/* ===== Add-to-calendar (.ics file, works with Apple/Google/Outlook) ===== */
function downloadICS() {
  const { title, start, durationHours } = CONFIG.calendar;
  const s = new Date(start); // parsed as local time
  const e = new Date(s.getTime() + durationHours * 3600 * 1000);
  const fmt = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const esc = (t) =>
    String(t).replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//DateNight//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@date-night`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(s)}`,
    `DTEND:${fmt(e)}`,
    `SUMMARY:${esc(title)}`,
    `LOCATION:${esc(CONFIG.place + " - " + CONFIG.address)}`,
    `DESCRIPTION:${esc(CONFIG.message)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "date-night.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ==========================================================
   CONFETTI (no libraries — plain canvas)
   ========================================================== */
const confetti = (() => {
  const canvas = $("confetti");
  const ctx = canvas.getContext("2d");
  const colors = ["#ff8fab", "#ffc8dd", "#cdb4db", "#a2d2ff", "#bde0fe", "#b9fbc0", "#ffe5a5", "#ffb4a2"];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const density = reduced ? 0.35 : 1;
  let parts = [];
  let raf = null;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  function make(x, y, vx, vy) {
    const r = Math.random();
    return {
      x, y, vx, vy,
      size: 6 + Math.random() * 8,
      color: colors[(Math.random() * colors.length) | 0],
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.3,
      tilt: Math.random() * Math.PI * 2,
      shape: r < 0.55 ? "rect" : r < 0.85 ? "circle" : "heart",
    };
  }

  function burst(x, y, count, angle = -Math.PI / 2, spread = Math.PI / 2) {
    const boost = Math.max(1, window.innerHeight / 800);
    for (let i = 0; i < count * density; i++) {
      const a = angle + (Math.random() - 0.5) * spread;
      const speed = (9 + Math.random() * 12) * boost;
      parts.push(make(x, y, Math.cos(a) * speed, Math.sin(a) * speed));
    }
    start();
  }

  function rain(count) {
    for (let i = 0; i < count * density; i++) {
      parts.push(
        make(Math.random() * window.innerWidth, -20 - Math.random() * 120, (Math.random() - 0.5) * 2, 2 + Math.random() * 3)
      );
    }
    start();
  }

  function drawHeart(s) {
    ctx.beginPath();
    ctx.moveTo(0, s * 0.3);
    ctx.bezierCurveTo(0, 0, -s * 0.5, 0, -s * 0.5, s * 0.3);
    ctx.bezierCurveTo(-s * 0.5, s * 0.6, 0, s * 0.8, 0, s);
    ctx.bezierCurveTo(0, s * 0.8, s * 0.5, s * 0.6, s * 0.5, s * 0.3);
    ctx.bezierCurveTo(s * 0.5, 0, 0, 0, 0, s * 0.3);
    ctx.fill();
  }

  function tick() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (const p of parts) {
      p.vy = Math.min(p.vy + 0.22, 7); // gravity with terminal velocity
      p.vx *= 0.985;                   // air drag
      p.tilt += 0.1;
      p.x += p.vx + Math.sin(p.tilt) * 0.6; // gentle sway
      p.y += p.vy;
      p.rot += p.vr;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === "rect") {
        ctx.scale(1, Math.cos(p.tilt)); // 3D flip effect
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.translate(0, -p.size / 2);
        drawHeart(p.size * 1.3);
      }
      ctx.restore();
    }
    parts = parts.filter((p) => p.y < window.innerHeight + 40);
    raf = parts.length ? requestAnimationFrame(tick) : null;
    if (!raf) ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }

  function start() {
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function celebrate() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    burst(0, h, 110, -Math.PI / 3, Math.PI / 4);          // bottom-left cannon
    burst(w, h, 110, (-2 * Math.PI) / 3, Math.PI / 4);    // bottom-right cannon
    setTimeout(() => burst(w / 2, h * 0.35, 140, 0, Math.PI * 2), 250); // centre pop
    let n = 0;
    const iv = setInterval(() => {
      rain(22);
      if (++n > 16) clearInterval(iv);
    }, 250);
  }

  return { celebrate, burst };
})();
