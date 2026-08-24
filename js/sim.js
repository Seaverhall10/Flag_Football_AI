/**
 * Cy-Fair K/1 Lions — interactive 8-on-8 play simulator
 * One formation. Tap a kid. PLAY runs the snap.
 */
(function () {
  const W = 800;
  const H = 500;
  const LOS_Y = 300;
  const DURATION = 2800;
  const NS = "http://www.w3.org/2000/svg";

  const RUNS = {
    "inside-right": { name: "Inside Right", color: "#d32f2f", holeX: 438, side: "R", defaultRunner: "RB3" },
    "inside-left": { name: "Inside Left", color: "#1976d2", holeX: 362, side: "L", defaultRunner: "RB1" },
    "off-tackle-right": { name: "Off-Tackle Right", color: "#e6a100", holeX: 514, side: "R", defaultRunner: "RB3" },
    "off-tackle-left": { name: "Off-Tackle Left", color: "#2e7d32", holeX: 286, side: "L", defaultRunner: "RB1" },
    "wide-right": { name: "Wide Right", color: "#e65100", holeX: 592, side: "R", defaultRunner: "RB3" },
    "wide-left": { name: "Wide Left", color: "#7b1fa2", holeX: 208, side: "L", defaultRunner: "RB1" }
  };

  const HOME = [
    { id: "LT", kind: "OL", label: "LT", x: 248, y: 312, fill: "#0A1628", stroke: "#D4A017" },
    { id: "LG", kind: "OL", label: "LG", x: 324, y: 312, fill: "#0A1628", stroke: "#D4A017" },
    { id: "C", kind: "OL", label: "C", x: 400, y: 312, fill: "#0A1628", stroke: "#D4A017" },
    { id: "RG", kind: "OL", label: "RG", x: 476, y: 312, fill: "#0A1628", stroke: "#D4A017" },
    { id: "RT", kind: "OL", label: "RT", x: 552, y: 312, fill: "#0A1628", stroke: "#D4A017" },
    { id: "RB1", kind: "RB", label: "RB1", x: 338, y: 412, fill: "#0A1628", stroke: "#D4A017" },
    { id: "RB2", kind: "RB", label: "RB2", x: 400, y: 368, fill: "#0A1628", stroke: "#D4A017" },
    { id: "RB3", kind: "RB", label: "RB3", x: 462, y: 412, fill: "#0A1628", stroke: "#D4A017" },
    { id: "DL1", kind: "DL", label: "DL", x: 286, y: 278, fill: "#3d4a5c", stroke: "#8a96a8" },
    { id: "DL2", kind: "DL", label: "DL", x: 400, y: 278, fill: "#3d4a5c", stroke: "#8a96a8" },
    { id: "DL3", kind: "DL", label: "DL", x: 514, y: 278, fill: "#3d4a5c", stroke: "#8a96a8" },
    { id: "LB1", kind: "LB", label: "LB", x: 330, y: 208, fill: "#3d4a5c", stroke: "#8a96a8" },
    { id: "LB2", kind: "LB", label: "LB", x: 470, y: 208, fill: "#3d4a5c", stroke: "#8a96a8" },
    { id: "LCB", kind: "CB", label: "CB", x: 118, y: 270, fill: "#3d4a5c", stroke: "#D4A017" },
    { id: "RCB", kind: "CB", label: "CB", x: 682, y: 270, fill: "#3d4a5c", stroke: "#D4A017" },
    { id: "S", kind: "S", label: "S", x: 400, y: 128, fill: "#3d4a5c", stroke: "#8a96a8" }
  ];

  const OL_COVER = {
    LT: "Cover the left DL.",
    LG: "Cover left or mid DL.",
    C: "Snap. Then the DL.",
    RG: "Cover right or mid DL.",
    RT: "Cover the right DL."
  };

  const state = {
    runKey: "inside-right",
    runnerId: "RB3",
    selectedId: null,
    playing: false,
    t0: 0,
    raf: 0,
    bounce: false,
    cutback: false,
    players: {},
    trails: []
  };

  let svg, cueEl, holeRing, ballG, trailG, reduced = false;

  function prefersReduced() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function ease(t) {
    t = Math.max(0, Math.min(1, t));
    return t * t * (3 - 2 * t);
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function cubic(p0, p1, p2, p3, t) {
    const u = 1 - t;
    return {
      x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
      y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y
    };
  }

  function seg(t, a, b) {
    if (t <= a) return 0;
    if (t >= b) return 1;
    return ease((t - a) / (b - a));
  }

  function el(name, attrs) {
    const n = document.createElementNS(NS, name);
    Object.keys(attrs || {}).forEach((k) => n.setAttribute(k, attrs[k]));
    return n;
  }

  function setCue(text) {
    if (cueEl) cueEl.textContent = text;
  }

  function roles() {
    const runner = state.runnerId;
    let lead = "RB2";
    if (runner === "RB2") lead = side() === "R" ? "RB1" : "RB3";
    const ids = ["RB1", "RB2", "RB3"];
    const extra = ids.find((id) => id !== runner && id !== lead);
    return { runner, lead, extra };
  }

  function side() {
    return RUNS[state.runKey].side;
  }

  function hole() {
    const r = RUNS[state.runKey];
    let x = r.holeX;
    if (state.bounce) x += (r.side === "R" ? 70 : -70);
    return { x, y: LOS_Y };
  }

  function resetPlayers() {
    HOME.forEach((h) => {
      const p = state.players[h.id];
      p.x = h.x;
      p.y = h.y;
      p.scale = 1;
      applyTransform(p);
    });
    state.trails = [];
    drawTrails();
    placeBallAtC(false);
    updateHole();
    updateSelection();
  }

  function applyTransform(p) {
    p.g.setAttribute("transform", `translate(${p.x},${p.y}) scale(${p.scale || 1})`);
  }

  function placeBallAtC(onRunner) {
    const { runner } = roles();
    const target = onRunner ? state.players[runner] : state.players.C;
    ballG.setAttribute("transform", `translate(${target.x},${target.y - (onRunner ? 10 : 18)})`);
    ballG.style.opacity = "1";
  }

  function updateHole() {
    const h = hole();
    holeRing.setAttribute("cx", h.x);
    holeRing.setAttribute("cy", h.y);
    holeRing.setAttribute("stroke", RUNS[state.runKey].color);
  }

  function updateSelection() {
    HOME.forEach((h) => {
      const p = state.players[h.id];
      const sel = p.id === state.selectedId;
      p.ring.setAttribute("opacity", sel ? "1" : "0");
      p.scale = sel ? 1.18 : 1;
      applyTransform(p);
    });
  }

  function snapCue() {
    const { runner, lead } = roles();
    setCue(`Snap to ${runner}. ${lead} is Lead. Follow. Plant. Go.`);
  }

  function tapPlayer(id) {
    if (state.playing) return;
    const p = state.players[id];
    state.selectedId = id;
    updateSelection();
    if (p.kind === "RB") {
      state.runnerId = id;
      snapCue();
      placeBallAtC(false);
      return;
    }
    if (p.kind === "OL") {
      setCue(`Find your jersey. Head out. Hands inside. ${OL_COVER[id]}`);
      return;
    }
    if (p.kind === "DL") { setCue("Stay home, then flag."); return; }
    if (p.kind === "CB") { setCue("Nothing outside."); return; }
    if (p.kind === "LB") { setCue("Fill the hole. Then flag."); return; }
    if (p.kind === "S") { setCue("Stay deep. Then the ball."); return; }
  }

  function buildField() {
    svg = el("svg", {
      viewBox: `0 0 ${W} ${H}`,
      width: "100%",
      class: "sim-svg",
      role: "img",
      "aria-label": "8 on 8 play field"
    });

    const defs = el("defs", {});
    defs.innerHTML = `
      <filter id="tokShadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="2" stdDeviation="2.2" flood-color="#000" flood-opacity="0.45"/>
      </filter>
      <radialGradient id="turfGrad" cx="50%" cy="55%" r="70%">
        <stop offset="0%" stop-color="#114a30"/>
        <stop offset="100%" stop-color="#0d3b24"/>
      </radialGradient>
    `;
    svg.appendChild(defs);

    svg.appendChild(el("rect", { width: W, height: H, fill: "url(#turfGrad)" }));

    for (let i = 0; i < 21; i++) {
      const x = 40 + i * 36;
      svg.appendChild(el("line", {
        x1: x, y1: 40, x2: x, y2: H - 28,
        stroke: "rgba(255,255,255,0.06)", "stroke-width": "1"
      }));
    }
    [80, 160, 240, 360, 440].forEach((y) => {
      svg.appendChild(el("line", {
        x1: 48, y1: y, x2: 752, y2: y,
        stroke: "rgba(255,255,255,0.12)", "stroke-width": y === 160 ? "1.6" : "1"
      }));
    });
    // hashes
    for (let y = 60; y < 460; y += 20) {
      svg.appendChild(el("line", { x1: 268, y1: y, x2: 286, y2: y, stroke: "rgba(255,255,255,0.22)", "stroke-width": "1.2" }));
      svg.appendChild(el("line", { x1: 514, y1: y, x2: 532, y2: y, stroke: "rgba(255,255,255,0.22)", "stroke-width": "1.2" }));
    }
    [[70, "10"], [160, "5"], [440, "5"]].forEach(([y, n]) => {
      const t1 = el("text", { x: 62, y, fill: "rgba(255,255,255,0.28)", "font-size": "18", "font-weight": "800", "font-family": "system-ui,sans-serif" });
      t1.textContent = n;
      const t2 = el("text", { x: 738, y, fill: "rgba(255,255,255,0.28)", "font-size": "18", "font-weight": "800", "text-anchor": "end", "font-family": "system-ui,sans-serif" });
      t2.textContent = n;
      svg.appendChild(t1);
      svg.appendChild(t2);
    });

    svg.appendChild(el("line", {
      x1: 36, y1: LOS_Y, x2: 764, y2: LOS_Y,
      stroke: "#D4A017", "stroke-width": "3"
    }));
    const losLbl = el("text", {
      x: 44, y: LOS_Y - 8, fill: "#D4A017", "font-size": "11", "font-weight": "800",
      "letter-spacing": "0.12em", "font-family": "system-ui,sans-serif"
    });
    losLbl.textContent = "LOS";
    svg.appendChild(losLbl);

    holeRing = el("circle", {
      r: "9", fill: "none", "stroke-width": "2.5", class: "sim-hole",
      opacity: "0.95"
    });
    svg.appendChild(holeRing);

    trailG = el("g", { class: "sim-trails" });
    svg.appendChild(trailG);

    HOME.forEach((h) => {
      const g = el("g", { class: "sim-player", "data-id": h.id, style: "cursor:pointer" });
      const hit = el("circle", { r: "24", fill: "transparent" });
      const disc = el("circle", {
        r: "16", fill: h.fill, stroke: h.stroke, "stroke-width": h.kind === "CB" ? "2.6" : "2.2",
        filter: "url(#tokShadow)"
      });
      const ring = el("circle", { r: "21", fill: "none", stroke: "#D4A017", "stroke-width": "2.4", opacity: "0" });
      const lab = el("text", {
        x: "0", y: "4.5", fill: "#fff", "font-size": h.kind === "RB" ? "9" : "10",
        "font-weight": "800", "text-anchor": "middle", "font-family": "system-ui,sans-serif",
        "pointer-events": "none"
      });
      lab.textContent = h.label;
      g.appendChild(hit);
      g.appendChild(ring);
      g.appendChild(disc);
      g.appendChild(lab);
      g.addEventListener("click", (e) => { e.stopPropagation(); tapPlayer(h.id); });
      svg.appendChild(g);
      state.players[h.id] = { ...h, g, disc, ring, scale: 1 };
      applyTransform(state.players[h.id]);
    });

    ballG = el("g", { class: "sim-ball" });
    ballG.appendChild(el("ellipse", {
      rx: "7", ry: "4.4", fill: "#f4f0ea", stroke: "#2a2218", "stroke-width": "1.1"
    }));
    ballG.appendChild(el("line", { x1: "-4", y1: "0", x2: "4", y2: "0", stroke: "#8b1e1e", "stroke-width": "0.9" }));
    svg.appendChild(ballG);

    return svg;
  }

  function drawTrails() {
    while (trailG.firstChild) trailG.removeChild(trailG.firstChild);
    state.trails.forEach((d, i) => {
      const o = (i + 1) / state.trails.length * 0.45;
      trailG.appendChild(el("circle", { cx: d.x, cy: d.y, r: 2.4, fill: "#fff", opacity: String(o) }));
    });
  }

  function poseAt(t) {
    const run = RUNS[state.runKey];
    const { runner, lead, extra } = roles();
    const h = hole();
    const bounce = state.bounce;
    const cut = state.cutback;
    const flare = bounce ? (run.side === "R" ? 70 : -70) : 0;
    const cutDir = run.side === "R" ? -1 : 1;

    const rHome = state.players[runner];
    const rh = HOME.find((x) => x.id === runner);

    // Football 0-0.25 C hitch then to runner
    const c = state.players.C;
    const cHome = HOME.find((x) => x.id === "C");
    const hitch = Math.sin(Math.min(1, t / 0.25) * Math.PI) * 6;
    if (t < 0.25) {
      c.x = cHome.x;
      c.y = cHome.y + hitch;
    }

    // OL 0.15-1.2 one step to their DL
    const olMap = { LT: "DL1", LG: "DL1", C: "DL2", RG: "DL3", RT: "DL3" };
    ["LT", "LG", "C", "RG", "RT"].forEach((id) => {
      if (id === "C" && t < 0.25) {
        applyTransform(c);
        return;
      }
      const p = state.players[id];
      const home = HOME.find((x) => x.id === id);
      const dl = state.players[olMap[id]];
      const u = seg(t, 0.15, 1.2);
      const tx = lerp(home.x, home.x + (dl.homeDx || 0) * 0 + (HOME.find((x) => x.id === olMap[id]).x - home.x) * 0.42, u);
      const ty = lerp(home.y, home.y - 18, u);
      p.x = tx;
      p.y = ty;
      applyTransform(p);
    });

    // DL sit then drift toward ball 0.15-1.2
    const runnerNow = { x: 0, y: 0 }; // filled after runner path
    // compute runner first
    const plantT = 0.95;
    let rx, ry;
    if (!cut) {
      const p0 = { x: rh.x, y: rh.y };
      const p1 = { x: lerp(rh.x, h.x, 0.35), y: rh.y - 30 };
      const p2 = { x: h.x + flare * 0.3, y: h.y + 8 };
      const p3 = { x: h.x + flare, y: 70 };
      const u = seg(t, 0.2, 2.4);
      const pt = cubic(p0, p1, p2, p3, u);
      rx = pt.x; ry = pt.y;
      if (t >= plantT && t < 1.15) {
        // brief pause near hole
        const freeze = cubic(p0, p1, p2, p3, seg(plantT, 0.2, 2.4));
        rx = freeze.x; ry = freeze.y;
      }
    } else {
      const p0 = { x: rh.x, y: rh.y };
      const p1 = { x: lerp(rh.x, h.x, 0.5), y: rh.y - 40 };
      const plant = { x: h.x + flare * 0.2, y: h.y - 8 };
      const end = { x: h.x + cutDir * 120, y: 72 };
      if (t < 1.05) {
        const u = seg(t, 0.2, 1.05);
        const pt = cubic(p0, p1, { x: plant.x, y: plant.y + 20 }, plant, u);
        rx = pt.x; ry = pt.y;
      } else {
        const u = seg(t, 1.05, 2.4);
        rx = lerp(plant.x, end.x, u);
        ry = lerp(plant.y, end.y, u);
      }
    }
    const rp = state.players[runner];
    rp.x = rx; rp.y = ry;
    applyTransform(rp);
    runnerNow.x = rx; runnerNow.y = ry;

    if (t < 0.25) {
      const u = t / 0.25;
      const bx = lerp(cHome.x, rp.x, ease(u));
      const by = lerp(cHome.y - 18, rp.y - 10, ease(u));
      ballG.setAttribute("transform", `translate(${bx},${by})`);
    } else {
      ballG.setAttribute("transform", `translate(${rp.x},${rp.y - 10})`);
    }

    // trails
    if (t > 0.25 && Math.random() > 0.4) {
      state.trails.push({ x: rp.x, y: rp.y });
      if (state.trails.length > 18) state.trails.shift();
      drawTrails();
    }

    // Lead 0.2-1.6 hole then nearest LB
    const leadP = state.players[lead];
    const leadH = HOME.find((x) => x.id === lead);
    const lbs = [state.players.LB1, state.players.LB2];
    const nearestLbHome = HOME.filter((x) => x.kind === "LB").sort((a, b) => Math.abs(a.x - h.x) - Math.abs(b.x - h.x))[0];
    const leadTargetX = bounce ? h.x + flare * 0.4 : (cut ? h.x - flare * 0.2 : h.x);
    const uLead = seg(t, 0.2, 1.6);
    if (uLead < 0.55) {
      const uu = uLead / 0.55;
      leadP.x = lerp(leadH.x, leadTargetX, uu);
      leadP.y = lerp(leadH.y, LOS_Y - 8, uu);
    } else {
      const uu = (uLead - 0.55) / 0.45;
      leadP.x = lerp(leadTargetX, nearestLbHome.x + (bounce ? flare * 0.15 : 0), uu);
      leadP.y = lerp(LOS_Y - 8, nearestLbHome.y + 12, uu);
    }
    applyTransform(leadP);

    // Extra trails 1 step playside
    const extraP = state.players[extra];
    const extraH = HOME.find((x) => x.id === extra);
    const uEx = seg(t, 0.2, 1.6);
    const kick = bounce ? (run.side === "R" ? 22 : -22) : (run.side === "R" ? 12 : -12);
    extraP.x = lerp(extraH.x, extraH.x + kick, uEx);
    extraP.y = lerp(extraH.y, extraH.y - 16, uEx);
    applyTransform(extraP);

    // DL stay home then flag toward ball
    ["DL1", "DL2", "DL3"].forEach((id) => {
      const p = state.players[id];
      const home = HOME.find((x) => x.id === id);
      const u = seg(t, 0.35, 1.6);
      p.x = lerp(home.x, lerp(home.x, runnerNow.x, 0.35), u);
      p.y = lerp(home.y, home.y + 6, u);
      applyTransform(p);
    });

    // LBs flow to hole then ball
    ["LB1", "LB2"].forEach((id) => {
      const p = state.players[id];
      const home = HOME.find((x) => x.id === id);
      const over = cut ? (run.side === "R" ? 36 : -36) : 0;
      const u1 = seg(t, 0.25, 1.1);
      const midX = h.x + over + (id === "LB1" ? -18 : 18);
      const midY = h.y - 40;
      let x = lerp(home.x, midX, u1);
      let y = lerp(home.y, midY, u1);
      const u2 = seg(t, 1.1, 2.5);
      x = lerp(x, runnerNow.x + (id === "LB1" ? -14 : 14), u2);
      y = lerp(y, runnerNow.y + 18, u2);
      p.x = x; p.y = y;
      applyTransform(p);
    });

    // CBs: playside stays outside runner, backside home
    const playside = run.side === "R" ? "RCB" : "LCB";
    const backside = run.side === "R" ? "LCB" : "RCB";
    const pcb = state.players[playside];
    const pcbH = HOME.find((x) => x.id === playside);
    const outside = run.side === "R" ? 28 : -28;
    const uCb = seg(t, 0.25, 2.2);
    pcb.x = lerp(pcbH.x, Math.max(40, Math.min(760, runnerNow.x + outside + (bounce ? flare * 0.2 : 0))), uCb);
    pcb.y = lerp(pcbH.y, Math.min(pcbH.y, runnerNow.y + 8), uCb);
    applyTransform(pcb);
    const bcb = state.players[backside];
    const bcbH = HOME.find((x) => x.id === backside);
    bcb.x = lerp(bcbH.x, bcbH.x + (cut ? cutDir * 20 : 0), seg(t, 0.4, 2.0));
    bcb.y = bcbH.y;
    applyTransform(bcb);

    // S shuffle to ball hash, stay deeper
    const s = state.players.S;
    const sH = HOME.find((x) => x.id === "S");
    const uS = seg(t, 0.3, 2.4);
    const sTargetX = cut ? h.x + cutDir * 40 : runnerNow.x;
    s.x = lerp(sH.x, sTargetX, uS);
    s.y = Math.min(sH.y + 20, runnerNow.y - 70);
    s.y = lerp(sH.y, s.y, uS);
    applyTransform(s);

    if (t >= 0.92 && t < 1.2) setCue("Plant. Go.");
  }

  function tick(now) {
    if (!state.playing) return;
    const t = Math.min(DURATION, now - state.t0);
    poseAt(t);
    if (t >= DURATION) {
      state.playing = false;
      setCue("Reset. Tap a kid.");
      return;
    }
    state.raf = requestAnimationFrame(tick);
  }

  function play() {
    if (state.playing) return;
    reduced = prefersReduced();
    snapCue();
    state.playing = true;
    state.trails = [];
    if (reduced) {
      poseAt(DURATION);
      state.playing = false;
      setCue("Reset. Tap a kid.");
      return;
    }
    state.t0 = performance.now();
    state.raf = requestAnimationFrame(tick);
  }

  function reset() {
    state.playing = false;
    if (state.raf) cancelAnimationFrame(state.raf);
    state.bounce = false;
    state.cutback = false;
    resetPlayers();
    setCue("Tap a kid. PLAY runs the snap.");
  }

  function setRun(key) {
    if (!RUNS[key]) return;
    const wasPlaying = state.playing;
    if (wasPlaying) {
      state.playing = false;
      if (state.raf) cancelAnimationFrame(state.raf);
    }
    state.runKey = key;
    state.bounce = false;
    state.cutback = false;
    if (!state.selectedId || state.players[state.selectedId].kind !== "RB") {
      state.runnerId = RUNS[key].defaultRunner;
    }
    resetPlayers();
    snapCue();
    document.querySelectorAll(".play-btn").forEach((b) => {
      const on = b.getAttribute("data-run-key") === key;
      b.style.outline = on ? `3px solid ${RUNS[key].color}` : "none";
    });
  }

  function bounce() {
    state.cutback = false;
    state.bounce = true;
    setCue("Edge crashes? Bounce.");
    if (state.playing) return;
    play();
  }

  function cutback() {
    state.bounce = false;
    state.cutback = true;
    setCue("They run wide? Cut back.");
    if (state.playing) return;
    play();
  }

  function init() {
    const root = document.getElementById("sim-root");
    cueEl = document.getElementById("sim-cue");
    if (!root) return;
    root.innerHTML = "";
    root.appendChild(buildField());
    HOME.forEach((h) => { const p = state.players[h.id]; p.homeDx = 0; });
    resetPlayers();
    setCue("Tap a kid. PLAY runs the snap.");
    document.querySelectorAll(".play-btn").forEach((b) => {
      b.addEventListener("click", () => setRun(b.getAttribute("data-run-key")));
    });
    const playBtn = document.getElementById("sim-play");
    const resetBtn = document.getElementById("sim-reset");
    const bounceBtn = document.getElementById("sim-bounce");
    const cutBtn = document.getElementById("sim-cutback");
    if (playBtn) playBtn.addEventListener("click", play);
    if (resetBtn) resetBtn.addEventListener("click", reset);
    if (bounceBtn) bounceBtn.addEventListener("click", bounce);
    if (cutBtn) cutBtn.addEventListener("click", cutback);
    setRun(state.runKey);
  }

  window.LionsSim = { setRun, play, reset, bounce, cutback };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
