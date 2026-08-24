/**
 * Cy-Fair K/1 Lions — Pro SVG Field Diagram & 8-Man Blocking Scheme Visualizer
 * Accurately spaced field:
 * - Defense Line 1 yd off ball (y = 240, across LOS)
 * - Line of Scrimmage & Football (y = 300)
 * - Offensive Line on Offense side (y = 345)
 * - Landmark Cones in the gaps (y = 315)
 * - Lead Blocker (y = 425)
 * - Designated Runner in Shotgun (y = 515)
 * - Full 8-Man Linemen Blocking Angles (C, LG, RG, LT, RT, WR) for each play!
 */

const FIELD_CONFIG = {
  activeDefenseMode: "5v4", // "5v4" or "8v8"
  activeRunKey: "inside-right",
  showBlockingAngles: true,
  isAnimating: false,
  animationInterval: null,

  runs: {
    "inside-right": {
      name: "Inside Right",
      colorName: "Red Diamond",
      color: "#dc2626",
      hole: "C-RG",
      targetHole: { x: 460, y: 315 },
      description: "Direct snap to Runner (~3 yds). Center drive-blocks Nose left; RG drive-blocks DL right. Lead attacks the C-RG A-gap hole first to seal Linebacker. Runner follows lead, plants on cone, drives north.",
      leadPath: [{x:420,y:425}, {x:450,y:370}, {x:460,y:305}, {x:465,y:210}],
      runnerPath: [{x:420,y:515}, {x:440,y:440}, {x:460,y:315}, {x:460,y:200}, {x:460,y:90}],
      blocking: [
        { from: {x:420,y:345}, to: {x:390,y:260}, label: "Drive DL Left" },
        { from: {x:500,y:345}, to: {x:530,y:260}, label: "Drive DL Right" },
        { from: {x:580,y:345}, to: {x:600,y:260}, label: "Seal Edge" },
        { from: {x:340,y:345}, to: {x:330,y:260}, label: "Backside Cutoff" },
        { from: {x:260,y:345}, to: {x:250,y:260}, label: "Backside Seal" },
        { from: {x:120,y:345}, to: {x:140,y:230}, label: "Stalk CB" }
      ]
    },

    "inside-left": {
      name: "Inside Left",
      colorName: "Blue Circle",
      color: "#2563eb",
      hole: "C-LG",
      targetHole: { x: 380, y: 315 },
      description: "Direct snap to Runner. Center drive-blocks Nose right; LG drive-blocks DL left. Lead attacks the C-LG A-gap hole first to seal Linebacker. Runner follows lead, plants firmly on cone, explodes north.",
      leadPath: [{x:420,y:425}, {x:390,y:370}, {x:380,y:305}, {x:375,y:210}],
      runnerPath: [{x:420,y:515}, {x:400,y:440}, {x:380,y:315}, {x:380,y:200}, {x:380,y:90}],
      blocking: [
        { from: {x:420,y:345}, to: {x:450,y:260}, label: "Drive DL Right" },
        { from: {x:340,y:345}, to: {x:310,y:260}, label: "Drive DL Left" },
        { from: {x:260,y:345}, to: {x:240,y:260}, label: "Seal Edge" },
        { from: {x:500,y:345}, to: {x:510,y:260}, label: "Backside Cutoff" },
        { from: {x:580,y:345}, to: {x:590,y:260}, label: "Backside Seal" },
        { from: {x:120,y:345}, to: {x:130,y:230}, label: "Stalk CB" }
      ]
    },

    "off-tackle-right": {
      name: "Off-Tackle Right",
      colorName: "Gold Star",
      color: "#d97706",
      hole: "RG-RT",
      targetHole: { x: 540, y: 315 },
      description: "Alley run through B-gap. RG down-blocks interior DL; RT kick-out blocks defensive end. Lead attacks RG-RT alley to seal Linebacker. Runner presses hole, plants outside foot, cuts north.",
      leadPath: [{x:420,y:425}, {x:480,y:380}, {x:535,y:310}, {x:545,y:210}],
      runnerPath: [{x:420,y:515}, {x:470,y:440}, {x:540,y:315}, {x:545,y:200}, {x:550,y:90}],
      blocking: [
        { from: {x:420,y:345}, to: {x:430,y:260}, label: "Reach DL" },
        { from: {x:500,y:345}, to: {x:460,y:260}, label: "Down Block" },
        { from: {x:580,y:345}, to: {x:625,y:260}, label: "Kick Out DE" },
        { from: {x:340,y:345}, to: {x:350,y:260}, label: "Backside Cutoff" },
        { from: {x:260,y:345}, to: {x:270,y:260}, label: "Backside Seal" },
        { from: {x:120,y:345}, to: {x:140,y:230}, label: "Clearout" }
      ]
    },

    "off-tackle-left": {
      name: "Off-Tackle Left",
      colorName: "Green Triangle",
      color: "#16a34a",
      hole: "LG-LT",
      targetHole: { x: 300, y: 315 },
      description: "Alley run through B-gap. LG down-blocks interior DL; LT kick-out blocks defensive end. Lead attacks LG-LT alley to seal Linebacker. Runner plants outside foot and drives north.",
      leadPath: [{x:420,y:425}, {x:360,y:380}, {x:305,y:310}, {x:295,y:210}],
      runnerPath: [{x:420,y:515}, {x:370,y:440}, {x:300,y:315}, {x:295,y:200}, {x:290,y:90}],
      blocking: [
        { from: {x:420,y:345}, to: {x:410,y:260}, label: "Reach DL" },
        { from: {x:340,y:345}, to: {x:380,y:260}, label: "Down Block" },
        { from: {x:260,y:345}, to: {x:215,y:260}, label: "Kick Out DE" },
        { from: {x:500,y:345}, to: {x:490,y:260}, label: "Backside Cutoff" },
        { from: {x:580,y:345}, to: {x:570,y:260}, label: "Backside Seal" },
        { from: {x:120,y:345}, to: {x:140,y:230}, label: "Stalk CB" }
      ]
    },

    "wide-right": {
      name: "Wide Right",
      colorName: "Orange Square",
      color: "#ea580c",
      hole: "RT outside hip",
      targetHole: { x: 640, y: 315 },
      description: "Perimeter sweep outside RT. RT & RG reach and seal defenders inside. Lead pulls wide right to seal perimeter edge. Runner sweeps outside RT cone, plants, and turns upfield.",
      leadPath: [{x:420,y:425}, {x:530,y:425}, {x:635,y:340}, {x:655,y:230}],
      runnerPath: [{x:420,y:515}, {x:540,y:480}, {x:640,y:340}, {x:650,y:220}, {x:655,y:90}],
      blocking: [
        { from: {x:420,y:345}, to: {x:450,y:260}, label: "Reach Right" },
        { from: {x:500,y:345}, to: {x:530,y:260}, label: "Reach Right" },
        { from: {x:580,y:345}, to: {x:600,y:260}, label: "Seal Inside" },
        { from: {x:340,y:345}, to: {x:360,y:260}, label: "Backside Cutoff" },
        { from: {x:260,y:345}, to: {x:280,y:260}, label: "Backside Protect" },
        { from: {x:120,y:345}, to: {x:150,y:230}, label: "Clearout" }
      ]
    },

    "wide-left": {
      name: "Wide Left",
      colorName: "Purple Hexagon",
      color: "#9333ea",
      hole: "LT outside hip",
      targetHole: { x: 200, y: 315 },
      description: "Perimeter sweep outside LT. LT & LG reach and seal defenders inside. Lead pulls wide left to seal perimeter edge. Runner sweeps outside LT cone, plants hard, and explodes up sideline.",
      leadPath: [{x:420,y:425}, {x:310,y:425}, {x:205,y:340}, {x:185,y:230}],
      runnerPath: [{x:420,y:515}, {x:300,y:480}, {x:200,y:340}, {x:190,y:220}, {x:185,y:90}],
      blocking: [
        { from: {x:420,y:345}, to: {x:390,y:260}, label: "Reach Left" },
        { from: {x:340,y:345}, to: {x:310,y:260}, label: "Reach Left" },
        { from: {x:260,y:345}, to: {x:240,y:260}, label: "Seal Inside" },
        { from: {x:500,y:345}, to: {x:480,y:260}, label: "Backside Cutoff" },
        { from: {x:580,y:345}, to: {x:560,y:260}, label: "Backside Protect" },
        { from: {x:120,y:345}, to: {x:100,y:230}, label: "Crack CB" }
      ]
    }
  },

  playerAssignments: {
    "C":  { role: "Center", cue: "Find jersey · Head out · Hands inside", detail: "Clean 3-yard shotgun snap direct into Runner's chest, then immediately step up to execute assigned drive/reach block on interior DL." },
    "LG": { role: "Left Guard", cue: "Find jersey · Head out · Hands inside", detail: "Executes assigned combo/down block with Center or reach block to create the designated run seam." },
    "RG": { role: "Right Guard", cue: "Find jersey · Head out · Hands inside", detail: "Executes assigned combo/down block with Center or reach block to protect the designated run gap." },
    "LT": { role: "Left Tackle", cue: "Seal edge · Hands inside", detail: "Controls outside edge defender. Kick-out blocks on off-tackle runs, reach-seals on sweeps." },
    "RT": { role: "Right Tackle", cue: "Seal edge · Hands inside", detail: "Controls right edge defender. Kick-out blocks on off-tackle runs, reach-seals on sweeps." },
    "WR": { role: "Wide Receiver", cue: "Stalk block · Clear out", detail: "Engages the cornerback downfield with hands inside or runs clear-out route to remove deep coverage." },
    "L":  { role: "Lead Blocker", cue: "Hole first · Then LB", detail: "Attacks the called landmark cone FIRST before seeking contact. Identifies and seals the Linebacker to open daylight for the Runner." },
    "R":  { role: "Designated Runner", cue: "Follow · Plant · Go", detail: "Catches the 3-yard snap cleanly. Follows the lead blocker into the gap, plants firmly at the landmark cone, and accelerates north." },
    "DL": { role: "Defensive Line (1 Yd Off)", cue: "Stay home, then flag", detail: "Lined up on the defense side across the neutral zone. Fills assigned gap and pulls flags at the line of scrimmage." },
    "MLB":{ role: "Middle Linebacker", cue: "Flow to ball · Flag pull", detail: "Second-level defender. Reads lead blocker flow, scrapes across the line, and attacks the runner." },
    "CB": { role: "Cornerback", cue: "Nothing outside · Force in", detail: "Keeps outside contain arm free. Forces wide sweeps back inside toward defensive pursuit." },
    "S":  { role: "Safety", cue: "Deep contain · Angle to ball", detail: "Deep third defender. Prevents breakaway touchdowns by taking proper pursuit angle to the sideline." }
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
    <!-- Diagram Control Toolbar -->
    <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px" class="no-print">
      <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">
        <button class="btn btn-primary" id="btn-animate-play" style="padding:6px 14px;font-size:0.85rem">
          ▶ Animate Snap & Run
        </button>
        <button class="btn btn-secondary" id="btn-reset-animation" style="padding:6px 10px;font-size:0.85rem">
          ↺ Reset
        </button>
        <button class="btn ${FIELD_CONFIG.showBlockingAngles ? 'btn-primary' : 'btn-secondary'}" id="btn-toggle-blocking" style="padding:6px 12px;font-size:0.85rem">
          🛡️ Linemen Blocking: ${FIELD_CONFIG.showBlockingAngles ? 'ON' : 'OFF'}
        </button>
      </div>

      <div style="display:flex;gap:6px;align-items:center;background:rgba(0,0,0,0.4);padding:4px 8px;border-radius:6px">
        <span style="font-size:0.75rem;color:#cbd5e1;font-weight:700">DEFENSE:</span>
        <button class="btn ${!is8v8 ? 'btn-primary' : 'btn-secondary'}" id="btn-def-5v4" style="padding:3px 8px;font-size:0.75rem">5v4 Practice</button>
        <button class="btn ${is8v8 ? 'btn-primary' : 'btn-secondary'}" id="btn-def-8v8" style="padding:3px 8px;font-size:0.75rem">8v8 Full Defense</button>
      </div>
    </div>

    <svg viewBox="0 0 840 580" class="field-diagram" id="field-svg" xmlns="http://www.w3.org/2000/svg" aria-label="Field Diagram for ${run.name}">
      <defs>
        <!-- Arrowhead Markers -->
        <marker id="arrow-run" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="${run.color}" />
        </marker>
        <marker id="arrow-lead" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
        </marker>
        <!-- Blocking Line T-Bar Marker -->
        <marker id="block-tbar" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <line x1="5" y1="0" x2="5" y2="10" stroke="#f1f5f9" stroke-width="3.5" />
        </marker>
      </defs>

      <!-- Turf Background -->
      <rect x="8" y="8" width="824" height="564" rx="12" fill="#144a29" stroke="#0f172a" stroke-width="3" />
      
      <!-- Lions Watermark at Midfield -->
      <g opacity="0.07" transform="translate(360, 200) scale(3.5)">
        <path d="M18 2 C13 2 9 5 8 10 C7 14 9 17 9 19 C7 19 5 21 5 24 C5 28 9 31 14 31 C15 31 16 33 18 33 C20 33 21 31 22 31 C27 31 31 28 31 24 C31 21 29 19 27 19 C27 17 29 14 28 10 C27 5 23 2 18 2 Z" fill="#ffffff" />
      </g>

      <!-- Yardlines -->
      <line x1="16" y1="100" x2="824" y2="100" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" stroke-dasharray="8,6" />
      <line x1="16" y1="200" x2="824" y2="200" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" />
      <line x1="16" y1="300" x2="824" y2="300" stroke="#f59e0b" stroke-width="3.5" /> <!-- Line of Scrimmage -->
      <line x1="16" y1="400" x2="824" y2="400" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" />
      <line x1="16" y1="500" x2="824" y2="500" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" />

      <!-- Field Markers -->
      <text x="32" y="294" fill="#f59e0b" font-weight="900" font-size="11" letter-spacing="1">LINE OF SCRIMMAGE</text>
      <text x="32" y="195" fill="rgba(255,255,255,0.45)" font-weight="700" font-size="10">5 YD (DEFENSE)</text>
      <text x="32" y="95" fill="rgba(255,255,255,0.45)" font-weight="700" font-size="10">10 YD (DEEP ZONE)</text>
      <text x="32" y="395" fill="rgba(255,255,255,0.45)" font-weight="700" font-size="10">OFFENSE BACKFIELD</text>
      <text x="32" y="495" fill="rgba(255,255,255,0.45)" font-weight="700" font-size="10">SHOTGUN ~3 YD</text>

      <!-- Football Resting on Line of Scrimmage -->
      <g transform="translate(420, 300)">
        <ellipse cx="0" cy="0" rx="9" ry="5.5" fill="#8d4004" stroke="#ffffff" stroke-width="1.2" />
        <line x1="-5" y1="0" x2="5" y2="0" stroke="#ffffff" stroke-width="1.2" />
      </g>

      <!-- Neutral Zone Strip (Between y=240 Defense and y=345 Offense) -->
      <rect x="16" y="260" width="808" height="70" fill="rgba(245, 158, 11, 0.03)" stroke="none" />

      <!-- Landmark Cones & On-Turf Gap Labels (Placed at y = 315 in the run gaps) -->
      <g id="landmarks">
        <!-- LT Outside Cone (Purple Hexagon) -->
        <polygon points="200,305 208,321 192,321" fill="#9333ea" stroke="#fff" stroke-width="1.5" />
        <text x="200" y="335" fill="#e9d5ff" font-size="9" font-weight="800" text-anchor="middle">LT OUT</text>

        <!-- LG-LT Cone (Green Triangle) -->
        <polygon points="300,305 308,321 292,321" fill="#16a34a" stroke="#fff" stroke-width="1.5" />
        <text x="300" y="335" fill="#bbf7d0" font-size="9" font-weight="800" text-anchor="middle">LG-LT</text>

        <!-- C-LG Cone (Blue Circle) -->
        <polygon points="380,305 388,321 372,321" fill="#2563eb" stroke="#fff" stroke-width="1.5" />
        <text x="380" y="335" fill="#bfdbfe" font-size="9" font-weight="800" text-anchor="middle">C-LG</text>

        <!-- C-RG Cone (Red Diamond) -->
        <polygon points="460,305 468,321 452,321" fill="#dc2626" stroke="#fff" stroke-width="1.5" />
        <text x="460" y="335" fill="#fecaca" font-size="9" font-weight="800" text-anchor="middle">C-RG</text>

        <!-- RG-RT Cone (Gold Star) -->
        <polygon points="540,305 548,321 532,321" fill="#d97706" stroke="#fff" stroke-width="1.5" />
        <text x="540" y="335" fill="#fde68a" font-size="9" font-weight="800" text-anchor="middle">RG-RT</text>

        <!-- RT Outside Cone (Orange Square) -->
        <polygon points="640,305 648,321 632,321" fill="#ea580c" stroke="#fff" stroke-width="1.5" />
        <text x="640" y="335" fill="#fed7aa" font-size="9" font-weight="800" text-anchor="middle">RT OUT</text>
      </g>

      <!-- Active Target Hole Pulse Indicator -->
      <circle cx="${run.targetHole.x}" cy="${run.targetHole.y}" r="22" fill="none" stroke="${run.color}" stroke-width="2.5" stroke-dasharray="4,3">
        <animate attributeName="r" values="18;26;18" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.9;0.2;0.9" dur="1.5s" repeatCount="indefinite" />
      </circle>

      <!-- 8-MAN OFFENSIVE LINEMEN BLOCKING ANGLES (T-Bar Football Blocks) -->
      <g id="linemen-blocking-angles" opacity="${FIELD_CONFIG.showBlockingAngles ? '1' : '0'}">
        ${run.blocking.map(b => `
          <g>
            <line x1="${b.from.x}" y1="${b.from.y - 16}" x2="${b.to.x}" y2="${b.to.y}" stroke="#f1f5f9" stroke-width="3" marker-end="url(#block-tbar)" />
            <text x="${(b.from.x + b.to.x)/2 + 8}" y="${(b.from.y + b.to.y)/2}" fill="#ffffff" font-size="8.5" font-weight="750" opacity="0.9">${b.label}</text>
          </g>
        `).join("")}
      </g>

      <!-- DEFENSE SIDE (y = 100 to 240, clearly ACROSS Line of Scrimmage on defense side) -->
      <g id="defense-group">
        ${!is8v8 ? `
          <!-- 5v4 Look Defense (Front 3 at y=240, CB at y=220) -->
          <!-- DL Left -->
          <circle cx="340" cy="240" r="16" fill="#1e293b" stroke="#94a3b8" stroke-width="2" class="player-token" data-pos="DL" />
          <text x="340" y="244" fill="#fff" font-size="10" font-weight="800" text-anchor="middle" pointer-events="none">DL</text>

          <!-- Middle Linebacker (MLB) at y=190 -->
          <circle cx="420" cy="190" r="16" fill="#1e293b" stroke="#94a3b8" stroke-width="2" class="player-token" data-pos="MLB" />
          <text x="420" y="194" fill="#fff" font-size="10" font-weight="800" text-anchor="middle" pointer-events="none">MLB</text>

          <!-- DL Right -->
          <circle cx="500" cy="240" r="16" fill="#1e293b" stroke="#94a3b8" stroke-width="2" class="player-token" data-pos="DL" />
          <text x="500" y="244" fill="#fff" font-size="10" font-weight="800" text-anchor="middle" pointer-events="none">DL</text>

          <!-- Cornerback (CB Contain) at y=220 -->
          <circle cx="660" cy="220" r="16" fill="#1e293b" stroke="#f59e0b" stroke-width="2" class="player-token" data-pos="CB" />
          <text x="660" y="224" fill="#f59e0b" font-size="10" font-weight="800" text-anchor="middle" pointer-events="none">CB</text>
        ` : `
          <!-- 8v8 Full Opponent Defense (4 Down DL/LB at y=240, 2 CB at y=220, 2 Safeties at y=110) -->
          <circle cx="270" cy="240" r="16" fill="#1e293b" stroke="#94a3b8" stroke-width="2" class="player-token" data-pos="DL" />
          <text x="270" y="244" fill="#fff" font-size="10" font-weight="800" text-anchor="middle" pointer-events="none">DE</text>

          <circle cx="360" cy="240" r="16" fill="#1e293b" stroke="#94a3b8" stroke-width="2" class="player-token" data-pos="DL" />
          <text x="360" y="244" fill="#fff" font-size="10" font-weight="800" text-anchor="middle" pointer-events="none">DT</text>

          <circle cx="480" cy="240" r="16" fill="#1e293b" stroke="#94a3b8" stroke-width="2" class="player-token" data-pos="DL" />
          <text x="480" y="244" fill="#fff" font-size="10" font-weight="800" text-anchor="middle" pointer-events="none">DT</text>

          <circle cx="570" cy="240" r="16" fill="#1e293b" stroke="#94a3b8" stroke-width="2" class="player-token" data-pos="DL" />
          <text x="570" y="244" fill="#fff" font-size="10" font-weight="800" text-anchor="middle" pointer-events="none">DE</text>

          <!-- Linebacker (MLB) at y=190 -->
          <circle cx="420" cy="190" r="16" fill="#1e293b" stroke="#94a3b8" stroke-width="2" class="player-token" data-pos="MLB" />
          <text x="420" y="194" fill="#fff" font-size="10" font-weight="800" text-anchor="middle" pointer-events="none">MLB</text>

          <!-- Cornerbacks at y=220 -->
          <circle cx="150" cy="220" r="16" fill="#1e293b" stroke="#f59e0b" stroke-width="2" class="player-token" data-pos="CB" />
          <text x="150" y="224" fill="#f59e0b" font-size="10" font-weight="800" text-anchor="middle" pointer-events="none">CB</text>

          <circle cx="680" cy="220" r="16" fill="#1e293b" stroke="#f59e0b" stroke-width="2" class="player-token" data-pos="CB" />
          <text x="680" y="224" fill="#f59e0b" font-size="10" font-weight="800" text-anchor="middle" pointer-events="none">CB</text>

          <!-- Safeties at y=110 -->
          <circle cx="340" cy="110" r="16" fill="#0f172a" stroke="#38bdf8" stroke-width="2" class="player-token" data-pos="S" />
          <text x="340" y="114" fill="#38bdf8" font-size="10" font-weight="800" text-anchor="middle" pointer-events="none">FS</text>

          <circle cx="500" cy="110" r="16" fill="#0f172a" stroke="#38bdf8" stroke-width="2" class="player-token" data-pos="S" />
          <text x="500" y="114" fill="#38bdf8" font-size="10" font-weight="800" text-anchor="middle" pointer-events="none">SS</text>
        `}
      </g>

      <!-- STATIC ROUTE TRACKS -->
      <g id="play-routes">
        <!-- Lead Blocker Path -->
        <path d="${leadPathD}" fill="none" stroke="#f59e0b" stroke-width="3.5" stroke-dasharray="6,4" marker-end="url(#arrow-lead)" id="lead-route-line" />
        
        <!-- Runner Path -->
        <path d="${runnerPathD}" fill="none" stroke="${run.color}" stroke-width="5.5" stroke-linecap="round" marker-end="url(#arrow-run)" id="runner-route-line" />
      </g>

      <!-- ANIMATED PLAY SIMULATION TOKENS (Hidden initially) -->
      <g id="animated-elements">
        <circle id="animated-football" cx="420" cy="300" r="7" fill="#8d4004" stroke="#fff" stroke-width="1.5" opacity="0" />
        <circle id="animated-lead" cx="420" cy="425" r="17" fill="#f59e0b" stroke="#0b192c" stroke-width="2.5" opacity="0" />
        <circle id="animated-runner" cx="420" cy="515" r="19" fill="${run.color}" stroke="#fff" stroke-width="2.5" opacity="0" />
      </g>

      <!-- OFFENSE SIDE (y = 345 to 515, clearly ON OFFENSE SIDE) -->
      <g id="offense-group">
        <!-- Wide Receiver (WR) at x=120, y=345 -->
        <circle cx="120" cy="345" r="17" fill="#0b192c" stroke="#f59e0b" stroke-width="2" class="player-token" data-pos="WR" />
        <text x="120" y="349" fill="#fff" font-size="10" font-weight="800" text-anchor="middle" pointer-events="none">WR</text>

        <!-- Left Tackle (LT) at x=260, y=345 -->
        <circle cx="260" cy="345" r="17" fill="#0b192c" stroke="#f59e0b" stroke-width="2.5" class="player-token" data-pos="LT" />
        <text x="260" y="349" fill="#fff" font-size="10" font-weight="800" text-anchor="middle" pointer-events="none">LT</text>

        <!-- Left Guard (LG) at x=340, y=345 -->
        <circle cx="340" cy="345" r="17" fill="#0b192c" stroke="#f59e0b" stroke-width="2.5" class="player-token" data-pos="LG" />
        <text x="340" y="349" fill="#fff" font-size="10" font-weight="800" text-anchor="middle" pointer-events="none">LG</text>

        <!-- Center (C) at x=420, y=345 -->
        <circle cx="420" cy="345" r="18" fill="#0b192c" stroke="#f59e0b" stroke-width="3" class="player-token" data-pos="C" />
        <text x="420" y="350" fill="#f59e0b" font-size="12" font-weight="900" text-anchor="middle" pointer-events="none">C</text>

        <!-- Right Guard (RG) at x=500, y=345 -->
        <circle cx="500" cy="345" r="17" fill="#0b192c" stroke="#f59e0b" stroke-width="2.5" class="player-token" data-pos="RG" />
        <text x="500" y="349" fill="#fff" font-size="10" font-weight="800" text-anchor="middle" pointer-events="none">RG</text>

        <!-- Right Tackle (RT) at x=580, y=345 -->
        <circle cx="580" cy="345" r="17" fill="#0b192c" stroke="#f59e0b" stroke-width="2.5" class="player-token" data-pos="RT" />
        <text x="580" y="349" fill="#fff" font-size="10" font-weight="800" text-anchor="middle" pointer-events="none">RT</text>

        <!-- Lead Blocker (L) at x=420, y=425 -->
        <circle cx="420" cy="425" r="17" fill="#f59e0b" stroke="#0b192c" stroke-width="2.5" class="player-token" data-pos="L" id="static-lead" />
        <text x="420" y="430" fill="#0b192c" font-size="12" font-weight="900" text-anchor="middle" pointer-events="none">L</text>

        <!-- Designated Runner (R) in Shotgun ~3 yds at x=420, y=515 -->
        <circle cx="420" cy="515" r="19" fill="${run.color}" stroke="#fff" stroke-width="2.5" class="player-token" data-pos="R" id="static-runner" />
        <text x="420" y="520" fill="#fff" font-size="13" font-weight="900" text-anchor="middle" pointer-events="none">R</text>
      </g>

      <!-- Badge Overlay -->
      <g transform="translate(18, 18)">
        <rect width="230" height="54" rx="6" fill="rgba(11, 25, 44, 0.94)" stroke="#334155" stroke-width="1" />
        <text x="12" y="20" fill="${run.color}" font-size="12" font-weight="800">${run.name.toUpperCase()}</text>
        <text x="12" y="36" fill="#f59e0b" font-size="10" font-weight="700">Landmark: ${run.hole} (${run.colorName})</text>
        <text x="12" y="48" fill="#94a3b8" font-size="8.5" font-weight="500">Shotgun ~3 yd Direct Snap · ${is8v8 ? '8v8 Game Day' : '5v4 Drill'}</text>
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

  if (window.sfx) window.sfx.playCadence();

  // Phase 1: Direct Snap to Runner (~0.45s)
  football.setAttribute("opacity", "1");
  football.setAttribute("cx", "420");
  football.setAttribute("cy", "300");

  let snapProgress = 0;
  const snapInterval = setInterval(() => {
    snapProgress += 0.08;
    const curY = 300 + (515 - 300) * snapProgress;
    football.setAttribute("cy", curY);

    if (snapProgress >= 1) {
      clearInterval(snapInterval);
      football.setAttribute("opacity", "0");
      runPaths();
    }
  }, 25);

  function runPaths() {
    if (staticLead) staticLead.setAttribute("opacity", "0.2");
    if (staticRunner) staticRunner.setAttribute("opacity", "0.2");

    animLead.setAttribute("opacity", "1");
    animRunner.setAttribute("opacity", "1");

    let progress = 0;
    const leadPts = run.leadPath;
    const runPts = run.runnerPath;

    FIELD_CONFIG.animationInterval = setInterval(() => {
      progress += 0.018;
      if (progress > 1) progress = 1;

      // Interpolate lead blocker
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

  document.getElementById("btn-toggle-blocking")?.addEventListener("click", () => {
    FIELD_CONFIG.showBlockingAngles = !FIELD_CONFIG.showBlockingAngles;
    renderFieldDiagram("field-diagram-container");
  });

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
