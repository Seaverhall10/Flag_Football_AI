/**
 * LIONS K/1 full-team slow-motion play teacher.
 * Six runs, eight offensive jobs, eight defenders, seven teaching beats.
 */
(function () {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const W = 1000;
  const H = 640;
  const LOS = 350;

  const BEATS = [
    { name: "PRE-SNAP", cue: "Find your position. Follow only your arrow." },
    { name: "SNAP", cue: "Center: clean snap. Runner: eyes on the ball." },
    { name: "FIRST STEP", cue: "Line: first step to your defender. Backs: start your route." },
    { name: "FIT", cue: "Blockers: arrive under control. Head out. Hands inside." },
    { name: "HOLE", cue: "Lead back goes through the hole first. Runner follows." },
    { name: "PLANT", cue: "Runner: plant at the colored hole. Get north." },
    { name: "GO", cue: "Go north! Finish through the next line." }
  ];

  const RUNS = {
    "inside-right": { name: "Inside Right", symbol: "Red Diamond", color: "#ef4444", hole: "C–RG", holeX: 555, side: "R", type: "inside", runner: "RB3", lead: "RB2", extra: "RB1" },
    "inside-left": { name: "Inside Left", symbol: "Blue Circle", color: "#3b82f6", hole: "C–LG", holeX: 445, side: "L", type: "inside", runner: "RB1", lead: "RB2", extra: "RB3" },
    "off-tackle-right": { name: "Off-Tackle Right", symbol: "Gold Star", color: "#f6c344", hole: "RG–RT", holeX: 665, side: "R", type: "off", runner: "RB3", lead: "RB2", extra: "RB1" },
    "off-tackle-left": { name: "Off-Tackle Left", symbol: "Green Triangle", color: "#4ade80", hole: "LG–LT", holeX: 335, side: "L", type: "off", runner: "RB1", lead: "RB2", extra: "RB3" },
    "wide-right": { name: "Wide Right", symbol: "Orange Square", color: "#fb923c", hole: "Outside RT", holeX: 790, side: "R", type: "wide", runner: "RB3", lead: "RB2", extra: "RB1" },
    "wide-left": { name: "Wide Left", symbol: "Purple Hexagon", color: "#c084fc", hole: "Outside LT", holeX: 210, side: "L", type: "wide", runner: "RB1", lead: "RB2", extra: "RB3" }
  };

  const HOME = {
    LT:  { x: 280, y: 378, label: "LT", kind: "OL" },
    LG:  { x: 390, y: 378, label: "LG", kind: "OL" },
    C:   { x: 500, y: 378, label: "C", kind: "OL" },
    RG:  { x: 610, y: 378, label: "RG", kind: "OL" },
    RT:  { x: 720, y: 378, label: "RT", kind: "OL" },
    RB1: { x: 420, y: 535, label: "RB1", kind: "RB" },
    RB2: { x: 500, y: 475, label: "RB2", kind: "RB" },
    RB3: { x: 580, y: 535, label: "RB3", kind: "RB" },
    LE:  { x: 290, y: 318, label: "E-L", kind: "DEF" },
    DT:  { x: 500, y: 312, label: "DT", kind: "DEF" },
    RE:  { x: 710, y: 318, label: "E-R", kind: "DEF" },
    LBL: { x: 405, y: 230, label: "LB-L", kind: "DEF" },
    LBR: { x: 595, y: 230, label: "LB-R", kind: "DEF" },
    CBL: { x: 135, y: 300, label: "CB-L", kind: "DEF" },
    CBR: { x: 865, y: 300, label: "CB-R", kind: "DEF" },
    S:   { x: 500, y: 105, label: "S", kind: "DEF" }
  };

  const OFFENSE = ["LT", "LG", "C", "RG", "RT", "RB1", "RB2", "RB3"];
  const DEFENSE = ["LE", "DT", "RE", "LBL", "LBR", "CBL", "CBR", "S"];
  const LINE_TARGETS = {
    LT: { id: "LE", x: 260, y: 338 },
    LG: { id: "DT", x: 455, y: 338 },
    C:  { id: "DT", x: 500, y: 344 },
    RG: { id: "DT", x: 545, y: 338 },
    RT: { id: "RE", x: 740, y: 338 }
  };

  const state = {
    runKey: "inside-right",
    t: 0,
    beat: 0,
    playing: false,
    speed: 9000,
    startedAt: 0,
    startT: 0,
    raf: 0,
    selected: null,
    players: {}
  };

  let svg;
  let ball;
  let holeRing;
  let holeLabel;
  let routeRunner;
  let routeLead;
  let routeFake;
  let blockLayer;
  let cueEl;
  let beatEl;
  let slider;
  let playButton;

  function el(name, attrs) {
    const node = document.createElementNS(NS, name);
    Object.keys(attrs || {}).forEach((key) => node.setAttribute(key, attrs[key]));
    return node;
  }

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t * t * (3 - 2 * t); }

  function mixPoint(a, b, t) {
    return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
  }

  function currentRun() { return RUNS[state.runKey]; }

  function playSideLb(run) { return run.side === "R" ? "LBR" : "LBL"; }
  function backSideLb(run) { return run.side === "R" ? "LBL" : "LBR"; }
  function playSideCb(run) { return run.side === "R" ? "CBR" : "CBL"; }
  function backSideCb(run) { return run.side === "R" ? "CBL" : "CBR"; }

  function lineCue(id, run) {
    const playSide = run.side === "R" ? ["RG", "RT"] : ["LG", "LT"];
    if (id === "C") return "Clean snap → protect inside on DT";
    if (id === (run.side === "R" ? "RT" : "LT")) return `Seal ${run.side === "R" ? "E-R" : "E-L"} · nothing crosses your face`;
    if (id === (run.side === "R" ? "RG" : "LG")) return `Take DT's ${run.side === "R" ? "right" : "left"} hip`;
    if (playSide.indexOf(id) === -1) return `Backside: stay home on ${LINE_TARGETS[id].id}`;
    return `Find ${LINE_TARGETS[id].id} · head out · hands inside`;
  }

  function roleFor(id, run) {
    if (id === run.runner) return "RUNNER";
    if (id === run.lead) return "LEAD";
    if (id === run.extra) return "FAKE";
    return "BLOCK";
  }

  function taskFor(id, run) {
    if (id === run.runner) return `Ball → ${run.hole} → plant → north`;
    if (id === run.lead) return `${run.hole} first → ${HOME[playSideLb(run)].label}`;
    if (id === run.extra) return "Fake opposite → get wide → carry out fake";
    return lineCue(id, run);
  }

  function basePoses() {
    const poses = {};
    Object.keys(HOME).forEach((id) => { poses[id] = { x: HOME[id].x, y: HOME[id].y }; });
    return poses;
  }

  function runnerPose(run, beat) {
    const h = HOME[run.runner];
    const side = run.side === "R" ? 1 : -1;
    const finishX = run.type === "wide" ? run.holeX + side * 34 : run.holeX;
    return [
      { x: h.x, y: h.y },
      { x: h.x, y: h.y - 12 },
      { x: lerp(h.x, run.holeX, 0.26), y: 478 },
      { x: lerp(h.x, run.holeX, 0.64), y: 414 },
      { x: run.holeX, y: 367 },
      { x: run.holeX, y: 318 },
      { x: finishX, y: 72 }
    ][beat];
  }

  function leadPose(run, beat) {
    const h = HOME[run.lead];
    const lb = HOME[playSideLb(run)];
    const side = run.side === "R" ? 1 : -1;
    const fitX = lb.x - side * 28;
    return [
      { x: h.x, y: h.y },
      { x: h.x + side * 8, y: h.y - 10 },
      { x: lerp(h.x, run.holeX, 0.38), y: 420 },
      { x: run.holeX, y: 365 },
      { x: run.holeX + side * 8, y: 304 },
      { x: fitX, y: lb.y + 32 },
      { x: fitX, y: lb.y + 28 }
    ][beat];
  }

  function fakePose(run, beat) {
    const h = HOME[run.extra];
    const dir = run.side === "R" ? -1 : 1;
    const wideX = dir < 0 ? 145 : 855;
    return [
      { x: h.x, y: h.y },
      { x: h.x + dir * 8, y: h.y - 8 },
      { x: lerp(h.x, wideX, 0.2), y: 492 },
      { x: lerp(h.x, wideX, 0.45), y: 430 },
      { x: lerp(h.x, wideX, 0.7), y: 360 },
      { x: wideX, y: 292 },
      { x: wideX, y: 225 }
    ][beat];
  }

  function poseAtBeat(beat) {
    const run = currentRun();
    const p = basePoses();

    ["LT", "LG", "C", "RG", "RT"].forEach((id) => {
      const amount = beat < 2 ? 0 : beat === 2 ? 0.45 : 1;
      p[id] = mixPoint(HOME[id], LINE_TARGETS[id], amount);
      if (id === "C" && beat === 1) p[id].y += 9;
    });

    p[run.runner] = runnerPose(run, beat);
    p[run.lead] = leadPose(run, beat);
    p[run.extra] = fakePose(run, beat);

    const runner = p[run.runner];
    const psLb = playSideLb(run);
    const bsLb = backSideLb(run);
    const psCb = playSideCb(run);
    const bsCb = backSideCb(run);
    const side = run.side === "R" ? 1 : -1;

    if (beat >= 4) {
      p[psLb] = mixPoint(HOME[psLb], { x: run.holeX - side * 18, y: 250 }, beat === 4 ? 0.35 : 0.72);
      p[bsLb] = mixPoint(HOME[bsLb], { x: run.holeX - side * 85, y: 248 }, beat === 4 ? 0.18 : 0.38);
      p[psCb] = mixPoint(HOME[psCb], { x: clamp(runner.x + side * 75, 80, 920), y: Math.min(270, runner.y + 55) }, beat === 4 ? 0.22 : beat === 5 ? 0.5 : 0.78);
      p[bsCb] = mixPoint(HOME[bsCb], { x: HOME[bsCb].x + side * 18, y: HOME[bsCb].y }, 0.3);
      p.S = mixPoint(HOME.S, { x: runner.x, y: Math.min(178, runner.y - 95) }, beat === 4 ? 0.2 : beat === 5 ? 0.38 : 0.62);
    }

    if (beat >= 3) {
      p.LE = mixPoint(HOME.LE, { x: HOME.LE.x + side * 8, y: HOME.LE.y + 10 }, 0.35);
      p.DT = mixPoint(HOME.DT, { x: run.holeX, y: HOME.DT.y + 12 }, beat >= 5 ? 0.18 : 0.08);
      p.RE = mixPoint(HOME.RE, { x: HOME.RE.x + side * 8, y: HOME.RE.y + 10 }, 0.35);
    }
    return p;
  }

  function interpolatedPoses(value) {
    const lo = Math.floor(value);
    const hi = Math.min(6, lo + 1);
    const u = ease(value - lo);
    const a = poseAtBeat(lo);
    const b = poseAtBeat(hi);
    const p = {};
    Object.keys(a).forEach((id) => { p[id] = mixPoint(a[id], b[id], u); });
    return p;
  }

  function pathFor(id) {
    const pts = [];
    for (let beat = 0; beat <= 6; beat += 1) pts.push(poseAtBeat(beat)[id]);
    return "M " + pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ");
  }

  function drawBlockArrows() {
    while (blockLayer.firstChild) blockLayer.removeChild(blockLayer.firstChild);
    ["LT", "LG", "C", "RG", "RT"].forEach((id) => {
      const home = HOME[id];
      const target = LINE_TARGETS[id];
      blockLayer.appendChild(el("path", {
        d: `M ${home.x},${home.y - 12} L ${target.x},${target.y}`,
        fill: "none", stroke: "#67e8f9", "stroke-width": "4", "stroke-linecap": "round",
        "marker-end": "url(#blockArrow)", opacity: "0.9"
      }));
      const tag = el("text", {
        x: String(lerp(home.x, target.x, 0.52)), y: String(lerp(home.y, target.y, 0.52) - 8),
        fill: "#cffafe", "font-size": "13", "font-weight": "900", "text-anchor": "middle",
        "paint-order": "stroke", stroke: "#0d3b24", "stroke-width": "4"
      });
      tag.textContent = `${id}→${target.id}`;
      blockLayer.appendChild(tag);
    });
  }

  function token(id) {
    const spec = HOME[id];
    const offense = OFFENSE.indexOf(id) !== -1;
    const g = el("g", { class: "sim-player", "data-player": id, tabindex: "0", role: "button" });
    const hit = el("circle", { r: "42", fill: "transparent" });
    const selected = el("circle", { r: "37", fill: "none", stroke: "#fff", "stroke-width": "4", opacity: "0" });
    const disc = el("circle", {
      r: offense ? "29" : "27", fill: offense ? "#07172c" : "#475569",
      stroke: offense ? "#f6c344" : (id.indexOf("CB") === 0 ? "#f6c344" : "#cbd5e1"),
      "stroke-width": offense ? "4" : "3"
    });
    const label = el("text", { x: "0", y: "6", fill: "#fff", "font-size": spec.label.length > 3 ? "14" : "18", "font-weight": "900", "text-anchor": "middle", "pointer-events": "none" });
    label.textContent = spec.label;
    const role = el("text", { x: "0", y: "48", fill: "#f6c344", "font-size": "13", "font-weight": "900", "text-anchor": "middle", "paint-order": "stroke", stroke: "#0d3b24", "stroke-width": "4", "pointer-events": "none" });
    g.appendChild(hit);
    g.appendChild(selected);
    g.appendChild(disc);
    g.appendChild(label);
    g.appendChild(role);
    const choose = function () { selectPlayer(id); };
    g.addEventListener("click", choose);
    g.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(); }
    });
    svg.appendChild(g);
    state.players[id] = { g, selected, role };
  }

  function buildField() {
    svg = el("svg", { viewBox: `0 0 ${W} ${H}`, class: "sim-svg full-team-svg", role: "img", "aria-label": "Eight on eight slow-motion play diagram" });
    const defs = el("defs", {});
    defs.innerHTML = `
      <marker id="runnerArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#f6c344"/></marker>
      <marker id="leadArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#fff"/></marker>
      <marker id="fakeArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#d8b4fe"/></marker>
      <marker id="blockArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#67e8f9"/></marker>
      <radialGradient id="fieldGlow" cx="50%" cy="65%" r="80%"><stop offset="0%" stop-color="#14532d"/><stop offset="100%" stop-color="#0b3522"/></radialGradient>
    `;
    svg.appendChild(defs);
    svg.appendChild(el("rect", { width: W, height: H, fill: "url(#fieldGlow)" }));
    [90, 180, 270, 440, 530].forEach((y) => svg.appendChild(el("line", { x1: "35", y1: y, x2: String(W - 35), y2: y, stroke: "rgba(255,255,255,.13)", "stroke-width": "2" })));
    svg.appendChild(el("line", { x1: "26", y1: LOS, x2: String(W - 26), y2: LOS, stroke: "#f6c344", "stroke-width": "5" }));
    const los = el("text", { x: "38", y: String(LOS - 12), fill: "#f6c344", "font-size": "18", "font-weight": "900" });
    los.textContent = "LINE OF SCRIMMAGE";
    svg.appendChild(los);

    holeRing = el("circle", { r: "22", fill: "rgba(0,0,0,.12)", "stroke-width": "5", class: "sim-hole" });
    holeLabel = el("text", { "font-size": "18", "font-weight": "900", "text-anchor": "middle", "paint-order": "stroke", stroke: "#0d3b24", "stroke-width": "5" });
    svg.appendChild(holeRing);
    svg.appendChild(holeLabel);

    blockLayer = el("g", { class: "sim-block-routes" });
    svg.appendChild(blockLayer);
    routeFake = el("path", { fill: "none", stroke: "#d8b4fe", "stroke-width": "5", "stroke-dasharray": "12 10", "stroke-linecap": "round", "marker-end": "url(#fakeArrow)" });
    routeLead = el("path", { fill: "none", stroke: "#fff", "stroke-width": "6", "stroke-dasharray": "12 9", "stroke-linecap": "round", "marker-end": "url(#leadArrow)" });
    routeRunner = el("path", { fill: "none", stroke: "#f6c344", "stroke-width": "8", "stroke-dasharray": "16 10", "stroke-linecap": "round", "marker-end": "url(#runnerArrow)" });
    svg.appendChild(routeFake);
    svg.appendChild(routeLead);
    svg.appendChild(routeRunner);

    DEFENSE.forEach(token);
    OFFENSE.forEach(token);

    ball = el("g", { class: "sim-ball" });
    ball.appendChild(el("ellipse", { rx: "15", ry: "10", fill: "#f8fafc", stroke: "#3f2b1d", "stroke-width": "2" }));
    ball.appendChild(el("line", { x1: "-8", y1: "0", x2: "8", y2: "0", stroke: "#9f1239", "stroke-width": "2" }));
    svg.appendChild(ball);
    return svg;
  }

  function updateRoutes() {
    const run = currentRun();
    routeRunner.setAttribute("d", pathFor(run.runner));
    routeRunner.setAttribute("stroke", run.color);
    routeLead.setAttribute("d", pathFor(run.lead));
    routeFake.setAttribute("d", pathFor(run.extra));
    drawBlockArrows();
    holeRing.setAttribute("cx", run.holeX);
    holeRing.setAttribute("cy", LOS);
    holeRing.setAttribute("stroke", run.color);
    holeLabel.setAttribute("x", run.holeX);
    holeLabel.setAttribute("y", LOS - 30);
    holeLabel.setAttribute("fill", run.color);
    holeLabel.textContent = run.hole;
  }

  function applyPoses() {
    const run = currentRun();
    const poses = interpolatedPoses(state.t);
    Object.keys(poses).forEach((id) => {
      const player = state.players[id];
      player.g.setAttribute("transform", `translate(${poses[id].x},${poses[id].y})`);
      player.role.textContent = OFFENSE.indexOf(id) !== -1 ? roleFor(id, run) : "";
      player.selected.setAttribute("opacity", state.selected === id ? "1" : "0");
    });

    const center = poses.C;
    const runner = poses[run.runner];
    const snapAmount = clamp(state.t, 0, 1);
    const ballPos = state.t < 1 ? mixPoint({ x: center.x, y: center.y - 32 }, { x: runner.x + 18, y: runner.y - 7 }, ease(snapAmount)) : { x: runner.x + 18, y: runner.y - 7 };
    ball.setAttribute("transform", `translate(${ballPos.x},${ballPos.y})`);

    const shown = clamp(Math.round(state.t), 0, 6);
    state.beat = shown;
    beatEl.textContent = `${BEATS[shown].name} · ${shown + 1} OF 7`;
    cueEl.textContent = BEATS[shown].cue;
    slider.value = String(state.t);
    document.querySelectorAll("[data-sim-dot]").forEach((dot) => dot.classList.toggle("is-on", Number(dot.getAttribute("data-sim-dot")) === shown));
  }

  function updateAssignments() {
    const run = currentRun();
    const board = document.getElementById("sim-assignments");
    const order = ["LT", "LG", "C", "RG", "RT", run.runner, run.lead, run.extra];
    board.innerHTML = order.map((id) => {
      const role = roleFor(id, run);
      return `<button type="button" class="assignment-card role-${role.toLowerCase()}" data-assignment-player="${id}">
        <span class="assignment-position">${id}</span>
        <span class="assignment-role">${role}</span>
        <span class="assignment-task">${taskFor(id, run)}</span>
      </button>`;
    }).join("");
    board.querySelectorAll("[data-assignment-player]").forEach((card) => card.addEventListener("click", function () { selectPlayer(card.getAttribute("data-assignment-player")); }));
  }

  function selectPlayer(id) {
    state.selected = state.selected === id ? null : id;
    applyPoses();
    document.querySelectorAll("[data-assignment-player]").forEach((card) => card.classList.toggle("is-selected", card.getAttribute("data-assignment-player") === state.selected));
    if (state.selected && OFFENSE.indexOf(state.selected) !== -1) cueEl.textContent = `${state.selected}: ${taskFor(state.selected, currentRun())}`;
  }

  function setT(value) {
    state.t = clamp(value, 0, 6);
    applyPoses();
  }

  function setBeat(value) {
    pause();
    setT(clamp(value, 0, 6));
  }

  function pause() {
    state.playing = false;
    if (state.raf) cancelAnimationFrame(state.raf);
    if (playButton) playButton.textContent = "PLAY SLOW";
  }

  function tick(now) {
    if (!state.playing) return;
    const remainingBeats = 6 - state.startT;
    const duration = state.speed * (remainingBeats / 6);
    const progress = duration <= 0 ? 1 : clamp((now - state.startedAt) / duration, 0, 1);
    setT(state.startT + remainingBeats * progress);
    if (progress < 1 && state.playing) state.raf = requestAnimationFrame(tick);
    else {
      state.playing = false;
      setT(6);
      playButton.textContent = "PLAY AGAIN";
    }
  }

  function play() {
    if (state.playing) { pause(); return; }
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setT(6); return; }
    if (state.t >= 5.99) setT(0);
    state.playing = true;
    state.startT = state.t;
    state.startedAt = performance.now();
    playButton.textContent = "PAUSE";
    state.raf = requestAnimationFrame(tick);
  }

  function reset() {
    pause();
    state.selected = null;
    setT(0);
    document.querySelectorAll("[data-assignment-player]").forEach((card) => card.classList.remove("is-selected"));
  }

  function setRun(key) {
    if (!RUNS[key]) return;
    pause();
    state.runKey = key;
    state.selected = null;
    state.t = 0;
    const run = currentRun();
    document.getElementById("sim-play-name").textContent = run.name;
    const badge = document.getElementById("sim-play-badge");
    badge.textContent = `${run.symbol} · ${run.hole}`;
    badge.style.borderColor = run.color;
    badge.style.color = run.color;
    document.querySelectorAll(".play-btn").forEach((button) => {
      const active = button.getAttribute("data-run-key") === key;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
    updateRoutes();
    updateAssignments();
    applyPoses();
  }

  function init() {
    const root = document.getElementById("sim-root");
    cueEl = document.getElementById("sim-cue");
    beatEl = document.getElementById("sim-beat");
    slider = document.getElementById("sim-slider");
    playButton = document.getElementById("sim-play");
    if (!root || !cueEl || !beatEl || !slider || !playButton) return;
    root.innerHTML = "";
    root.appendChild(buildField());
    document.querySelectorAll(".play-btn").forEach((button) => button.addEventListener("click", function () { setRun(button.getAttribute("data-run-key")); }));
    playButton.addEventListener("click", play);
    document.getElementById("sim-back").addEventListener("click", function () { setBeat(state.beat - 1); });
    document.getElementById("sim-next").addEventListener("click", function () { setBeat(state.beat + 1); });
    document.getElementById("sim-reset").addEventListener("click", reset);
    slider.addEventListener("input", function () { pause(); setT(Number(slider.value)); });
    document.querySelectorAll("[data-sim-speed]").forEach((button) => button.addEventListener("click", function () {
      const value = button.getAttribute("data-sim-speed");
      state.speed = value === "fast" ? 3600 : value === "normal" ? 6000 : 9000;
      document.querySelectorAll("[data-sim-speed]").forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }));
    setRun("inside-right");
  }

  window.LionsSim = { setRun, play, reset, setBeat };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
