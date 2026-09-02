/**
 * Seahawks slow-motion teacher — data-driven from js/plays-data.js.
 * Recreates the 14 coach-sheet diagrams. No QB-wing keeper model.
 */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var W = 1000;
  var H = 900;
  var LOS = 400;
  var BEATS = [
    { name: "LINE UP", cue: "Find your circle. Two-point stance. Eyes up." },
    { name: "SNAP", cue: "Center snaps. Ball goes to the Gold RB. See it. Catch it. Tuck it." },
    { name: "FIRST STEP", cue: "First step on your arrow. Head out. Hands inside." },
    { name: "FIT", cue: "Arrive under control. Open hands inside. No holding." },
    { name: "LANE", cue: "Lane is there. Blockers are set. Hit it." },
    { name: "CUT", cue: "Plant. One cut. Safety is the last flag." },
    { name: "FINISH", cue: "North. Flag only — no tackling, no blocks in the back." }
  ];

  var state = { runKey: "play-01", t: 0, playing: false, speed: 11000, startedAt: 0, startT: 0, raf: 0, selected: null, players: {} };
  var svg, ball, routeLayer, blockLayer, iconLayer, cueEl, beatEl, beatsEl, slider, playButton, photoEl;

  function isCustomTeam() {
    if (!window.TeamManager) return false;
    var teamId = window.TeamManager.getActiveTeamId();
    return teamId !== "seahawks-youth-flag" && teamId !== "lions-k1-flag";
  }

  function plays() {
    if (isCustomTeam() && window.CustomPlaybook) {
      return window.CustomPlaybook.getTeamPlays();
    }
    return window.SEAHAWKS_PLAYS || window.COACH_PLAYS || window.LIONS_PLAYS || [];
  }

  function playMap() {
    var list = plays();
    var map = {};
    list.forEach(function (p) { map[p.id] = p; });
    return map;
  }

  function currentPlay() {
    var pList = plays();
    var seed = window.SEAHAWKS_PLAYS || window.COACH_PLAYS || window.LIONS_PLAYS || [];
    return playMap()[state.runKey] || pList[0] || seed[0];
  }
  function el(name, attrs) {
    var node = document.createElementNS(NS, name);
    Object.keys(attrs || {}).forEach(function (key) { node.setAttribute(key, attrs[key]); });
    return node;
  }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t * t * (3 - 2 * t); }
  function mixPoint(a, b, t) { return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) }; }
  function darkFill(color) {
    if (!color) return false;
    var c = color.replace("#", "");
    if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
    var r = parseInt(c.slice(0, 2), 16), g = parseInt(c.slice(2, 4), 16), b = parseInt(c.slice(4, 6), 16);
    return (r * 0.299 + g * 0.587 + b * 0.114) < 150;
  }

  function findOff(play, id) {
    for (var i = 0; i < play.offense.length; i++) if (play.offense[i].id === id) return play.offense[i];
    return null;
  }
  function findDef(play, id) {
    for (var i = 0; i < play.defense.length; i++) if (play.defense[i].id === id) return play.defense[i];
    return null;
  }
  function routeFor(play, id) {
    var routes = play.routes || [];
    for (var i = 0; i < routes.length; i++) if (routes[i].from === id) return routes[i];
    return null;
  }
  function blockFor(play, id) {
    var blocks = play.blocks || [];
    for (var i = 0; i < blocks.length; i++) if (blocks[i].from === id) return blocks[i];
    return null;
  }

  function pathPoints(play, id) {
    var p = findOff(play, id);
    if (!p) {
      var d = findDef(play, id);
      if (!d) return [{ x: 0, y: 0 }];
      if (d.slide && d.slide.length) return d.slide.slice();
      return [{ x: d.x, y: d.y }];
    }
    var route = routeFor(play, id);
    if (route && route.points && route.points.length) {
      var pts = route.points.slice();
      if (pts[0].x !== p.x || pts[0].y !== p.y) pts.unshift({ x: p.x, y: p.y });
      return pts;
    }
    var block = blockFor(play, id);
    if (block) {
      var defn = findDef(play, block.toDefenderId);
      if (defn) {
        var dx = defn.x - p.x, dy = defn.y - p.y, dist = Math.hypot(dx, dy) || 1;
        return [{ x: p.x, y: p.y }, { x: defn.x - dx / dist * 30, y: defn.y - dy / dist * 30 }];
      }
    }
    return [{ x: p.x, y: p.y }];
  }

  function samplePath(points, u) {
    if (!points || !points.length) return { x: 0, y: 0 };
    if (points.length === 1 || u <= 0) return { x: points[0].x, y: points[0].y };
    if (u >= 1) return { x: points[points.length - 1].x, y: points[points.length - 1].y };
    var segs = [];
    var total = 0;
    for (var i = 0; i < points.length - 1; i++) {
      var len = Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y) || 0.001;
      segs.push(len);
      total += len;
    }
    var target = u * total, acc = 0;
    for (var j = 0; j < segs.length; j++) {
      if (acc + segs[j] >= target) {
        var t = (target - acc) / segs[j];
        return mixPoint(points[j], points[j + 1], t);
      }
      acc += segs[j];
    }
    return { x: points[points.length - 1].x, y: points[points.length - 1].y };
  }

  function pathPrefixToPoint(points, target) {
    if (!points || !points.length) return [];
    if (points.length === 1 || !target) return points.slice(0, 1);
    var best = { distance: Infinity, segment: 0, point: points[0] };
    for (var i = 0; i < points.length - 1; i++) {
      var a = points[i], b = points[i + 1];
      var dx = b.x - a.x, dy = b.y - a.y;
      var len2 = dx * dx + dy * dy || 1;
      var amount = clamp(((target.x - a.x) * dx + (target.y - a.y) * dy) / len2, 0, 1);
      var projected = { x: a.x + dx * amount, y: a.y + dy * amount };
      var distance = Math.hypot(projected.x - target.x, projected.y - target.y);
      if (distance < best.distance) best = { distance: distance, segment: i, point: projected };
    }
    var prefix = points.slice(0, best.segment + 1);
    prefix.push(best.point);
    return prefix;
  }

  function possessionBeat(play) {
    var carrier = play && play.ball ? findOff(play, play.ball.carrierId) : null;
    return carrier && carrier.role === "CATCH" ? 3 : 1;
  }

  function carrierMotionAmount(play, beat) {
    var start = possessionBeat(play);
    if (beat <= start) return 0;
    return ease(clamp((beat - start) / Math.max(1, 6 - start), 0, 1));
  }

  function isCarrier(play, id) {
    return Boolean(play && play.ball && play.ball.carrierId === id);
  }

  function motionAmount(kind, beat) {
    beat = Number(beat);
    if (kind === "lead") {
      if (beat <= 0) return 0;
      if (beat === 1) return 0.06;
      if (beat === 2) return 0.24;
      if (beat === 3) return 0.52;
      if (beat === 4) return 0.78;
      return 1;
    }
    if (kind === "block") {
      if (beat <= 0) return 0;
      if (beat === 1) return 0.1;
      if (beat === 2) return 0.48;
      if (beat === 3) return 0.86;
      return 1;
    }
    if (kind === "ball") {
      if (beat <= 0) return 0;
      if (beat === 1) return 0.12;
      if (beat === 2) return 0.22;
      if (beat === 3) return 0.28;
      if (beat === 4) return 0.52;
      if (beat === 5) return 0.82;
      return 1;
    }
    if (kind === "fake") {
      if (beat <= 0) return 0;
      if (beat === 1) return 0.04;
      if (beat === 2) return 0.2;
      if (beat === 3) return 0.52;
      if (beat === 4) return 0.82;
      return 1;
    }
    if (kind === "slide") {
      if (beat < 4) return 0;
      return clamp((beat - 3) / 3, 0, 1);
    }
    return clamp(beat / 6, 0, 1);
  }

  function kindFor(play, id) {
    if (findDef(play, id) && findDef(play, id).slide) return "slide";
    if (isCarrier(play, id)) return "ball";
    var p = findOff(play, id);
    if (p && (p.role === "PASS" || p.role === "PITCH")) return "passer";
    if (p && p.role === "FAKE") return "fake";
    if (p && p.role === "LEAD") return p.pace === "block" ? "block" : "lead";
    if (p && (p.role === "BLOCK" || p.role === "SNAP" || p.role === "CATCH")) return "block";
    if (blockFor(play, id)) return "block";
    var r = routeFor(play, id);
    if (r) {
      var color = String(r.color || "").toLowerCase();
      if (color === "#dc2626" || color === "red") return "ball";
      return "block";
    }
    return "block";
  }

  function poseAtBeat(beat) {
    var play = currentPlay();
    var poses = {};
    play.offense.forEach(function (p) {
      var pts = pathPoints(play, p.id);
      var kind = kindFor(play, p.id);
      var amt = kind === "ball" ? carrierMotionAmount(play, beat) : motionAmount(kind, beat);
      if (p.role === "SNAP" && beat === 1) {
        poses[p.id] = { x: p.x, y: p.y + 8 };
      } else if (kind === "passer") {
        poses[p.id] = { x: p.x, y: p.y };
      } else {
        poses[p.id] = samplePath(pts, amt);
      }
    });
    play.defense.forEach(function (d) {
      if (d.slide && d.slide.length) {
        poses[d.id] = samplePath(d.slide, motionAmount("slide", beat));
      } else {
        poses[d.id] = { x: d.x, y: d.y };
      }
    });
    return poses;
  }

  function interpolatedPoses(value) {
    var lo = Math.floor(value), hi = Math.min(6, lo + 1), u = ease(value - lo);
    var a = poseAtBeat(lo), b = poseAtBeat(hi), p = {};
    Object.keys(a).forEach(function (id) { p[id] = mixPoint(a[id], b[id], u); });
    return p;
  }

  function dFromPoints(points) {
    return "M " + points.map(function (p) { return p.x.toFixed(1) + "," + p.y.toFixed(1); }).join(" L ");
  }

  function shorten(points, startPad, endPad) {
    if (points.length < 2) return points;
    var copy = points.map(function (p) { return { x: p.x, y: p.y }; });
    var dx = copy[1].x - copy[0].x, dy = copy[1].y - copy[0].y, dist = Math.hypot(dx, dy) || 1;
    copy[0].x += dx / dist * startPad;
    copy[0].y += dy / dist * startPad;
    var n = copy.length - 1;
    var dx2 = copy[n].x - copy[n - 1].x, dy2 = copy[n].y - copy[n - 1].y, dist2 = Math.hypot(dx2, dy2) || 1;
    copy[n].x -= dx2 / dist2 * endPad;
    copy[n].y -= dy2 / dist2 * endPad;
    return copy;
  }

  function footballIcon(x, y) {
    var g = el("g", { transform: "translate(" + x + "," + y + ")", "data-ball-icon": "1" });
    g.appendChild(el("ellipse", { rx: "11", ry: "7.5", fill: "#f8fafc", stroke: "#3f2b1d", "stroke-width": "2.2" }));
    g.appendChild(el("line", { x1: "-6", y1: "0", x2: "6", y2: "0", stroke: "#9f1239", "stroke-width": "1.6" }));
    return g;
  }

  function drawStaticRoutes() {
    while (blockLayer.firstChild) blockLayer.removeChild(blockLayer.firstChild);
    while (routeLayer.firstChild) routeLayer.removeChild(routeLayer.firstChild);
    while (iconLayer.firstChild) iconLayer.removeChild(iconLayer.firstChild);
    var play = currentPlay();
    var routed = {};
    (play.routes || []).forEach(function (route) {
      routed[route.from] = true;
      var from = findOff(play, route.from);
      if (!from) return;
      var color = route.color || "#111111";
      var isBall = color.toLowerCase() === "#dc2626" || color === "red";
      if (isBall) return;
      var pts = route.points.slice();
      if (pts[0].x !== from.x || pts[0].y !== from.y) pts.unshift({ x: from.x, y: from.y });
      var dashed = route.style === "dashed";
      var path = el("path", {
        d: dFromPoints(shorten(pts, 18, 8)),
        fill: "none",
        stroke: isBall ? "#dc2626" : "#e7eef7",
        "stroke-width": isBall ? "4" : "2.8",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        opacity: isBall ? ".9" : ".72",
        "marker-end": isBall ? "url(#ballArrow)" : "url(#blockArrow)",
        "data-route-owner": route.from
      });
      if (dashed) path.setAttribute("stroke-dasharray", isBall ? "9 7" : "8 7");
      routeLayer.appendChild(path);
    });
    (play.blocks || []).forEach(function (block) {
      if (routed[block.from]) return;
      var from = findOff(play, block.from);
      var to = findDef(play, block.toDefenderId);
      if (!from || !to) return;
      var pts = shorten([{ x: from.x, y: from.y }, { x: to.x, y: to.y }], 20, 18);
      blockLayer.appendChild(el("path", {
        d: dFromPoints(pts),
        fill: "none",
        stroke: "#e7eef7",
        "stroke-width": "2.8",
        "stroke-linecap": "round",
        opacity: ".78",
        "marker-end": "url(#blockArrow)",
        "data-route-owner": block.from
      }));
    });
    var ballPts = play.ball && play.ball.points ? play.ball.points : [];
    if (ballPts.length > 1) {
      var ballPath = el("path", {
        d: dFromPoints(ballPts),
        fill: "none",
        stroke: "#dc2626",
        "stroke-width": "4",
        "stroke-dasharray": "10 8",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        opacity: ".9",
        "marker-end": "url(#ballArrow)",
        "data-route-owner": play.ball.carrierId || ""
      });
      routeLayer.appendChild(ballPath);
    }
    (play.ball && play.ball.icons || []).forEach(function (pt) {
      iconLayer.appendChild(footballIcon(pt.x, pt.y));
    });
  }


  var GOLD_RB_FILL = "#e8b423";
  var GOLD_RB_STROKE = "#dc2626";
  var BLUE_RB_FILL = "#2f6fe0";

  function isRb(p) {
    if (!p) return false;
    if (p.letter === "RB") return true;
    return Boolean(p.id && String(p.id).indexOf("rb-") === 0);
  }
  function isBallBack(p) {
    if (!p) return false;
    var play = currentPlay();
    return Boolean(play && play.ball && play.ball.carrierId === p.id);
  }
  function rbColorKey(p) {
    if (!isRb(p)) return "";
    var c = String(p.color || "").toLowerCase();
    if (c === BLUE_RB_FILL) return "BLUE";
    if (c === GOLD_RB_FILL) return "GOLD";
    return "PURPLE";
  }
  function positionTitle(p) {
    if (!p) return "";
    var key = rbColorKey(p);
    if (key === "GOLD") return "Gold RB";
    if (key === "BLUE") return "Blue RB";
    if (key === "PURPLE") return "Purple RB";
    return p.letter;
  }
  function assignmentRole(p) {
    if (!p) return "BLOCK";
    if (p.role === "RUN") return "BALL";
    if (p.role === "PASS" || p.role === "PITCH" || p.role === "LEAD" || p.role === "FAKE" || p.role === "CATCH" || p.role === "SNAP") return p.role;
    return p.role || "BLOCK";
  }
  function tokenFill(p) {
    return p.color;
  }
  function setRoleCaption(textEl, p) {
    while (textEl.firstChild) textEl.removeChild(textEl.firstChild);
    var key = rbColorKey(p);
    if (key) {
      textEl.appendChild(document.createTextNode(key));
      if (p.role === "LEAD" || p.role === "FAKE") {
        var extra = document.createElementNS(NS, "tspan");
        extra.setAttribute("x", "0");
        extra.setAttribute("dy", "13");
        extra.textContent = p.role;
        textEl.appendChild(extra);
      }
      return;
    }
    var caption = shortRole(p);
    if (caption && caption !== "BLOCK") textEl.appendChild(document.createTextNode(caption));
  }

  function tokenOffense(p) {
    var fill = tokenFill(p);
    var assigned = window.LineupManager ? window.LineupManager.getPlayerForPos(p.id) : null;
    var playerLabel = assigned ? ("#" + assigned.number + " " + assigned.name + " (" + positionTitle(p) + ")") : positionTitle(p);

    var g = el("g", { class: "sim-player", "data-player": p.id, tabindex: "0", role: "button", "aria-label": playerLabel });
    g.appendChild(el("circle", { r: "38", fill: "transparent" }));
    var selected = el("circle", { r: "36", fill: "none", stroke: "#fff", "stroke-width": "2.6", opacity: "0" });
    var stroke = isBallBack(p) ? GOLD_RB_STROKE : (p.stroke || "#1a1a1a");
    var sw = (isBallBack(p) || p.stroke) ? "3.6" : "2.4";
    var disc = el("circle", { r: "34", fill: fill, stroke: stroke, "stroke-width": sw });
    
    var label = el("text", {
      x: "0", y: assigned ? "0" : "6",
      fill: darkFill(fill) ? "#fff" : "#111",
      "font-size": assigned ? "16" : "20", "font-weight": "800", "text-anchor": "middle", "pointer-events": "none"
    });
    label.textContent = p.letter;

    var numSub = null;
    if (assigned && assigned.number) {
      numSub = el("text", {
        x: "0", y: "17",
        fill: darkFill(fill) ? "#f6c344" : "#111",
        "font-size": "13", "font-weight": "900", "text-anchor": "middle", "pointer-events": "none"
      });
      numSub.textContent = "#" + assigned.number;
    }

    var role = el("text", {
      x: "0", y: "46", fill: "#f6c344", "font-size": "12", "font-weight": "800",
      "text-anchor": "middle", "paint-order": "stroke", stroke: "#0d3b24", "stroke-width": "3.4", "pointer-events": "none"
    });

    g.appendChild(selected); g.appendChild(disc); g.appendChild(label);
    if (numSub) g.appendChild(numSub);
    g.appendChild(role);

    g.addEventListener("click", function () { selectPlayer(p.id); });
    g.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectPlayer(p.id); }
    });
    svg.appendChild(g);
    state.players[p.id] = { g: g, selected: selected, role: role, kind: "O", spec: p, assigned: assigned };
  }

  function tokenDefense(d) {
    var g = el("g", { class: "sim-player", "data-player": d.id, tabindex: "0", role: "button", "aria-label": d.letter });
    g.appendChild(el("circle", { r: "34", fill: "transparent" }));
    var selected = el("circle", { r: "32", fill: "none", stroke: "#fff", "stroke-width": "2.6", opacity: "0" });
    var sq = el("rect", { x: "-22", y: "-22", width: "44", height: "44", rx: "4", fill: "#f8fafc", stroke: "#111", "stroke-width": "2.4" });
    var label = el("text", {
      x: "0", y: "6", fill: "#111", "font-size": "16", "font-weight": "800",
      "text-anchor": "middle", "pointer-events": "none"
    });
    label.textContent = d.letter;
    var role = el("text", { x: "0", y: "40", fill: "#f6c344", "font-size": "11", "font-weight": "800", "text-anchor": "middle", "pointer-events": "none" });
    g.appendChild(selected); g.appendChild(sq); g.appendChild(label); g.appendChild(role);
    g.addEventListener("click", function () { selectPlayer(d.id); });
    g.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectPlayer(d.id); }
    });
    svg.appendChild(g);
    state.players[d.id] = { g: g, selected: selected, role: role, kind: "D", spec: d };
  }

  function rebuildTokens() {
    Object.keys(state.players).forEach(function (id) {
      var node = state.players[id].g;
      if (node && node.parentNode) node.parentNode.removeChild(node);
    });
    state.players = {};
    var play = currentPlay();
    play.defense.forEach(tokenDefense);
    play.offense.forEach(tokenOffense);
    if (ball && ball.parentNode) svg.appendChild(ball);
  }

  function fitViewBox() {
    if (!svg) return;
    var play = currentPlay();
    var xs = [60, 940];
    var ys = [110, 620];
    function add(x, y) { xs.push(Number(x)); ys.push(Number(y)); }
    (play.offense || []).forEach(function (p) { add(p.x, p.y); });
    (play.defense || []).forEach(function (d) { add(d.x, d.y); });
    (play.routes || []).forEach(function (r) {
      (r.points || []).forEach(function (pt) { add(pt.x, pt.y); });
    });
    if (play.ball && play.ball.points) {
      play.ball.points.forEach(function (pt) { add(pt.x, pt.y); });
    }
    var pad = 54;
    var minX = Math.min.apply(null, xs) - pad;
    var maxX = Math.max.apply(null, xs) + pad;
    var minY = Math.min.apply(null, ys) - 50;
    var maxY = Math.max.apply(null, ys) + 70;
    var vbW = Math.max(100, maxX - minX);
    var vbH = Math.max(100, maxY - minY);
    var root = document.getElementById("sim-root");
    var box = root ? root.getBoundingClientRect() : { width: 390, height: 520 };
    var w = Math.max(160, box.width);
    var h = Math.max(160, box.height);
    var needH = vbW * (h / w);
    if (needH > vbH) {
      minY -= (needH - vbH) * 0.28;
      vbH = needH;
    }
    svg.setAttribute("viewBox", minX.toFixed(1) + " " + minY.toFixed(1) + " " + vbW.toFixed(1) + " " + vbH.toFixed(1));
  }

  function buildField() {
    svg = el("svg", { viewBox: "0 -200 1000 1600", preserveAspectRatio: "xMidYMid meet", class: "sim-svg full-team-svg", role: "img", "aria-label": "Coach-sheet recreation" });
    var defs = el("defs", {});
    defs.innerHTML =
      '<marker id="ballArrow" markerUnits="userSpaceOnUse" viewBox="0 0 14 14" refX="11.5" refY="7" markerWidth="14" markerHeight="14" orient="auto"><path d="M1,1 L12,7 L1,13 z" fill="#dc2626"/></marker>' +
      '<marker id="blockArrow" markerUnits="userSpaceOnUse" viewBox="0 0 14 14" refX="11.5" refY="7" markerWidth="14" markerHeight="14" orient="auto"><path d="M1,1 L12,7 L1,13 z" fill="#e7eef7"/></marker>' +
      '<radialGradient id="fieldGlow" cx="50%" cy="40%" r="90%"><stop offset="0%" stop-color="#14532d"/><stop offset="100%" stop-color="#0b3522"/></radialGradient>';
    svg.appendChild(defs);
    svg.appendChild(el("rect", { x: "-400", y: "-800", width: "1800", height: "2800", fill: "url(#fieldGlow)" }));
    var y;
    for (y = -700; y <= 1800; y += 100) {
      svg.appendChild(el("line", { x1: "20", y1: String(y), x2: String(W - 20), y2: String(y), stroke: "rgba(255,255,255,.12)", "stroke-width": "2" }));
    }
    svg.appendChild(el("line", { x1: "26", y1: String(LOS), x2: String(W - 26), y2: String(LOS), stroke: "#f6c344", "stroke-width": "3" }));
    var los = el("text", { x: "38", y: String(LOS - 10), fill: "#f6c344", "font-size": "11", "font-weight": "800" });
    los.textContent = "LOS";
    svg.appendChild(los);
    blockLayer = el("g", { class: "sim-block-routes" });
    routeLayer = el("g", { class: "sim-skill-routes" });
    iconLayer = el("g", { class: "sim-ball-icons" });
    svg.appendChild(blockLayer);
    svg.appendChild(routeLayer);
    svg.appendChild(iconLayer);
    ball = el("g", { class: "sim-ball", "data-possession": "in-flight" });
    ball.appendChild(el("ellipse", { rx: "14", ry: "9", fill: "#7c3f20", stroke: "#fff7df", "stroke-width": "3" }));
    ball.appendChild(el("line", { x1: "-5", y1: "0", x2: "5", y2: "0", stroke: "#fff7df", "stroke-width": "1.8" }));
    svg.appendChild(ball);
    return svg;
  }

  function applyFocus() {
    var selected = state.selected;
    Object.keys(state.players).forEach(function (id) {
      state.players[id].g.classList.toggle("is-dimmed", Boolean(selected && id !== selected));
    });
    svg.querySelectorAll("[data-route-owner]").forEach(function (route) {
      var owner = route.getAttribute("data-route-owner");
      route.classList.toggle("is-dimmed", Boolean(selected && owner !== selected));
      route.classList.toggle("is-focused", Boolean(selected && owner === selected));
    });
  }

  function ballPosAt(t, poses) {
    var play = currentPlay();
    var pts = play.ball && play.ball.points ? play.ball.points : [];
    if (!pts.length) {
      var c = findOff(play, "c") || play.offense[0];
      return { x: c.x, y: c.y };
    }
    var carrierId = play.ball.carrierId;
    var carrier = findOff(play, carrierId);
    var acquireAt = possessionBeat(play);
    if (!carrier || t < acquireAt) {
      var transfer = pathPrefixToPoint(pts, carrier || pts[pts.length - 1]);
      var transferAmount = ease(clamp(t / Math.max(0.01, acquireAt), 0, 1));
      var flight = samplePath(transfer, transferAmount);
      flight.attached = false;
      flight.carrierId = carrierId || "";
      return flight;
    }
    var carrierPos = poses && poses[carrierId] ? poses[carrierId] : { x: carrier.x, y: carrier.y };
    var route = routeFor(play, carrierId);
    var next = route && route.points && route.points[1] ? route.points[1] : carrierPos;
    var direction = next.x < carrier.x ? -1 : 1;
    var settle = ease(clamp((t - acquireAt) / 0.4, 0, 1));
    return {
      x: carrierPos.x + direction * 18 * settle,
      y: carrierPos.y - 12 * settle,
      attached: true,
      carrierId: carrierId
    };
  }

  function shortRole(p) {
    if (!p) return "";
    var key = rbColorKey(p);
    if (key) {
      if (p.role === "LEAD") return key + " LEAD";
      if (p.role === "FAKE") return key + " FAKE";
      return key;
    }
    if (p.role === "RUN" || p.role === "PASS" || p.role === "PITCH") return "BALL";
    if (p.role === "LEAD") return "LEAD";
    if (p.role === "FAKE") return "FAKE";
    if (p.role === "CATCH") return "CATCH";
    if (p.role === "SNAP") return "SNAP";
    return "BLOCK";
  }

  function applyPoses() {
    var play = currentPlay();
    var poses = interpolatedPoses(state.t);
    Object.keys(state.players).forEach(function (id) {
      var player = state.players[id];
      var pos = poses[id];
      if (!pos) return;
      player.g.setAttribute("transform", "translate(" + pos.x + "," + pos.y + ")");
      player.selected.setAttribute("opacity", state.selected === id ? "1" : "0");
      if (player.kind === "O") setRoleCaption(player.role, player.spec);
      else player.role.textContent = "";
    });
    var bp = ballPosAt(state.t, poses);
    ball.setAttribute("transform", "translate(" + bp.x + "," + bp.y + ")");
    ball.setAttribute("data-possession", bp.attached ? "attached" : "in-flight");
    ball.setAttribute("data-carrier", bp.carrierId || "");
    Object.keys(state.players).forEach(function (id) {
      state.players[id].g.classList.toggle("has-possession", Boolean(bp.attached && id === bp.carrierId));
    });
    var shown = clamp(Math.round(state.t), 0, 6);
    if (beatEl) beatEl.textContent = BEATS[shown].name + " · " + (shown + 1) + " OF 7";
    if (beatsEl) {
      beatsEl.querySelectorAll("[data-beat]").forEach(function (chip) {
        chip.classList.toggle("is-on", Number(chip.getAttribute("data-beat")) === shown);
      });
    }
    if (cueEl && !state.selected) cueEl.textContent = play.cue || BEATS[shown].cue;
    if (slider) slider.value = String(state.t);
    document.querySelectorAll("[data-sim-dot]").forEach(function (dot) {
      dot.classList.toggle("is-on", Number(dot.getAttribute("data-sim-dot")) === shown);
    });
    applyFocus();
  }

  function jobFor(id) {
    var play = currentPlay();
    var o = findOff(play, id);
    if (o) {
      var assigned = window.LineupManager ? window.LineupManager.getPlayerForPos(o.id) : null;
      var namePrefix = assigned ? ("#" + assigned.number + " " + assigned.name + " (" + positionTitle(o) + "): ") : (positionTitle(o) + ": ");
      return namePrefix + (o.job || shortRole(o));
    }
    var d = findDef(play, id);
    if (d) return d.letter + ": " + (d.job || "stay home, then flag. No tackling.");
    return "";
  }

  function openQuickSwapModal(posId) {
    if (!window.LineupManager) return;
    var roster = window.LineupManager.getRoster();
    var current = window.LineupManager.getPlayerForPos(posId);
    
    var overlay = document.createElement("div");
    overlay.className = "modal-overlay no-print";
    overlay.id = "swap-modal-overlay";

    var itemsHtml = roster.map(function (p) {
      var isCurrent = current && String(current.number) === String(p.number);
      return '<button type="button" class="team-item' + (isCurrent ? ' is-active' : '') + '" data-player-num="' + p.number + '" style="width:100%;text-align:left;cursor:pointer">' +
        '<div><strong>#' + p.number + ' ' + p.name + '</strong>' +
        '<span>' + (p.offensePos || 'Offense') + '</span></div>' +
        (isCurrent ? '<span class="sport-badge">IN SPOT</span>' : '<span style="font-size:0.8rem;color:var(--gold)">Assign ➔</span>') +
        '</button>';
    }).join("");

    overlay.innerHTML = '<div class="modal-card">' +
      '<h2>Quick Assign Player</h2>' +
      '<p class="tiny" style="margin-top:-4px">Choose which child is playing this spot right now:</p>' +
      '<div style="display:flex;flex-direction:column;gap:6px;margin:16px 0;max-height:50vh;overflow-y:auto">' + itemsHtml + '</div>' +
      '<div style="text-align:right"><button type="button" class="btn btn-secondary" id="close-swap-modal">Cancel</button></div>' +
      '</div>';

    document.body.appendChild(overlay);

    overlay.querySelectorAll("[data-player-num]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var num = btn.getAttribute("data-player-num");
        var match = roster.find(function (p) { return String(p.number) === String(num); });
        if (match) {
          window.LineupManager.assignPlayer(posId, match);
        }
        overlay.remove();
      });
    });

    document.getElementById("close-swap-modal")?.addEventListener("click", function () { overlay.remove(); });
    overlay.addEventListener("click", function (e) { if (e.target === overlay) overlay.remove(); });
  }

  function renderQuickLineupBar() {
    var container = document.getElementById("squad-rotation-list");
    if (!container || !window.LineupManager) return;
    var positions = window.LineupManager.DEFAULT_POSITIONS_8V8;
    var lineup = window.LineupManager.getLineup();

    container.innerHTML = positions.map(function (pos) {
      var assigned = lineup[pos.id];
      var numName = assigned ? ("#" + assigned.number + " " + assigned.name.split(" ")[0]) : "--";
      return '<button type="button" class="rotation-chip" data-pos-id="' + pos.id + '" aria-label="Assign ' + pos.name + '">' +
        '<span class="pos-tag">' + pos.letter + ':</span>' +
        '<span class="player-tag">' + numName + '</span>' +
        '</button>';
    }).join("");

    container.querySelectorAll("[data-pos-id]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        openQuickSwapModal(chip.getAttribute("data-pos-id"));
      });
    });
  }

  function updateAssignments() {
    var play = currentPlay();
    var board = document.getElementById("sim-assignments");
    if (!board) return;
    function cardFor(p, kind) {
      var role = kind === "D" ? (p.letter === "S" ? "FIT" : "HOME") : assignmentRole(p);
      var assigned = (kind === "O" && window.LineupManager) ? window.LineupManager.getPlayerForPos(p.id) : null;
      var title = kind === "D" ? p.letter : (assigned ? ("#" + assigned.number + " " + assigned.name + " (" + positionTitle(p) + ")") : positionTitle(p));
      var fill = kind === "D" ? "#f8fafc" : (tokenFill(p) || "#d0d4da");
      var ring = kind === "D" ? "#111111" : (isBallBack(p) ? GOLD_RB_STROKE : "#111111");
      var cls = "assignment-card role-" + String(role).toLowerCase().replace(/[^a-z0-9]+/g, "-");
      var job = p.job || (kind === "D" ? (p.letter === "S" ? "Stay deep. Hash to hash. Fit the run after the cut. Flag only." : "Stay home, then flag. No tackling.") : "");
      return '<button type="button" class="' + cls + '" data-assignment-player="' + p.id + '">' +
        '<span class="assignment-head">' +
        '<span class="assignment-swatch" style="background:' + fill + ";border-color:" + ring + '"></span>' +
        '<span class="assignment-position">' + title + "</span></span>" +
        '<span class="assignment-role">' + role + "</span>" +
        '<span class="assignment-task">' + job + "</span></button>";
    }
    board.innerHTML = play.offense.map(function (p) { return cardFor(p, "O"); }).join("") +
      play.defense.map(function (d) { return cardFor(d, "D"); }).join("");
    board.querySelectorAll("[data-assignment-player]").forEach(function (card) {
      card.addEventListener("click", function () { selectPlayer(card.getAttribute("data-assignment-player")); });
    });
  }

  function selectPlayer(id) {
    state.selected = state.selected === id ? null : id;
    applyPoses();
    document.querySelectorAll("[data-assignment-player]").forEach(function (card) {
      card.classList.toggle("is-selected", card.getAttribute("data-assignment-player") === state.selected);
    });
    if (state.selected && cueEl) cueEl.textContent = jobFor(state.selected);
  }

  function setT(value) { state.t = clamp(value, 0, 6); applyPoses(); }
  function pause() {
    state.playing = false;
    if (state.raf) cancelAnimationFrame(state.raf);
    if (playButton) playButton.textContent = "Play";
  }
  function setBeat(value) { pause(); setT(clamp(value, 0, 6)); }
  function tick(now) {
    if (!state.playing) return;
    var remaining = 6 - state.startT;
    var duration = state.speed * (remaining / 6);
    var progress = duration <= 0 ? 1 : clamp((now - state.startedAt) / duration, 0, 1);
    setT(state.startT + remaining * progress);
    if (progress < 1 && state.playing) state.raf = requestAnimationFrame(tick);
    else { state.playing = false; setT(6); if (playButton) playButton.textContent = "Play"; }
  }
  function play() {
    if (state.playing) { pause(); return; }
    if (state.t >= 5.99) setT(0);
    state.playing = true;
    state.startT = state.t;
    state.startedAt = performance.now();
    if (playButton) playButton.textContent = "Pause";
    state.raf = requestAnimationFrame(tick);
  }
  function reset() {
    pause();
    state.selected = null;
    setT(0);
    document.querySelectorAll("[data-assignment-player]").forEach(function (card) { card.classList.remove("is-selected"); });
  }

  function gifSlug(text) {
    return String(text || "play").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function exportGif() {
    var api = window.LIONS_GIF;
    var btn = document.getElementById("sim-gif");
    if (!svg || !api) return;
    if (btn && btn.getAttribute("aria-busy") === "true") return;
    pause();
    var savedT = state.t;
    var play = currentPlay();
    var width = 420;
    var height = 378;
    var count = 24;
    if (btn) {
      btn.setAttribute("aria-busy", "true");
      btn.disabled = true;
      btn.textContent = "GIF…";
    }
    var frames = [];
    function finish(ok) {
      setT(savedT);
      if (btn) {
        btn.removeAttribute("aria-busy");
        btn.disabled = false;
        btn.textContent = ok ? "GIF" : "GIF";
      }
    }
    function step(i) {
      if (i >= count) {
        try {
          var bytes = api.encodeGif(frames, width, height, 9);
          api.downloadBytes(bytes, "Seahawks-" + gifSlug(play.name) + "-" + gifSlug(play.call) + ".gif");
          finish(true);
        } catch (err) {
          finish(false);
        }
        return;
      }
      setT(count === 1 ? 0 : (i / (count - 1)) * 6);
      api.svgFrame(svg, width, height).then(function (idx) {
        frames.push(idx);
        step(i + 1);
      }).catch(function () { finish(false); });
    }
    step(0);
  }


  function renderBeatChips() {
    beatsEl = document.getElementById("sim-beats");
    if (!beatsEl) return;
    beatsEl.innerHTML = BEATS.map(function (beat, i) {
      return '<button type="button" class="sim-beat-chip" role="tab" data-beat="' + i + '">' + beat.name + "</button>";
    }).join("");
    beatsEl.querySelectorAll("[data-beat]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        setBeat(Number(chip.getAttribute("data-beat")));
      });
    });
  }

  function renderCustomPlayPicker() {
    if (!isCustomTeam()) return;
    var grid = document.querySelector(".play-strip .btn-grid");
    if (!grid) return;

    var pList = plays();
    if (!pList.length) {
      grid.innerHTML = '<div style="display:flex;align-items:center;gap:12px;padding:8px">' +
        '<span style="font-size:0.85rem;color:var(--muted)">No custom plays loaded.</span>' +
        '<button type="button" class="btn btn-secondary btn-sm" id="btn-restore-generic">Load 6 Example Plays</button>' +
        '</div>';
      var restoreBtn = document.getElementById("btn-restore-generic");
      if (restoreBtn) {
        restoreBtn.addEventListener("click", function () {
          if (window.CustomPlaybook) {
            window.CustomPlaybook.resetToStarter();
            renderCustomPlayPicker();
            setRun(plays()[0] ? plays()[0].id : "gen-01");
          }
        });
      }
      return;
    }

    grid.innerHTML = pList.map(function (p, i) {
      var num = i + 1;
      var active = p.id === state.runKey;
      return '<button class="play-btn' + (active ? ' is-active active' : '') + '" type="button" data-run-key="' + p.id + '" aria-pressed="' + String(active) + '" aria-label="' + p.name + ' ' + p.call + '">' +
        '<span class="btn-num">' + num + '</span>' +
        '<span class="btn-call">' + p.call + '</span>' +
        '</button>';
    }).join("") +
    '<div class="custom-play-actions" style="display:flex;align-items:center;gap:6px;margin-left:auto">' +
    '<button type="button" class="btn-squad" id="btn-clear-plays" title="Clear example plays to build your own">🗑 Clear</button>' +
    '<button type="button" class="btn-squad" id="btn-reset-plays" title="Reset to 6 example plays">🔄 Examples</button>' +
    '</div>';

    grid.querySelectorAll(".play-btn[data-run-key]").forEach(function (button) {
      button.addEventListener("click", function () {
        setRun(button.getAttribute("data-run-key"));
      });
    });

    var clearBtn = document.getElementById("btn-clear-plays");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        if (confirm("Clear example plays to build your custom playbook?")) {
          if (window.CustomPlaybook) {
            window.CustomPlaybook.clearExamplePlays();
            renderCustomPlayPicker();
          }
        }
      });
    }

    var resetBtn = document.getElementById("btn-reset-plays");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        if (window.CustomPlaybook) {
          window.CustomPlaybook.resetToStarter();
          renderCustomPlayPicker();
          setRun(plays()[0] ? plays()[0].id : "gen-01");
        }
      });
    }
  }

  function setRun(key) {
    if (!playMap()[key]) {
      var first = plays()[0];
      if (!first) return;
      key = first.id;
    }
    pause();
    state.runKey = key;
    state.selected = null;
    state.t = 0;
    var play = currentPlay();
    if (!play) return;
    var nameEl = document.getElementById("sim-play-name");
    if (nameEl) nameEl.textContent = play.name;
    var badge = document.getElementById("sim-play-badge");
    if (badge) badge.textContent = play.call;
    var appPlay = document.getElementById("appbar-play");
    if (appPlay) appPlay.textContent = play.call;
    
    var sheetPane = document.getElementById("sheet-pane");
    if (sheetPane) {
      sheetPane.hidden = Boolean(isCustomTeam() || !play.photo);
      sheetPane.style.removeProperty("display");
    }
    if (photoEl && play.photo) {
      photoEl.src = play.photo;
      photoEl.alt = "Coach sheet for " + play.name + " " + play.call;
    }
    document.querySelectorAll(".play-btn").forEach(function (button) {
      var active = button.getAttribute("data-run-key") === key;
      button.classList.toggle("is-active", active);
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    rebuildTokens();
    drawStaticRoutes();
    updateAssignments();
    applyPoses();
    fitViewBox();
  }

  document.addEventListener("DOMContentLoaded", function () {
    var root = document.getElementById("sim-root");
    cueEl = document.getElementById("sim-cue");
    beatEl = document.getElementById("sim-beat");
    renderBeatChips();
    slider = document.getElementById("sim-slider");
    playButton = document.getElementById("sim-play");
    photoEl = document.getElementById("coach-sheet-photo");
    if (!root || !plays().length) return;
    root.innerHTML = "";
    root.appendChild(buildField());
    fitViewBox();
    window.addEventListener("resize", fitViewBox);
    if (window.ResizeObserver) {
      new ResizeObserver(fitViewBox).observe(root);
    }
    renderCustomPlayPicker();
    document.querySelectorAll(".play-btn[data-run-key]").forEach(function (button) {
      button.addEventListener("click", function () { setRun(button.getAttribute("data-run-key")); });
    });
    if (playButton) playButton.addEventListener("click", play);
    var back = document.getElementById("sim-back");
    var next = document.getElementById("sim-next");
    var rst = document.getElementById("sim-reset");
    if (back) back.addEventListener("click", function () { setBeat(Math.round(state.t) - 1); });
    if (next) next.addEventListener("click", function () { setBeat(Math.round(state.t) + 1); });
    if (rst) rst.addEventListener("click", reset);
    var gifBtn = document.getElementById("sim-gif");
    if (gifBtn) gifBtn.addEventListener("click", exportGif);
    if (slider) slider.addEventListener("input", function () { pause(); setT(Number(slider.value)); });
    document.querySelectorAll("[data-sim-speed]").forEach(function (button) {
      button.addEventListener("click", function () {
        var speeds = { slow: 11000, normal: 7000, fast: 4300 };
        state.speed = speeds[button.getAttribute("data-sim-speed")] || 11000;
        document.querySelectorAll("[data-sim-speed]").forEach(function (item) {
          var active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-pressed", String(active));
        });
      });
    });
    var initialKey = isCustomTeam() ? ((plays()[0] && plays()[0].id) || "gen-01") : "play-01";
    setRun(initialKey);
    renderQuickLineupBar();

    window.addEventListener("playbook:changed", function () {
      renderCustomPlayPicker();
      setRun(plays()[0] ? plays()[0].id : "gen-01");
    });

    window.addEventListener("lineup:changed", function () {
      rebuildTokens();
      updateAssignments();
      renderQuickLineupBar();
      applyPoses();
    });
  });
})();
