/**
 * Lions K/1 slow-motion teacher — data-driven from js/plays-data.js.
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
    { name: "LANE", cue: "Ball follows the red dashed path. Blockers stay on their man." },
    { name: "CUT", cue: "One cut. Eyes up. Defense pursues for the flag." },
    { name: "FINISH", cue: "North. Flag only — no tackling, no blocks in the back." }
  ];

  var state = { runKey: "play-01", t: 0, playing: false, speed: 11000, startedAt: 0, startT: 0, raf: 0, selected: null, players: {} };
  var svg, ball, routeLayer, blockLayer, iconLayer, cueEl, beatEl, slider, playButton, photoEl;

  function plays() { return window.LIONS_PLAYS || []; }
  function playMap() { return window.LIONS_PLAY_MAP || {}; }
  function currentPlay() { return playMap()[state.runKey] || plays()[0]; }
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

  function motionAmount(kind, beat) {
    if (kind === "block") {
      if (beat < 2) return 0;
      if (beat === 2) return 0.38;
      if (beat === 3) return 0.78;
      return 1;
    }
    if (kind === "slide") {
      if (beat < 4) return 0;
      return (beat - 3) / 3;
    }
    return clamp(beat / 6, 0, 1);
  }

  function kindFor(play, id) {
    if (findDef(play, id) && findDef(play, id).slide) return "slide";
    if (routeFor(play, id)) {
      var r = routeFor(play, id);
      if (r.style === "dashed" && r.color && r.color.toLowerCase() !== "#dc2626" && r.color !== "red") return "route";
      return "route";
    }
    if (blockFor(play, id)) return "block";
    return "route";
  }

  function poseAtBeat(beat) {
    var play = currentPlay();
    var poses = {};
    play.offense.forEach(function (p) {
      var pts = pathPoints(play, p.id);
      var amt = motionAmount(kindFor(play, p.id), beat);
      if (p.role === "SNAP" && beat === 1) {
        poses[p.id] = { x: p.x, y: p.y + 8 };
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
      var pts = route.points.slice();
      if (pts[0].x !== from.x || pts[0].y !== from.y) pts.unshift({ x: from.x, y: from.y });
      var dashed = route.style === "dashed";
      var color = route.color || "#111111";
      var isBall = color.toLowerCase() === "#dc2626" || color === "red";
      var path = el("path", {
        d: dFromPoints(shorten(pts, 18, 8)),
        fill: "none",
        stroke: isBall ? "#dc2626" : color,
        "stroke-width": isBall ? "3.2" : "2.8",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
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
        stroke: "#111111",
        "stroke-width": "2.8",
        "stroke-linecap": "round",
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
        "stroke-width": "3.1",
        "stroke-dasharray": "9 7",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
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
    if (p.id === "rb-ball") return true;
    if (!isRb(p)) return false;
    return p.role === "RUN" || p.role === "PASS" || p.role === "PITCH";
  }
  function rbColorKey(p) {
    if (!isRb(p)) return "";
    if (isBallBack(p)) return "GOLD";
    var c = String(p.color || "").toLowerCase();
    if (c === BLUE_RB_FILL) return "BLUE";
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
    if (isBallBack(p)) return GOLD_RB_FILL;
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
    textEl.appendChild(document.createTextNode(shortRole(p)));
  }

  function tokenOffense(p) {
    var fill = tokenFill(p);
    var g = el("g", { class: "sim-player", "data-player": p.id, tabindex: "0", role: "button", "aria-label": positionTitle(p) });
    g.appendChild(el("circle", { r: "32", fill: "transparent" }));
    var selected = el("circle", { r: "30", fill: "none", stroke: "#fff", "stroke-width": "2.6", opacity: "0" });
    var stroke = isBallBack(p) ? GOLD_RB_STROKE : (p.stroke || "#1a1a1a");
    var sw = (isBallBack(p) || p.stroke) ? "3.6" : "2.4";
    var disc = el("circle", { r: "24", fill: fill, stroke: stroke, "stroke-width": sw });
    var label = el("text", {
      x: "0", y: "6",
      fill: darkFill(fill) ? "#fff" : "#111",
      "font-size": "16", "font-weight": "800", "text-anchor": "middle", "pointer-events": "none"
    });
    label.textContent = p.letter;
    var role = el("text", {
      x: "0", y: "40", fill: "#f6c344", "font-size": "11", "font-weight": "800",
      "text-anchor": "middle", "paint-order": "stroke", stroke: "#0d3b24", "stroke-width": "3.4", "pointer-events": "none"
    });
    g.appendChild(selected); g.appendChild(disc); g.appendChild(label); g.appendChild(role);
    g.addEventListener("click", function () { selectPlayer(p.id); });
    g.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectPlayer(p.id); }
    });
    svg.appendChild(g);
    state.players[p.id] = { g: g, selected: selected, role: role, kind: "O", spec: p };
  }

  function tokenDefense(d) {
    var g = el("g", { class: "sim-player", "data-player": d.id, tabindex: "0", role: "button", "aria-label": d.letter });
    g.appendChild(el("circle", { r: "34", fill: "transparent" }));
    var selected = el("circle", { r: "32", fill: "none", stroke: "#fff", "stroke-width": "2.6", opacity: "0" });
    var sq = el("rect", { x: "-18", y: "-18", width: "36", height: "36", rx: "4", fill: "#f8fafc", stroke: "#111", "stroke-width": "2.4" });
    var label = el("text", {
      x: "0", y: "6", fill: "#111", "font-size": "14", "font-weight": "800",
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

  function buildField() {
    svg = el("svg", { viewBox: "0 0 " + W + " " + H, preserveAspectRatio: "xMidYMid meet", class: "sim-svg full-team-svg", role: "img", "aria-label": "Coach-sheet recreation" });
    var defs = el("defs", {});
    defs.innerHTML =
      '<marker id="ballArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#dc2626"/></marker>' +
      '<marker id="blockArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#111111"/></marker>' +
      '<radialGradient id="fieldGlow" cx="50%" cy="65%" r="85%"><stop offset="0%" stop-color="#14532d"/><stop offset="100%" stop-color="#0b3522"/></radialGradient>';
    svg.appendChild(defs);
    svg.appendChild(el("rect", { width: String(W), height: String(H), fill: "url(#fieldGlow)" }));
    [90, 190, 290, 520, 640, 760, 850].forEach(function (y) {
      svg.appendChild(el("line", { x1: "30", y1: String(y), x2: String(W - 30), y2: String(y), stroke: "rgba(255,255,255,.13)", "stroke-width": "2" }));
    });
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
    ball = el("g", { class: "sim-ball" });
    ball.appendChild(el("ellipse", { rx: "14", ry: "10", fill: "#f8fafc", stroke: "#3f2b1d", "stroke-width": "2.6" }));
    ball.appendChild(el("line", { x1: "-7", y1: "0", x2: "7", y2: "0", stroke: "#9f1239", "stroke-width": "1.8" }));
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

  function ballPosAt(t) {
    var play = currentPlay();
    var pts = play.ball && play.ball.points ? play.ball.points : [];
    if (!pts.length) {
      var c = findOff(play, "c") || play.offense[0];
      return { x: c.x, y: c.y };
    }
    return samplePath(pts, clamp(t / 6, 0, 1));
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
    var bp = ballPosAt(state.t);
    ball.setAttribute("transform", "translate(" + bp.x + "," + bp.y + ")");
    var shown = clamp(Math.round(state.t), 0, 6);
    if (beatEl) beatEl.textContent = BEATS[shown].name + " · " + (shown + 1) + " OF 7";
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
    if (o) return positionTitle(o) + ": " + (o.job || shortRole(o));
    var d = findDef(play, id);
    if (d) return d.letter + ": stay home, then flag. No tackling.";
    return "";
  }

  function updateAssignments() {
    var play = currentPlay();
    var board = document.getElementById("sim-assignments");
    if (!board) return;
    board.innerHTML = play.offense.map(function (p) {
      var role = assignmentRole(p);
      var title = positionTitle(p);
      var fill = tokenFill(p) || "#d0d4da";
      var ring = isBallBack(p) ? GOLD_RB_STROKE : "#111111";
      var cls = "assignment-card role-" + String(role).toLowerCase().replace(/[^a-z0-9]+/g, "-");
      return '<button type="button" class="' + cls + '" data-assignment-player="' + p.id + '">' +
        '<span class="assignment-head">' +
        '<span class="assignment-swatch" style="background:' + fill + ";border-color:" + ring + '"></span>' +
        '<span class="assignment-position">' + title + "</span></span>" +
        '<span class="assignment-role">' + role + "</span>" +
        '<span class="assignment-task">' + (p.job || "") + "</span></button>";
    }).join("");
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
    if (playButton) playButton.textContent = "PLAY SLOW";
  }
  function setBeat(value) { pause(); setT(clamp(value, 0, 6)); }
  function tick(now) {
    if (!state.playing) return;
    var remaining = 6 - state.startT;
    var duration = state.speed * (remaining / 6);
    var progress = duration <= 0 ? 1 : clamp((now - state.startedAt) / duration, 0, 1);
    setT(state.startT + remaining * progress);
    if (progress < 1 && state.playing) state.raf = requestAnimationFrame(tick);
    else { state.playing = false; setT(6); if (playButton) playButton.textContent = "PLAY AGAIN"; }
  }
  function play() {
    if (state.playing) { pause(); return; }
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setT(6); return; }
    if (state.t >= 5.99) setT(0);
    state.playing = true;
    state.startT = state.t;
    state.startedAt = performance.now();
    if (playButton) playButton.textContent = "PAUSE";
    state.raf = requestAnimationFrame(tick);
  }
  function reset() {
    pause();
    state.selected = null;
    setT(0);
    document.querySelectorAll("[data-assignment-player]").forEach(function (card) { card.classList.remove("is-selected"); });
  }

  function setRun(key) {
    if (!playMap()[key]) return;
    pause();
    state.runKey = key;
    state.selected = null;
    state.t = 0;
    var play = currentPlay();
    var nameEl = document.getElementById("sim-play-name");
    if (nameEl) nameEl.textContent = play.name + " · " + play.call;
    var badge = document.getElementById("sim-play-badge");
    if (badge) { badge.textContent = play.call; badge.style.borderColor = ""; badge.style.color = ""; }
    if (photoEl) {
      photoEl.src = play.photo;
      photoEl.alt = "Coach sheet for " + play.name + " " + play.call;
    }
    document.querySelectorAll(".play-btn").forEach(function (button) {
      var active = button.getAttribute("data-run-key") === key;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    rebuildTokens();
    drawStaticRoutes();
    updateAssignments();
    applyPoses();
  }

  document.addEventListener("DOMContentLoaded", function () {
    var root = document.getElementById("sim-root");
    cueEl = document.getElementById("sim-cue");
    beatEl = document.getElementById("sim-beat");
    slider = document.getElementById("sim-slider");
    playButton = document.getElementById("sim-play");
    photoEl = document.getElementById("coach-sheet-photo");
    if (!root || !plays().length) return;
    root.innerHTML = "";
    root.appendChild(buildField());
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
    setRun("play-01");
  });
})();
