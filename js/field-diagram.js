/**
 * Cy-Fair K/1 Lions - SVG Field Diagram
 * Pre-snap 8v8: 5 OL + RB1/RB2/RB3 vs 3 DL / 2 LB / 2 CB / 1 S.
 * Colored triangles are NOT personnel. One hole ring only.
 */
const FIELD_CONFIG = {
  runs: {
    "inside-right": {
      name: "Inside Right", colorName: "Red Diamond", color: "#dc2626", hole: "C-RG",
      runnerId: "RB3", leadId: "RB2", extraId: "RB1",
      leadPath: "M 400,368 Q 428,300 438,210",
      runnerPath: "M 462,412 Q 448,340 438,210 L 438,108",
      targetHole: { x: 438, y: 292 },
      description: "Direct snap to RB3. Lead RB2 through C-RG, then LB. Extra RB1. Follow. Plant. Go."
    },
    "inside-left": {
      name: "Inside Left", colorName: "Blue Circle", color: "#2563eb", hole: "C-LG",
      runnerId: "RB1", leadId: "RB2", extraId: "RB3",
      leadPath: "M 400,368 Q 372,300 362,210",
      runnerPath: "M 338,412 Q 352,340 362,210 L 362,108",
      targetHole: { x: 362, y: 292 },
      description: "Direct snap to RB1. Lead RB2 through C-LG, then LB. Extra RB3. Follow. Plant. Go."
    },
    "off-tackle-right": {
      name: "Off-Tackle Right", colorName: "Gold Star", color: "#d97706", hole: "RG-RT",
      runnerId: "RB3", leadId: "RB2", extraId: "RB1",
      leadPath: "M 400,368 Q 490,320 514,210",
      runnerPath: "M 462,412 Q 500,350 514,205 L 520,108",
      targetHole: { x: 514, y: 292 },
      description: "Direct snap to RB3. Lead RB2 through RG-RT, then LB. Extra RB1."
    },
    "off-tackle-left": {
      name: "Off-Tackle Left", colorName: "Green Triangle", color: "#16a34a", hole: "LG-LT",
      runnerId: "RB1", leadId: "RB2", extraId: "RB3",
      leadPath: "M 400,368 Q 310,320 286,210",
      runnerPath: "M 338,412 Q 300,350 286,205 L 280,108",
      targetHole: { x: 286, y: 292 },
      description: "Direct snap to RB1. Lead RB2 through LG-LT, then LB. Extra RB3."
    },
    "wide-right": {
      name: "Wide Right", colorName: "Orange Square", color: "#ea580c", hole: "RT outside hip",
      runnerId: "RB3", leadId: "RB2", extraId: "RB1",
      leadPath: "M 400,368 Q 560,330 610,250",
      runnerPath: "M 462,412 Q 560,390 620,220 L 630,108",
      targetHole: { x: 610, y: 292 },
      description: "Perimeter run by RB3. No WR. Lead seals outside RT. CB: Nothing outside."
    },
    "wide-left": {
      name: "Wide Left", colorName: "Purple Hexagon", color: "#9333ea", hole: "LT outside hip",
      runnerId: "RB1", leadId: "RB2", extraId: "RB3",
      leadPath: "M 400,368 Q 240,330 190,250",
      runnerPath: "M 338,412 Q 240,390 180,220 L 170,108",
      targetHole: { x: 190, y: 292 },
      description: "Perimeter run by RB1. No WR. Lead seals outside LT. CB: Nothing outside."
    }
  }
};

function token(x, y, label, kind) {
  const fill = kind === "off" ? "#0b192c" : "#1e293b";
  const stroke = kind === "cb" ? "#d4a017" : (kind === "off" ? "#d4a017" : "#94a3b8");
  const tc = kind === "cb" || label === "C" ? "#d4a017" : "#fff";
  return `<g>
    <circle cx="${x}" cy="${y}" r="17" fill="${fill}" stroke="${stroke}" stroke-width="2.4"/>
    <text x="${x}" y="${y + 5}" fill="${tc}" font-size="11" font-weight="800" text-anchor="middle" font-family="system-ui,Segoe UI,sans-serif">${label}</text>
  </g>`;
}

function rbToken(id, x, y, run) {
  const runner = id === run.runnerId;
  const lead = id === run.leadId;
  const stroke = runner ? "#fff" : (lead ? "#e2e8f0" : "#d4a017");
  const sw = runner ? 3.2 : 2.2;
  const tag = runner ? "BALL" : (lead ? "LEAD" : "");
  return `<g>
    <circle cx="${x}" cy="${y}" r="17" fill="#0b192c" stroke="${stroke}" stroke-width="${sw}"/>
    <text x="${x}" y="${y + 4}" fill="#fff" font-size="10" font-weight="800" text-anchor="middle" font-family="system-ui,Segoe UI,sans-serif">${id}</text>
    ${tag ? `<text x="${x}" y="${y + 30}" fill="#e2e8f0" font-size="8" font-weight="700" text-anchor="middle">${tag}</text>` : ""}
  </g>`;
}

function renderFieldDiagram(containerId, activeRunKey) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const run = FIELD_CONFIG.runs[activeRunKey] || FIELD_CONFIG.runs["inside-right"];

  container.innerHTML = `
  <svg viewBox="0 0 800 500" class="field-diagram" xmlns="http://www.w3.org/2000/svg" aria-label="${run.name} 8 on 8">
    <defs>
      <marker id="arw-r" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="${run.color}"/>
      </marker>
      <marker id="arw-l" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#e2e8f0"/>
      </marker>
    </defs>
    <rect x="6" y="6" width="788" height="488" rx="14" fill="#0d3b24"/>
    <line x1="20" y1="110" x2="780" y2="110" stroke="rgba(255,255,255,.22)" stroke-width="1.4" stroke-dasharray="7 6"/>
    <line x1="20" y1="200" x2="780" y2="200" stroke="rgba(255,255,255,.2)" stroke-width="1.4"/>
    <line x1="20" y1="300" x2="780" y2="300" stroke="#d4a017" stroke-width="3.5"/>
    <line x1="20" y1="400" x2="780" y2="400" stroke="rgba(255,255,255,.18)" stroke-width="1.4"/>
    <text x="28" y="294" fill="#d4a017" font-size="11" font-weight="800">LOS</text>
    <text x="28" y="196" fill="rgba(255,255,255,.45)" font-size="10" font-weight="700">5</text>
    <text x="28" y="106" fill="rgba(255,255,255,.45)" font-size="10" font-weight="700">10</text>

    <!-- one hole only -->
    <circle cx="${run.targetHole.x}" cy="${run.targetHole.y}" r="11" fill="none" stroke="${run.color}" stroke-width="2.5">
      <animate attributeName="r" values="9;14;9" dur="1.5s" repeatCount="indefinite"/>
    </circle>
    <text x="${run.targetHole.x}" y="${run.targetHole.y - 18}" fill="${run.color}" font-size="9" font-weight="800" text-anchor="middle">${run.hole}</text>

    <g id="defense" aria-label="3 DL 2 LB 2 CB 1 S">
      ${token(286, 278, "DL", "def")}
      ${token(400, 274, "DL", "def")}
      ${token(514, 278, "DL", "def")}
      ${token(330, 208, "LB", "def")}
      ${token(470, 208, "LB", "def")}
      ${token(118, 270, "CB", "cb")}
      ${token(682, 270, "CB", "cb")}
      ${token(400, 128, "S", "def")}
    </g>

    <path d="${run.leadPath}" fill="none" stroke="#e2e8f0" stroke-width="3" stroke-dasharray="6 4" marker-end="url(#arw-l)"/>
    <path d="${run.runnerPath}" fill="none" stroke="${run.color}" stroke-width="5" stroke-linecap="round" marker-end="url(#arw-r)"/>

    <g id="offense" aria-label="5 OL RB1 RB2 RB3">
      ${token(248, 312, "LT", "off")}
      ${token(324, 312, "LG", "off")}
      ${token(400, 312, "C", "off")}
      ${token(476, 312, "RG", "off")}
      ${token(552, 312, "RT", "off")}
      ${rbToken("RB1", 338, 412, run)}
      ${rbToken("RB2", 400, 368, run)}
      ${rbToken("RB3", 462, 412, run)}
    </g>

    <g transform="translate(16,16)">
      <rect width="268" height="62" rx="8" fill="rgba(10,22,40,.92)"/>
      <text x="12" y="20" fill="${run.color}" font-size="13" font-weight="800">${run.name.toUpperCase()}</text>
      <text x="12" y="38" fill="#e2e8f0" font-size="11">${run.colorName} · ${run.hole}</text>
      <text x="12" y="52" fill="#94a3b8" font-size="10">Snap ${run.runnerId} · Lead ${run.leadId} · Extra ${run.extraId}</text>
    </g>
    <text x="400" y="488" fill="rgba(255,255,255,.4)" font-size="10" text-anchor="middle">D: 3 DL · 2 LB · 2 CB · 1 S     O: 5 OL · RB1 RB2 RB3</text>
  </svg>`;
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
      if (detailsBox && FIELD_CONFIG.runs[runKey]) detailsBox.textContent = FIELD_CONFIG.runs[runKey].description;
    });
  });
  renderFieldDiagram("field-diagram-container", "inside-right");
}

document.addEventListener("DOMContentLoaded", initPlaybookDiagrams);
