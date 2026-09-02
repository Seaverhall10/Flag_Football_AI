/**
 * Universal Board & Field Animation Engine
 * Dynamically renders pitch/court/field geometries, token dynamics, routes, blocks, ball paths, and playback states.
 */
(function (root) {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";

  function el(name, attrs) {
    var node = document.createElementNS(NS, name);
    Object.keys(attrs || {}).forEach(function (key) {
      node.setAttribute(key, attrs[key]);
    });
    return node;
  }

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t * t * (3 - 2 * t); }
  function mixPoint(a, b, t) { return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) }; }

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

  function dFromPoints(points) {
    if (!points || !points.length) return "";
    var d = "M " + points[0].x.toFixed(1) + " " + points[0].y.toFixed(1);
    for (var i = 1; i < points.length; i++) {
      d += " L " + points[i].x.toFixed(1) + " " + points[i].y.toFixed(1);
    }
    return d;
  }

  function renderFieldBackground(svg, fieldSpec) {
    var spec = fieldSpec || { width: 1000, height: 900, type: "football-field", background: "#246b38" };
    var W = spec.width || 1000;
    var H = spec.height || 900;
    var type = spec.type || "football-field";

    var bg = el("rect", { x: 0, y: 0, width: W, height: H, fill: spec.background || "#246b38" });
    svg.appendChild(bg);

    var grid = el("g", { class: "field-markings", stroke: spec.lineColor || "rgba(255,255,255,0.4)" });

    if (type === "football-field") {
      // Football yard lines & LOS
      var losY = spec.losY || 400;
      for (var y = 100; y < H; y += 100) {
        var line = el("line", { x1: 40, y1: y, x2: W - 40, y2: y, "stroke-width": 2 });
        grid.appendChild(line);
      }
      // Line of Scrimmage highlight (Blue line)
      var los = el("line", { x1: 30, y1: losY, x2: W - 30, y2: losY, stroke: "#3b82f6", "stroke-width": 4, "stroke-dasharray": "8 4" });
      grid.appendChild(los);

      // Sideline bounds
      grid.appendChild(el("rect", { x: 30, y: 30, width: W - 60, height: H - 60, fill: "none", "stroke-width": 3 }));
    } else if (type === "soccer-pitch") {
      // Outer touchlines
      grid.appendChild(el("rect", { x: 40, y: 40, width: W - 80, height: H - 80, fill: "none", "stroke-width": 3 }));
      // Halfway line
      grid.appendChild(el("line", { x1: 40, y1: H / 2, x2: W - 40, y2: H / 2, "stroke-width": 2 }));
      // Center circle
      grid.appendChild(el("circle", { cx: W / 2, cy: H / 2, r: 80, fill: "none", "stroke-width": 2 }));
      grid.appendChild(el("circle", { cx: W / 2, cy: H / 2, r: 4, fill: "rgba(255,255,255,0.8)" }));
      // Goal areas top and bottom
      grid.appendChild(el("rect", { x: W / 2 - 120, y: 40, width: 240, height: 100, fill: "none", "stroke-width": 2 }));
      grid.appendChild(el("rect", { x: W / 2 - 120, y: H - 140, width: 240, height: 100, fill: "none", "stroke-width": 2 }));
    } else if (type === "basketball-court") {
      // Court boundary
      grid.appendChild(el("rect", { x: 40, y: 40, width: W - 80, height: H - 80, fill: "none", "stroke-width": 3 }));
      // Half-court line
      grid.appendChild(el("line", { x1: 40, y1: H / 2, x2: W - 40, y2: H / 2, "stroke-width": 2 }));
      // Center circle
      grid.appendChild(el("circle", { cx: W / 2, cy: H / 2, r: 70, fill: "none", "stroke-width": 2 }));
      // Top 3-point arc and Key
      grid.appendChild(el("rect", { x: W / 2 - 80, y: 40, width: 160, height: 160, fill: "none", "stroke-width": 2 }));
      grid.appendChild(el("circle", { cx: W / 2, cy: 200, r: 60, fill: "none", "stroke-width": 2, "stroke-dasharray": "6 6" }));
      // Bottom 3-point arc and Key
      grid.appendChild(el("rect", { x: W / 2 - 80, y: H - 200, width: 160, height: 160, fill: "none", "stroke-width": 2 }));
      grid.appendChild(el("circle", { cx: W / 2, cy: H - 200, r: 60, fill: "none", "stroke-width": 2, "stroke-dasharray": "6 6" }));
    } else if (type === "baseball-diamond") {
      // Diamond base lines
      grid.appendChild(el("polygon", { points: (W/2)+",120 "+(W-140)+","+(H/2)+" "+(W/2)+","+(H-120)+" 140,"+(H/2), fill: "none", "stroke-width": 3 }));
      // Pitcher's mound circle
      grid.appendChild(el("circle", { cx: W / 2, cy: H / 2, r: 40, fill: "none", "stroke-width": 2 }));
    } else {
      // Generic grid
      for (var gx = 100; gx < W; gx += 100) {
        grid.appendChild(el("line", { x1: gx, y1: 0, x2: gx, y2: H, "stroke-width": 1, "stroke-dasharray": "4 4" }));
      }
      for (var gy = 100; gy < H; gy += 100) {
        grid.appendChild(el("line", { x1: 0, y1: gy, x2: W, y2: gy, "stroke-width": 1, "stroke-dasharray": "4 4" }));
      }
    }

    svg.appendChild(grid);
  }

  root.BoardEngine = {
    NS: NS,
    el: el,
    clamp: clamp,
    lerp: lerp,
    ease: ease,
    mixPoint: mixPoint,
    samplePath: samplePath,
    dFromPoints: dFromPoints,
    renderFieldBackground: renderFieldBackground
  };
})(typeof window !== "undefined" ? window : globalThis);
