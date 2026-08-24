/**
 * 5v4 Grid drill — beat-by-beat still pictures.
 * Half line: C G T + RB1 RB2 vs 2 DL, LB, CB.
 * No interpolated PLAY. Default paused.
 */
(function () {
  const W = 800;
  const H = 520;
  const LOS = 300;
  const NS = "http://www.w3.org/2000/svg";
  const BEATS = [
    { id: 0, name: "PRE-SNAP", cue: "Find your jersey." },
    { id: 1, name: "SNAP", cue: "Clean snap." },
    { id: 2, name: "FIRST STEP", cue: "Head out. Hands inside. Stay home then flag." },
    { id: 3, name: "FIT", cue: "Find your jersey." },
    { id: 4, name: "HOLE", cue: "Hole first. LB." },
    { id: 5, name: "PLANT", cue: "Plant." },
    { id: 6, name: "GO", cue: "Follow. Plant. Go. Nothing outside." }
  ];

  const state = {
    side: "R",
    hole: "inside",
    beat: 0,
    drag: null,
    runnerOverride: null,
    holdingSlow: false,
    players: {},
    dragging: false,
    forceRunner: null
  };

  let svg, cueEl, beatEl, holeRing, holeLbl, ballG, slider;

  function el(name, attrs) {
    const n = document.createElementNS(NS, name);
    Object.keys(attrs || {}).forEach((k) => n.setAttribute(k, attrs[k]));
    return n;
  }

  function flipX(x) {
    return state.side === "R" ? x : W - x;
  }

  function holeInfo() {
    if (state.hole === "inside") return { x: flipX(404), label: "C-G" };
    if (state.hole === "off") return { x: flipX(492), label: "G-T" };
    return { x: flipX(610), label: "outside T" };
  }

  function roles() {
    const playsideRB = "RB2";
    const insideRB = "RB1";
    let runner, lead;
    if (state.hole === "inside") { runner = insideRB; lead = playsideRB; }
    else { runner = playsideRB; lead = insideRB; }
    if (state.forceRunner === "RB1" || state.forceRunner === "RB2") {
      runner = state.forceRunner;
      lead = runner === "RB1" ? "RB2" : "RB1";
    }
    return { runner, lead };
  }

  function homes() {
    return {
      C: { x: flipX(360), y: 322, label: "C", kind: "OL", fill: "#0A1628", stroke: "#D4A017" },
      G: { x: flipX(448), y: 322, label: "G", kind: "OL", fill: "#0A1628", stroke: "#D4A017" },
      T: { x: flipX(536), y: 322, label: "T", kind: "OL", fill: "#0A1628", stroke: "#D4A017" },
      RB1: { x: flipX(380), y: 418, label: "RB1", kind: "RB", fill: "#0A1628", stroke: "#D4A017" },
      RB2: { x: flipX(500), y: 418, label: "RB2", kind: "RB", fill: "#0A1628", stroke: "#D4A017" },
      DLG: { x: flipX(448), y: 268, label: "DL", kind: "DL", fill: "#3d4a5c", stroke: "#8a96a8" },
      DLT: { x: flipX(536), y: 268, label: "DL", kind: "DL", fill: "#3d4a5c", stroke: "#8a96a8" },
      LB: { x: flipX(400), y: 198, label: "LB", kind: "LB", fill: "#3d4a5c", stroke: "#8a96a8" },
      CB: { x: flipX(640), y: 258, label: "CB", kind: "CB", fill: "#3d4a5c", stroke: "#D4A017" }
    };
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function poses(beat) {
    const h = homes();
    const hole = holeInfo();
    const { runner, lead } = roles();
    const sign = state.side === "R" ? 1 : -1;
    const p = {};
    Object.keys(h).forEach((id) => { p[id] = { x: h[id].x, y: h[id].y }; });

    const dlgGap = [Math.min(h.C.x, h.G.x) - 8, Math.max(h.C.x, h.G.x) + 8];
    const dltGap = [Math.min(h.G.x, h.T.x) - 8, Math.max(h.G.x, h.T.x) + 36];

    if (beat >= 1) {
      p.C.y = h.C.y + 10;
    }
    if (beat >= 2) {
      p.C.x = h.C.x + sign * 10;
      p.C.y = h.C.y - 8;
      p.G.x = h.G.x;
      p.G.y = h.G.y - 14;
      p.T.x = h.T.x;
      p.T.y = h.T.y - 14;
      p[lead].x = h[lead].x + (hole.x - h[lead].x) * 0.18;
      p[lead].y = h[lead].y - 18;
      p[runner].y = h[runner].y - 12;
    }
    if (beat >= 3) {
      p.G.x = h.DLG.x;
      p.G.y = h.G.y - 22;
      p.T.x = h.DLT.x;
      p.T.y = h.T.y - 22;
      p.C.x = h.C.x + sign * 16;
      p.C.y = h.C.y - 16;
      p[lead].x = h[lead].x + (hole.x - h[lead].x) * 0.55;
      p[lead].y = 338;
      p[runner].x = h[runner].x + (hole.x - h[runner].x) * 0.35;
      p[runner].y = 360;
    }
    if (beat >= 4) {
      p[lead].x = hole.x;
      p[lead].y = LOS + 6;
      p[runner].x = hole.x;
      p[runner].y = LOS + 28;
      p.LB.x = h.LB.x + (hole.x - h.LB.x) * 0.35;
      p.LB.y = h.LB.y + 18;
    }
    if (beat >= 5) {
      p[runner].x = hole.x;
      p[runner].y = LOS + 4;
      p[lead].x = hole.x + sign * 8;
      p[lead].y = LOS - 8;
      p.LB.x = h.LB.x + (hole.x - h.LB.x) * 0.55;
      p.LB.y = LOS - 36;
    }
    if (beat >= 6) {
      p[runner].x = hole.x;
      p[runner].y = 118;
      p[lead].x = hole.x + sign * 10;
      p[lead].y = LOS - 24;
      p.DLG.y = h.DLG.y + 8;
      p.DLT.y = h.DLT.y + 8;
      p.LB.x = hole.x - sign * 12;
      p.LB.y = 150;
      p.CB.y = 140;
    }

    if (state.runnerOverride && beat >= 1) {
      const rx = state.runnerOverride.x;
      const ry = state.runnerOverride.y;
      if (beat <= 3) {
        p[runner].x = rx;
        p[runner].y = ry;
      }
      if (beat >= 4) {
        p[runner].x = rx;
        p[runner].y = ry;
        const ballX = rx;
        const ballY = ry;
        if (beat >= 4) {
          p.LB.x = h.LB.x + (ballX - h.LB.x) * (beat === 4 ? 0.35 : beat === 5 ? 0.55 : 0.75);
          p.LB.y = beat >= 6 ? Math.min(ballY + 24, 180) : (beat === 5 ? LOS - 36 : h.LB.y + 18);
        }
        if (beat >= 6) {
          const inG = ballX >= dlgGap[0] && ballX <= dlgGap[1] && ballY < LOS;
          const inT = ballX >= dltGap[0] && ballX <= dltGap[1] && ballY < LOS;
          if (inG) {
            p.DLG.x = clamp(ballX, dlgGap[0], dlgGap[1]);
            p.DLG.y = h.DLG.y + 10;
          } else {
            p.DLG.x = h.DLG.x;
            p.DLG.y = h.DLG.y;
          }
          if (inT) {
            p.DLT.x = clamp(ballX, dltGap[0], dltGap[1]);
            p.DLT.y = h.DLT.y + 10;
          } else {
            p.DLT.x = h.DLT.x;
            p.DLT.y = h.DLT.y;
          }
        }
      }
    }

    // CB nothing outside — always wider than ball (and than T)
    const ballX = p[runner].x;
    if (state.side === "R") {
      p.CB.x = Math.max(h.CB.x, ballX + 48, h.T.x + 70);
    } else {
      p.CB.x = Math.min(h.CB.x, ballX - 48, h.T.x - 70);
    }
    if (beat < 6) p.CB.y = h.CB.y;
    else p.CB.y = Math.min(h.CB.y, p[runner].y + 20);

    // LB inside-out: do not pass CB
    if (state.side === "R") p.LB.x = Math.min(p.LB.x, p.CB.x - 40);
    else p.LB.x = Math.max(p.LB.x, p.CB.x + 40);

    // DL gap integrity unless GO and ball in their gap
    if (beat < 6) {
      p.DLG.x = h.DLG.x;
      p.DLG.y = h.DLG.y;
      p.DLT.x = h.DLT.x;
      p.DLT.y = h.DLT.y;
    } else if (!state.runnerOverride) {
      p.DLG.x = clamp(p.DLG.x + (hole.x - h.DLG.x) * 0.15, dlgGap[0], dlgGap[1]);
      p.DLT.x = clamp(p.DLT.x + (hole.x - h.DLT.x) * 0.2, dltGap[0], dltGap[1]);
    }

    return { p, runner, lead, hole, ball: { x: p[runner].x, y: p[runner].y } };
  }

  function applyPoses() {
    const { p, runner, hole, ball } = poses(state.beat);
    Object.keys(p).forEach((id) => {
      const node = state.players[id];
      if (!node) return;
      node.x = p[id].x;
      node.y = p[id].y;
      node.g.setAttribute("transform", "translate(" + p[id].x + "," + p[id].y + ")");
      node.ring.setAttribute("opacity", id === runner ? "1" : "0");
    });
    const onC = state.beat === 0;
    const hx = onC ? state.players.C.x : ball.x + 16;
    const hy = onC ? state.players.C.y - 28 : ball.y - 8;
    ballG.setAttribute("transform", "translate(" + hx + "," + hy + ")");
    holeRing.setAttribute("cx", hole.x);
    holeRing.setAttribute("cy", LOS);
    holeLbl.setAttribute("x", hole.x);
    holeLbl.setAttribute("y", LOS - 22);
    holeLbl.textContent = hole.label;
    const b = BEATS[state.beat];
    if (cueEl) cueEl.textContent = b.cue;
    if (beatEl) beatEl.textContent = "Beat " + state.beat + " · " + b.name;
    if (slider) slider.value = String(state.beat);
    document.querySelectorAll("[data-beat-dot]").forEach((d) => {
      d.classList.toggle("is-on", Number(d.getAttribute("data-beat-dot")) === state.beat);
    });
  }

  function setBeat(n) {
    state.beat = clamp(n, 0, 6);
    applyPoses();
  }

  function svgPoint(e) {
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 400, y: 400 };
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const m = pt.matrixTransform(ctm.inverse());
    return { x: clamp(m.x, 40, 760), y: clamp(m.y, 50, 490) };
  }

  function onDown(e, id) {
    const { runner } = roles();
    if (id !== runner && id !== "RB1" && id !== "RB2") return;
    e.preventDefault();
    e.stopPropagation();
    state.dragging = true;
    if (id === "RB1" || id === "RB2") {
      // dragging a back makes them the pictured runner this series
      state.forceRunner = id;
    }
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    const pt = svgPoint(e);
    state.runnerOverride = pt;
    applyPoses();
  }

  function onMove(e) {
    if (!state.dragging) return;
    e.preventDefault();
    state.runnerOverride = svgPoint(e);
    applyPoses();
  }

  function onUp() {
    state.dragging = false;
  }

  function token(id, spec) {
    const g = el("g", { class: "grid-tok", "data-id": id, style: "cursor:grab;touch-action:none" });
    const hit = el("circle", { r: "36", fill: "transparent" });
    const disc = el("circle", { r: "26", fill: spec.fill, stroke: spec.stroke, "stroke-width": spec.kind === "CB" ? "4" : "3.2" });
    const ring = el("circle", { r: "32", fill: "none", stroke: "#fff", "stroke-width": "3", opacity: "0" });
    const lab = el("text", {
      x: "0", y: "6", fill: "#fff", "font-size": spec.label.length > 2 ? "13" : "16",
      "font-weight": "800", "text-anchor": "middle", "font-family": "system-ui,sans-serif",
      "pointer-events": "none"
    });
    lab.textContent = spec.label;
    g.appendChild(hit);
    g.appendChild(ring);
    g.appendChild(disc);
    g.appendChild(lab);
    g.addEventListener("pointerdown", (e) => onDown(e, id));
    svg.appendChild(g);
    state.players[id] = { id, g, disc, ring, x: spec.x, y: spec.y };
  }

  function build() {
    svg = el("svg", {
      viewBox: "0 0 " + W + " " + H,
      width: "100%",
      class: "grid5-svg",
      style: "touch-action:none;user-select:none;display:block",
      role: "img",
      "aria-label": "5 on 4 beat pictures"
    });
    svg.appendChild(el("rect", { width: W, height: H, fill: "#0d3b24" }));
    svg.appendChild(el("line", { x1: 30, y1: LOS, x2: 770, y2: LOS, stroke: "#D4A017", "stroke-width": "4" }));
    const los = el("text", { x: 40, y: LOS - 10, fill: "#D4A017", "font-size": "14", "font-weight": "800", "font-family": "system-ui,sans-serif" });
    los.textContent = "LOS";
    svg.appendChild(los);
    [110, 200, 400].forEach((y) => {
      svg.appendChild(el("line", { x1: 40, y1: y, x2: 760, y2: y, stroke: "rgba(255,255,255,.15)", "stroke-width": "1.2" }));
    });
    holeRing = el("circle", { r: "16", fill: "none", stroke: "#e8b423", "stroke-width": "3" });
    holeLbl = el("text", { fill: "#e8b423", "font-size": "14", "font-weight": "800", "text-anchor": "middle", "font-family": "system-ui,sans-serif" });
    svg.appendChild(holeRing);
    svg.appendChild(holeLbl);
    const h = homes();
    ["C", "G", "T", "RB1", "RB2", "DLG", "DLT", "LB", "CB"].forEach((id) => token(id, h[id]));
    ballG = el("g", {});
    ballG.appendChild(el("ellipse", { rx: "13", ry: "8", fill: "#f4f0ea", stroke: "#2a2218", "stroke-width": "1.5" }));
    svg.appendChild(ballG);
    svg.addEventListener("pointermove", onMove);
    svg.addEventListener("pointerup", onUp);
    svg.addEventListener("pointercancel", onUp);
    return svg;
  }

  function reset() {
    state.holdingSlow = false;
    state.runnerOverride = null;
    state.forceRunner = null;
    state.dragging = false;
    state.beat = 0;
    applyPoses();
  }

  function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }

  async function holdSlow() {
    state.holdingSlow = true;
    while (state.holdingSlow) {
      await sleep(1200);
      if (!state.holdingSlow) break;
      if (state.beat >= 6) {
        state.holdingSlow = false;
        break;
      }
      setBeat(state.beat + 1);
      await sleep(1000);
    }
  }

  function syncToggles() {
    document.querySelectorAll("[data-grid-side]").forEach((b) => {
      const on = b.getAttribute("data-grid-side") === state.side;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    document.querySelectorAll("[data-grid-hole]").forEach((b) => {
      const on = b.getAttribute("data-grid-hole") === state.hole;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
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
    const slow = document.getElementById("grid5-slow");
    if (slow) {
      const start = (e) => { e.preventDefault(); holdSlow(); };
      const stop = () => { state.holdingSlow = false; };
      slow.addEventListener("pointerdown", start);
      slow.addEventListener("pointerup", stop);
      slow.addEventListener("pointerleave", stop);
      slow.addEventListener("pointercancel", stop);
    }
    if (slider) {
      slider.addEventListener("input", () => setBeat(Number(slider.value)));
    }
    document.querySelectorAll("[data-grid-side]").forEach((b) => {
      b.addEventListener("click", () => {
        state.side = b.getAttribute("data-grid-side");
        state.runnerOverride = null;
        syncToggles();
        applyPoses();
      });
    });
    document.querySelectorAll("[data-grid-hole]").forEach((b) => {
      b.addEventListener("click", () => {
        state.hole = b.getAttribute("data-grid-hole");
        state.runnerOverride = null;
        syncToggles();
        applyPoses();
      });
    });
    syncToggles();
    applyPoses();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
