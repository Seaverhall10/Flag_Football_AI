/** Lions single drill: 5-player half offense vs 4-player half defense. */
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const W = 1000, H = 920, LOS = 400;
  const BEATS = [
    { name: "LINE UP", cue: "Count defenders from inside out. Point to your job before the snap." },
    { name: "DIRECT SNAP", cue: "Center snaps to Runner. Defense reads the ball without crossing early." },
    { name: "FIRST STEP", cue: "Offense steps to its assignment. Defense protects its starting lane." },
    { name: "FIT", cue: "Eyes up. Head out. Hands inside. Defense anchors and creates separation." },
    { name: "LANE", cue: "Lead RB enters first. Runner commits to the selected lane." },
    { name: "SHED / FLAG", cue: "Defense finds the ball, sheds toward the lane, and closes under control." },
    { name: "FINISH", cue: "Runner goes north. Defense pursues inside-out; Corner keeps contain." }
  ];
  const state = { lane: "inside", side: "right", front: "two-dl", t: 0, playing: false, speed: 10500, startT: 0, startedAt: 0, raf: 0, selected: null, players: {} };
  const OFFENSE = ["C", "G", "T", "RUN", "LEAD"];
  const DEFENSE = ["DL", "LB", "CB", "FLEX"];
  let svg, ball, lanePath, laneLabel, blockLayer, defenseLayer, cueEl, beatEl, slider, playButton;

  function el(name, attrs) { const node = document.createElementNS(NS, name); Object.keys(attrs || {}).forEach((key) => node.setAttribute(key, attrs[key])); return node; }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t * t * (3 - 2 * t); }
  function mix(a, b, t) { return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) }; }
  function flipX(x) { return state.side === "right" ? x : W - x; }
  function p(x, y) { return { x: flipX(x), y }; }
  function laneX() { return flipX(state.lane === "inside" ? 440 : 820); }
  function sideName() { return state.side.toUpperCase(); }
  function laneName() { return state.lane.toUpperCase(); }
  function frontName() { return state.front === "two-dl" ? "Two-DL Front" : "Two-LB Front"; }

  function labels() {
    return {
      C: "CENTER", G: "GUARD", T: "TACKLE", RUN: "RUNNER", LEAD: "LEAD RB",
      DL: "D-LINE", LB: state.front === "two-dl" ? "LINEBACKER" : "LB-IN", CB: "CORNER",
      FLEX: state.front === "two-dl" ? "EDGE / DL" : "LB-OUT"
    };
  }
  function tokenLabels() {
    return { C: "C", G: "G", T: "T", RUN: "RUN", LEAD: "LEAD", DL: "DL", LB: "LB", CB: "CB", FLEX: state.front === "two-dl" ? "EDGE" : "LB-OUT" };
  }
  function homes() {
    const lab = labels();
    const raw = state.front === "two-dl"
      ? { C: p(360, 455), G: p(520, 455), T: p(680, 455), RUN: p(360, 800), LEAD: p(650, 690), DL: p(520, 340), FLEX: p(720, 340), LB: p(610, 220), CB: p(910, 275) }
      : { C: p(360, 455), G: p(520, 455), T: p(680, 455), RUN: p(360, 800), LEAD: p(650, 690), DL: p(520, 340), FLEX: p(720, 220), LB: p(555, 220), CB: p(910, 275) };
    Object.keys(raw).forEach((id) => { raw[id].label = lab[id]; });
    return raw;
  }
  function assignments() {
    const h = homes();
    return state.front === "two-dl"
      ? {
          C: { target: "DL", point: mix(h.C, h.DL, .72), task: "Snap → help Guard on D-LINE → protect inside" },
          G: { target: "DL", point: h.DL, task: "Own D-LINE · play-side hip · head out" },
          T: { target: "FLEX", point: h.FLEX, task: "Own EDGE / DL · keep outside arm from crossing" },
          LEAD: { target: "LB", point: h.LB, task: `${laneName()} lane first → fit LINEBACKER under control` },
          RUN: { target: "LANE", point: { x: laneX(), y: LOS }, task: `Secure snap → ${laneName()} ${sideName()} → one cut → north` }
        }
      : {
          C: { target: "DL", point: mix(h.C, h.DL, .72), task: "Snap → help Guard on D-LINE → protect inside" },
          G: { target: "DL", point: h.DL, task: "Own D-LINE · play-side hip · head out" },
          T: { target: "LB", point: h.LB, task: "Release under control to LB-IN · do not chase across" },
          LEAD: { target: "FLEX", point: h.FLEX, task: `${laneName()} lane first → fit LB-OUT under control` },
          RUN: { target: "LANE", point: { x: laneX(), y: LOS }, task: `Secure snap → ${laneName()} ${sideName()} → one cut → north` }
        };
  }
  function defenseTasks() {
    return state.front === "two-dl"
      ? {
          DL: `Anchor inside · separate from Guard · shed toward ${laneName()} lane`,
          FLEX: `Set the edge · outside arm free · squeeze without losing contain`,
          LB: `Stay square · scrape inside-out · meet Lead RB in the lane`,
          CB: `Unblocked contain · nothing outside · force Runner back to pursuit`
        }
      : {
          DL: `Anchor inside · separate from Guard · shed toward ${laneName()} lane`,
          LB: `Read Tackle release · keep inside leverage · close under control`,
          FLEX: `Stay square outside · fit Lead RB · protect the selected lane`,
          CB: `Unblocked contain · nothing outside · force Runner back to pursuit`
        };
  }
  function offenseRole(id) { return id === "RUN" ? "BALL" : id === "LEAD" ? "LEAD" : "BLOCK"; }

  function basePoses() { const h = homes(), out = {}; Object.keys(h).forEach((id) => { out[id] = { x: h[id].x, y: h[id].y }; }); return out; }
  function runnerPose(beat) {
    const h = homes().RUN, x = laneX(), finishX = state.lane === "outside" ? x : lerp(x, 500, .12);
    return [h, { x: h.x, y: h.y - 8 }, { x: lerp(h.x, x, .18), y: 685 }, { x: lerp(h.x, x, .48), y: 555 }, { x, y: 420 }, { x, y: 300 }, { x: finishX, y: 70 }][beat];
  }
  function leadPose(beat) {
    const h = homes().LEAD, target = assignments().LEAD.point, x = laneX();
    return [h, { x: h.x, y: h.y - 8 }, { x: lerp(h.x, x, .3), y: 610 }, { x: lerp(h.x, x, .68), y: 505 }, { x, y: 365 }, { x: target.x, y: target.y + 35 }, { x: target.x, y: target.y + 30 }][beat];
  }
  function poseAtBeat(beat) {
    const h = homes(), a = assignments(), out = basePoses();
    ["C", "G", "T"].forEach((id) => { const amount = beat < 2 ? 0 : beat === 2 ? .42 : 1; out[id] = mix(h[id], a[id].point, amount); if (id === "C" && beat === 1) out[id].y += 8; });
    out.RUN = runnerPose(beat); out.LEAD = leadPose(beat);
    const x = laneX(), laneBias = state.side === "right" ? -24 : 24;
    if (beat >= 4) {
      const lbTarget = { x: x + laneBias, y: 275 };
      out.LB = mix(h.LB, lbTarget, beat === 4 ? .25 : beat === 5 ? .62 : .8);
      const flexTarget = state.front === "two-dl" ? { x: h.FLEX.x + (state.side === "right" ? -20 : 20), y: h.FLEX.y + 25 } : { x: x + (state.side === "right" ? 35 : -35), y: 270 };
      out.FLEX = mix(h.FLEX, flexTarget, beat === 4 ? .18 : beat === 5 ? .52 : .72);
      const cbTarget = { x: state.lane === "outside" ? x + (state.side === "right" ? 55 : -55) : h.CB.x + (state.side === "right" ? -35 : 35), y: 295 };
      out.CB = mix(h.CB, cbTarget, beat === 4 ? .12 : beat === 5 ? .4 : .7);
    }
    if (beat >= 3) out.DL = mix(h.DL, { x: state.lane === "inside" ? x : h.DL.x + (state.side === "right" ? 22 : -22), y: h.DL.y + 28 }, beat === 3 ? .12 : beat === 4 ? .25 : .48);
    return out;
  }
  function posesAt(value) { const lo = Math.floor(value), hi = Math.min(6, lo + 1), u = ease(value - lo), a = poseAtBeat(lo), b = poseAtBeat(hi), out = {}; Object.keys(a).forEach((id) => { out[id] = mix(a[id], b[id], u); }); return out; }
  function pathFor(id) { const points = []; for (let i = 0; i <= 6; i += 1) points.push(poseAtBeat(i)[id]); return "M " + points.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" L "); }

  function drawLane() {
    const x = laneX(), start = homes().RUN;
    lanePath.setAttribute("d", `M ${start.x},${start.y} C ${start.x},650 ${x},540 ${x},${LOS} L ${x},85`);
    lanePath.setAttribute("stroke", state.lane === "inside" ? "#f6c344" : "#fb923c");
    laneLabel.setAttribute("x", x); laneLabel.setAttribute("y", LOS - 35); laneLabel.textContent = `${laneName()} LANE`;
    laneLabel.setAttribute("fill", state.lane === "inside" ? "#f6c344" : "#fb923c");
  }
  function drawAssignments() {
    blockLayer.innerHTML = "";
    const h = homes(), a = assignments();
    ["C", "G", "T", "LEAD"].forEach((id) => {
      const target = a[id].point;
      const path = el("path", { d: `M ${h[id].x},${h[id].y - 10} L ${target.x},${target.y}`, fill: "none", stroke: id === "LEAD" ? "#fff" : "#67e8f9", "stroke-width": id === "LEAD" ? "8" : "6", "stroke-dasharray": id === "LEAD" ? "14 10" : "", "marker-end": id === "LEAD" ? "url(#halfLeadArrow)" : "url(#halfBlockArrow)", "data-half-owner": id });
      blockLayer.appendChild(path);
    });
  }
  function drawDefensePaths() {
    defenseLayer.innerHTML = "";
    DEFENSE.forEach((id) => { const path = el("path", { d: pathFor(id), fill: "none", stroke: "#f87171", "stroke-width": "5", "stroke-dasharray": "8 10", opacity: ".72", "data-half-owner": id }); defenseLayer.appendChild(path); });
  }
  function token(id) {
    const offense = OFFENSE.includes(id), g = el("g", { class: "sim-player", "data-half-player": id, tabindex: "0", role: "button" });
    const hit = el("circle", { r: "48", fill: "transparent" }), selected = el("circle", { r: "42", fill: "none", stroke: "#fff", "stroke-width": "5", opacity: "0" });
    const disc = el("circle", { r: offense ? "34" : "31", fill: offense ? "#07172c" : "#7f1d1d", stroke: offense ? "#f6c344" : "#fecaca", "stroke-width": "5" });
    const label = el("text", { x: "0", y: "6", fill: "#fff", "font-size": "15", "font-weight": "900", "text-anchor": "middle", "pointer-events": "none" });
    const role = el("text", { x: "0", y: "57", fill: offense ? "#f6c344" : "#fecaca", "font-size": "14", "font-weight": "900", "text-anchor": "middle", "paint-order": "stroke", stroke: "#0d3b24", "stroke-width": "5", "pointer-events": "none" });
    g.appendChild(hit); g.appendChild(selected); g.appendChild(disc); g.appendChild(label); g.appendChild(role);
    const choose = function () { selectPlayer(id); }; g.addEventListener("click", choose); g.addEventListener("keydown", function (event) { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(); } });
    svg.appendChild(g); state.players[id] = { g, selected, label, role };
  }
  function buildField() {
    svg = el("svg", { viewBox: `0 0 ${W} ${H}`, class: "sim-svg full-team-svg half-team-svg", role: "img", "aria-label": "Five-player half offense versus four-player half defense animated drill" });
    const defs = el("defs", {}); defs.innerHTML = `<marker id="halfRunArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#f6c344"/></marker><marker id="halfLeadArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#fff"/></marker><marker id="halfBlockArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#67e8f9"/></marker><radialGradient id="halfField" cx="50%" cy="65%" r="85%"><stop offset="0%" stop-color="#14532d"/><stop offset="100%" stop-color="#0b3522"/></radialGradient>`;
    svg.appendChild(defs); svg.appendChild(el("rect", { width: W, height: H, fill: "url(#halfField)" }));
    [90, 190, 290, 520, 640, 760, 870].forEach((y) => svg.appendChild(el("line", { x1: "35", y1: y, x2: "965", y2: y, stroke: "rgba(255,255,255,.13)", "stroke-width": "2" })));
    svg.appendChild(el("line", { x1: "25", y1: LOS, x2: "975", y2: LOS, stroke: "#f6c344", "stroke-width": "6" }));
    const los = el("text", { x: "38", y: LOS - 14, fill: "#f6c344", "font-size": "19", "font-weight": "900" }); los.textContent = "LINE OF SCRIMMAGE"; svg.appendChild(los);
    defenseLayer = el("g", { class: "half-defense-routes" }); blockLayer = el("g", { class: "half-block-routes" }); svg.appendChild(defenseLayer); svg.appendChild(blockLayer);
    lanePath = el("path", { fill: "none", stroke: "#f6c344", "stroke-width": "12", "stroke-dasharray": "20 13", "stroke-linecap": "round", "marker-end": "url(#halfRunArrow)", "data-half-owner": "RUN" }); laneLabel = el("text", { fill: "#f6c344", "font-size": "20", "font-weight": "900", "text-anchor": "middle", "paint-order": "stroke", stroke: "#0d3b24", "stroke-width": "6" }); svg.appendChild(lanePath); svg.appendChild(laneLabel);
    DEFENSE.forEach(token); OFFENSE.forEach(token);
    ball = el("g", {}); ball.appendChild(el("ellipse", { rx: "16", ry: "11", fill: "#f8fafc", stroke: "#3f2b1d", "stroke-width": "3" })); ball.appendChild(el("line", { x1: "-8", y1: "0", x2: "8", y2: "0", stroke: "#9f1239", "stroke-width": "2" })); svg.appendChild(ball); return svg;
  }
  function applyFocus() {
    const selected = state.selected; Object.keys(state.players).forEach((id) => state.players[id].g.classList.toggle("is-dimmed", Boolean(selected && id !== selected)));
    svg.querySelectorAll("[data-half-owner]").forEach((path) => { const same = path.getAttribute("data-half-owner") === selected; path.classList.toggle("is-dimmed", Boolean(selected && !same)); path.classList.toggle("is-focused", Boolean(selected && same)); });
  }
  function applyPoses() {
    const poses = posesAt(state.t), h = homes(), short = tokenLabels();
    Object.keys(poses).forEach((id) => { const player = state.players[id]; player.g.setAttribute("transform", `translate(${poses[id].x},${poses[id].y})`); player.label.textContent = short[id]; player.role.textContent = OFFENSE.includes(id) ? offenseRole(id) : "DEFEND"; player.selected.setAttribute("opacity", state.selected === id ? "1" : "0"); });
    const center = poses.C, runner = poses.RUN, amount = clamp(state.t, 0, 1), ballPos = state.t < 1 ? mix({ x: center.x, y: center.y + 25 }, { x: runner.x + 18, y: runner.y - 8 }, ease(amount)) : { x: runner.x + 18, y: runner.y - 8 }; ball.setAttribute("transform", `translate(${ballPos.x},${ballPos.y})`);
    const shown = clamp(Math.round(state.t), 0, 6); beatEl.textContent = `${BEATS[shown].name} · ${shown + 1} OF 7`; cueEl.textContent = BEATS[shown].cue; slider.value = String(state.t); document.querySelectorAll("[data-half-dot]").forEach((dot) => dot.classList.toggle("is-on", Number(dot.getAttribute("data-half-dot")) === shown)); applyFocus();
  }
  function updateJobs() {
    const h = homes(), a = assignments(), d = defenseTasks();
    document.getElementById("half-offense-jobs").innerHTML = OFFENSE.map((id) => `<button type="button" class="assignment-card role-${offenseRole(id).toLowerCase()}" data-half-job="${id}"><span class="assignment-position">${h[id].label}</span><span class="assignment-role">${id === "RUN" ? "RUN THE LANE" : id === "LEAD" ? "LEAD BLOCK" : "BLOCK"}</span><span class="assignment-task">${a[id].task}</span></button>`).join("");
    document.getElementById("half-defense-jobs").innerHTML = DEFENSE.map((id) => `<button type="button" class="assignment-card defense-job" data-half-job="${id}"><span class="assignment-position">${h[id].label}</span><span class="assignment-role">LANE INTEGRITY</span><span class="assignment-task">${d[id]}</span></button>`).join("");
    document.querySelectorAll("[data-half-job]").forEach((card) => card.addEventListener("click", function () { selectPlayer(card.getAttribute("data-half-job")); }));
  }
  function selectPlayer(id) { state.selected = state.selected === id ? null : id; applyPoses(); document.querySelectorAll("[data-half-job]").forEach((card) => card.classList.toggle("is-selected", card.getAttribute("data-half-job") === state.selected)); const task = OFFENSE.includes(id) ? assignments()[id].task : defenseTasks()[id]; if (state.selected) cueEl.textContent = `${homes()[id].label}: ${task}`; }
  function updateUi() {
    [["half-lane", state.lane], ["half-side", state.side], ["half-front", state.front]].forEach(([group, value]) => document.querySelectorAll(`[data-${group}]`).forEach((button) => { const active = button.getAttribute(`data-${group}`) === value; button.classList.toggle("is-active", active); button.setAttribute("aria-pressed", String(active)); }));
    const formation = state.front === "two-dl" ? "2 DL · 1 LB · 1 CB" : "1 DL · 2 LB · 1 CB";
    document.getElementById("half-call").innerHTML = `<strong>${laneName()} ${sideName()}</strong><span>${formation}</span>`;
    document.getElementById("half-title").textContent = `${laneName()[0] + laneName().slice(1).toLowerCase()} ${sideName()[0] + sideName().slice(1).toLowerCase()} · ${frontName()}`;
    document.getElementById("half-badge").textContent = `${laneName()} · ${sideName()}`;
  }
  function renderChoice() { pause(); state.t = 0; state.selected = null; updateUi(); drawLane(); drawAssignments(); drawDefensePaths(); updateJobs(); applyPoses(); }
  function setT(value) { state.t = clamp(value, 0, 6); applyPoses(); }
  function pause() { state.playing = false; if (state.raf) cancelAnimationFrame(state.raf); if (playButton) playButton.textContent = "PLAY SLOW"; }
  function tick(now) { if (!state.playing) return; const remaining = 6 - state.startT, duration = state.speed * (remaining / 6), progress = duration <= 0 ? 1 : clamp((now - state.startedAt) / duration, 0, 1); setT(state.startT + remaining * progress); if (progress < 1 && state.playing) state.raf = requestAnimationFrame(tick); else { state.playing = false; setT(6); playButton.textContent = "PLAY AGAIN"; } }
  function play() { if (state.playing) { pause(); return; } if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setT(6); return; } if (state.t >= 5.99) setT(0); state.playing = true; state.startT = state.t; state.startedAt = performance.now(); playButton.textContent = "PAUSE"; state.raf = requestAnimationFrame(tick); }
  function setBeat(value) { pause(); setT(clamp(value, 0, 6)); }
  function bindChoice(selector, key) { document.querySelectorAll(selector).forEach((button) => button.addEventListener("click", function () { state[key] = button.getAttribute(selector.slice(1, -1)); renderChoice(); })); }

  document.addEventListener("DOMContentLoaded", function () {
    const root = document.getElementById("half-drill-root"); cueEl = document.getElementById("half-cue"); beatEl = document.getElementById("half-beat"); slider = document.getElementById("half-slider"); playButton = document.getElementById("half-play"); if (!root || !cueEl || !beatEl || !slider || !playButton) return;
    root.innerHTML = ""; root.appendChild(buildField()); bindChoice("[data-half-lane]", "lane"); bindChoice("[data-half-side]", "side"); bindChoice("[data-half-front]", "front");
    playButton.addEventListener("click", play); document.getElementById("half-back").addEventListener("click", function () { setBeat(Math.round(state.t) - 1); }); document.getElementById("half-next").addEventListener("click", function () { setBeat(Math.round(state.t) + 1); }); document.getElementById("half-reset").addEventListener("click", function () { pause(); state.selected = null; setT(0); document.querySelectorAll("[data-half-job]").forEach((card) => card.classList.remove("is-selected")); }); slider.addEventListener("input", function () { pause(); setT(Number(slider.value)); });
    document.querySelectorAll("[data-half-speed]").forEach((button) => button.addEventListener("click", function () { const speeds = { slow: 10500, normal: 6800, fast: 4200 }; state.speed = speeds[button.getAttribute("data-half-speed")] || 10500; document.querySelectorAll("[data-half-speed]").forEach((item) => { const active = item === button; item.classList.toggle("is-active", active); item.setAttribute("aria-pressed", String(active)); }); }));
    renderChoice();
  });
})();
