/**
 * Cy-Fair K/1 Lions — Interactive SVG Field Diagram
 * Renders 8-on-8 flag football formation with dynamic run path visualizer.
 */

const FIELD_CONFIG = {
  runs: {
    "inside-right": {
      name: "Inside Right",
      colorName: "Red Diamond",
      color: "#d32f2f",
      hole: "C-RG",
      leadPath: "M 400,350 Q 430,320 435,260",
      runnerPath: "M 400,410 Q 425,360 435,210 L 435,120",
      targetHole: { x: 435, y: 300 },
      description: "Direct snap to Runner. Lead hits the C-RG hole first, picks up LB. Runner follows lead, plants at cone, goes north."
    },
    "inside-left": {
      name: "Inside Left",
      colorName: "Blue Circle",
      color: "#1976d2",
      hole: "C-LG",
      leadPath: "M 400,350 Q 370,320 365,260",
      runnerPath: "M 400,410 Q 375,360 365,210 L 365,120",
      targetHole: { x: 365, y: 300 },
      description: "Direct snap to Runner. Lead attacks C-LG hole. Runner follows lead, plants firmly at landmark cone, explodes north."
    },
    "off-tackle-right": {
      name: "Off-Tackle Right",
      colorName: "Gold Star",
      color: "#e6a100",
      hole: "RG-RT",
      leadPath: "M 400,350 Q 480,340 505,260",
      runnerPath: "M 400,410 Q 470,370 505,220 L 515,120",
      targetHole: { x: 505, y: 300 },
      description: "Direct snap. Lead attacks the RG-RT alley. Runner presses toward the hole, plants on outside foot, cuts north."
    },
    "off-tackle-left": {
      name: "Off-Tackle Left",
      colorName: "Green Triangle",
      color: "#2e7d32",
      hole: "LG-LT",
      leadPath: "M 400,350 Q 320,340 295,260",
      runnerPath: "M 400,410 Q 330,370 295,220 L 285,120",
      targetHole: { x: 295, y: 300 },
      description: "Direct snap. Lead attacks LG-LT alley. Runner presses hole, plants off outside foot, drives north."
    },
    "wide-right": {
      name: "Wide Right",
      colorName: "Orange Square",
      color: "#e65100",
      hole: "RT outside hip",
      leadPath: "M 400,350 Q 520,350 580,280",
      runnerPath: "M 400,410 Q 530,400 585,240 L 590,120",
      targetHole: { x: 580, y: 300 },
      description: "Direct snap. Lead seals perimeter outside RT. Runner sweeps to outside cone, plants, and turns upfield. CB must not let outside."
    },
    "wide-left": {
      name: "Wide Left",
      colorName: "Purple Hexagon",
      color: "#7b1fa2",
      hole: "LT outside hip",
      leadPath: "M 400,350 Q 280,350 220,280",
      runnerPath: "M 400,410 Q 270,400 215,240 L 210,120",
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
    <svg viewBox="0 0 800 480" class="field-diagram" xmlns="http://www.w3.org/2000/svg" aria-label="Field Diagram for ${run.name}">
      <defs>
        <!-- Arrowhead Marker -->
        <marker id="arrow-${activeRunKey}" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="${run.color}" />
        </marker>
        <marker id="arrow-lead" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#f5b800" />
        </marker>
        <!-- Glow Filter -->
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.5"/>
        </filter>
      </defs>

      <!-- Field Background & Yardlines -->
      <rect x="10" y="10" width="780" height="460" rx="8" fill="#1b5e20" stroke="#040c17" stroke-width="4" />
      
      <!-- Yardlines -->
      <line x1="20" y1="120" x2="780" y2="120" stroke="rgba(255,255,255,0.4)" stroke-width="2" stroke-dasharray="6,6" />
      <line x1="20" y1="200" x2="780" y2="200" stroke="rgba(255,255,255,0.3)" stroke-width="2" />
      <line x1="20" y1="300" x2="780" y2="300" stroke="#f5b800" stroke-width="4" /> <!-- Line of Scrimmage -->
      <line x1="20" y1="400" x2="780" y2="400" stroke="rgba(255,255,255,0.3)" stroke-width="2" />

      <!-- Field Labels -->
      <text x="35" y="294" fill="#f5b800" font-weight="900" font-size="12" letter-spacing="1">LOS</text>
      <text x="35" y="194" fill="rgba(255,255,255,0.5)" font-weight="700" font-size="11">5 YD</text>
      <text x="35" y="114" fill="rgba(255,255,255,0.5)" font-weight="700" font-size="11">10 YD</text>

      <!-- Cones (Landmarks) -->
      <!-- C-LG (365), C-RG (435), LG-LT (295), RG-RT (505), LT Out (220), RT Out (580) -->
      <g id="landmarks" filter="url(#glow)">
        <!-- LT Outside Cone (Purple Hexagon) -->
        <polygon points="220,290 228,306 212,306" fill="#7b1fa2" stroke="#fff" stroke-width="1.5" />
        <!-- LG-LT Cone (Green Triangle) -->
        <polygon points="295,290 303,306 287,306" fill="#2e7d32" stroke="#fff" stroke-width="1.5" />
        <!-- C-LG Cone (Blue Circle) -->
        <polygon points="365,290 373,306 357,306" fill="#1976d2" stroke="#fff" stroke-width="1.5" />
        <!-- C-RG Cone (Red Diamond) -->
        <polygon points="435,290 443,306 427,306" fill="#d32f2f" stroke="#fff" stroke-width="1.5" />
        <!-- RG-RT Cone (Gold Star) -->
        <polygon points="505,290 513,306 497,306" fill="#e6a100" stroke="#fff" stroke-width="1.5" />
        <!-- RT Outside Cone (Orange Square) -->
        <polygon points="580,290 588,306 572,306" fill="#e65100" stroke="#fff" stroke-width="1.5" />
      </g>

      <!-- Active Hole Highlight -->
      <circle cx="${run.targetHole.x}" cy="${run.targetHole.y}" r="22" fill="none" stroke="${run.color}" stroke-width="3" stroke-dasharray="4,3">
        <animate attributeName="r" values="18;26;18" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.5s" repeatCount="indefinite" />
      </circle>

      <!-- Defense Look Team (4 Players: Front 3 + CB) -->
      <g id="defense" filter="url(#glow)">
        <!-- Front 3 (DL/LB) -->
        <circle cx="340" cy="240" r="16" fill="#37474f" stroke="#eceff1" stroke-width="2" />
        <text x="340" y="245" fill="#fff" font-size="11" font-weight="900" text-anchor="middle">F</text>

        <circle cx="400" cy="225" r="16" fill="#37474f" stroke="#eceff1" stroke-width="2" />
        <text x="400" y="230" fill="#fff" font-size="11" font-weight="900" text-anchor="middle">MLB</text>

        <circle cx="460" cy="240" r="16" fill="#37474f" stroke="#eceff1" stroke-width="2" />
        <text x="460" y="245" fill="#fff" font-size="11" font-weight="900" text-anchor="middle">F</text>

        <!-- Cornerback (CB) -->
        <circle cx="610" cy="220" r="16" fill="#263238" stroke="#f5b800" stroke-width="2" />
        <text x="610" y="225" fill="#f5b800" font-size="11" font-weight="900" text-anchor="middle">CB</text>
      </g>

      <!-- Offensive Run & Lead Paths -->
      <g id="play-routes">
        <!-- Lead Blocker Path -->
        <path d="${run.leadPath}" fill="none" stroke="#f5b800" stroke-width="4" stroke-dasharray="5,4" marker-end="url(#arrow-lead)" />
        
        <!-- Runner Path (Thick Colored Route) -->
        <path d="${run.runnerPath}" fill="none" stroke="${run.color}" stroke-width="6" stroke-linecap="round" marker-end="url(#arrow-${activeRunKey})" filter="url(#glow)" />
      </g>

      <!-- Offense 8 Players -->
      <g id="offense" filter="url(#glow)">
        <!-- Center (C) -->
        <circle cx="400" cy="300" r="18" fill="#07172c" stroke="#f5b800" stroke-width="3" />
        <text x="400" y="305" fill="#f5b800" font-size="13" font-weight="900" text-anchor="middle">C</text>

        <!-- Left Guard (LG) -->
        <circle cx="330" cy="300" r="17" fill="#07172c" stroke="#f5b800" stroke-width="2.5" />
        <text x="330" y="305" fill="#fff" font-size="11" font-weight="900" text-anchor="middle">LG</text>

        <!-- Right Guard (RG) -->
        <circle cx="470" cy="300" r="17" fill="#07172c" stroke="#f5b800" stroke-width="2.5" />
        <text x="470" y="305" fill="#fff" font-size="11" font-weight="900" text-anchor="middle">RG</text>

        <!-- Left Tackle (LT) -->
        <circle cx="260" cy="300" r="17" fill="#07172c" stroke="#f5b800" stroke-width="2.5" />
        <text x="260" y="305" fill="#fff" font-size="11" font-weight="900" text-anchor="middle">LT</text>

        <!-- Right Tackle (RT) -->
        <circle cx="540" cy="300" r="17" fill="#07172c" stroke="#f5b800" stroke-width="2.5" />
        <text x="540" y="305" fill="#fff" font-size="11" font-weight="900" text-anchor="middle">RT</text>

        <!-- Wide Receiver (WR) -->
        <circle cx="150" cy="300" r="16" fill="#07172c" stroke="#f5b800" stroke-width="2" />
        <text x="150" y="305" fill="#fff" font-size="11" font-weight="900" text-anchor="middle">WR</text>

        <!-- Lead Blocker (L) -->
        <circle cx="400" cy="350" r="17" fill="#f5b800" stroke="#07172c" stroke-width="3" />
        <text x="400" y="355" fill="#07172c" font-size="12" font-weight="900" text-anchor="middle">L</text>

        <!-- Designated Runner (R) — Shotgun ~3 yards -->
        <circle cx="400" cy="410" r="19" fill="${run.color}" stroke="#fff" stroke-width="3" />
        <text x="400" y="416" fill="#fff" font-size="13" font-weight="900" text-anchor="middle">R</text>
      </g>

      <!-- Legend Overlay -->
      <g transform="translate(20, 20)">
        <rect width="200" height="58" rx="4" fill="rgba(7, 23, 44, 0.85)" stroke="#f5b800" stroke-width="1.5" />
        <text x="12" y="22" fill="${run.color}" font-size="13" font-weight="900">${run.name.toUpperCase()}</text>
        <text x="12" y="38" fill="#f5b800" font-size="11" font-weight="700">Landmark: ${run.hole} (${run.colorName})</text>
        <text x="12" y="50" fill="#a4bedb" font-size="9" font-weight="600">Direct Snap to Runner · Shotgun ~3 yd</text>
      </g>
    </svg>
  `;

  container.innerHTML = svgHtml;
}

// Attach diagram listeners to buttons/cards
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

      // Update call details box if available
      const detailsBox = document.getElementById("run-detail-description");
      if (detailsBox && FIELD_CONFIG.runs[runKey]) {
        detailsBox.textContent = FIELD_CONFIG.runs[runKey].description;
      }
    });
  });

  // Default render
  renderFieldDiagram("field-diagram-container", "inside-right");
}

document.addEventListener("DOMContentLoaded", initPlaybookDiagrams);
