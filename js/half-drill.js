/** Lions single drill: 5-player half offense vs 4-player half defense. */
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const W = 1000, H = 820, LOS = 360, HIP = 16;
  const BEATS = [
    { name: "LINE UP", cue: "Tap your position to see your job. Then press PLAY SLOW." },
    { name: "DIRECT SNAP", cue: "Center snaps to Runner. Defense reads the ball without crossing early." },
    { name: "ANGLE STEP", cue: "Center takes one clean angle to the Linebacker's starting landmark. No chasing." },
    { name: "FIT", cue: "Head out. Open hands inside the legal torso. Square feet." },
    { name: "CONTROLLED PUSH", cue: "Center and blockers take short controlled steps and move defenders off the lane." },
    { name: "SEPARATE / SHED", cue: "Defense anchors, presses free, finds the ball, and steps toward the lane." },
    { name: "FINISH", cue: "Runner goes north. Defense pursues inside-out; Corner keeps contain." }
  ];
  const state = {
    lane: "inside", side: "right", front: "two-dl", view: "offense", t: 0, playing: false, speed: 10500,
    startT: 0, startedAt: 0, raf: 0, selected: null, players: {}, shown: null
  };
  const OFFENSE = ["C", "G", "T", "RUN", "LEAD"];
  const DEFENSE = ["DL", "LB", "CB", "FLEX"];
  let svg, ball, lanePath, laneLabel, blockLayer, defenseLayer, hipLayer, cueEl, beatEl, slider, playButton, spotlightEl, modeButton;

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
  function hipOf(def, kind) { return { x: def.x + hipDx(kind), y: def.y + 4 }; }
  function visualFit(blocker, defender, kind) {
    const target = hipOf(defender, kind);
    const dx = blocker.x - target.x, dy = blocker.y - target.y, dist = Math.hypot(dx, dy) || 1;
    const tokenContact = 62;
    return { x: target.x + dx / dist * tokenContact, y: target.y + dy / dist * tokenContact };
  }
  function labels() {
    return {
      C: "CENTER", G: "GUARD", T: "TACKLE", RUN: "RUNNER", LEAD: "LEAD RB",
      DL: "D-LINE", LB: state.front === "two-dl" ? "LINEBACKER" : "LB-IN", CB: "CORNER",
      FLEX: state.front === "two-dl" ? "EDGE / DL" : "LB-OUT"
    };
  }
  function tokenLabels() {
    return { C: "C", G: "G", T: "T", RUN: "RUN", LEAD: "LEAD", DL: "DL", LB: "LB", CB: "CB", FLEX: state.front === "two-dl" ? "EDGE" : "LB2" };
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
    const gHip = visualFit(h.G, h.DL, gHipKind());
    return state.front === "two-dl"
      ? {
          C: { target: "LB", point: visualFit(h.C, h.LB, "inside"), task: "Snap. Take one clean angle to LINEBACKER. Head out. Open hands inside. Short controlled steps." },
          G: { target: "DL", point: gHip, task: `${gHipLabel()} of D-LINE. Head out. Open hands inside. Controlled feet.` },
          T: { target: "FLEX", point: visualFit(h.T, h.FLEX, gHipKind()), task: `${gHipLabel()} of EDGE. Keep your feet under you.` },
          LEAD: { target: "LANE", point: { x: laneX(), y: LOS - 55 }, task: `${laneName()} lane first. Guide the Runner through. Stay off the Corner.` },
          RUN: { target: "LANE", point: { x: laneX(), y: LOS }, task: `Secure the snap. ${laneName()} ${sideName()}. Follow. Plant. Go north.` }
        }
      : {
          C: { target: "LB", point: visualFit(h.C, h.LB, "inside"), task: "Snap. Take one clean angle to LB-IN. Head out. Open hands inside. Short controlled steps." },
          G: { target: "DL", point: gHip, task: `${gHipLabel()} of D-LINE. Head out. Open hands inside. Controlled feet.` },
          T: { target: "DL", point: visualFit(h.T, h.DL, "outside"), task: "Help Guard on the outside half of D-LINE. Stay square." },
          LEAD: { target: "FLEX", point: visualFit(h.LEAD, h.FLEX, "inside"), task: `${laneName()} lane first. Fit the outside LINEBACKER under control.` },
          RUN: { target: "LANE", point: { x: laneX(), y: LOS }, task: `Secure the snap. ${laneName()} ${sideName()}. Follow. Plant. Go north.` }
        };
  }
  function defenseTasks() {
    return state.front === "two-dl"
      ? {
          DL: `Anchor inside · separate from Guard · shed toward ${laneName()} lane`,
          FLEX: `Set the edge · outside arm free · squeeze without losing contain`,
          LB: `Anchor against Center · press free · protect the lane · pursue the flag`,
          CB: `Unblocked contain · nothing outside · force Runner back to pursuit`
        }
      : {
          DL: `Anchor inside · separate from Guard · shed toward ${laneName()} lane`,
          LB: `Anchor against Center · press free · protect inside lane · pursue the flag`,
          FLEX: `Stay square outside · fit the lead · protect the selected lane`,
          CB: `Unblocked contain · nothing outside · force Runner back to pursuit`
        };
  }
  function offenseRole(id) {
    if (id === "RUN") return "BALL";
    if (id === "LEAD") return state.front === "two-dl" ? "LANE" : "LEAD";
    if (id === "G") return gHipLabel();
    if (id === "C") return "BLOCK LB";
    return "BLOCK";
  }
  function tokenCaption(id) {
    if (id === "RUN") return "BALL";
    if (id === "LEAD") return "LEAD";
    return "";
  }

  function basePoses() { const h = homes(), out = {}; Object.keys(h).forEach((id) => { out[id] = { x: h[id].x, y: h[id].y }; }); return out; }

  /** Fixed teaching landmarks: the Center never retargets to a moving defender. */
  function centerLandmarks() {
    const h = homes();
    const fit = assignments().C.point;
    const awayFromLane = h.LB.x >= laneX() ? 1 : -1;
    const pushedLb = { x: h.LB.x + awayFromLane * 46, y: h.LB.y };
    const pushedFit = visualFit(h.C, pushedLb, "inside");
    return {
      h,
      fit,
      pushedLb,
      pushedFit,
      angle: mix(h.C, fit, .46),
      shed: { x: lerp(pushedLb.x, laneX(), .34), y: pushedLb.y + 42 },
      pursue: { x: laneX() + (state.side === "right" ? -24 : 24), y: 275 }
    };
  }
  function centerWaypoints() {
    const m = centerLandmarks();
    return [m.h.C, { x: m.h.C.x, y: m.h.C.y + 12 }, m.angle, m.fit, m.pushedFit, m.pushedFit, m.pushedFit];
  }

  function runnerPose(beat) {
    const h = homes().RUN, x = laneX(), finishX = state.lane === "outside" ? x : lerp(x, 500, .12);
    return [h, { x: h.x, y: h.y - 6 }, { x: lerp(h.x, x, .22), y: 620 }, { x: lerp(h.x, x, .52), y: 500 }, { x, y: 380 }, { x, y: 270 }, { x: finishX, y: 64 }][beat];
  }
  function leadPose(beat) {
    const h = homes().LEAD, x = laneX(), target = assignments().LEAD.point;
    if (state.front === "two-lb") {
      return [h, { x: h.x, y: h.y - 6 }, mix(h, target, .3), mix(h, target, .62), target, target, target][beat];
    }
    return [h, { x: h.x, y: h.y - 6 }, { x: lerp(h.x, x, .3), y: 560 }, { x: lerp(h.x, x, .68), y: 460 }, { x, y: 300 }, { x, y: 190 }, { x, y: 105 }][beat];
  }
  function poseAtBeat(beat) {
    const h = homes(), out = basePoses();
    out.RUN = runnerPose(beat);
    out.LEAD = leadPose(beat);
    const x = laneX();
    const center = centerLandmarks();
    out.LB = beat <= 3 ? h.LB : beat === 4 ? center.pushedLb : beat === 5 ? center.shed : center.pursue;
    const flexTarget = state.front === "two-dl"
      ? { x: h.FLEX.x - playOut() * 32, y: h.FLEX.y + 36 }
      : { x: x + playOut() * 38, y: 272 };
    const dlTarget = { x: lerp(h.DL.x, x, .42), y: h.DL.y + 34 };
    const cbTarget = { x: state.lane === "outside" ? x + playOut() * 62 : h.CB.x - playOut() * 38, y: 294 };
    if (beat >= 5) {
      out.FLEX = mix(h.FLEX, flexTarget, beat === 5 ? .55 : 1);
      out.DL = mix(h.DL, dlTarget, beat === 5 ? .5 : 1);
      out.CB = mix(h.CB, cbTarget, beat === 5 ? .5 : 1);
    }
    const gHipNow = visualFit(h.G, h.DL, gHipKind());
    const tTarget = state.front === "two-dl" ? h.FLEX : h.DL;
    const tHipNow = visualFit(h.T, tTarget, state.front === "two-dl" ? gHipKind() : "outside");
    const gAmt = beat < 2 ? 0 : beat === 2 ? .5 : 1;
    const tAmt = beat < 2 ? 0 : beat === 2 ? .45 : 1;
    const shedAway = state.lane === "inside" ? playOut() : -playOut();
    out.G = beat <= 4 ? mix(h.G, gHipNow, gAmt) : { x: gHipNow.x + shedAway * (beat === 5 ? 45 : 90), y: gHipNow.y + (beat === 5 ? 28 : 50) };
    out.T = beat <= 4 ? mix(h.T, tHipNow, tAmt) : { x: tHipNow.x + shedAway * (beat === 5 ? 45 : 90), y: tHipNow.y + (beat === 5 ? 28 : 50) };
    out.C = centerWaypoints()[beat];
    return out;
  }
  function posesAt(value) {
    const lo = Math.floor(value), hi = Math.min(6, lo + 1), u = ease(value - lo), a = poseAtBeat(lo), b = poseAtBeat(hi), out = {};
    Object.keys(a).forEach((id) => { out[id] = mix(a[id], b[id], u); });
    return out;
  }

  function drawLane() {
    const x = laneX(), start = homes().RUN;
    lanePath.setAttribute("d", `M ${start.x},${start.y} C ${start.x},650 ${x},540 ${x},${LOS} L ${x},70`);
    lanePath.setAttribute("stroke", state.lane === "inside" ? "#f6c344" : "#fb923c");
    const outsideEdge = state.lane === "outside";
    laneLabel.setAttribute("x", String(x + (outsideEdge ? (state.side === "right" ? -18 : 18) : 0)));
    laneLabel.setAttribute("y", "68");
    laneLabel.setAttribute("text-anchor", outsideEdge ? (state.side === "right" ? "end" : "start") : "middle");
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
    ["C", "G", "T"].forEach((id) => {
      const s = shortArrow({ x: h[id].x, y: h[id].y }, a[id].point);
      const path = el("path", {
        d: `M ${s.x1},${s.y1} L ${s.x2},${s.y2}`, fill: "none",
        stroke: "#67e8f9", "stroke-width": "6", "stroke-linecap": "round",
        "marker-end": "url(#halfBlockArrow)", "data-half-owner": id, "pointer-events": "none"
      });
      blockLayer.appendChild(path);
    });
    const leadArrow = shortArrow(h.LEAD, a.LEAD.point);
    const leadPath = el("path", {
      d: `M ${leadArrow.x1},${leadArrow.y1} L ${leadArrow.x2},${leadArrow.y2}`,
      fill: "none", stroke: "#fff", "stroke-width": "7",
      "stroke-linecap": "round",
      "marker-end": "url(#halfLeadArrow)", "data-half-owner": "LEAD", "pointer-events": "none"
    });
    blockLayer.appendChild(leadPath);
  }
  function defenseLandmark(id) {
    const h = homes(), x = laneX();
    if (id === "LB") return centerLandmarks().pursue;
    if (id === "DL") return { x: lerp(h.DL.x, x, .42), y: h.DL.y + 34 };
    if (id === "FLEX") return state.front === "two-dl"
      ? { x: h.FLEX.x - playOut() * 32, y: h.FLEX.y + 36 }
      : { x: x + playOut() * 38, y: 272 };
    return { x: state.lane === "outside" ? x + playOut() * 62 : h.CB.x - playOut() * 38, y: 294 };
  }
  function drawDefensePaths() {
    defenseLayer.innerHTML = "";
    const h = homes();
    DEFENSE.forEach((id) => {
      const arrow = shortArrow(h[id], defenseLandmark(id));
      defenseLayer.appendChild(el("path", {
        d: `M ${arrow.x1},${arrow.y1} L ${arrow.x2},${arrow.y2}`,
        fill: "none", stroke: "#f87171", "stroke-width": "5.5", "stroke-linecap": "round",
        "marker-end": "url(#halfDefenseArrow)", opacity: ".86", "data-half-owner": id, "pointer-events": "none"
      }));
    });
  }
  function drawHips(poses) {
    hipLayer.innerHTML = "";
    if (state.t < 2 || state.t > 5) return;
    const marks = state.front === "two-dl"
      ? [["G", "DL", gHipKind()], ["T", "FLEX", gHipKind()], ["C", "LB", "inside"]]
      : [["G", "DL", gHipKind()], ["T", "DL", "outside"], ["C", "LB", "inside"], ["LEAD", "FLEX", "inside"]];
    marks.forEach(([ol, defId, kind]) => {
      const hip = hipOf(poses[defId], kind);
      const dir = hipDx(kind) >= 0 ? 1 : -1;
      const chev = el("path", {
        d: `M ${hip.x - dir * 3},${hip.y - 9} L ${hip.x + dir * 11},${hip.y} L ${hip.x - dir * 3},${hip.y + 9} L ${hip.x - dir * 1},${hip.y} Z`,
        fill: "#f6c344", stroke: "#071018", "stroke-width": "2", "data-half-owner": ol, class: "half-hip-chevron"
      });
      hipLayer.appendChild(chev);
      const lab = el("text", {
        x: String(hip.x + dir * 14), y: String(hip.y - 12),
        fill: "#f6c344", "font-size": "18", "font-weight": "900",
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
    const g = el("g", { class: "sim-player", "data-half-player": id, tabindex: "0", role: "button", "aria-label": labels()[id] });
    const hit = el("circle", { r: "50", fill: "transparent" });
    let selected;
    let body;
    if (offense) {
      const r = 34;
      selected = el("circle", { r: "43", fill: "none", stroke: "#fff", "stroke-width": "5", opacity: "0" });
      body = el("circle", {
        r: String(r), fill: "#0a1a32", stroke: "#f6c344", "stroke-width": "5", filter: "url(#halfTokenShadow)"
      });
    } else {
      selected = el("circle", { r: "41", fill: "none", stroke: "#fff", "stroke-width": "5", opacity: "0" });
      body = el("circle", { r: "32", fill: "#9b1c1c", stroke: "#fecaca", "stroke-width": "5", filter: "url(#halfTokenShadow)" });
    }
    const letterSize = id === "LEAD" || id === "FLEX" ? "22" : id === "RUN" ? "26" : "30";
    const label = el("text", {
      x: "0", y: "7", fill: "#fff", "font-size": letterSize, "font-weight": "900",
      "text-anchor": "middle", "pointer-events": "none", "letter-spacing": "0.02em"
    });
    const role = el("text", {
      x: "0", y: "61", fill: offense ? "#f6c344" : "#fecaca", "font-size": "24", "font-weight": "900",
      "text-anchor": "middle", "paint-order": "stroke", stroke: "#071018", "stroke-width": "3",
      "pointer-events": "none"
    });
    g.appendChild(hit); g.appendChild(selected); g.appendChild(body); g.appendChild(label); g.appendChild(role);
    const choose = function () { selectPlayer(id); };
    g.addEventListener("click", choose);
    g.addEventListener("keydown", function (event) { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(); } });
    svg.appendChild(g); state.players[id] = { g, selected, label, role };
  }
  function updateViewBox() {
    if (!svg) return;
    const phone = window.matchMedia && window.matchMedia("(max-width: 700px)").matches;
    const losLabel = svg.querySelector(".half-los-label");
    if (phone) {
      svg.setAttribute("viewBox", state.side === "right" ? "200 20 780 780" : "20 20 780 780");
      if (losLabel) losLabel.setAttribute("x", state.side === "right" ? "216" : "36");
    } else {
      svg.setAttribute("viewBox", state.side === "right" ? "80 20 900 780" : "20 20 900 780");
      if (losLabel) losLabel.setAttribute("x", state.side === "right" ? "96" : "36");
    }
  }
  function buildField() {
    svg = el("svg", { viewBox: `0 0 ${W} ${H}`, class: "sim-svg full-team-svg half-team-svg", role: "img", "aria-label": "Five-player half offense versus four-player half defense animated drill" });
    const defs = el("defs", {});
    defs.innerHTML = [
      '<marker id="halfRunArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#f6c344"/></marker>',
      '<marker id="halfLeadArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#fff"/></marker>',
      '<marker id="halfDecoyArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#c084fc"/></marker>',
      '<marker id="halfBlockArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#67e8f9"/></marker>',
      '<marker id="halfDefenseArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#f87171"/></marker>',
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
      class: "half-los-label",
      x: "44", y: String(LOS + 30), fill: "#f6c344", "font-size": "22", "font-weight": "900",
      "paint-order": "stroke", stroke: "#0d3b24", "stroke-width": "5", "letter-spacing": "0.14em"
    });
    los.textContent = "LOS";
    svg.appendChild(los);
    defenseLayer = el("g", { class: "half-defense-routes" });
    blockLayer = el("g", { class: "half-block-routes" });
    hipLayer = el("g", { class: "half-hip-marks" });
    lanePath = el("path", { class: "half-run-lane", fill: "none", stroke: "#f6c344", "stroke-width": "9", "stroke-linecap": "round", "marker-end": "url(#halfRunArrow)", "data-half-owner": "RUN", "pointer-events": "none" });
    laneLabel = el("text", { fill: "#f6c344", "font-size": "26", "font-weight": "900", "text-anchor": "middle", "paint-order": "stroke", stroke: "#071018", "stroke-width": "7", "pointer-events": "none" });
    svg.appendChild(lanePath);
    svg.appendChild(laneLabel);
    svg.appendChild(defenseLayer);
    svg.appendChild(blockLayer);
    svg.appendChild(hipLayer);
    DEFENSE.forEach(token);
    OFFENSE.forEach(token);
    ball = el("g", {});
    ball.appendChild(el("ellipse", { rx: "15", ry: "10", fill: "#f8fafc", stroke: "#3f2b1d", "stroke-width": "3" }));
    ball.appendChild(el("line", { x1: "-10", y1: "0", x2: "10", y2: "0", stroke: "#9f1239", "stroke-width": "3" }));
    svg.appendChild(ball);
    updateViewBox();
    return svg;
  }
  function applyFocus() {
    const selected = state.selected;
    let target = null;
    if (selected && OFFENSE.includes(selected)) target = assignments()[selected].target;
    const focusIds = new Set([selected, target].filter((id) => state.players[id]));
    Object.keys(state.players).forEach((id) => state.players[id].g.classList.toggle("is-dimmed", Boolean(selected && !focusIds.has(id))));
    svg.querySelectorAll("[data-half-owner]").forEach((path) => {
      const same = path.getAttribute("data-half-owner") === selected;
      path.classList.toggle("is-dimmed", Boolean(selected && !same));
      path.classList.toggle("is-focused", Boolean(selected && same));
    });
  }
  function applyPoses() {
    const poses = posesAt(state.t);
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
  function drillPlayerName(id) {
    if (!window.LineupManager) return "";
    if (id === "C") {
      const p = window.LineupManager.getPlayerForPos("c");
      return p ? `#${p.number} ${p.name}` : "";
    }
    if (id === "G") {
      const p = window.LineupManager.getPlayerForPos(state.side === "left" ? "lg" : "rg");
      return p ? `#${p.number} ${p.name}` : "";
    }
    if (id === "T") {
      const p = window.LineupManager.getPlayerForPos(state.side === "left" ? "lt" : "rt");
      return p ? `#${p.number} ${p.name}` : "";
    }
    if (id === "RUN") {
      const p = window.LineupManager.getPlayerForPos("rb-ball");
      return p ? `#${p.number} ${p.name}` : "";
    }
    if (id === "LEAD") {
      const p = window.LineupManager.getPlayerForPos("rb-lead");
      return p ? `#${p.number} ${p.name}` : "";
    }
    return "";
  }

  function updateJobs() {
    const h = homes(), a = assignments(), d = defenseTasks();
    document.getElementById("half-offense-jobs").innerHTML = OFFENSE.map((id) => {
      const role = id === "RUN" ? "RUN THE LANE"
        : id === "LEAD" ? (state.front === "two-dl" ? "GUIDE THE LANE" : "BLOCK OUTSIDE LB")
          : id === "C" ? "BLOCK LINEBACKER"
            : id === "T" && state.front === "two-lb" ? "HELP ON D-LINE"
              : id === "G" ? gHipLabel() : "BLOCK";
      const pName = drillPlayerName(id);
      const displayTitle = pName ? `${pName} · ${h[id].label}` : h[id].label;
      return `<button type="button" class="assignment-card role-${offenseRole(id).toLowerCase().replace(" ", "-")}" data-half-job="${id}"><span class="assignment-position">${displayTitle}</span><span class="assignment-role">${role}</span><span class="assignment-task">${a[id].task}</span></button>`;
    }).join("");
    document.getElementById("half-defense-jobs").innerHTML = DEFENSE.map((id) => `<button type="button" class="assignment-card defense-job" data-half-job="${id}"><span class="assignment-position">${h[id].label}</span><span class="assignment-role">LANE INTEGRITY</span><span class="assignment-task">${d[id]}</span></button>`).join("");
    document.querySelectorAll("[data-half-job]").forEach((card) => card.addEventListener("click", function () { selectPlayer(card.getAttribute("data-half-job")); }));
  }
  function selectPlayer(id) {
    state.selected = state.selected === id ? null : id;
    applyPoses();
    document.querySelectorAll("[data-half-job]").forEach((card) => card.classList.toggle("is-selected", card.getAttribute("data-half-job") === state.selected));
    if (!state.selected) {
      spotlightEl.classList.add("is-empty");
      spotlightEl.innerHTML = "<strong>TAP A PLAYER</strong><span>See that player's starting spot, job, target, and path.</span>";
      return;
    }
    const pName = drillPlayerName(id);
    const displayTitle = pName ? `${pName} (${homes()[id].label})` : homes()[id].label;
    const task = OFFENSE.includes(id) ? assignments()[id].task : defenseTasks()[id];
    cueEl.textContent = `${displayTitle}: ${task}`;
    spotlightEl.classList.remove("is-empty");
    spotlightEl.innerHTML = `<strong>${displayTitle}</strong><span>LINE UP HERE → ${task}</span>`;
  }
  function updateUi() {
    [["half-lane", state.lane], ["half-side", state.side], ["half-front", state.front]].forEach(([group, value]) => document.querySelectorAll(`[data-${group}]`).forEach((button) => { const active = button.getAttribute(`data-${group}`) === value; button.classList.toggle("is-active", active); button.setAttribute("aria-pressed", String(active)); }));
    const formation = state.front === "two-dl" ? "2 DL · 1 LB · 1 CB" : "1 DL · 2 LB · 1 CB";
    document.getElementById("half-call").innerHTML = `<strong>${laneName()} ${sideName()}</strong><span>${formation}</span>`;
    document.getElementById("half-title").textContent = `${laneName()[0] + laneName().slice(1).toLowerCase()} ${sideName()[0] + sideName().slice(1).toLowerCase()} · ${frontName()}`;
    document.getElementById("half-badge").textContent = `${laneName()} · ${sideName()}`;
    updateViewBox();
  }
  function applyTeachingView() {
    document.body.classList.toggle("view-offense", state.view === "offense");
    document.body.classList.toggle("view-defense", state.view === "defense");
    document.querySelectorAll("[data-half-view]").forEach((button) => {
      const active = button.getAttribute("data-half-view") === state.view;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }
  function renderChoice() {
    pause();
    state.t = 0;
    state.selected = null;
    state.shown = null;
    spotlightEl.classList.add("is-empty");
    spotlightEl.innerHTML = "<strong>TAP A PLAYER</strong><span>See that player's starting spot, job, target, and path.</span>";
    updateUi();
    drawLane();
    drawAssignments();
    drawDefensePaths();
    updateJobs();
    applyTeachingView();
    applyPoses();
  }
  function setT(value) { state.t = clamp(value, 0, 6); applyPoses(); }
  function pause() { state.playing = false; if (state.raf) cancelAnimationFrame(state.raf); if (playButton) playButton.textContent = "PLAY SLOW"; }
  function tick(now) { if (!state.playing) return; const remaining = 6 - state.startT, duration = state.speed * (remaining / 6), progress = duration <= 0 ? 1 : clamp((now - state.startedAt) / duration, 0, 1); setT(state.startT + remaining * progress); if (progress < 1 && state.playing) state.raf = requestAnimationFrame(tick); else { state.playing = false; setT(6); playButton.textContent = "PLAY AGAIN"; } }
  function play() { if (state.playing) { pause(); return; } if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setT(6); return; } if (state.t >= 5.99) setT(0); state.playing = true; state.startT = state.t; state.startedAt = performance.now(); playButton.textContent = "PAUSE"; state.raf = requestAnimationFrame(tick); }
  function setBeat(value) { pause(); state.shown = null; setT(clamp(value, 0, 6)); }
  function bindChoice(selector, key) { document.querySelectorAll(selector).forEach((button) => button.addEventListener("click", function () { state[key] = button.getAttribute(selector.slice(1, -1)); renderChoice(); })); }

  document.addEventListener("DOMContentLoaded", function () {
    const root = document.getElementById("half-drill-root");
    cueEl = document.getElementById("half-cue");
    beatEl = document.getElementById("half-beat");
    slider = document.getElementById("half-slider");
    playButton = document.getElementById("half-play");
    spotlightEl = document.getElementById("half-spotlight");
    modeButton = document.getElementById("half-mode");
    if (!root || !cueEl || !beatEl || !slider || !playButton || !spotlightEl || !modeButton) return;
    root.innerHTML = "";
    root.appendChild(buildField());
    bindChoice("[data-half-lane]", "lane");
    bindChoice("[data-half-side]", "side");
    bindChoice("[data-half-front]", "front");
    document.querySelectorAll("[data-half-view]").forEach((button) => button.addEventListener("click", function () {
      state.view = button.getAttribute("data-half-view");
      applyTeachingView();
      cueEl.textContent = state.view === "offense"
        ? "OFFENSE: Point to the block, take one clean angle, and run the called lane."
        : "DEFENSE: Anchor. Press. Separate. Find the ball. Pursue the flag.";
    }));
    modeButton.addEventListener("click", function () {
      const kidView = document.body.classList.toggle("kid-demo-mode");
      modeButton.setAttribute("aria-pressed", String(kidView));
      modeButton.textContent = kidView ? "CHANGE SETUP" : "SHOW KID VIEW";
      updateViewBox();
    });
    playButton.addEventListener("click", play);
    document.getElementById("half-back").addEventListener("click", function () { setBeat(Math.round(state.t) - 1); });
    document.getElementById("half-next").addEventListener("click", function () { setBeat(Math.round(state.t) + 1); });
    document.getElementById("half-reset").addEventListener("click", function () { pause(); state.selected = null; state.shown = null; spotlightEl.classList.add("is-empty"); spotlightEl.innerHTML = "<strong>TAP A PLAYER</strong><span>See that player's starting spot, job, target, and path.</span>"; setT(0); document.querySelectorAll("[data-half-job]").forEach((card) => card.classList.remove("is-selected")); });
    slider.addEventListener("input", function () { pause(); state.shown = null; setT(Number(slider.value)); });
    document.querySelectorAll("[data-half-speed]").forEach((button) => button.addEventListener("click", function () {
      const speeds = { slow: 10500, normal: 6800, fast: 4200 };
      state.speed = speeds[button.getAttribute("data-half-speed")] || 10500;
      document.querySelectorAll("[data-half-speed]").forEach((item) => { const active = item === button; item.classList.toggle("is-active", active); item.setAttribute("aria-pressed", String(active)); });
    }));
    window.addEventListener("resize", updateViewBox);
    window.addEventListener("lineup:changed", function () {
      renderChoice();
    });
    renderChoice();
  });
})();
