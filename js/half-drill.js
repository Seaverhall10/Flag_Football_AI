/** Lions single drill: 5-player half offense vs 4-player half defense. */
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const W = 1000, H = 820, LOS = 360, HIP = 16;
  const BEATS = [
    { name: "LINE UP", cue: "Count defenders from inside out. Point to your job before the snap." },
    { name: "DIRECT SNAP", cue: "Center snaps to Runner. Defense reads the ball without crossing early." },
    { name: "FIRST STEP", cue: "Guard: your DL. Center: A-gap, then climb to the backer." },
    { name: "FIT", cue: "G on the DL. C wraps inside to the backer. T on the edge." },
    { name: "LANE", cue: "Lead RB enters first. Runner commits to the selected lane." },
    { name: "SHED / FLAG", cue: "Defense finds the ball, sheds toward the lane, and closes under control." },
    { name: "FINISH", cue: "Runner goes north. Defense pursues inside-out; Corner keeps contain." }
  ];
  const state = {
    lane: "inside", side: "right", front: "two-dl", decoy: true, t: 0, playing: false, speed: 10500,
    startT: 0, startedAt: 0, raf: 0, selected: null, players: {},
    nudge: { RUN: { x: 0, y: 0 }, LEAD: { x: 0, y: 0 } },
    shown: null, dragging: null
  };
  const OFFENSE = ["C", "G", "T", "RUN", "LEAD"];
  const DEFENSE = ["DL", "LB", "CB", "FLEX"];
  let svg, ball, lanePath, laneLabel, blockLayer, defenseLayer, hipLayer, cueEl, beatEl, slider, playButton;

  function el(name, attrs) { const node = document.createElementNS(NS, name); Object.keys(attrs || {}).forEach((key) => node.setAttribute(key, attrs[key])); return node; }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t * t * (3 - 2 * t); }
  function mix(a, b, t) { return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) }; }
  function flipX(x) { return state.side === "right" ? x : W - x; }
  function p(x, y) { return { x: flipX(x), y }; }
  function laneX() { return flipX(state.lane === "inside" ? 400 : 855); }
  function sideName() { return state.side.toUpperCase(); }
  function laneName() { return state.lane.toUpperCase(); }
  function frontName() { return state.front === "two-dl" ? "Two-DL Front" : "Two-LB Front"; }
  function gHipKind() { return state.lane === "inside" ? "inside" : "outside"; }
  function gHipLabel() { return gHipKind() === "inside" ? "INSIDE HIP" : "OUTSIDE HIP"; }
  function playOut() { return state.side === "right" ? 1 : -1; }
  function hipDx(kind) { const outside = playOut() * HIP; return kind === "outside" ? outside : -outside; }
  function hipOf(def, kind) { return { x: def.x + hipDx(kind), y: def.y + 8 }; }

  function labels() {
    return {
      C: "CENTER", G: "GUARD", T: "TACKLE", RUN: "RUNNER", LEAD: "LEAD RB",
      DL: "D-LINE", LB: state.front === "two-dl" ? "LINEBACKER" : "LB-IN", CB: "CORNER",
      FLEX: state.front === "two-dl" ? "EDGE / DL" : "LB-OUT"
    };
  }
  function tokenLabels() {
    return { C: "C", G: "G", T: "T", RUN: "R", LEAD: "L", DL: "DL", LB: "LB", CB: "CB", FLEX: state.front === "two-dl" ? "E" : "O" };
  }
  function rawHomes() {
    const ol = { C: { x: 310, y: 410 }, G: { x: 500, y: 410 }, T: { x: 700, y: 410 }, RUN: { x: 330, y: 710 }, LEAD: { x: 680, y: 610 } };
    if (state.front === "two-dl") {
      return Object.assign(ol, { DL: { x: 500, y: 300 }, FLEX: { x: 740, y: 300 }, LB: { x: 575, y: 175 }, CB: { x: 900, y: 230 } });
    }
    return Object.assign(ol, { DL: { x: 500, y: 300 }, FLEX: { x: 750, y: 175 }, LB: { x: 455, y: 175 }, CB: { x: 900, y: 230 } });
  }
  function homes() {
    const lab = labels(), raw = rawHomes(), out = {};
    Object.keys(raw).forEach((id) => { out[id] = p(raw[id].x, raw[id].y); out[id].label = lab[id]; });
    return out;
  }
  function assignments() {
    const h = homes();
    const gHip = hipOf(h.DL, gHipKind());
    const tHip = hipOf(h.FLEX, gHipKind());
    const cHip = hipOf(h.LB, "inside");
    const lanePt = { x: laneX(), y: LOS - 20 };
    return {
      C: { target: "LB", point: cHip, task: "Snap. Climb through the A-gap. Wrap inside the DL to the backer. Do not block Guard's man." },
      G: { target: "DL", point: gHip, task: `${gHipLabel()} of D-LINE. That is YOUR guy.` },
      T: { target: "FLEX", point: tHip, task: `${gHipLabel()} of EDGE. Stay on him.` },
      LEAD: { target: state.decoy ? "CB" : "LANE", point: state.decoy ? { x: h.CB.x, y: h.CB.y + 36 } : lanePt, task: state.decoy ? "Decoy wide. Hold the Corner." : "Lead through the hole. Center has the backer." },
      RUN: { target: "LANE", point: { x: laneX(), y: LOS }, task: `Snap. ${laneName()} ${sideName()}. One cut. North.` }
    };
  }
  function defenseTasks() {
    return state.front === "two-dl"
      ? {
          DL: `Anchor inside · separate from Guard · shed toward ${laneName()} lane`,
          FLEX: `Set the edge · outside arm free · squeeze without losing contain`,
          LB: `Stay square. Center is climbing to you. Shed, then the ball.`,
          CB: `Unblocked contain · nothing outside · force Runner back to pursuit`
        }
      : {
          DL: `Anchor inside · separate from Guard · shed toward ${laneName()} lane`,
          LB: `Stay square. Center is climbing to you. Shed, then the ball.`,
          FLEX: `Stay square outside · fit Lead RB · protect the selected lane`,
          CB: `Unblocked contain · nothing outside · force Runner back to pursuit`
        };
  }
  function offenseRole(id) {
    if (id === "RUN") return "BALL";
    if (id === "LEAD") return state.decoy ? "DECOY" : "LEAD";
    if (id === "G") return gHipLabel();
    if (id === "C") return "CLIMB";
    return "BLOCK";
  }
  function tokenCaption(id) {
    if (id === "RUN") return "BALL";
    if (id === "LEAD") return state.decoy ? "DECOY" : "LEAD";
    return "";
  }

  function basePoses() { const h = homes(), out = {}; Object.keys(h).forEach((id) => { out[id] = { x: h[id].x, y: h[id].y }; }); return out; }

  /**
   * Center wrap path. Unflipped (side=right) coordinates:
   *   0 home        (300, 450) just behind LOS
   *   1 snap hitch  (300, 464) tiny step back
   *   2 A-gap step  (382, 430) between C and G, NOT toward the DL
   *   3 A-gap @ LOS (388, 400) C.x stays well left of DL.x=500
   *   4 climb past  (380, 270) past DL inside, still not touching
   *   5-6           blend from (380, 270) to live/home LB inside hip
   * flipX / p() mirrors this for side=left.
   */
  function centerWaypoints() {
    const lbHip = hipOf(homes().LB, "inside");
    const w0 = p(310, 410);
    const w1 = p(310, 422);
    const w2 = p(385, 385);
    const w3 = p(392, 355);
    const w4 = p(385, 250);
    const w5 = mix(w4, lbHip, 0.62);
    const w6 = mix(w4, lbHip, 1);
    return [w0, w1, w2, w3, w4, w5, w6];
  }
  function sampleCenterPath(t) {
    const w = centerWaypoints();
    const lo = Math.floor(t), hi = Math.min(6, lo + 1), u = ease(t - lo);
    return mix(w[lo], w[hi], u);
  }

  function runnerPose(beat) {
    const h = homes().RUN, x = laneX(), finishX = state.lane === "outside" ? x : lerp(x, 500, .12);
    return [h, { x: h.x, y: h.y - 8 }, { x: lerp(h.x, x, .18), y: 685 }, { x: lerp(h.x, x, .48), y: 555 }, { x, y: 420 }, { x, y: 300 }, { x: finishX, y: 70 }][beat];
  }
  function leadPose(beat) {
    const h = homes().LEAD, target = assignments().LEAD.point, x = laneX();
    if (state.decoy) {
      const cb = homes().CB;
      const flare = { x: lerp(h.x, cb.x, .78), y: cb.y + 36 };
      return [
        h,
        { x: lerp(h.x, flare.x, .1), y: h.y - 6 },
        { x: lerp(h.x, flare.x, .38), y: 575 },
        { x: lerp(h.x, flare.x, .62), y: 455 },
        { x: lerp(h.x, flare.x, .86), y: 340 },
        flare,
        { x: lerp(flare.x, cb.x, .28), y: cb.y + 28 }
      ][beat];
    }
    return [h, { x: h.x, y: h.y - 8 }, { x: lerp(h.x, x, .3), y: 610 }, { x: lerp(h.x, x, .68), y: 505 }, { x, y: 365 }, { x: target.x, y: target.y + 35 }, { x: target.x, y: target.y + 30 }][beat];
  }
  function poseAtBeat(beat) {
    const h = homes(), out = basePoses();
    out.RUN = runnerPose(beat);
    out.LEAD = leadPose(beat);
    const x = laneX(), laneBias = state.side === "right" ? -24 : 24;
    if (beat >= 5) {
      const lbTarget = { x: x + laneBias, y: 275 };
      out.LB = mix(h.LB, lbTarget, beat === 5 ? .62 : .8);
      const flexTarget = state.front === "two-dl" ? { x: h.FLEX.x + (state.side === "right" ? -20 : 20), y: h.FLEX.y + 25 } : { x: x + (state.side === "right" ? 35 : -35), y: 270 };
      out.FLEX = mix(h.FLEX, flexTarget, beat === 5 ? .52 : .72);
      out.DL = mix(h.DL, { x: state.lane === "inside" ? x : h.DL.x + (state.side === "right" ? 22 : -22), y: h.DL.y + 28 }, beat === 5 ? .35 : .48);
      const cbTarget = { x: state.lane === "outside" ? x + (state.side === "right" ? 55 : -55) : h.CB.x + (state.side === "right" ? -35 : 35), y: 295 };
      out.CB = mix(h.CB, cbTarget, beat === 5 ? .4 : .7);
    } else {
      out.DL = mix(h.DL, { x: h.DL.x, y: h.DL.y + 6 }, beat >= 2 ? .2 : 0);
      out.FLEX = mix(h.FLEX, { x: h.FLEX.x + playOut() * 8, y: h.FLEX.y + 4 }, beat >= 2 ? .15 : 0);
      if (beat >= 4) {
        out.LB = mix(h.LB, { x: x + laneBias, y: 275 }, .25);
        const cbTarget = { x: state.lane === "outside" ? x + (state.side === "right" ? 55 : -55) : h.CB.x + (state.side === "right" ? -18 : 18), y: 295 };
        out.CB = mix(h.CB, cbTarget, .12);
      }
    }
    const gHipNow = hipOf(out.DL, gHipKind());
    const tHipNow = hipOf(out.FLEX, gHipKind());
    const gAmt = beat < 2 ? 0 : beat === 2 ? .5 : 1;
    const tAmt = beat < 2 ? 0 : beat === 2 ? .45 : 1;
    out.G = mix(h.G, gHipNow, gAmt);
    out.T = mix(h.T, tHipNow, tAmt);
    out.C = centerWaypoints()[beat];
    return out;
  }
  function posesAt(value) {
    const lo = Math.floor(value), hi = Math.min(6, lo + 1), u = ease(value - lo), a = poseAtBeat(lo), b = poseAtBeat(hi), out = {};
    Object.keys(a).forEach((id) => { out[id] = mix(a[id], b[id], u); });
    return out;
  }
  function pathFor(id) { const points = []; for (let i = 0; i <= 6; i += 1) points.push(poseAtBeat(i)[id]); return "M " + points.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" L "); }

  function applyNudges(poses) {
    poses.RUN = { x: poses.RUN.x + state.nudge.RUN.x, y: poses.RUN.y + state.nudge.RUN.y };
    poses.LEAD = { x: poses.LEAD.x + state.nudge.LEAD.x, y: poses.LEAD.y + state.nudge.LEAD.y };
  }
  function reactToBall(poses) {
    if (state.t < 1) return;
    const ballX = poses.RUN.x;
    const k = state.dragging === "RUN" ? 0.22 : 0.55;
    const follow = clamp((state.t - 1) / 4.2, 0, 1);
    const lbWant = { x: lerp(homes().LB.x, ballX + (state.side === "right" ? -24 : 24), follow), y: lerp(homes().LB.y, Math.min(poses.RUN.y - 50, 280), follow * 0.7) };
    poses.LB = mix(poses.LB, lbWant, k);
    const margin = 72;
    let wantCb = poses.CB.x;
    if (state.side === "right") wantCb = Math.max(poses.CB.x, ballX + margin);
    else wantCb = Math.min(poses.CB.x, ballX - margin);
    poses.CB.x = lerp(poses.CB.x, wantCb, k);
    if (state.t < 5) {
      const pin = state.dragging === "RUN" ? 0.35 : 0.2;
      poses.DL = mix(poses.DL, { x: homes().DL.x, y: homes().DL.y + 6 }, pin);
      poses.FLEX = mix(poses.FLEX, { x: homes().FLEX.x + playOut() * 8, y: homes().FLEX.y + 4 }, pin);
    }
  }
  function keepCenterInsideDl(poses) {
    const minSep = 48;
    const inside = -playOut();
    const climbed = state.t >= 4 && poses.C.y < poses.DL.y - 48;
    if (climbed) {
      const dist = Math.hypot(poses.C.x - poses.DL.x, poses.C.y - poses.DL.y) || 0.01;
      if (dist < 40) {
        const nx = (poses.C.x - poses.DL.x) / dist, ny = (poses.C.y - poses.DL.y) / dist;
        poses.C.x = poses.DL.x + nx * 40;
        poses.C.y = poses.DL.y + ny * 40;
      }
      return;
    }
    const limit = poses.DL.x + inside * minSep;
    if (inside < 0) poses.C.x = Math.min(poses.C.x, limit);
    else poses.C.x = Math.max(poses.C.x, limit);
  }
  function separate(poses) {
    const close = { "G|DL": 1, "DL|G": 1, "T|FLEX": 1, "FLEX|T": 1 };
    const ids = Object.keys(poses);
    for (let pass = 0; pass < 4; pass += 1) {
      for (let i = 0; i < ids.length; i += 1) {
        for (let j = i + 1; j < ids.length; j += 1) {
          const aId = ids[i], bId = ids[j];
          if ((aId === "C" && bId === "DL") || (aId === "DL" && bId === "C")) continue;
          const a = poses[aId], b = poses[bId];
          const dx = b.x - a.x, dy = b.y - a.y, dist = Math.hypot(dx, dy) || 0.01;
          const blocking = close[aId + "|" + bId];
          const min = blocking ? 26 : 38;
          if (dist < min) {
            const push = (min - dist) / 2, nx = dx / dist, ny = dy / dist;
            a.x -= nx * push; a.y -= ny * push; b.x += nx * push; b.y += ny * push;
          }
        }
      }
    }
    keepCenterInsideDl(poses);
  }
  function easeShown(poses) {
    if (!state.shown || state.dragging) {
      if (!state.shown) { state.shown = poses; return poses; }
      const k = 0.28, out = {};
      Object.keys(poses).forEach((id) => { out[id] = mix(state.shown[id], poses[id], id === state.dragging ? 1 : k); });
      state.shown = out;
      return out;
    }
    state.shown = poses;
    return poses;
  }

  function drawLane() {
    const x = laneX(), start = homes().RUN;
    lanePath.setAttribute("d", `M ${start.x},${start.y} C ${start.x},650 ${x},540 ${x},${LOS} L ${x},70`);
    lanePath.setAttribute("stroke", state.lane === "inside" ? "#f6c344" : "#fb923c");
    laneLabel.setAttribute("x", String(x));
    laneLabel.setAttribute("y", "68");
    laneLabel.setAttribute("text-anchor", "middle");
    laneLabel.setAttribute("paint-order", "stroke");
    laneLabel.setAttribute("stroke", "#071018");
    laneLabel.setAttribute("stroke-width", "8");
    laneLabel.setAttribute("fill", state.lane === "inside" ? "#f6c344" : "#fb923c");
    laneLabel.textContent = `${laneName()} LANE`;
  }
  function shortArrow(from, to) {
    const dx = to.x - from.x, dy = to.y - from.y, dist = Math.hypot(dx, dy) || 1;
    const startPad = 16, endPad = 10;
    if (dist < startPad + endPad + 8) return { x1: from.x, y1: from.y, x2: to.x, y2: to.y };
    return {
      x1: from.x + dx / dist * startPad,
      y1: from.y + dy / dist * startPad,
      x2: to.x - dx / dist * endPad,
      y2: to.y - dy / dist * endPad
    };
  }
  function drawAssignments() {
    blockLayer.innerHTML = "";
    const h = homes(), a = assignments();
    const wrap = el("path", {
      d: pathFor("C"), fill: "none", stroke: "#67e8f9", "stroke-width": "2.6",
      "stroke-dasharray": "8 6", "stroke-linecap": "round", "stroke-linejoin": "round",
      "marker-end": "url(#halfBlockArrow)", "data-half-owner": "C", "pointer-events": "none"
    });
    blockLayer.appendChild(wrap);
    ["G", "T"].forEach((id) => {
      const s = shortArrow({ x: h[id].x, y: h[id].y }, a[id].point);
      const path = el("path", {
        d: `M ${s.x1},${s.y1} L ${s.x2},${s.y2}`, fill: "none",
        stroke: "#67e8f9", "stroke-width": "2.6", "stroke-linecap": "round",
        "marker-end": "url(#halfBlockArrow)", "data-half-owner": id, "pointer-events": "none"
      });
      blockLayer.appendChild(path);
    });
    const decoyLead = state.decoy;
    const leadD = decoyLead
      ? (function () {
          const cb = homes().CB;
          const flare = { x: lerp(h.LEAD.x, cb.x, .78), y: cb.y + 36 };
          return `M ${h.LEAD.x},${h.LEAD.y} Q ${flare.x},${(h.LEAD.y + flare.y) / 2} ${flare.x},${flare.y}`;
        }())
      : pathFor("LEAD");
    const leadPath = el("path", {
      d: leadD, fill: "none",
      stroke: decoyLead ? "#c084fc" : "#fff",
      "stroke-width": decoyLead ? "2.8" : "3.2",
      "stroke-dasharray": decoyLead ? "6 10" : "14 10",
      "stroke-linecap": "round",
      "marker-end": decoyLead ? "url(#halfDecoyArrow)" : "url(#halfLeadArrow)",
      "data-half-owner": "LEAD", "pointer-events": "none"
    });
    blockLayer.appendChild(leadPath);
  }
  function drawDefensePaths() {
    defenseLayer.innerHTML = "";
  }
  function drawHips(poses) {
    hipLayer.innerHTML = "";
    if (state.t < 2 || state.t > 5) return;
    [["G", "DL", gHipKind()], ["T", "FLEX", gHipKind()], ["C", "LB", "inside"]].forEach(([ol, defId, kind]) => {
      const hip = hipOf(poses[defId], kind);
      const dir = hipDx(kind) >= 0 ? 1 : -1;
      const chev = el("path", {
        d: `M ${hip.x - dir * 3},${hip.y - 9} L ${hip.x + dir * 11},${hip.y} L ${hip.x - dir * 3},${hip.y + 9} L ${hip.x - dir * 1},${hip.y} Z`,
        fill: "#f6c344", stroke: "#071018", "stroke-width": "2", "data-half-owner": ol, class: "half-hip-chevron"
      });
      hipLayer.appendChild(chev);
      const lab = el("text", {
        x: String(hip.x + dir * 14), y: String(hip.y - 12),
        fill: "#f6c344", "font-size": "8", "font-weight": "800",
        "text-anchor": dir > 0 ? "start" : "end",
        "paint-order": "stroke", stroke: "#071018", "stroke-width": "5",
        "data-half-owner": ol, "pointer-events": "none"
      });
      lab.textContent = kind === "inside" ? "INSIDE" : "OUTSIDE";
      hipLayer.appendChild(lab);
    });
  }
  function token(id) {
    const offense = OFFENSE.includes(id);
    const wide = false;
    const g = el("g", { class: "sim-player" + (id === "RUN" || id === "LEAD" ? " half-draggable" : ""), "data-half-player": id, tabindex: "0", role: "button" });
    const hit = el("circle", { r: "26", fill: "transparent" });
    let selected;
    let body;
    if (offense) {
      const r = wide ? 18 : 16;
      selected = el("circle", { r: String(r + 4), fill: "none", stroke: "#fff", "stroke-width": "2", opacity: "0" });
      body = el("circle", {
        r: String(r), fill: "#0a1a32", stroke: "#f6c344", "stroke-width": "2.2", filter: "url(#halfTokenShadow)"
      });
    } else {
      selected = el("circle", { r: "20", fill: "none", stroke: "#fff", "stroke-width": "2", opacity: "0" });
      body = el("circle", { r: "15", fill: "#9b1c1c", stroke: "#fecaca", "stroke-width": "2.2", filter: "url(#halfTokenShadow)" });
    }
    const letterSize = wide ? "8" : (id.length > 2 ? "8" : "11");
    const label = el("text", {
      x: "0", y: wide ? "3" : "4", fill: "#fff", "font-size": letterSize, "font-weight": "800",
      "text-anchor": "middle", "pointer-events": "none", "letter-spacing": "0.02em"
    });
    const role = el("text", {
      x: "0", y: "26", fill: "#f6c344", "font-size": "8", "font-weight": "800",
      "text-anchor": "middle", "paint-order": "stroke", stroke: "#071018", "stroke-width": "3",
      "pointer-events": "none"
    });
    g.appendChild(hit); g.appendChild(selected); g.appendChild(body); g.appendChild(label); g.appendChild(role);
    const choose = function () { if (g.getAttribute("data-half-moved") === "1") { g.setAttribute("data-half-moved", "0"); return; } selectPlayer(id); };
    g.addEventListener("click", choose);
    g.addEventListener("keydown", function (event) { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(); } });
    if (id === "RUN" || id === "LEAD") bindDrag(g, id);
    svg.appendChild(g); state.players[id] = { g, selected, label, role };
  }
  function svgPoint(event) {
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = event.clientX; pt.y = event.clientY;
    const loc = pt.matrixTransform(ctm.inverse());
    return { x: loc.x, y: loc.y };
  }
  function bindDrag(g, id) {
    g.addEventListener("pointerdown", function (event) {
      event.preventDefault();
      g.setPointerCapture(event.pointerId);
      const loc = svgPoint(event);
      const scripted = posesAt(state.t)[id];
      state.dragging = id;
      state.dragOrigin = { x: loc.x - (scripted.x + state.nudge[id].x), y: loc.y - (scripted.y + state.nudge[id].y) };
      g.setAttribute("data-half-moved", "0");
    });
    g.addEventListener("pointermove", function (event) {
      if (state.dragging !== id) return;
      const loc = svgPoint(event);
      const scripted = posesAt(state.t)[id];
      const nx = loc.x - state.dragOrigin.x - scripted.x;
      const ny = loc.y - state.dragOrigin.y - scripted.y;
      if (Math.hypot(nx - state.nudge[id].x, ny - state.nudge[id].y) > 2) g.setAttribute("data-half-moved", "1");
      state.nudge[id] = { x: nx, y: ny };
      applyPoses();
    });
    function endDrag() { if (state.dragging === id) state.dragging = null; }
    g.addEventListener("pointerup", endDrag);
    g.addEventListener("pointercancel", endDrag);
  }
  function buildField() {
    svg = el("svg", { viewBox: `0 0 ${W} ${H}`, class: "sim-svg full-team-svg half-team-svg", role: "img", "aria-label": "Five-player half offense versus four-player half defense animated drill" });
    const defs = el("defs", {});
    defs.innerHTML = [
      '<marker id="halfRunArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#f6c344"/></marker>',
      '<marker id="halfLeadArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#fff"/></marker>',
      '<marker id="halfDecoyArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#c084fc"/></marker>',
      '<marker id="halfBlockArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#67e8f9"/></marker>',
      '<filter id="halfTokenShadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="3" stdDeviation="2.4" flood-color="#000000" flood-opacity="0.45"/></filter>'
    ].join("");
    svg.appendChild(defs);
    const turf = el("g", { class: "half-turf" });
    const stripeH = 82;
    for (let i = 0; i < 10; i += 1) {
      turf.appendChild(el("rect", { x: "0", y: String(i * stripeH), width: String(W), height: String(stripeH), fill: i % 2 === 0 ? "#166534" : "#12723a" }));
    }
    svg.appendChild(turf);
    svg.appendChild(el("rect", { x: "16", y: "12", width: "968", height: "796", fill: "none", stroke: "rgba(255,255,255,.4)", "stroke-width": "2" }));
    svg.appendChild(el("rect", { x: "22", y: "18", width: "956", height: "784", fill: "none", stroke: "rgba(246,195,68,.22)", "stroke-width": "1" }));
    const hashes = el("g", { class: "half-hashes", "stroke": "rgba(255,255,255,.42)", "stroke-width": "1" });
    [360, 640].forEach((hx) => {
      for (let y = 50; y <= 870; y += 20) {
        hashes.appendChild(el("line", { x1: String(hx - 16), y1: String(y), x2: String(hx + 16), y2: String(y) }));
      }
    });
    svg.appendChild(hashes);
    svg.appendChild(el("line", { x1: "30", y1: String(LOS), x2: "970", y2: String(LOS), stroke: "#f6c344", "stroke-width": "3" }));
    const los = el("text", {
      x: "44", y: String(LOS + 22), fill: "#f6c344", "font-size": "10", "font-weight": "800",
      "paint-order": "stroke", stroke: "#0d3b24", "stroke-width": "5", "letter-spacing": "0.14em"
    });
    los.textContent = "LOS";
    svg.appendChild(los);
    defenseLayer = el("g", { class: "half-defense-routes" });
    blockLayer = el("g", { class: "half-block-routes" });
    hipLayer = el("g", { class: "half-hip-marks" });
    lanePath = el("path", { fill: "none", stroke: "#f6c344", "stroke-width": "3.2", "stroke-dasharray": "9 7", "stroke-linecap": "round", "marker-end": "url(#halfRunArrow)", "data-half-owner": "RUN", "pointer-events": "none" });
    laneLabel = el("text", { fill: "#f6c344", "font-size": "12", "font-weight": "900", "text-anchor": "middle", "paint-order": "stroke", stroke: "#071018", "stroke-width": "4", "pointer-events": "none" });
    svg.appendChild(lanePath);
    svg.appendChild(laneLabel);
    svg.appendChild(defenseLayer);
    svg.appendChild(blockLayer);
    svg.appendChild(hipLayer);
    DEFENSE.forEach(token);
    OFFENSE.forEach(token);
    ball = el("g", {});
    ball.appendChild(el("ellipse", { rx: "8", ry: "5.5", fill: "#f8fafc", stroke: "#3f2b1d", "stroke-width": "1.6" }));
    ball.appendChild(el("line", { x1: "-7", y1: "0", x2: "7", y2: "0", stroke: "#9f1239", "stroke-width": "2" }));
    svg.appendChild(ball);
    return svg;
  }
  function applyFocus() {
    const selected = state.selected;
    Object.keys(state.players).forEach((id) => state.players[id].g.classList.toggle("is-dimmed", Boolean(selected && id !== selected)));
    svg.querySelectorAll("[data-half-owner]").forEach((path) => {
      const same = path.getAttribute("data-half-owner") === selected;
      path.classList.toggle("is-dimmed", Boolean(selected && !same));
      path.classList.toggle("is-focused", Boolean(selected && same));
    });
  }
  function applyPoses() {
    let poses = posesAt(state.t);
    applyNudges(poses);
    reactToBall(poses);
    if (state.t >= 2) {
      const gAmt = state.t < 3 ? lerp(0.5, 1, clamp(state.t - 2, 0, 1)) : 1;
      const tAmt = gAmt;
      poses.G = mix(homes().G, hipOf(poses.DL, gHipKind()), gAmt);
      poses.T = mix(homes().T, hipOf(poses.FLEX, gHipKind()), tAmt);
    }
    poses.C = sampleCenterPath(state.t);
    if (state.t > 4) {
      const liveHip = hipOf(poses.LB, "inside");
      const u = clamp((state.t - 4) / 2, 0, 1);
      poses.C = mix(poses.C, liveHip, ease(u) * 0.85);
    }
    separate(poses);
    poses = easeShown(poses);
    const short = tokenLabels();
    Object.keys(poses).forEach((id) => {
      const player = state.players[id];
      player.g.setAttribute("transform", `translate(${poses[id].x},${poses[id].y})`);
      player.label.textContent = short[id];
      player.role.textContent = tokenCaption(id);
      player.selected.setAttribute("opacity", state.selected === id ? "1" : "0");
    });
    drawHips(poses);
    const center = poses.C, runner = poses.RUN, amount = clamp(state.t, 0, 1);
    const ballPos = state.t < 1
      ? mix({ x: center.x, y: center.y + 16 }, { x: runner.x + 12, y: runner.y - 4 }, ease(amount))
      : { x: runner.x + 12, y: runner.y - 4 };
    ball.setAttribute("transform", `translate(${ballPos.x},${ballPos.y})`);
    const shown = clamp(Math.round(state.t), 0, 6);
    beatEl.textContent = `${BEATS[shown].name} · ${shown + 1} OF 7`;
    cueEl.textContent = BEATS[shown].cue;
    slider.value = String(state.t);
    document.querySelectorAll("[data-half-dot]").forEach((dot) => dot.classList.toggle("is-on", Number(dot.getAttribute("data-half-dot")) === shown));
    applyFocus();
  }
  function updateJobs() {
    const h = homes(), a = assignments(), d = defenseTasks();
    document.getElementById("half-offense-jobs").innerHTML = OFFENSE.map((id) => `<button type="button" class="assignment-card role-${offenseRole(id).toLowerCase().replace(" ", "-")}" data-half-job="${id}"><span class="assignment-position">${h[id].label}</span><span class="assignment-role">${id === "RUN" ? "RUN THE LANE" : id === "LEAD" ? (state.decoy ? "DECOY WIDE" : "LEAD BLOCK") : id === "G" ? gHipLabel() : id === "C" ? "WRAP TO LB" : "BLOCK"}</span><span class="assignment-task">${a[id].task}</span></button>`).join("");
    document.getElementById("half-defense-jobs").innerHTML = DEFENSE.map((id) => `<button type="button" class="assignment-card defense-job" data-half-job="${id}"><span class="assignment-position">${h[id].label}</span><span class="assignment-role">LANE INTEGRITY</span><span class="assignment-task">${d[id]}</span></button>`).join("");
    document.querySelectorAll("[data-half-job]").forEach((card) => card.addEventListener("click", function () { selectPlayer(card.getAttribute("data-half-job")); }));
  }
  function selectPlayer(id) {
    state.selected = state.selected === id ? null : id;
    applyPoses();
    document.querySelectorAll("[data-half-job]").forEach((card) => card.classList.toggle("is-selected", card.getAttribute("data-half-job") === state.selected));
    const task = OFFENSE.includes(id) ? assignments()[id].task : defenseTasks()[id];
    if (state.selected) cueEl.textContent = `${homes()[id].label}: ${task}`;
  }
  function updateUi() {
    [["half-lane", state.lane], ["half-side", state.side], ["half-front", state.front]].forEach(([group, value]) => document.querySelectorAll(`[data-${group}]`).forEach((button) => { const active = button.getAttribute(`data-${group}`) === value; button.classList.toggle("is-active", active); button.setAttribute("aria-pressed", String(active)); }));
    document.querySelectorAll("[data-half-decoy]").forEach((button) => {
      const on = button.getAttribute("data-half-decoy") === "on";
      const active = on === state.decoy;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    const formation = state.front === "two-dl" ? "2 DL · 1 LB · 1 CB" : "1 DL · 2 LB · 1 CB";
    document.getElementById("half-call").innerHTML = `<strong>${laneName()} ${sideName()}</strong><span>${formation}${state.decoy ? " · DECOY WIDE" : ""}</span>`;
    document.getElementById("half-title").textContent = `${laneName()[0] + laneName().slice(1).toLowerCase()} ${sideName()[0] + sideName().slice(1).toLowerCase()} · ${frontName()}`;
    document.getElementById("half-badge").textContent = `${laneName()} · ${sideName()}`;
  }
  function renderChoice() {
    pause();
    state.t = 0;
    state.selected = null;
    state.nudge = { RUN: { x: 0, y: 0 }, LEAD: { x: 0, y: 0 } };
    state.shown = null;
    updateUi();
    drawLane();
    drawAssignments();
    drawDefensePaths();
    updateJobs();
    applyPoses();
  }
  function setT(value) { state.t = clamp(value, 0, 6); applyPoses(); }
  function pause() { state.playing = false; if (state.raf) cancelAnimationFrame(state.raf); if (playButton) playButton.textContent = "PLAY SLOW"; }
  function tick(now) { if (!state.playing) return; const remaining = 6 - state.startT, duration = state.speed * (remaining / 6), progress = duration <= 0 ? 1 : clamp((now - state.startedAt) / duration, 0, 1); setT(state.startT + remaining * progress); if (progress < 1 && state.playing) state.raf = requestAnimationFrame(tick); else { state.playing = false; setT(6); playButton.textContent = "PLAY AGAIN"; } }
  function play() { if (state.playing) { pause(); return; } if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setT(6); return; } if (state.t >= 5.99) setT(0); state.playing = true; state.startT = state.t; state.startedAt = performance.now(); playButton.textContent = "PAUSE"; state.raf = requestAnimationFrame(tick); }
  function setBeat(value) { pause(); setT(clamp(value, 0, 6)); }
  function bindChoice(selector, key) { document.querySelectorAll(selector).forEach((button) => button.addEventListener("click", function () { state[key] = button.getAttribute(selector.slice(1, -1)); if (key === "lane") state.decoy = state.lane === "inside"; renderChoice(); })); }

  document.addEventListener("DOMContentLoaded", function () {
    const root = document.getElementById("half-drill-root");
    cueEl = document.getElementById("half-cue");
    beatEl = document.getElementById("half-beat");
    slider = document.getElementById("half-slider");
    playButton = document.getElementById("half-play");
    if (!root || !cueEl || !beatEl || !slider || !playButton) return;
    root.innerHTML = "";
    root.appendChild(buildField());
    bindChoice("[data-half-lane]", "lane");
    bindChoice("[data-half-side]", "side");
    bindChoice("[data-half-front]", "front");
    document.querySelectorAll("[data-half-decoy]").forEach((button) => button.addEventListener("click", function () { state.decoy = button.getAttribute("data-half-decoy") === "on"; renderChoice(); }));
    playButton.addEventListener("click", play);
    document.getElementById("half-back").addEventListener("click", function () { setBeat(Math.round(state.t) - 1); });
    document.getElementById("half-next").addEventListener("click", function () { setBeat(Math.round(state.t) + 1); });
    document.getElementById("half-reset").addEventListener("click", function () { pause(); state.selected = null; state.nudge = { RUN: { x: 0, y: 0 }, LEAD: { x: 0, y: 0 } }; state.shown = null; setT(0); document.querySelectorAll("[data-half-job]").forEach((card) => card.classList.remove("is-selected")); });
    slider.addEventListener("input", function () { pause(); setT(Number(slider.value)); });
    document.querySelectorAll("[data-half-speed]").forEach((button) => button.addEventListener("click", function () {
      const speeds = { slow: 10500, normal: 6800, fast: 4200 };
      state.speed = speeds[button.getAttribute("data-half-speed")] || 10500;
      document.querySelectorAll("[data-half-speed]").forEach((item) => { const active = item === button; item.classList.toggle("is-active", active); item.setAttribute("aria-pressed", String(active)); });
    }));
    renderChoice();
  });
})();
