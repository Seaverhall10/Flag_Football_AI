/**
 * Cy-Fair K/1 Lions - SVG Field Diagram
 * 8v8: 5 OL + RB1/RB2/RB3 vs 3 DL, 2 LB, 2 CB, 1 S.
 * Direct snap to designated runner. No WR/QB split. RB circles are navy (not play colors).
 */

const FIELD_CONFIG = {
  runs: {
    "inside-right": {
      name: "Inside Right",
      colorName: "Red Diamond",
      color: "#dc2626",
      hole: "C-RG",
      runnerId: "RB3",
      leadId: "RB2",
      extraId: "RB1",
      leadPath: "M 400,365 Q 430,315 435,255",
      runnerPath: "M 460,405 Q 440,350 435,210 L 435,115",
      targetHole: { x: 435, y: 300 },
      description: "Direct snap to RB3 (~3 yds). RB2 (Lead) attacks the C-RG A-gap hole first, then LB. RB1 stays an extra back. Runner follows lead, plants at cone, drives north."
    },
    "inside-left": {
      name: "Inside Left",
      colorName: "Blue Circle",
      color: "#2563eb",
      hole: "C-LG",
      runnerId: "RB1",
      leadId: "RB2",
      extraId: "RB3",
      leadPath: "M 400,365 Q 370,315 365,255",
      runnerPath: "M 340,405 Q 360,350 365,210 L 365,115",
      targetHole: { x: 365, y: 300 },
      description: "Direct snap to RB1. RB2 (Lead) attacks C-LG A-gap hole first, then LB. RB3 stays an extra back. Runner follows, plants at landmark cone, explodes north."
    },
    "off-tackle-right": {
      name: "Off-Tackle Right",
      colorName: "Gold Star",
      color: "#d97706",
      hole: "RG-RT",
      runnerId: "RB3",
      leadId: "RB2",
      extraId: "RB1",
      leadPath: "M 400,365 Q 480,335 505,255",
      runnerPath: "M 460,405 Q 490,360 505,215 L 515,115",
      targetHole: { x: 505, y: 300 },
      description: "Direct snap to RB3. RB2 (Lead) attacks the RG-RT B-gap alley first, then LB. Extra back is RB1. Runner plants on outside foot and cuts north."
    },
    "off-tackle-left": {
      name: "Off-Tackle Left",
      colorName: "Green Triangle",
      color: "#16a34a",
      hole: "LG-LT",
      runnerId: "RB1",
      leadId: "RB2",
      extraId: "RB3",
      leadPath: "M 400,365 Q 320,335 295,255",
      runnerPath: "M 340,405 Q 310,360 295,215 L 285,115",
      targetHole: { x: 295, y: 300 },
      description: "Direct snap to RB1. RB2 (Lead) attacks LG-LT B-gap alley first, then LB. Extra back is RB3. Runner plants off outside foot and drives north."
    },
    "wide-right": {
      name: "Wide Right",
      colorName: "Orange Square",
      color: "#ea580c",
      hole: "RT outside hip",
      runnerId: "RB3",
      leadId: "RB2",
      extraId: "RB1",
      leadPath: "M 400,365 Q 520,345 580,275",
      runnerPath: "M 460,405 Q 530,390 585,235 L 590,115",
      targetHole: { x: 580, y: 300 },
      description: "Perimeter RUN, not a split WR. Direct snap to RB3 who sweeps. RB2 (Lead) seals outside RT. Extra back RB1 stays with the play. CB: Nothing outside."
    },
    "wide-left": {
      name: "Wide Left",
      colorName: "Purple Hexagon",
      color: "#9333ea",
      hole: "LT outside hip",
      runnerId: "RB1",
      leadId: "RB2",
      extraId: "RB3",
      leadPath: "M 400,365 Q 280,345 220,275",
      runnerPath: "M 340,405 Q 270,390 215,235 L 210,115",
      targetHole: { x: 220, y: 300 },
      description: "Perimeter RUN, not a split WR. Direct snap to RB1 who sweeps. RB2 (Lead) seals outside LT. Extra back RB3 stays with the play. CB: Nothing outside."
    }
  }
};

function rbCircle(id, x, y, run) {
  const isRunner = id === run.runnerId;
  const isLead = id === run.leadId;
  const stroke = isRunner ? "#ffffff" : (isLead ? "#cbd5e1" : "#f59e0b");
  const sw = isRunner ? "3.2" : "2";
  const dash = isLead && !isRunner ? ' stroke-dasharray="4,3"' : "";
  const tag = isRunner ? "R" : (isLead ? "Lead" : "XB");
  return `
        <circle cx="${x}" cy="${y}" r="16" fill="#0b192c" stroke="${stroke}" stroke-width="${sw}"${dash} />
        <text x="${x}" y="${y + 4}" fill="#fff" font-size="10" font-weight="800" text-anchor="middle">${id}</text>
        <text x="${x}" y="${y + 28}" fill="#cbd5e1" font-size="8" font-weight="700" text-anchor="middle">${tag}</text>`;
}

function renderFieldDiagram(containerId, activeRunKey = "inside-right") {
  const container = document.getElementById(containerId);
  if (!container) return;

  const run = FIELD_CONFIG.runs[activeRunKey] || FIELD_CONFIG.runs["inside-right"];

  const svgHtml = `
    <svg viewBox="0 0 800 460" class="field-diagram" xmlns="http://www.w3.org/2000/svg" aria-label="Field Diagram for ${run.name}">
      <defs>
        <marker id="arrow-${activeRunKey}" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="${run.color}" />
        </marker>
        <marker id="arrow-lead" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#cbd5e1" />
        </marker>
      </defs>

      <rect x="8" y="8" width="784" height="444" rx="12" fill="#144a29" stroke="#0f172a" stroke-width="3" />

      <g opacity="0.08" transform="translate(340, 160) scale(3.2)">
        <path d="M18 2 C13 2 9 5 8 10 C7 14 9 17 9 19 C7 19 5 21 5 24 C5 28 9 31 14 31 C15 31 16 33 18 33 C20 33 21 31 22 31 C27 31 31 28 31 24 C31 21 29 19 27 19 C27 17 29 14 28 10 C27 5 23 2 18 2 Z" fill="#ffffff" />
      </g>

      <line x1="16" y1="115" x2="784" y2="115" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" stroke-dasharray="8,6" />
      <line x1="16" y1="195" x2="784" y2="195" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" />
      <line x1="16" y1="300" x2="784" y2="300" stroke="#f59e0b" stroke-width="3.5" />
      <line x1="16" y1="390" x2="784" y2="390" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" />

      <text x="32" y="294" fill="#f59e0b" font-weight="900" font-size="11" letter-spacing="1">LOS</text>
      <text x="32" y="190" fill="rgba(255,255,255,0.45)" font-weight="700" font-size="10">5 YD</text>
      <text x="32" y="110" fill="rgba(255,255,255,0.45)" font-weight="700" font-size="10">10 YD</text>

      <g id="landmarks">
        <polygon points="220,288 228,304 212,304" fill="#9333ea" stroke="#fff" stroke-width="1.5" />
        <polygon points="295,288 303,304 287,304" fill="#16a34a" stroke="#fff" stroke-width="1.5" />
        <polygon points="365,288 373,304 357,304" fill="#2563eb" stroke="#fff" stroke-width="1.5" />
        <polygon points="435,288 443,304 427,304" fill="#dc2626" stroke="#fff" stroke-width="1.5" />
        <polygon points="505,288 513,304 497,304" fill="#d97706" stroke="#fff" stroke-width="1.5" />
        <polygon points="580,288 588,304 572,304" fill="#ea580c" stroke="#fff" stroke-width="1.5" />
      </g>

      <circle cx="${run.targetHole.x}" cy="${run.targetHole.y}" r="20" fill="none" stroke="${run.color}" stroke-width="2.5" stroke-dasharray="4,3">
        <animate attributeName="r" values="16;24;16" dur="1.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.9;0.2;0.9" dur="1.6s" repeatCount="indefinite" />
      </circle>

      <g id="defense">
        <circle cx="330" cy="262" r="15" fill="#1e293b" stroke="#94a3b8" stroke-width="2" />
        <text x="330" y="266" fill="#fff" font-size="10" font-weight="800" text-anchor="middle">DL</text>
        <circle cx="400" cy="258" r="15" fill="#1e293b" stroke="#94a3b8" stroke-width="2" />
        <text x="400" y="262" fill="#fff" font-size="10" font-weight="800" text-anchor="middle">DL</text>
        <circle cx="470" cy="262" r="15" fill="#1e293b" stroke="#94a3b8" stroke-width="2" />
        <text x="470" y="266" fill="#fff" font-size="10" font-weight="800" text-anchor="middle">DL</text>

        <circle cx="350" cy="210" r="15" fill="#1e293b" stroke="#94a3b8" stroke-width="2" />
        <text x="350" y="214" fill="#fff" font-size="10" font-weight="800" text-anchor="middle">LB</text>
        <circle cx="450" cy="210" r="15" fill="#1e293b" stroke="#94a3b8" stroke-width="2" />
        <text x="450" y="214" fill="#fff" font-size="10" font-weight="800" text-anchor="middle">LB</text>

        <circle cx="160" cy="250" r="15" fill="#1e293b" stroke="#f59e0b" stroke-width="2" />
        <text x="160" y="254" fill="#f59e0b" font-size="10" font-weight="800" text-anchor="middle">CB</text>
        <circle cx="640" cy="250" r="15" fill="#1e293b" stroke="#f59e0b" stroke-width="2" />
        <text x="640" y="254" fill="#f59e0b" font-size="10" font-weight="800" text-anchor="middle">CB</text>

        <circle cx="400" cy="145" r="15" fill="#1e293b" stroke="#94a3b8" stroke-width="2" />
        <text x="400" y="149" fill="#fff" font-size="10" font-weight="800" text-anchor="middle">S</text>
      </g>

      <g id="play-routes">
        <path d="${run.leadPath}" fill="none" stroke="#cbd5e1" stroke-width="3.5" stroke-dasharray="6,4" marker-end="url(#arrow-lead)" />
        <path d="${run.runnerPath}" fill="none" stroke="${run.color}" stroke-width="5.5" stroke-linecap="round" marker-end="url(#arrow-${activeRunKey})" />
      </g>

      <g id="offense">
        <circle cx="400" cy="300" r="17" fill="#0b192c" stroke="#f59e0b" stroke-width="2.5" />
        <text x="400" y="305" fill="#f59e0b" font-size="12" font-weight="900" text-anchor="middle">C</text>
        <circle cx="330" cy="300" r="16" fill="#0b192c" stroke="#f59e0b" stroke-width="2" />
        <text x="330" y="304" fill="#fff" font-size="10" font-weight="800" text-anchor="middle">LG</text>
        <circle cx="470" cy="300" r="16" fill="#0b192c" stroke="#f59e0b" stroke-width="2" />
        <text x="470" y="304" fill="#fff" font-size="10" font-weight="800" text-anchor="middle">RG</text>
        <circle cx="260" cy="300" r="16" fill="#0b192c" stroke="#f59e0b" stroke-width="2" />
        <text x="260" y="304" fill="#fff" font-size="10" font-weight="800" text-anchor="middle">LT</text>
        <circle cx="540" cy="300" r="16" fill="#0b192c" stroke="#f59e0b" stroke-width="2" />
        <text x="540" y="304" fill="#fff" font-size="10" font-weight="800" text-anchor="middle">RT</text>
        ${rbCircle("RB1", 340, 405, run)}
        ${rbCircle("RB2", 400, 365, run)}
        ${rbCircle("RB3", 460, 405, run)}
      </g>

      <g transform="translate(18, 18)">
        <rect width="250" height="58" rx="6" fill="rgba(11, 25, 44, 0.9)" stroke="#334155" stroke-width="1" />
        <text x="12" y="20" fill="${run.color}" font-size="12" font-weight="800">${run.name.toUpperCase()}</text>
        <text x="12" y="36" fill="#e2e8f0" font-size="10" font-weight="700">Landmark: ${run.hole} (${run.colorName})</text>
        <text x="12" y="50" fill="#94a3b8" font-size="8.5" font-weight="500">Snap ${run.runnerId}  |  Lead ${run.leadId}  |  Extra ${run.extraId}</text>
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
