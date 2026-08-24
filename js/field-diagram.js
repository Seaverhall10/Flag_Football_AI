/**
 * Cy-Fair K/1 Lions — Modern SVG Field Diagram
 * Renders 8-on-8 flag football formation with dynamic run path visualizer.
 */

const FIELD_CONFIG = {
  runs: {
    "inside-right": {
      name: "Inside Right",
      colorName: "Red Diamond",
      color: "#dc2626",
      hole: "C-RG",
      leadPath: "M 400,345 Q 430,315 435,255",
      runnerPath: "M 400,410 Q 425,360 435,210 L 435,115",
      targetHole: { x: 435, y: 300 },
      description: "Direct snap to Runner (~3 yds). Lead attacks the C-RG A-gap hole first, picks up linebacker. Runner follows lead, plants at cone, drives north."
    },
    "inside-left": {
      name: "Inside Left",
      colorName: "Blue Circle",
      color: "#2563eb",
      hole: "C-LG",
      leadPath: "M 400,345 Q 370,315 365,255",
      runnerPath: "M 400,410 Q 375,360 365,210 L 365,115",
      targetHole: { x: 365, y: 300 },
      description: "Direct snap to Runner. Lead attacks C-LG A-gap hole. Runner follows lead, plants firmly at landmark cone, explodes north."
    },
    "off-tackle-right": {
      name: "Off-Tackle Right",
      colorName: "Gold Star",
      color: "#d97706",
      hole: "RG-RT",
      leadPath: "M 400,345 Q 480,335 505,255",
      runnerPath: "M 400,410 Q 470,370 505,215 L 515,115",
      targetHole: { x: 505, y: 300 },
      description: "Direct snap. Lead attacks the RG-RT B-gap alley. Runner presses toward the hole, plants on outside foot, cuts north."
    },
    "off-tackle-left": {
      name: "Off-Tackle Left",
      colorName: "Green Triangle",
      color: "#16a34a",
      hole: "LG-LT",
      leadPath: "M 400,345 Q 320,335 295,255",
      runnerPath: "M 400,410 Q 330,370 295,215 L 285,115",
      targetHole: { x: 295, y: 300 },
      description: "Direct snap. Lead attacks LG-LT B-gap alley. Runner presses hole, plants off outside foot, drives north."
    },
    "wide-right": {
      name: "Wide Right",
      colorName: "Orange Square",
      color: "#ea580c",
      hole: "RT outside hip",
      leadPath: "M 400,345 Q 520,345 580,275",
      runnerPath: "M 400,410 Q 530,400 585,235 L 590,115",
      targetHole: { x: 580, y: 300 },
      description: "Direct snap. Lead seals perimeter outside RT. Runner sweeps to outside cone, plants, and turns upfield. CB must not allow outside."
    },
    "wide-left": {
      name: "Wide Left",
      colorName: "Purple Hexagon",
      color: "#9333ea",
      hole: "LT outside hip",
      leadPath: "M 400,345 Q 280,345 220,275",
      runnerPath: "M 400,410 Q 270,400 215,235 L 210,115",
      targetHole: { x: 220, y: 300 },
      description: "Direct snap. Lead seals outside LT. Runner takes angle to outside cone, plants hard, cuts up sideline."
    }
  }
};

function renderFieldDiagram(containerId, activeRunKey = "inside-right") {
  const container = document.getElementById(containerId);
  if (!container) return;

  const run = FIELD_CONFIG.runs[activeRunKey] || FIELD_CONFIG.runs["inside-right"];

  const svgHtml = `
    <svg viewBox="0 0 800 460" class="field-diagram" xmlns="http://www.w3.org/2000/svg" aria-label="Field Diagram for ${run.name}">
      <defs>
        <!-- Arrowhead Markers -->
        <marker id="arrow-${activeRunKey}" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="${run.color}" />
        </marker>
        <marker id="arrow-lead" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
        </marker>
      </defs>

      <!-- Field Surface -->
      <rect x="8" y="8" width="784" height="444" rx="12" fill="#144a29" stroke="#0f172a" stroke-width="3" />
      
      <!-- Yardlines -->
      <line x1="16" y1="115" x2="784" y2="115" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" stroke-dasharray="8,6" />
      <line x1="16" y1="195" x2="784" y2="195" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" />
      <line x1="16" y1="300" x2="784" y2="300" stroke="#f59e0b" stroke-width="3.5" /> <!-- Line of Scrimmage -->
      <line x1="16" y1="390" x2="784" y2="390" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" />

      <!-- Field Markers -->
      <text x="32" y="294" fill="#f59e0b" font-weight="900" font-size="11" letter-spacing="1">LOS</text>
      <text x="32" y="190" fill="rgba(255,255,255,0.45)" font-weight="700" font-size="10">5 YD</text>
      <text x="32" y="110" fill="rgba(255,255,255,0.45)" font-weight="700" font-size="10">10 YD</text>

      <!-- Landmark Cones -->
      <g id="landmarks">
        <!-- LT Outside Cone (Purple Hexagon) -->
        <polygon points="220,288 228,304 212,304" fill="#9333ea" stroke="#fff" stroke-width="1.5" />
        <!-- LG-LT Cone (Green Triangle) -->
        <polygon points="295,288 303,304 287,304" fill="#16a34a" stroke="#fff" stroke-width="1.5" />
        <!-- C-LG Cone (Blue Circle) -->
        <polygon points="365,288 373,304 357,304" fill="#2563eb" stroke="#fff" stroke-width="1.5" />
        <!-- C-RG Cone (Red Diamond) -->
        <polygon points="435,288 443,304 427,304" fill="#dc2626" stroke="#fff" stroke-width="1.5" />
        <!-- RG-RT Cone (Gold Star) -->
        <polygon points="505,288 513,304 497,304" fill="#d97706" stroke="#fff" stroke-width="1.5" />
        <!-- RT Outside Cone (Orange Square) -->
        <polygon points="580,288 588,304 572,304" fill="#ea580c" stroke="#fff" stroke-width="1.5" />
      </g>

      <!-- Active Hole Pulse -->
      <circle cx="${run.targetHole.x}" cy="${run.targetHole.y}" r="20" fill="none" stroke="${run.color}" stroke-width="2.5" stroke-dasharray="4,3">
        <animate attributeName="r" values="16;24;16" dur="1.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.9;0.2;0.9" dur="1.6s" repeatCount="indefinite" />
      </circle>

      <!-- Defensive Look Team (4 Players: Front 3 + CB) -->
      <g id="defense">
        <circle cx="340" cy="235" r="15" fill="#1e293b" stroke="#94a3b8" stroke-width="2" />
        <text x="340" y="239" fill="#fff" font-size="10" font-weight="800" text-anchor="middle">DL</text>

        <circle cx="400" cy="220" r="15" fill="#1e293b" stroke="#94a3b8" stroke-width="2" />
        <text x="400" y="224" fill="#fff" font-size="10" font-weight="800" text-anchor="middle">MLB</text>

        <circle cx="460" cy="235" r="15" fill="#1e293b" stroke="#94a3b8" stroke-width="2" />
        <text x="460" y="239" fill="#fff" font-size="10" font-weight="800" text-anchor="middle">DL</text>

        <circle cx="610" cy="215" r="15" fill="#1e293b" stroke="#f59e0b" stroke-width="2" />
        <text x="610" y="219" fill="#f59e0b" font-size="10" font-weight="800" text-anchor="middle">CB</text>
      </g>

      <!-- Offensive Run & Lead Paths -->
      <g id="play-routes">
        <!-- Lead Blocker Path -->
        <path d="${run.leadPath}" fill="none" stroke="#f59e0b" stroke-width="3.5" stroke-dasharray="6,4" marker-end="url(#arrow-lead)" />
        
        <!-- Runner Path (Colored Route) -->
        <path d="${run.runnerPath}" fill="none" stroke="${run.color}" stroke-width="5.5" stroke-linecap="round" marker-end="url(#arrow-${activeRunKey})" />
      </g>

      <!-- Offense 8 Players -->
      <g id="offense">
        <!-- Center (C) -->
        <circle cx="400" cy="300" r="17" fill="#0b192c" stroke="#f59e0b" stroke-width="2.5" />
        <text x="400" y="305" fill="#f59e0b" font-size="12" font-weight="900" text-anchor="middle">C</text>

        <!-- Left Guard (LG) -->
        <circle cx="330" cy="300" r="16" fill="#0b192c" stroke="#f59e0b" stroke-width="2" />
        <text x="330" y="304" fill="#fff" font-size="10" font-weight="800" text-anchor="middle">LG</text>

        <!-- Right Guard (RG) -->
        <circle cx="470" cy="300" r="16" fill="#0b192c" stroke="#f59e0b" stroke-width="2" />
        <text x="470" y="304" fill="#fff" font-size="10" font-weight="800" text-anchor="middle">RG</text>

        <!-- Left Tackle (LT) -->
        <circle cx="260" cy="300" r="16" fill="#0b192c" stroke="#f59e0b" stroke-width="2" />
        <text x="260" y="304" fill="#fff" font-size="10" font-weight="800" text-anchor="middle">LT</text>

        <!-- Right Tackle (RT) -->
        <circle cx="540" cy="300" r="16" fill="#0b192c" stroke="#f59e0b" stroke-width="2" />
        <text x="540" y="304" fill="#fff" font-size="10" font-weight="800" text-anchor="middle">RT</text>

        <!-- Wide Receiver (WR) -->
        <circle cx="150" cy="300" r="15" fill="#0b192c" stroke="#f59e0b" stroke-width="2" />
        <text x="150" y="304" fill="#fff" font-size="10" font-weight="800" text-anchor="middle">WR</text>

        <!-- Lead Blocker (L) -->
        <circle cx="400" cy="345" r="16" fill="#f59e0b" stroke="#0b192c" stroke-width="2.5" />
        <text x="400" y="350" fill="#0b192c" font-size="11" font-weight="900" text-anchor="middle">L</text>

        <!-- Designated Runner (R) — Shotgun ~3 yards -->
        <circle cx="400" cy="410" r="18" fill="${run.color}" stroke="#fff" stroke-width="2.5" />
        <text x="400" y="415" fill="#fff" font-size="12" font-weight="900" text-anchor="middle">R</text>
      </g>

      <!-- Badge Overlay -->
      <g transform="translate(18, 18)">
        <rect width="210" height="52" rx="6" fill="rgba(11, 25, 44, 0.9)" stroke="#334155" stroke-width="1" />
        <text x="12" y="20" fill="${run.color}" font-size="12" font-weight="800">${run.name.toUpperCase()}</text>
        <text x="12" y="36" fill="#f59e0b" font-size="10" font-weight="700">Landmark: ${run.hole} (${run.colorName})</text>
        <text x="12" y="46" fill="#94a3b8" font-size="8.5" font-weight="500">Shotgun ~3 yd Direct Snap</text>
      </g>
    </svg>
  `;

  container.innerHTML = svgHtml;
}

function initPlaybookDiagrams() {
  const container = document.getElementById("field-diagram-container");
  if (!container) return;

  const buttons = document.querySelectorAll("[data-run-key]");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const runKey = btn.getAttribute("data-run-key");
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
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
