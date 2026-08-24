/**
 * 5v4 Grid — spaced half-line, block leverage, dashed RB routes, decoy.
 */
(function () {
  const W = 900;
  const H = 580;
  const LOS = 310;
  const NS = "http://www.w3.org/2000/svg";
  const BEATS = [
    { id: 0, name: "PRE-SNAP", cue: "Find your jersey. See the hole." },
    { id: 1, name: "SNAP", cue: "Clean snap." },
    { id: 2, name: "FIRST STEP", cue: "Step to HIS hip. The one with the arrow." },
    { id: 3, name: "FIT", cue: "Get that shoulder. Hands inside." },
    { id: 4, name: "HOLE", cue: "Lead: hole first. LB. Runner: follow." },
    { id: 5, name: "PLANT", cue: "Plant." },
    { id: 6, name: "GO", cue: "North. CB: nothing outside." }
  ];

  const state = {
    side: "R", hole: "inside", beat: 0, t: 0, speed: 8,
    decoy: true, playing: false, holdingSlow: false,
    runnerOverride: null, forceRunner: null, dragging: false,
    players: {}, trail: null
  };
  let svg, cueEl, beatEl, holeRing, holeLbl, ballG, slider, routeLead, routeRun, routeDecoy, levG;

  function el(name, attrs) {
    const n = document.createElementNS(NS, name);
    Object.keys(attrs || {}).forEach((k) => n.setAttribute(k, attrs[k]));
    return n;
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, u) { return a + (b - a) * u; }
  function ease(u) { return u * u * (3 - 2 * u); }
  function flipX(x) { return state.side === "R" ? x : W - x; }
  function sign() { return state.side === "R" ? 1 : -1; }

  function holeInfo() {
    if (state.hole === "inside") return { x: flipX(390), label: "C–G" };
    if (state.hole === "off") return { x: flipX(530), label: "G–T" };
    return { x: flipX(700), label: "outside T" };
  }

  function useDecoy() {
    return state.decoy && state.hole === "inside";
  }

  function roles() {
    let runner = state.hole === "inside" ? "RB1" : "RB2";
    let lead = runner === "RB1" ? "RB2" : "RB1";
    if (state.forceRunner === "RB1" || state.forceRunner === "RB2") {
      runner = state.forceRunner;
      lead = runner === "RB1" ? "RB2" : "RB1";
    }
    const decoy = useDecoy() ? lead : null;
    if (decoy) lead = null;
    return { runner, lead, decoy };
  }

  function homes() {
    const s = sign();
    return {
      C: { x: flipX(300), y: LOS + 36, label: "C", fill: "#0A1628", stroke: "#D4A017" },
      G: { x: flipX(460), y: LOS + 36, label: "G", fill: "#0A1628", stroke: "#D4A017" },
      T: { x: flipX(620), y: LOS + 36, label: "T", fill: "#0A1628", stroke: "#D4A017" },
      RB1: { x: flipX(340), y: 500, label: "RB1", fill: "#0A1628", stroke: "#D4A017" },
      RB2: { x: flipX(520), y: 500, label: "RB2", fill: "#0A1628", stroke: "#D4A017" },
      DLG: { x: flipX(470), y: LOS - 42, label: "DL", fill: "#334155", stroke: "#94a3b8" },
      DLT: { x: flipX(630), y: LOS - 42, label: "DL", fill: "#334155", stroke: "#94a3b8" },
      LB: { x: flipX(360), y: 175, label: "LB", fill: "#334155", stroke: "#94a3b8" },
      CB: { x: flipX(790), y: 240, label: "CB", fill: "#334155", stroke: "#D4A017" }
    };
  }

  /* Which hip of the DL the OL should take. +1 = playside/outside, -1 = inside toward C. */
  function leverage() {
    const s = sign();
    if (state.hole === "inside") {
      return { G: { side: s, word: "OUTSIDE hip" }, T: { side: s, word: "OUTSIDE hip" }, C: { side: s, word: "hole hip" } };
    }
    if (state.hole === "off") {
      return { G: { side: -s, word: "INSIDE hip" }, T: { side: s, word: "OUTSIDE hip" }, C: { side: s, word: "help G" } };
    }
    return { G: { side: -s, word: "INSIDE hip" }, T: { side: s, word: "OUTSIDE hip" }, C: { side: -s, word: "stay in" } };
  }

  function fitOnHip(dl, olHome, side, beatAmt) {
    const hip = 34;
    return {
      x: lerp(olHome.x, dl.x + side * hip, beatAmt),
      y: lerp(olHome.y, dl.y + 28, beatAmt)
    };
  }

  function poses(beat) {
    const h = homes();
    const hole = holeInfo();
    const { runner, lead, decoy } = roles();
    const lev = leverage();
    const s = sign();
    const p = {};
    Object.keys(h).forEach((id) => { p[id] = { x: h[id].x, y: h[id].y }; });

    const gFit = beat >= 3 ? 1 : beat >= 2 ? 0.45 : 0;
    const tFit = gFit;
    const cFit = beat >= 3 ? 0.85 : beat >= 2 ? 0.35 : 0;
    const gf = fitOnHip(h.DLG, h.G, lev.G.side, gFit);
    const tf = fitOnHip(h.DLT, h.T, lev.T.side, tFit);
    p.G = gf;
    p.T = tf;
    p.C = {
      x: lerp(h.C.x, h.C.x + lev.C.side * 22, cFit),
      y: lerp(h.C.y, LOS + (beat >= 1 ? 18 : 36) - (beat >= 2 ? 20 : 0), Math.min(1, beat / 3))
    };
    if (beat >= 1) p.C.y = h.C.y + 8;

    // RBs
    const runHome = h[runner];
    const decoyHome = decoy ? h[decoy] : null;
    const leadHome = lead ? h[lead] : null;

    if (beat >= 1) p[runner].y = runHome.y - 16;
    if (beat >= 2) {
      p[runner].x = lerp(runHome.x, hole.x, 0.2);
      p[runner].y = runHome.y - 36;
    }
    if (beat >= 3) {
      p[runner].x = lerp(runHome.x, hole.x, 0.45);
      p[runner].y = 400;
    }
    if (beat >= 4) { p[runner].x = hole.x; p[runner].y = LOS + 24; }
    if (beat >= 5) { p[runner].x = hole.x; p[runner].y = LOS - 6; }
    if (beat >= 6) { p[runner].x = hole.x; p[runner].y = 88; }

    if (leadHome) {
      if (beat >= 2) { p[lead].x = lerp(leadHome.x, hole.x, 0.25); p[lead].y = leadHome.y - 40; }
      if (beat >= 3) { p[lead].x = lerp(leadHome.x, hole.x, 0.65); p[lead].y = 360; }
      if (beat >= 4) { p[lead].x = hole.x + s * 12; p[lead].y = LOS - 8; }
      if (beat >= 5) { p[lead].x = hole.x + s * 18; p[lead].y = LOS - 28; }
      if (beat >= 6) {
        p[lead].x = hole.x + s * 22;
        p[lead].y = 155;
        p.LB.x = hole.x - s * 16;
        p.LB.y = 130;
      }
    }

    if (decoyHome) {
      const wideX = flipX(780);
      const wideY = 210;
      if (beat >= 2) { p[decoy].x = lerp(decoyHome.x, wideX, 0.25); p[decoy].y = decoyHome.y - 50; }
      if (beat >= 3) { p[decoy].x = lerp(decoyHome.x, wideX, 0.55); p[decoy].y = 340; }
      if (beat >= 4) { p[decoy].x = lerp(decoyHome.x, wideX, 0.85); p[decoy].y = 250; }
      if (beat >= 5) { p[decoy].x = wideX; p[decoy].y = wideY + 20; }
      if (beat >= 6) { p[decoy].x = wideX; p[decoy].y = wideY; }
    }

    if (state.runnerOverride && beat >= 1) {
      p[runner].x = state.runnerOverride.x;
      p[runner].y = state.runnerOverride.y;
    }

    const ballX = p[runner].x;
    const ballY = p[runner].y;
    if (beat >= 4) {
      p.LB.x = lerp(h.LB.x, ballX, beat === 4 ? 0.3 : beat === 5 ? 0.5 : 0.72);
      p.LB.y = beat >= 6 ? Math.min(ballY + 36, 170) : (beat === 5 ? 200 : 185);
    }
    if (beat < 6) {
      p.DLG.x = h.DLG.x; p.DLG.y = h.DLG.y;
      p.DLT.x = h.DLT.x; p.DLT.y = h.DLT.y;
    } else {
      const throughG = Math.abs(ballX - h.DLG.x) < 70 && ballY < LOS;
      const throughT = Math.abs(ballX - h.DLT.x) < 70 && ballY < LOS;
      if (throughG) { p.DLG.x = ballX; p.DLG.y = h.DLG.y + 12; }
      if (throughT) { p.DLT.x = ballX; p.DLT.y = h.DLT.y + 12; }
    }

    if (state.side === "R") p.CB.x = Math.max(h.CB.x, ballX + 70, h.T.x + 90);
    else p.CB.x = Math.min(h.CB.x, ballX - 70, h.T.x - 90);
    p.CB.y = beat < 6 ? h.CB.y : Math.min(h.CB.y, ballY + 28);
    if (state.side === "R") p.LB.x = Math.min(p.LB.x, p.CB.x - 50);
    else p.LB.x = Math.max(p.LB.x, p.CB.x + 50);

    return { p, runner, lead, decoy, hole, ball: { x: p[runner].x, y: p[runner].y }, lev };
  }

  function lerpPoses(tval) {
    const t0 = Math.floor(tval);
    const t1 = Math.min(6, t0 + 1);
    const u = ease(tval - t0);
    const A = poses(t0);
    const B = poses(t1);
    const p = {};
    Object.keys(A.p).forEach((id) => {
      p[id] = { x: lerp(A.p[id].x, B.p[id].x, u), y: lerp(A.p[id].y, B.p[id].y, u) };
    });
    return { p, runner: A.runner, lead: A.lead, decoy: A.decoy, hole: A.hole, lev: A.lev, ball: { x: p[A.runner].x, y: p[A.runner].y } };
  }

  function pathFrom(id, key) {
    const pts = [];
    for (let b = 0; b <= 6; b++) {
      const pos = poses(b).p[id];
      if (pos) pts.push(pos.x.toFixed(1) + "," + pos.y.toFixed(1));
    }
    return "M " + pts.join(" L ");
  }

  function drawLeverage(pack) {
    while (levG.firstChild) levG.removeChild(levG.firstChild);
    const h = homes();
    const L = pack.lev;
    const beat = state.t;
    if (beat < 0.4) return;
    function mark(dl, side, word) {
      const hx = dl.x + side * 32;
      const hy = dl.y + 6;
      const poly = el("polygon", {
        points: side > 0
          ? (hx - 14) + "," + (hy - 12) + " " + (hx + 16) + "," + hy + " " + (hx - 14) + "," + (hy + 12)
          : (hx + 14) + "," + (hy - 12) + " " + (hx - 16) + "," + hy + " " + (hx + 14) + "," + (hy + 12),
        fill: "#e8b423",
        opacity: "0.95"
      });
      const tx = el("text", {
        x: String(hx + side * 8), y: String(hy - 20), fill: "#e8b423",
        "font-size": "11", "font-weight": "800", "text-anchor": side > 0 ? "start" : "end",
        "font-family": "system-ui,sans-serif"
      });
      tx.textContent = word;
      levG.appendChild(poly);
      levG.appendChild(tx);
    }
    mark(h.DLG, L.G.side, "G: " + L.G.word);
    mark(h.DLT, L.T.side, "T: " + L.T.word);
  }

  function applyPoses() {
    const pack = (Math.abs(state.t - Math.round(state.t)) < 0.02) ? poses(state.beat) : lerpPoses(state.t);
    const { p, runner, lead, decoy, hole, ball } = pack;
    Object.keys(p).forEach((id) => {
      const node = state.players[id];
      if (!node) return;
      node.g.setAttribute("transform", "translate(" + p[id].x + "," + p[id].y + ")");
      node.ring.setAttribute("opacity", id === runner ? "1" : "0");
      let role = "";
      if (id === runner) role = "BALL";
      else if (id === lead) role = "LEAD";
      else if (id === decoy) role = "DECOY";
      if (node.role) node.role.textContent = role;
    });
    const onC = state.t < 0.85;
    const hx = onC ? p.C.x : ball.x + 18;
    const hy = onC ? p.C.y - 30 : ball.y - 10;
    ballG.setAttribute("transform", "translate(" + hx + "," + hy + ")");
    holeRing.setAttribute("cx", hole.x);
    holeRing.setAttribute("cy", LOS);
    holeLbl.setAttribute("x", hole.x);
    holeLbl.setAttribute("y", LOS - 26);
    holeLbl.textContent = hole.label;

    if (routeRun) routeRun.setAttribute("d", pathFrom(runner));
    if (routeLead) {
      routeLead.setAttribute("d", lead ? pathFrom(lead) : "");
      routeLead.setAttribute("opacity", lead ? "1" : "0");
    }
    if (routeDecoy) {
      routeDecoy.setAttribute("d", decoy ? pathFrom(decoy) : "");
      routeDecoy.setAttribute("opacity", decoy ? "1" : "0");
    }
    drawLeverage(pack);

    const shown = clamp(Math.round(state.t), 0, 6);
    const b = BEATS[shown];
    let cue = b.cue;
    if (decoy && shown >= 2) cue = shown < 5 ? "Decoy, get wide. Runner, the hole." : cue;
    if (cueEl) cueEl.textContent = cue;
    if (beatEl) beatEl.textContent = b.name + (decoy ? "  ·  decoy wide" : "  ·  lead through hole");
    if (slider) slider.value = String(state.t);
    document.querySelectorAll("[data-beat-dot]").forEach((d) => {
      d.classList.toggle("is-on", Number(d.getAttribute("data-beat-dot")) === shown);
    });
    if (state.playing && state.trail) {
      const pt = el("circle", { cx: String(ball.x), cy: String(ball.y), r: "3.2", fill: "#e8b423", opacity: "0.4" });
      state.trail.appendChild(pt);
      while (state.trail.childNodes.length > 30) state.trail.removeChild(state.trail.firstChild);
    }
  }

  function setBeat(n) { state.playing = false; state.t = clamp(n, 0, 6); state.beat = Math.round(state.t); applyPoses(); }
  function setT(v) { state.t = clamp(v, 0, 6); state.beat = Math.round(state.t); applyPoses(); }

  function playSlow() {
    if (state.playing) { state.playing = false; return; }
    state.playing = true;
    if (state.t >= 5.98) state.t = 0;
    const dur = (state.speed || 8) * 1000;
    const startT = state.t;
    const start = performance.now();
    const span = 6 - startT;
    function frame(now) {
      if (!state.playing) return;
      const u = Math.min(1, (now - start) / dur);
      setT(startT + span * u);
      if (u < 1 && state.playing) requestAnimationFrame(frame);
      else { state.playing = false; setT(6); }
    }
    requestAnimationFrame(frame);
  }

  function svgPoint(e) {
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 400, y: 400 };
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const m = pt.matrixTransform(ctm.inverse());
    return { x: clamp(m.x, 50, 850), y: clamp(m.y, 40, 540) };
  }
  function onDown(e, id) {
    if (id !== "RB1" && id !== "RB2") return;
    e.preventDefault();
    state.dragging = true;
    state.forceRunner = id;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    state.runnerOverride = svgPoint(e);
    applyPoses();
  }
  function onMove(e) {
    if (!state.dragging) return;
    e.preventDefault();
    state.runnerOverride = svgPoint(e);
    applyPoses();
  }
  function onUp() { state.dragging = false; }

  function token(id, spec) {
    const g = el("g", { class: "grid-tok", "data-id": id, style: "cursor:grab;touch-action:none" });
    g.appendChild(el("circle", { r: "40", fill: "transparent" }));
    const ring = el("circle", { r: "34", fill: "none", stroke: "#fff", "stroke-width": "3", opacity: "0" });
    const disc = el("circle", { r: "28", fill: spec.fill, stroke: spec.stroke, "stroke-width": spec.label === "CB" ? "4" : "3.2" });
    const lab = el("text", { x: "0", y: "6", fill: "#fff", "font-size": spec.label.length > 2 ? "13" : "17", "font-weight": "800", "text-anchor": "middle", "font-family": "system-ui,sans-serif", "pointer-events": "none" });
    lab.textContent = spec.label;
    const role = el("text", { x: "0", y: "44", fill: "#e8b423", "font-size": "12", "font-weight": "800", "text-anchor": "middle", "font-family": "system-ui,sans-serif", "pointer-events": "none" });
    g.appendChild(ring); g.appendChild(disc); g.appendChild(lab); g.appendChild(role);
    g.addEventListener("pointerdown", (ev) => onDown(ev, id));
    svg.appendChild(g);
    state.players[id] = { id, g, disc, ring, role };
  }

  function build() {
    svg = el("svg", { viewBox: "0 0 " + W + " " + H, width: "100%", class: "grid5-svg", style: "touch-action:none;user-select:none;display:block;background:#0d3b24", role: "img", "aria-label": "5 on 4 half line" });
    svg.appendChild(el("rect", { width: W, height: H, fill: "#0d3b24" }));
    svg.appendChild(el("line", { x1: 24, y1: LOS, x2: W - 24, y2: LOS, stroke: "#D4A017", "stroke-width": "4" }));
    const los = el("text", { x: 36, y: LOS - 10, fill: "#D4A017", "font-size": "15", "font-weight": "800", "font-family": "system-ui,sans-serif" });
    los.textContent = "LOS";
    svg.appendChild(los);
    [100, 190, 430].forEach((y) => {
      svg.appendChild(el("line", { x1: 40, y1: y, x2: W - 40, y2: y, stroke: "rgba(255,255,255,.14)", "stroke-width": "1.2" }));
    });
    state.trail = el("g", {});
    svg.appendChild(state.trail);
    routeDecoy = el("path", { fill: "none", stroke: "#c084fc", "stroke-width": "3", "stroke-dasharray": "10 8", "stroke-linecap": "round", opacity: "0" });
    routeLead = el("path", { fill: "none", stroke: "#e2e8f0", "stroke-width": "3.2", "stroke-dasharray": "9 7", "stroke-linecap": "round" });
    routeRun = el("path", { fill: "none", stroke: "#e8b423", "stroke-width": "4", "stroke-dasharray": "12 8", "stroke-linecap": "round" });
    svg.appendChild(routeDecoy); svg.appendChild(routeLead); svg.appendChild(routeRun);
    levG = el("g", { class: "leverage" });
    svg.appendChild(levG);
    holeRing = el("circle", { r: "18", fill: "none", stroke: "#e8b423", "stroke-width": "3" });
    holeLbl = el("text", { fill: "#e8b423", "font-size": "16", "font-weight": "800", "text-anchor": "middle", "font-family": "system-ui,sans-serif" });
    svg.appendChild(holeRing); svg.appendChild(holeLbl);
    const h = homes();
    ["DLG", "DLT", "LB", "CB", "C", "G", "T", "RB1", "RB2"].forEach((id) => token(id, h[id]));
    ballG = el("g", {});
    ballG.appendChild(el("ellipse", { rx: "14", ry: "9", fill: "#f4f0ea", stroke: "#2a2218", "stroke-width": "1.6" }));
    svg.appendChild(ballG);
    svg.addEventListener("pointermove", onMove);
    svg.addEventListener("pointerup", onUp);
    svg.addEventListener("pointercancel", onUp);
    return svg;
  }

  function reset() {
    state.playing = false; state.holdingSlow = false; state.t = 0; state.beat = 0;
    state.runnerOverride = null; state.forceRunner = null; state.dragging = false;
    if (state.trail) while (state.trail.firstChild) state.trail.removeChild(state.trail.firstChild);
    applyPoses();
  }

  function syncToggles() {
    document.querySelectorAll("[data-grid-side]").forEach((b) => {
      const on = b.getAttribute("data-grid-side") === state.side;
      b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    document.querySelectorAll("[data-grid-hole]").forEach((b) => {
      const on = b.getAttribute("data-grid-hole") === state.hole;
      b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    document.querySelectorAll("[data-grid-decoy]").forEach((b) => {
      const want = b.getAttribute("data-grid-decoy") === "1";
      b.classList.toggle("is-active", want === state.decoy);
    });
  }

  function init() {
    const root = document.getElementById("grid5-root");
    cueEl = document.getElementById("grid5-cue");
    beatEl = document.getElementById("grid5-beat");
    slider = document.getElementById("grid5-slider");
    if (!root) return;
    root.innerHTML = "";
    root.appendChild(build());
    document.getElementById("grid5-back")?.addEventListener("click", () => setBeat(state.beat - 1));
    document.getElementById("grid5-next")?.addEventListener("click", () => setBeat(state.beat + 1));
    document.getElementById("grid5-reset")?.addEventListener("click", reset);
    document.getElementById("grid5-play")?.addEventListener("click", playSlow);
    const slow = document.getElementById("grid5-slow");
    if (slow) {
      slow.addEventListener("pointerdown", (e) => { e.preventDefault(); state.holdingSlow = true;
        (async function loop() {
          while (state.holdingSlow) {
            await new Promise((r) => setTimeout(r, 1100));
            if (!state.holdingSlow) break;
            if (state.beat >= 6) { state.holdingSlow = false; break; }
            setBeat(state.beat + 1);
          }
        })();
      });
      const stop = () => { state.holdingSlow = false; };
      slow.addEventListener("pointerup", stop); slow.addEventListener("pointerleave", stop);
    }
    if (slider) {
      slider.setAttribute("step", "0.02");
      slider.addEventListener("input", () => { state.playing = false; setT(Number(slider.value)); });
    }
    document.querySelectorAll("[data-grid-speed]").forEach((b) => {
      b.addEventListener("click", () => {
        const s = b.getAttribute("data-grid-speed");
        state.speed = s === "fast" ? 3.5 : s === "normal" ? 5.5 : 8;
        document.querySelectorAll("[data-grid-speed]").forEach((x) => x.classList.toggle("is-active", x === b));
      });
    });
    document.querySelectorAll("[data-grid-side]").forEach((b) => {
      b.addEventListener("click", () => { state.side = b.getAttribute("data-grid-side"); state.runnerOverride = null; syncToggles(); applyPoses(); });
    });
    document.querySelectorAll("[data-grid-hole]").forEach((b) => {
      b.addEventListener("click", () => {
        state.hole = b.getAttribute("data-grid-hole");
        state.runnerOverride = null;
        if (state.hole === "inside") state.decoy = true;
        if (state.hole !== "inside") state.decoy = false;
        syncToggles(); applyPoses();
      });
    });
    document.querySelectorAll("[data-grid-decoy]").forEach((b) => {
      b.addEventListener("click", () => {
        state.decoy = b.getAttribute("data-grid-decoy") === "1";
        syncToggles(); applyPoses();
      });
    });
    syncToggles();
    applyPoses();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
