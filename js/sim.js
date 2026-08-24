/**
 * Lions K/1 full-team slow-motion teacher.
 * QB takes the direct snap and runs; WING-L and WING-R align wide or tight.
 */
(function () {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const W = 1000;
  const H = 940;
  const LOS = 400;
  const BEATS = [
    { name: "LINE UP", cue: "QB behind Center. WING-L and WING-R use the selected spacing." },
    { name: "DIRECT SNAP", cue: "Center snaps to QB. QB: see it, catch it, tuck it." },
    { name: "FIRST STEP", cue: "Line finds its jersey. Play-side Wing aims for the called lane." },
    { name: "FIT", cue: "Blockers arrive under control: head out, hands inside, feet moving." },
    { name: "LANE", cue: "Lead Wing enters first. QB follows the same-colored lane." },
    { name: "ONE CUT", cue: "QB plants once at the landmark. Defenders shed and keep leverage." },
    { name: "FINISH", cue: "QB goes north. Defense pursues for the flag without losing contain." }
  ];

  const RUNS = {
    "inside-right": { name: "QB Inside Right", symbol: "Red Diamond", color: "#ef4444", hole: "C–RG", holeX: 555, side: "R", type: "inside", lead: "WBR", fake: "WBL" },
    "inside-left": { name: "QB Inside Left", symbol: "Blue Circle", color: "#3b82f6", hole: "C–LG", holeX: 445, side: "L", type: "inside", lead: "WBL", fake: "WBR" },
    "off-tackle-right": { name: "QB Off-Tackle Right", symbol: "Gold Star", color: "#f6c344", hole: "RG–RT", holeX: 665, side: "R", type: "off", lead: "WBR", fake: "WBL" },
    "off-tackle-left": { name: "QB Off-Tackle Left", symbol: "Green Triangle", color: "#4ade80", hole: "LG–LT", holeX: 335, side: "L", type: "off", lead: "WBL", fake: "WBR" },
    "wide-right": { name: "QB Wide Right", symbol: "Orange Square", color: "#fb923c", hole: "Outside RT", holeX: 810, side: "R", type: "wide", lead: "WBR", fake: "WBL" },
    "wide-left": { name: "QB Wide Left", symbol: "Purple Hexagon", color: "#c084fc", hole: "Outside LT", holeX: 190, side: "L", type: "wide", lead: "WBL", fake: "WBR" }
  };

  const HOME = {
    LT: { x: 280, y: 450, label: "LT" }, LG: { x: 390, y: 450, label: "LG" },
    C: { x: 500, y: 450, label: "C" }, RG: { x: 610, y: 450, label: "RG" }, RT: { x: 720, y: 450, label: "RT" },
    QB: { x: 500, y: 800, label: "QB" }, WBL: { x: 160, y: 650, label: "WING-L" }, WBR: { x: 840, y: 650, label: "WING-R" },
    EL: { x: 205, y: 340, label: "EDGE-L" }, DTL: { x: 390, y: 340, label: "DT-L" }, DTR: { x: 610, y: 340, label: "DT-R" }, ER: { x: 795, y: 340, label: "EDGE-R" },
    LBL: { x: 420, y: 225, label: "LB-L" }, LBR: { x: 580, y: 225, label: "LB-R" }, CBL: { x: 90, y: 270, label: "CB-L" }, CBR: { x: 910, y: 270, label: "CB-R" }
  };
  const BACKFIELD = {
    wide: { QB: { x: 500, y: 800 }, WBL: { x: 160, y: 650 }, WBR: { x: 840, y: 650 }, label: "SPREAD WINGS — CREATE SPACE" },
    tight: { QB: { x: 500, y: 805 }, WBL: { x: 395, y: 760 }, WBR: { x: 605, y: 760 }, label: "TIGHT WINGS — LINE UP TOGETHER" }
  };
  const OFFENSE = ["LT", "LG", "C", "RG", "RT", "QB", "WBL", "WBR"];
  const DEFENSE = ["EL", "DTL", "DTR", "ER", "LBL", "LBR", "CBL", "CBR"];
  const state = { runKey: "inside-right", formation: "wide", t: 0, playing: false, speed: 11000, startedAt: 0, startT: 0, raf: 0, selected: null, players: {} };

  let svg, ball, holeRing, holeLabel, formationLabel, routeRunner, routeLead, routeFake, blockLayer, cueEl, beatEl, slider, playButton;
  function el(name, attrs) { const node = document.createElementNS(NS, name); Object.keys(attrs || {}).forEach((key) => node.setAttribute(key, attrs[key])); return node; }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t * t * (3 - 2 * t); }
  function mixPoint(a, b, t) { return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) }; }
  function currentRun() { return RUNS[state.runKey]; }
  function home(id) { return BACKFIELD[state.formation][id] || HOME[id]; }
  function playSideLb(run) { return run.side === "R" ? "LBR" : "LBL"; }
  function backSideLb(run) { return run.side === "R" ? "LBL" : "LBR"; }
  function playSideCb(run) { return run.side === "R" ? "CBR" : "CBL"; }
  function backSideCb(run) { return run.side === "R" ? "CBL" : "CBR"; }

  function lineTargets(run) {
    return { LT: { id: "EDGE-L", x: 235, y: 368 }, LG: { id: "DT-L", x: 370, y: 370 }, C: run.side === "R" ? { id: "HELP RG", x: 565, y: 374 } : { id: "HELP LG", x: 435, y: 374 }, RG: { id: "DT-R", x: 630, y: 370 }, RT: { id: "EDGE-R", x: 765, y: 368 } };
  }
  function lineCue(id, run) {
    const targets = lineTargets(run);
    if (id === "C") return `Snap to QB → protect inside → ${targets.C.id}`;
    if (id === (run.side === "R" ? "RT" : "LT")) return `Seal ${run.side === "R" ? "EDGE-R" : "EDGE-L"} · nothing crosses your face`;
    if (id === (run.side === "R" ? "RG" : "LG")) return `Own ${targets[id].id}'s play-side hip`;
    return `Stay home on ${targets[id].id} · head out · hands inside`;
  }
  function roleFor(id, run) { if (id === "QB") return "QB RUNNER"; if (id === run.lead) return "LEAD WING"; if (id === run.fake) return "BACKSIDE WING"; return "BLOCK"; }
  function shortRole(id, run) { if (id === "QB") return "QB RUN"; if (id === run.lead) return "LEAD"; if (id === run.fake) return "FAKE"; return "BLOCK"; }
  function taskFor(id, run) {
    if (id === "QB") return `Catch direct snap → tuck → ${run.hole} → one cut → north`;
    if (id === run.lead) return `${HOME[id].label}: called lane first → ${HOME[playSideLb(run)].label}`;
    if (id === run.fake) return `${HOME[id].label}: sell opposite action → get wide → finish fake`;
    return lineCue(id, run);
  }
  function basePoses() { const poses = {}; Object.keys(HOME).forEach((id) => { const h = home(id); poses[id] = { x: h.x, y: h.y }; }); return poses; }

  function qbPose(run, beat) {
    const h = home("QB"); const side = run.side === "R" ? 1 : -1; const finishX = run.type === "wide" ? run.holeX + side * 20 : run.holeX;
    return [{ x: h.x, y: h.y }, { x: h.x, y: h.y - 8 }, { x: lerp(h.x, run.holeX, 0.18), y: 690 }, { x: lerp(h.x, run.holeX, 0.48), y: 555 }, { x: run.holeX, y: 425 }, { x: run.holeX, y: 315 }, { x: finishX, y: 75 }][beat];
  }
  function leadPose(run, beat) {
    const h = home(run.lead); const lb = HOME[playSideLb(run)]; const side = run.side === "R" ? 1 : -1; const fitX = lb.x - side * 30; const laneX = run.type === "wide" ? run.holeX - side * 30 : run.holeX;
    return [{ x: h.x, y: h.y }, { x: h.x + side * 8, y: h.y - 8 }, { x: lerp(h.x, laneX, 0.32), y: 575 }, { x: laneX, y: 470 }, { x: run.holeX, y: 355 }, { x: fitX, y: lb.y + 38 }, { x: fitX, y: lb.y + 32 }][beat];
  }
  function fakePose(run, beat) {
    const h = home(run.fake); const dir = run.side === "R" ? -1 : 1; const wideX = dir < 0 ? 115 : 885;
    return [{ x: h.x, y: h.y }, { x: h.x + dir * 10, y: h.y - 6 }, { x: lerp(h.x, wideX, 0.22), y: 610 }, { x: lerp(h.x, wideX, 0.48), y: 525 }, { x: lerp(h.x, wideX, 0.72), y: 430 }, { x: wideX, y: 335 }, { x: wideX, y: 245 }][beat];
  }
  function poseAtBeat(beat) {
    const run = currentRun(); const p = basePoses(); const targets = lineTargets(run);
    ["LT", "LG", "C", "RG", "RT"].forEach((id) => { const amount = beat < 2 ? 0 : beat === 2 ? 0.42 : 1; p[id] = mixPoint(home(id), targets[id], amount); if (id === "C" && beat === 1) p[id].y += 8; });
    p.QB = qbPose(run, beat); p[run.lead] = leadPose(run, beat); p[run.fake] = fakePose(run, beat);
    const psLb = playSideLb(run), bsLb = backSideLb(run), psCb = playSideCb(run), bsCb = backSideCb(run), side = run.side === "R" ? 1 : -1;
    if (beat >= 4) {
      p[psLb] = mixPoint(HOME[psLb], { x: run.holeX - side * 24, y: 270 }, beat === 4 ? 0.28 : 0.72);
      p[bsLb] = mixPoint(HOME[bsLb], { x: run.holeX - side * 95, y: 260 }, beat === 4 ? 0.15 : 0.34);
      p[psCb] = mixPoint(HOME[psCb], { x: clamp(run.holeX + side * 90, 70, 930), y: 300 }, beat === 4 ? 0.16 : beat === 5 ? 0.42 : 0.72);
      p[bsCb] = mixPoint(HOME[bsCb], { x: HOME[bsCb].x + side * 14, y: HOME[bsCb].y }, 0.25);
    }
    if (beat >= 3) {
      p.EL = mixPoint(HOME.EL, { x: HOME.EL.x + side * 7, y: HOME.EL.y + 10 }, 0.3);
      p.DTL = mixPoint(HOME.DTL, { x: run.holeX - 90, y: HOME.DTL.y + 10 }, beat >= 5 ? 0.15 : 0.07);
      p.DTR = mixPoint(HOME.DTR, { x: run.holeX + 90, y: HOME.DTR.y + 10 }, beat >= 5 ? 0.15 : 0.07);
      p.ER = mixPoint(HOME.ER, { x: HOME.ER.x + side * 7, y: HOME.ER.y + 10 }, 0.3);
    }
    return p;
  }
  function interpolatedPoses(value) { const lo = Math.floor(value), hi = Math.min(6, lo + 1), u = ease(value - lo), a = poseAtBeat(lo), b = poseAtBeat(hi), p = {}; Object.keys(a).forEach((id) => { p[id] = mixPoint(a[id], b[id], u); }); return p; }
  function pathFor(id) { const pts = []; for (let beat = 0; beat <= 6; beat += 1) pts.push(poseAtBeat(beat)[id]); return "M " + pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L "); }

  function drawBlockArrows() {
    while (blockLayer.firstChild) blockLayer.removeChild(blockLayer.firstChild);
    const targets = lineTargets(currentRun());
    ["LT", "LG", "C", "RG", "RT"].forEach((id) => {
      const h = home(id), target = targets[id];
      blockLayer.appendChild(el("path", { d: `M ${h.x},${h.y - 10} L ${target.x},${target.y}`, fill: "none", stroke: "#67e8f9", "stroke-width": "5", "stroke-linecap": "round", "marker-end": "url(#blockArrow)", opacity: "0.95", "data-route-owner": id }));
    });
  }
  function token(id) {
    const spec = HOME[id], offense = OFFENSE.includes(id), g = el("g", { class: "sim-player", "data-player": id, tabindex: "0", role: "button", "aria-label": spec.label });
    const hit = el("circle", { r: "46", fill: "transparent" }), selected = el("circle", { r: "40", fill: "none", stroke: "#fff", "stroke-width": "5", opacity: "0" });
    const disc = el("circle", { r: offense ? "32" : "29", fill: offense ? "#07172c" : "#475569", stroke: offense ? "#f6c344" : (id.startsWith("CB") ? "#f6c344" : "#cbd5e1"), "stroke-width": offense ? "5" : "4" });
    const label = el("text", { x: "0", y: "6", fill: "#fff", "font-size": spec.label.length > 4 ? "14" : "19", "font-weight": "900", "text-anchor": "middle", "pointer-events": "none" }); label.textContent = spec.label;
    const role = el("text", { x: "0", y: "54", fill: "#f6c344", "font-size": "14", "font-weight": "900", "text-anchor": "middle", "paint-order": "stroke", stroke: "#0d3b24", "stroke-width": "5", "pointer-events": "none" });
    g.appendChild(hit); g.appendChild(selected); g.appendChild(disc); g.appendChild(label); g.appendChild(role);
    const choose = function () { selectPlayer(id); }; g.addEventListener("click", choose); g.addEventListener("keydown", function (event) { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(); } });
    svg.appendChild(g); state.players[id] = { g, selected, role };
  }
  function buildField() {
    svg = el("svg", { viewBox: `0 0 ${W} ${H}`, class: "sim-svg full-team-svg", role: "img", "aria-label": "Eight-on-eight QB direct-snap play with two wing backs" });
    const defs = el("defs", {}); defs.innerHTML = `<marker id="runnerArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#f6c344"/></marker><marker id="leadArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#fff"/></marker><marker id="fakeArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#d8b4fe"/></marker><marker id="blockArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#67e8f9"/></marker><radialGradient id="fieldGlow" cx="50%" cy="65%" r="85%"><stop offset="0%" stop-color="#14532d"/><stop offset="100%" stop-color="#0b3522"/></radialGradient>`;
    svg.appendChild(defs); svg.appendChild(el("rect", { width: W, height: H, fill: "url(#fieldGlow)" }));
    [90, 190, 290, 520, 640, 760, 870].forEach((y) => svg.appendChild(el("line", { x1: "35", y1: y, x2: String(W - 35), y2: y, stroke: "rgba(255,255,255,.13)", "stroke-width": "2" })));
    svg.appendChild(el("line", { x1: "26", y1: LOS, x2: String(W - 26), y2: LOS, stroke: "#f6c344", "stroke-width": "6" }));
    const los = el("text", { x: "38", y: String(LOS - 14), fill: "#f6c344", "font-size": "19", "font-weight": "900" }); los.textContent = "LINE OF SCRIMMAGE"; svg.appendChild(los);
    formationLabel = el("text", { x: "500", y: "915", fill: "#f6c344", "font-size": "19", "font-weight": "900", "text-anchor": "middle", "letter-spacing": "2" }); svg.appendChild(formationLabel);
    svg.appendChild(el("line", { x1: "500", y1: "478", x2: "500", y2: "790", stroke: "rgba(255,255,255,.38)", "stroke-width": "3", "stroke-dasharray": "10 12" }));
    const snapText = el("text", { x: "515", y: "620", fill: "#fff", "font-size": "15", "font-weight": "900", transform: "rotate(90 515 620)" }); snapText.textContent = "DIRECT SNAP TO QB"; svg.appendChild(snapText);
    holeRing = el("circle", { r: "25", fill: "rgba(0,0,0,.14)", "stroke-width": "6", class: "sim-hole" }); holeLabel = el("text", { "font-size": "19", "font-weight": "900", "text-anchor": "middle", "paint-order": "stroke", stroke: "#0d3b24", "stroke-width": "6" }); svg.appendChild(holeRing); svg.appendChild(holeLabel);
    blockLayer = el("g", { class: "sim-block-routes" }); svg.appendChild(blockLayer);
    routeFake = el("path", { fill: "none", stroke: "#d8b4fe", "stroke-width": "7", "stroke-dasharray": "14 11", "stroke-linecap": "round", "marker-end": "url(#fakeArrow)" });
    routeLead = el("path", { fill: "none", stroke: "#fff", "stroke-width": "8", "stroke-dasharray": "14 10", "stroke-linecap": "round", "marker-end": "url(#leadArrow)" });
    routeRunner = el("path", { fill: "none", stroke: "#f6c344", "stroke-width": "10", "stroke-dasharray": "18 11", "stroke-linecap": "round", "marker-end": "url(#runnerArrow)", "data-route-owner": "QB" });
    svg.appendChild(routeFake); svg.appendChild(routeLead); svg.appendChild(routeRunner); DEFENSE.forEach(token); OFFENSE.forEach(token);
    ball = el("g", { class: "sim-ball" }); ball.appendChild(el("ellipse", { rx: "16", ry: "11", fill: "#f8fafc", stroke: "#3f2b1d", "stroke-width": "3" })); ball.appendChild(el("line", { x1: "-8", y1: "0", x2: "8", y2: "0", stroke: "#9f1239", "stroke-width": "2" })); svg.appendChild(ball); return svg;
  }
  function updateRoutes() {
    const run = currentRun(); routeRunner.setAttribute("d", pathFor("QB")); routeRunner.setAttribute("stroke", run.color);
    routeLead.setAttribute("d", pathFor(run.lead)); routeLead.setAttribute("data-route-owner", run.lead); routeFake.setAttribute("d", pathFor(run.fake)); routeFake.setAttribute("data-route-owner", run.fake);
    drawBlockArrows(); holeRing.setAttribute("cx", run.holeX); holeRing.setAttribute("cy", LOS); holeRing.setAttribute("stroke", run.color); holeLabel.setAttribute("x", run.holeX); holeLabel.setAttribute("y", LOS - 34); holeLabel.setAttribute("fill", run.color); holeLabel.textContent = run.hole; formationLabel.textContent = BACKFIELD[state.formation].label;
  }
  function applyFocus() {
    const selected = state.selected; Object.keys(state.players).forEach((id) => state.players[id].g.classList.toggle("is-dimmed", Boolean(selected && id !== selected)));
    svg.querySelectorAll("[data-route-owner]").forEach((route) => { const owner = route.getAttribute("data-route-owner"); route.classList.toggle("is-dimmed", Boolean(selected && owner !== selected)); route.classList.toggle("is-focused", Boolean(selected && owner === selected)); });
  }
  function applyPoses() {
    const run = currentRun(), poses = interpolatedPoses(state.t);
    Object.keys(poses).forEach((id) => { const player = state.players[id]; player.g.setAttribute("transform", `translate(${poses[id].x},${poses[id].y})`); player.role.textContent = OFFENSE.includes(id) ? shortRole(id, run) : ""; player.selected.setAttribute("opacity", state.selected === id ? "1" : "0"); });
    const center = poses.C, qb = poses.QB, snapAmount = clamp(state.t, 0, 1), ballPos = state.t < 1 ? mixPoint({ x: center.x, y: center.y + 24 }, { x: qb.x + 17, y: qb.y - 8 }, ease(snapAmount)) : { x: qb.x + 17, y: qb.y - 8 }; ball.setAttribute("transform", `translate(${ballPos.x},${ballPos.y})`);
    const shown = clamp(Math.round(state.t), 0, 6); beatEl.textContent = `${BEATS[shown].name} · ${shown + 1} OF 7`; cueEl.textContent = BEATS[shown].cue; slider.value = String(state.t); document.querySelectorAll("[data-sim-dot]").forEach((dot) => dot.classList.toggle("is-on", Number(dot.getAttribute("data-sim-dot")) === shown)); applyFocus();
  }
  function roleClass(role) { return role.toLowerCase().replace(/[^a-z0-9]+/g, "-"); }
  function updateAssignments() {
    const run = currentRun(), board = document.getElementById("sim-assignments"), order = ["LT", "LG", "C", "RG", "RT", "QB", "WBL", "WBR"];
    board.innerHTML = order.map((id) => { const role = roleFor(id, run); return `<button type="button" class="assignment-card role-${roleClass(role)}" data-assignment-player="${id}"><span class="assignment-position">${HOME[id].label}</span><span class="assignment-role">${role}</span><span class="assignment-task">${taskFor(id, run)}</span></button>`; }).join("");
    board.querySelectorAll("[data-assignment-player]").forEach((card) => card.addEventListener("click", function () { selectPlayer(card.getAttribute("data-assignment-player")); }));
  }
  function selectPlayer(id) { state.selected = state.selected === id ? null : id; applyPoses(); document.querySelectorAll("[data-assignment-player]").forEach((card) => card.classList.toggle("is-selected", card.getAttribute("data-assignment-player") === state.selected)); if (state.selected && OFFENSE.includes(state.selected)) cueEl.textContent = `${HOME[state.selected].label}: ${taskFor(state.selected, currentRun())}`; }
  function setT(value) { state.t = clamp(value, 0, 6); applyPoses(); }
  function setBeat(value) { pause(); setT(clamp(value, 0, 6)); }
  function pause() { state.playing = false; if (state.raf) cancelAnimationFrame(state.raf); if (playButton) playButton.textContent = "PLAY SLOW"; }
  function tick(now) { if (!state.playing) return; const remaining = 6 - state.startT, duration = state.speed * (remaining / 6), progress = duration <= 0 ? 1 : clamp((now - state.startedAt) / duration, 0, 1); setT(state.startT + remaining * progress); if (progress < 1 && state.playing) state.raf = requestAnimationFrame(tick); else { state.playing = false; setT(6); playButton.textContent = "PLAY AGAIN"; } }
  function play() { if (state.playing) { pause(); return; } if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setT(6); return; } if (state.t >= 5.99) setT(0); state.playing = true; state.startT = state.t; state.startedAt = performance.now(); playButton.textContent = "PAUSE"; state.raf = requestAnimationFrame(tick); }
  function reset() { pause(); state.selected = null; setT(0); document.querySelectorAll("[data-assignment-player]").forEach((card) => card.classList.remove("is-selected")); }
  function updateFormationUi() {
    document.querySelectorAll("[data-sim-formation]").forEach((button) => { const active = button.getAttribute("data-sim-formation") === state.formation; button.classList.toggle("is-active", active); button.setAttribute("aria-pressed", String(active)); });
    const explanation = document.getElementById("sim-formation-explain"); if (explanation) explanation.textContent = state.formation === "wide" ? "Wings split wide so every child can see the QB, lane, and leverage." : "Both Wings line up close to the QB for the tight backfield look.";
  }
  function setFormation(key) { if (!BACKFIELD[key]) return; pause(); state.formation = key; state.selected = null; state.t = 0; updateFormationUi(); updateRoutes(); updateAssignments(); applyPoses(); }
  function setRun(key) {
    if (!RUNS[key]) return; pause(); state.runKey = key; state.selected = null; state.t = 0; const run = currentRun(); document.getElementById("sim-play-name").textContent = run.name;
    const badge = document.getElementById("sim-play-badge"); badge.textContent = `${run.symbol} · ${run.hole}`; badge.style.borderColor = run.color; badge.style.color = run.color;
    document.querySelectorAll(".play-btn").forEach((button) => { const active = button.getAttribute("data-run-key") === key; button.classList.toggle("is-active", active); button.setAttribute("aria-pressed", String(active)); button.style.outline = ""; }); updateRoutes(); updateAssignments(); applyPoses();
  }
  document.addEventListener("DOMContentLoaded", function () {
    const root = document.getElementById("sim-root"); cueEl = document.getElementById("sim-cue"); beatEl = document.getElementById("sim-beat"); slider = document.getElementById("sim-slider"); playButton = document.getElementById("sim-play"); if (!root || !cueEl || !beatEl || !slider || !playButton) return;
    root.innerHTML = ""; root.appendChild(buildField()); document.querySelectorAll(".play-btn").forEach((button) => button.addEventListener("click", function () { setRun(button.getAttribute("data-run-key")); })); document.querySelectorAll("[data-sim-formation]").forEach((button) => button.addEventListener("click", function () { setFormation(button.getAttribute("data-sim-formation")); }));
    playButton.addEventListener("click", play); document.getElementById("sim-back").addEventListener("click", function () { setBeat(Math.round(state.t) - 1); }); document.getElementById("sim-next").addEventListener("click", function () { setBeat(Math.round(state.t) + 1); }); document.getElementById("sim-reset").addEventListener("click", reset); slider.addEventListener("input", function () { pause(); setT(Number(slider.value)); });
    document.querySelectorAll("[data-sim-speed]").forEach((button) => button.addEventListener("click", function () { const speeds = { slow: 11000, normal: 7000, fast: 4300 }; state.speed = speeds[button.getAttribute("data-sim-speed")] || 11000; document.querySelectorAll("[data-sim-speed]").forEach((item) => { const active = item === button; item.classList.toggle("is-active", active); item.setAttribute("aria-pressed", String(active)); }); }));
    updateFormationUi(); setRun("inside-right");
  });
})();
