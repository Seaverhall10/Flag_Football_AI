/**
 * Cy-Fair K/1 Lions — Advanced Interactive SVG Field Diagram & Animated Play Simulator
 * Features: Animated play execution, 5v4 vs 8v8 defense mode, on-turf landmark labels, player assignment inspection.
 */

const FIELD_CONFIG = {
  activeDefenseMode: "5v4", // "5v4" or "8v8"
  activeRunKey: "inside-right",
  isAnimating: false,
  animationInterval: null,

  runs: {
    "inside-right": {
      name: "Inside Right",
      colorName: "Red Diamond",
      color: "#dc2626",
      hole: "C-RG",
      leadPath: [{x:400,y:345}, {x:425,y:315}, {x:435,y:255}],
      runnerPath: [{x:400,y:410}, {x:415,y:360}, {x:435,y:300}, {x:435,y:210}, {x:435,y:115}],
      targetHole: { x: 435, y: 300 },
      description: "Direct snap to Runner (~3 yds). Lead attacks the C-RG A-gap hole first, picks up linebacker. Runner follows lead, plants at cone, drives north."
    },
    "inside-left": {
      name: "Inside Left",
      colorName: "Blue Circle",
      color: "#2563eb",
      hole: "C-LG",
      leadPath: [{x:400,y:345}, {x:375,y:315}, {x:365,y:255}],
      runnerPath: [{x:400,y:410}, {x:385,y:360}, {x:365,y:300}, {x:365,y:210}, {x:365,y:115}],
      targetHole: { x: 365, y: 300 },
      description: "Direct snap to Runner. Lead attacks C-LG A-gap hole. Runner follows lead, plants firmly at landmark cone, explodes north."
    },
    "off-tackle-right": {
      name: "Off-Tackle Right",
      colorName: "Gold Star",
      color: "#d97706",
      hole: "RG-RT",
      leadPath: [{x:400,y:345}, {x:460,y:335}, {x:505,y:255}],
      runnerPath: [{x:400,y:410}, {x:450,y:370}, {x:505,y:300}, {x:505,y:215}, {x:515,y:115}],
      targetHole: { x: 505, y: 300 },
      description: "Direct snap. Lead attacks the RG-RT B-gap alley. Runner presses toward the hole, plants on outside foot, cuts north."
    },
    "off-tackle-left": {
      name: "Off-Tackle Left",
      colorName: "Green Triangle",
      color: "#16a34a",
      hole: "LG-LT",
      leadPath: [{x:400,y:345}, {x:340,y:335}, {x:295,y:255}],
      runnerPath: [{x:400,y:410}, {x:350,y:370}, {x:295,y:300}, {x:295,y:215}, {x:285,y:115}],
      targetHole: { x: 295, y: 300 },
      description: "Direct snap. Lead attacks LG-LT B-gap alley. Runner presses hole, plants off outside foot, drives north."
    },
    "wide-right": {
      name: "Wide Right",
      colorName: "Orange Square",
      color: "#ea580c",
      hole: "RT outside hip",
      leadPath: [{x:400,y:345}, {x:500,y:345}, {x:580,y:275}],
      runnerPath: [{x:400,y:410}, {x:510,y:400}, {x:580,y:300}, {x:585,y:235}, {x:590,y:115}],
      targetHole: { x: 580, y: 300 },
      description: "Direct snap. Lead seals perimeter outside RT. Runner sweeps to outside cone, plants, and turns upfield. CB must not allow outside."
    },
    "wide-left": {
      name: "Wide Left",
      colorName: "Purple Hexagon",
      color: "#9333ea",
      hole: "LT outside hip",
      leadPath: [{x:400,y:345}, {x:300,y:345}, {x:220,y:275}],
      runnerPath: [{x:400,y:410}, {x:290,y:400}, {x:220,y:300}, {x:215,y:235}, {x:210,y:115}],
      targetHole: { x: 220, y: 300 },
      description: "Direct snap. Lead seals outside LT. Runner takes angle to outside cone, plants hard, cuts up sideline."
    }
  },

  playerAssignments: {
    "C": { role: "Center", cue: "Find your jersey. Head out. Hands inside.", detail: "Delivers a clean 3-yard shotgun snap straight into the Runner's chest, then immediately steps up to drive block the defensive lineman." },
    "LG": { role: "Left Guard", cue: "Find your jersey. Head out. Hands inside.", detail: "Engages the interior defender. Maintains inside leverage and protects the A/B-gap run lanes." },
    "RG": { role: "Right Guard", cue: "Find your jersey. Head out. Hands inside.", detail: "Finds jersey, heads out, strikes hands inside. Protects the right-side run lanes." },
    "LT": { role: "Left Tackle", cue: "Seal edge. Hands inside.", detail: "Sets firm edge seal. Does not allow outside defenders to pinch inside." },
    "RT": { role: "Right Tackle", cue: "Seal edge. Hands inside.", detail: "Sets firm edge seal on the right side. Keeps defenders off the runner's cut." },
    "WR": { role: "Wide Receiver", cue: "Stalk block. Clear out.", detail: "Engages the cornerback downfield or runs a clear-out decoy to pull coverage away from the play." },
    "L": { role: "Lead Blocker", cue: "Hole first. Then Linebacker.", detail: "Attacks the called landmark hole FIRST before looking for contact. Seals the linebacker to create a daylight seam." },
    "R": { role: "Designated Runner", cue: "Follow. Plant. Go.", detail: "Catches the 3-yard snap cleanly. Follows the lead blocker, plants hard on the landmark cone, and accelerates north." },
    "DL": { role: "Defensive Line", cue: "Stay home, then flag.", detail: "Fills assigned gap. Does not overpursue opposite flow. Pulls flags at the line." },
    "MLB": { role: "Middle Linebacker", cue: "Flow to ball. Flag pull.", detail: "Reads lead blocker into the hole. Scrapes across and attacks the runner." },
    "CB": { role: "Cornerback", cue: "Nothing outside. Force in.", detail: "Keeps outside arm free. Forces the runner back into pursuit inside." },
    "S": { role: "Safety", cue: "Deep contain. Help top.", detail: "Prevents breakout touchdowns. Takes proper angle to the sideline." }
  }
};

function pointsToSvgPath(points) {
  if (!points || points.length === 0) return "";
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x},${points[i].y}`;
  }
  return d;
}

function renderFieldDiagram(containerId, activeRunKey = null, defenseMode = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (activeRunKey) FIELD_CONFIG.activeRunKey = activeRunKey;
  if (defenseMode) FIELD_CONFIG.activeDefenseMode = defenseMode;

  const run = FIELD_CONFIG.runs[FIELD_CONFIG.activeRunKey] || FIELD_CONFIG.runs["inside-right"];
  const is8v8 = FIELD_CONFIG.activeDefenseMode === "8v8";

  const leadPathD = pointsToSvgPath(run.leadPath);
  const runnerPathD = pointsToSvgPath(run.runnerPath);

  const svgHtml = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px" class="no-print">
      <div style="display:flex;gap:8px;align-items:center">
        <button class="btn btn-primary" id="btn-animate-play" style="padding:6px 12px;font-size:0.82rem">
          ▶ Animate Snap & Run
        </button>
        <button class="btn btn-secondary" id="btn-reset-animation" style="padding:6px 10px;font-size:0.82rem">
          ↺ Reset
        </button>
      </div>

      <div style="display:flex;gap:6px;align-items:center;background:rgba(0,0,0,0.3);padding:4px 8px;border-radius:6px">
        <span style="font-size:0.75rem;color:#cbd5e1;font-weight:700">DEFENSE:</span>
        <button class="btn ${!is8v8 ? 'btn-primary' : 'btn-secondary'}" id="btn-def-5v4" style="padding:3px 8px;font-size:0.75rem">5v4 Practice</button>
        <button class="btn ${is8v8 ? 'btn-primary' : 'btn-secondary'}" id="btn-def-8v8" style="padding:3px 8px;font-size:0.75rem">8v8 Game Day</button>
      </div>
    </div>

    <svg viewBox="0 0 800 470" class="field-diagram" id="field-svg" xmlns="http://www.w3.org/2000/svg" aria-label="Field Diagram for ${run.name}">
      <defs>
        <!-- Arrowhead Markers -->
        <marker id="arrow-${FIELD_CONFIG.activeRunKey}" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="${run.color}" />
        </marker>
        <marker id="arrow-lead" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
        </marker>
      </defs>

      <!-- Field Surface -->
      <rect x="8" y="8" width="784" height="454" rx="12" fill="#144a29" stroke="#0f172a" stroke-width="3" />
      
      <!-- Lions Watermark at Midfield -->
      <g opacity="0.08" transform="translate(340, 160) scale(3.2)">
        <path d="M18 2 C13 2 9 5 8 10 C7 14 9 17 9 19 C7 19 5 21 5 24 C5 28 9 31 14 31 C15 31 16 33 18 33 C20 33 21 31 22 31 C27 31 31 28 31 24 C31 21 29 19 27 19 C27 18 29 15 28 11 C27 6 23 3 18 3 Z" fill="#ffffff" />
      </g>

      <!-- Yardlines -->
      <line x1="16" y1="115" x2="784" y2="115" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" stroke-dasharray="8,6" />
      <line x1="16" y1="195" x2="784" y2="195" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" />
      <line x1="16" y1="300" x2="784" y2="300" stroke="#f59e0b" stroke-width="3.5" /> <!-- Line of Scrimmage -->
      <line x1="16" y1="390" x2="784" y2="390" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" />

      <!-- Field Markers -->
      <text x="32" y="294" fill="#f59e0b" font-weight="900" font-size="11" letter-spacing="1">LOS</text>
      <text x="32" y="190" fill="rgba(255,255,255,0.45)" font-weight="700" font-size="10">5 YD</text>
      <text x="32" y="110" fill="rgba(255,255,255,0.45)" font-weight="700" font-size="10">10 YD</text>

      <!-- Landmark Cones & On-Turf Labels -->
      <g id="landmarks">
        <!-- LT Outside Cone (Purple Hexagon) -->
        <polygon points="220,286 228,302 212,302" fill="#9333ea" stroke="#fff" stroke-width="1.5" />
        <text x="220" y="316" fill="#e9d5ff" font-size="9" font-weight="800" text-anchor="middle">LT OUT</text>

        <!-- LG-LT Cone (Green Triangle) -->
        <polygon points="295,286 303,302 287,302" fill="#16a34a" stroke="#fff" stroke-width="1.5" />
        <text x="295" y="316" fill="#bbf7d0" font-size="9" font-weight="800" text-anchor="middle">LG-LT</text>

        <!-- C-LG Cone (Blue Circle) -->
        <polygon points="365,286 373,302 357,302" fill="#2563eb" stroke="#fff" stroke-width="1.5" />
        <text x="365" y="316" fill="#bfdbfe" font-size="9" font-weight="800" text-anchor="middle">C-LG</text>

        <!-- C-RG Cone (Red Diamond) -->
        <polygon points="435,286 443,302 427,302" fill="#dc2626" stroke="#fff" stroke-width="1.5" />
        <text x="435" y="316" fill="#fecaca" font-size="9" font-weight="800" text-anchor="middle">C-RG</text>

        <!-- RG-RT Cone (Gold Star) -->
        <polygon points="505,286 513,302 497,302" fill="#d97706" stroke="#fff" stroke-width="1.5" />
        <text x="505" y="316" fill="#fde68a" font-size="9" font-weight="800" text-anchor="middle">RG-RT</text>

        <!-- RT Outside Cone (Orange Square) -->
        <polygon points="580,286 588,302 572,302" fill="#ea580c" stroke="#fff" stroke-width="1.5" />
        <text x="580" y="316" fill="#fed7aa" font-size="9" font-weight="800" text-anchor="middle">RT OUT</text>
      </g>

      <!-- Active Target Hole Indicator -->
      <circle cx="${run.targetHole.x}" cy="${run.targetHole.y}" r="22" fill="none" stroke="${run.color}" stroke-width="2.5" stroke-dasharray="4,3">
        <animate attributeName="r" values="18;26;18" dur="1.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.9;0.2;0.9" dur="1.6s" repeatCount="indefinite" />
      </circle>

      <!-- Defensive Alignment -->
      <g id="defense-group">
        ${!is8v8 ? `
          <!-- 5v4 Look Defense (Front 3 + CB) -->
          <circle cx="340" cy="235" r="15" fill="#1e293b" stroke="#94a3b8" stroke-width="2" class="player-token" data-pos="DL" />
          <text x="340" y="239" fill="#fff" font-size="10" font-weight="800" text-anchor="middle" pointer-events="none">DL</text>

          <circle cx="400" cy="220" r="15" fill="#1e293b" stroke="#94a3b8" stroke-width="2" class="player-token" data-pos="MLB" />
          <text x="400" y="224" fill="#fff" font-size="10" font-weight="800" text-anchor="middle" pointer-events="none">MLB</text>

          <circle cx="460" cy="235" r="15" fill="#1e293b" stroke="#94a3b8" stroke-width="2" class="player-token" data-pos="DL" />
          <text x="460" y="239" fill="#fff" font-size="10" font-weight="800" text-anchor="middle" pointer-events="none">DL</text>

          <circle cx="610" cy="215" r="15" fill="#1e293b" stroke="#f59e0b" stroke-width="2" class="player-token" data-pos="CB" />
          <text x="610" y="219" fill="#f59e0b" font-size="10" font-weight="800" text-anchor="middle" pointer-events="none">CB</text>
        ` : `
          <!-- 8v8 Full Game Defense (4 DL/LB, 2 CB, 2 Safety) -->
          <circle cx="280" cy="245" r="15" fill="#1e293b" stroke="#94a3b8" stroke-width="2" class="player-token" data-pos="DL" />
          <text x="280" y="249" fill="#fff" font-size="10" font-weight="800" text-anchor="middle" pointer-events="none">DL</text>

          <circle cx="360" cy="235" r="15" fill="#1e293b" stroke="#94a3b8" stroke-width="2" class="player-token" data-pos="DL" />
          <text x="360" y="239" fill="#fff" font-size="10" font-weight="800" text-anchor="middle" pointer-events="none">DL</text>

          <circle cx="440" cy="235" r="15" fill="#1e293b" stroke="#94a3b8" stroke-width="2" class="player-token" data-pos="DL" />
          <text x="440" y="239" fill="#fff" font-size="10" font-weight="800" text-anchor="middle" pointer-events="none">DL</text>

          <circle cx="520" cy="245" r="15" fill="#1e293b" stroke="#94a3b8" stroke-width="2" class="player-token" data-pos="DL" />
          <text x="520" y="249" fill="#fff" font-size="10" font-weight="800" text-anchor="middle" pointer-events="none">DL</text>

          <circle cx="170" cy="220" r="15" fill="#1e293b" stroke="#f59e0b" stroke-width="2" class="player-token" data-pos="CB" />
          <text x="170" y="224" fill="#f59e0b" font-size="10" font-weight="800" text-anchor="middle" pointer-events="none">CB</text>

          <circle cx="630" cy="220" r="15" fill="#1e293b" stroke="#f59e0b" stroke-width="2" class="player-token" data-pos="CB" />
          <text x="630" y="224" fill="#f59e0b" font-size="10" font-weight="800" text-anchor="middle" pointer-events="none">CB</text>

          <circle cx="330" cy="145" r="15" fill="#0f172a" stroke="#38bdf8" stroke-width="2" class="player-token" data-pos="S" />
          <text x="330" y="149" fill="#38bdf8" font-size="10" font-weight="800" text-anchor="middle" pointer-events="none">S</text>

          <circle cx="470" cy="145" r="15" fill="#0f172a" stroke="#38bdf8" stroke-width="2" class="player-token" data-pos="S" />
          <text x="470" y="149" fill="#38bdf8" font-size="10" font-weight="800" text-anchor="middle" pointer-events="none">S</text>
        `}
      </g>

      <!-- Static Route Lines -->
      <g id="play-routes">
        <path d="${leadPathD}" fill="none" stroke="#f59e0b" stroke-width="3.5" stroke-dasharray="6,4" marker-end="url(#arrow-lead)" id="lead-route-line" />
        <path d="${runnerPathD}" fill="none" stroke="${run.color}" stroke-width="5.5" stroke-linecap="round" marker-end="url(#arrow-${FIELD_CONFIG.activeRunKey})" id="runner-route-line" />
      </g>

      <!-- Animated Player Track Tokens (Hidden until animated) -->
      <g id="animated-elements">
        <circle id="animated-football" cx="400" cy="300" r="7" fill="#8d4004" stroke="#fff" stroke-width="1.5" opacity="0" />
        <circle id="animated-lead" cx="400" cy="345" r="16" fill="#f59e0b" stroke="#0b192c" stroke-width="2.5" opacity="0">
          <title>Lead Blocker (Sim)</title>
        </circle>
        <circle id="animated-runner" cx="400" cy="410" r="18" fill="${run.color}" stroke="#fff" stroke-width="2.5" opacity="0">
          <title>Runner (Sim)</title>
        </circle>
      </g>

      <!-- Offense 8 Players (Lions Squad) -->
      <g id="offense-group">
        <!-- Center (C) -->
        <circle cx="400" cy="300" r="17" fill="#0b192c" stroke="#f59e0b" stroke-width="2.5" class="player-token" data-pos="C" />
        <text x="400" y="305" fill="#f59e0b" font-size="12" font-weight="900" text-anchor="middle" pointer-events="none">C</text>

        <!-- Left Guard (LG) -->
        <circle cx="330" cy="300" r="16" fill="#0b192c" stroke="#f59e0b" stroke-width="2" class="player-token" data-pos="LG" />
        <text x="330" y="304" fill="#fff" font-size="10" font-weight="800" text-anchor="middle" pointer-events="none">LG</text>

        <!-- Right Guard (RG) -->
        <circle cx="470" cy="300" r="16" fill="#0b192c" stroke="#f59e0b" stroke-width="2" class="player-token" data-pos="RG" />
        <text x="470" y="304" fill="#fff" font-size="10" font-weight="800" text-anchor="middle" pointer-events="none">RG</text>

        <!-- Left Tackle (LT) -->
        <circle cx="260" cy="300" r="16" fill="#0b192c" stroke="#f59e0b" stroke-width="2" class="player-token" data-pos="LT" />
        <text x="260" y="304" fill="#fff" font-size="10" font-weight="800" text-anchor="middle" pointer-events="none">LT</text>

        <!-- Right Tackle (RT) -->
        <circle cx="540" cy="300" r="16" fill="#0b192c" stroke="#f59e0b" stroke-width="2" class="player-token" data-pos="RT" />
        <text x="540" y="304" fill="#fff" font-size="10" font-weight="800" text-anchor="middle" pointer-events="none">RT</text>

        <!-- Wide Receiver (WR) -->
        <circle cx="150" cy="300" r="15" fill="#0b192c" stroke="#f59e0b" stroke-width="2" class="player-token" data-pos="WR" />
        <text x="150" y="304" fill="#fff" font-size="10" font-weight="800" text-anchor="middle" pointer-events="none">WR</text>

        <!-- Lead Blocker (L) -->
        <circle cx="400" cy="345" r="16" fill="#f59e0b" stroke="#0b192c" stroke-width="2.5" class="player-token" data-pos="L" id="static-lead" />
        <text x="400" y="350" fill="#0b192c" font-size="11" font-weight="900" text-anchor="middle" pointer-events="none">L</text>

        <!-- Designated Runner (R) — Shotgun ~3 yards -->
        <circle cx="400" cy="410" r="18" fill="${run.color}" stroke="#fff" stroke-width="2.5" class="player-token" data-pos="R" id="static-runner" />
        <text x="400" y="415" fill="#fff" font-size="12" font-weight="900" text-anchor="middle" pointer-events="none">R</text>
      </g>

      <!-- Badge Overlay -->
      <g transform="translate(18, 18)">
        <rect width="220" height="54" rx="6" fill="rgba(11, 25, 44, 0.92)" stroke="#334155" stroke-width="1" />
        <text x="12" y="20" fill="${run.color}" font-size="12" font-weight="800">${run.name.toUpperCase()}</text>
        <text x="12" y="36" fill="#f59e0b" font-size="10" font-weight="700">Landmark: ${run.hole} (${run.colorName})</text>
        <text x="12" y="48" fill="#94a3b8" font-size="8.5" font-weight="500">Shotgun ~3 yd Direct Snap · ${is8v8 ? '8v8 Game Defense' : '5v4 Drill'}</text>
      </g>
    </svg>

    <!-- Player Assignment Modal / Quick Card -->
    <div id="player-assignment-card" style="display:none;background:var(--paper);border:1px solid var(--line);border-radius:8px;padding:12px 16px;margin-top:12px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <strong id="inspect-pos-title" style="color:var(--navy);font-size:1.05rem">Position Role</strong>
        <span id="inspect-pos-cue" style="background:var(--gold-bg);color:var(--gold-text);padding:2px 8px;border-radius:4px;font-size:0.8rem;font-weight:800">Cue</span>
      </div>
      <p id="inspect-pos-detail" style="margin:6px 0 0;font-size:0.9rem;color:var(--ink)"></p>
    </div>
  `;

  container.innerHTML = svgHtml;
  attachDiagramEvents();
}

/**
 * Animated Snap & Run Simulation
 */
function animatePlayExecution() {
  if (FIELD_CONFIG.isAnimating) return;
  FIELD_CONFIG.isAnimating = true;

  const run = FIELD_CONFIG.runs[FIELD_CONFIG.activeRunKey];
  const football = document.getElementById("animated-football");
  const animLead = document.getElementById("animated-lead");
  const animRunner = document.getElementById("animated-runner");
  const staticLead = document.getElementById("static-lead");
  const staticRunner = document.getElementById("static-runner");

  if (!football || !animLead || !animRunner) return;

  // Sound cadence
  if (window.sfx) window.sfx.playCadence();

  // Phase 1: Snap to Runner (~0.5s)
  football.setAttribute("opacity", "1");
  football.setAttribute("cx", "400");
  football.setAttribute("cy", "300");

  let snapProgress = 0;
  const snapInterval = setInterval(() => {
    snapProgress += 0.1;
    const curY = 300 + (410 - 300) * snapProgress;
    football.setAttribute("cy", curY);

    if (snapProgress >= 1) {
      clearInterval(snapInterval);
      football.setAttribute("opacity", "0");
      runPaths();
    }
  }, 30);

  function runPaths() {
    if (staticLead) staticLead.setAttribute("opacity", "0.2");
    if (staticRunner) staticRunner.setAttribute("opacity", "0.2");

    animLead.setAttribute("opacity", "1");
    animRunner.setAttribute("opacity", "1");

    let progress = 0;
    const leadPts = run.leadPath;
    const runPts = run.runnerPath;

    FIELD_CONFIG.animationInterval = setInterval(() => {
      progress += 0.02;
      if (progress > 1) progress = 1;

      // Interpolate lead
      const leadIdx = Math.min(Math.floor(progress * (leadPts.length - 1)), leadPts.length - 2);
      const leadSubProg = (progress * (leadPts.length - 1)) - leadIdx;
      const lx = leadPts[leadIdx].x + (leadPts[leadIdx + 1].x - leadPts[leadIdx].x) * leadSubProg;
      const ly = leadPts[leadIdx].y + (leadPts[leadIdx + 1].y - leadPts[leadIdx].y) * leadSubProg;
      animLead.setAttribute("cx", lx);
      animLead.setAttribute("cy", ly);

      // Interpolate runner
      const runIdx = Math.min(Math.floor(progress * (runPts.length - 1)), runPts.length - 2);
      const runSubProg = (progress * (runPts.length - 1)) - runIdx;
      const rx = runPts[runIdx].x + (runPts[runIdx + 1].x - runPts[runIdx].x) * runSubProg;
      const ry = runPts[runIdx].y + (runPts[runIdx + 1].y - runPts[runIdx].y) * runSubProg;
      animRunner.setAttribute("cx", rx);
      animRunner.setAttribute("cy", ry);

      if (progress >= 1) {
        clearInterval(FIELD_CONFIG.animationInterval);
        FIELD_CONFIG.isAnimating = false;
      }
    }, 25);
  }
}

function resetPlayAnimation() {
  if (FIELD_CONFIG.animationInterval) clearInterval(FIELD_CONFIG.animationInterval);
  FIELD_CONFIG.isAnimating = false;
  renderFieldDiagram("field-diagram-container");
}

function attachDiagramEvents() {
  document.getElementById("btn-animate-play")?.addEventListener("click", animatePlayExecution);
  document.getElementById("btn-reset-animation")?.addEventListener("click", resetPlayAnimation);

  document.getElementById("btn-def-5v4")?.addEventListener("click", () => {
    renderFieldDiagram("field-diagram-container", null, "5v4");
  });

  document.getElementById("btn-def-8v8")?.addEventListener("click", () => {
    renderFieldDiagram("field-diagram-container", null, "8v8");
  });

  // Player position inspect click
  document.querySelectorAll(".player-token").forEach(token => {
    token.addEventListener("click", () => {
      const pos = token.getAttribute("data-pos");
      const assignment = FIELD_CONFIG.playerAssignments[pos];
      const card = document.getElementById("player-assignment-card");
      if (assignment && card) {
        document.getElementById("inspect-pos-title").textContent = assignment.role;
        document.getElementById("inspect-pos-cue").textContent = assignment.cue;
        document.getElementById("inspect-pos-detail").textContent = assignment.detail;
        card.style.display = "block";
      }
    });
  });
}

function initPlaybookDiagrams() {
  const container = document.getElementById("field-diagram-container");
  if (!container) return;

  const buttons = document.querySelectorAll("[data-run-key]");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const runKey = btn.getAttribute("data-run-key");
      buttons.forEach(b => {
        b.classList.remove("active");
        b.style.outline = "none";
      });
      btn.classList.add("active");
      btn.style.outline = `3px solid ${btn.getAttribute("data-color") || '#f59e0b'}`;

      renderFieldDiagram("field-diagram-container", runKey);

      const detailsBox = document.getElementById("run-detail-description");
      if (detailsBox && FIELD_CONFIG.runs[runKey]) {
        detailsBox.textContent = FIELD_CONFIG.runs[runKey].description;
      }
    });
  });

  renderFieldDiagram("field-diagram-container", "inside-right");
}

document.addEventListener("DOMContentLoaded", initPlaybookDiagrams);
