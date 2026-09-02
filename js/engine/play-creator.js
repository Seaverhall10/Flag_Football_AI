/**
 * Interactive Tactical Play & Drill Creator
 * Allows coaches to place players on the field, draw routes/blocks, preview animation, and save to custom playbook.
 */
(function (root) {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var W = 1000;
  var H = 900;

  function PlayCreator(canvasId, options) {
    this.canvas = typeof canvasId === "string" ? document.getElementById(canvasId) : canvasId;
    this.options = options || {};
    this.mode = "move"; // 'move' | 'route' | 'block' | 'ball'
    this.selectedPlayerId = null;
    this.playData = {
      id: "custom-" + Date.now(),
      name: "New Custom Play",
      call: "Sweep Right",
      cue: "Run the called assignment on the whistle.",
      offense: [
        { id: "c", letter: "C", color: "#eab308", x: 500, y: 450, role: "SNAP", job: "Snap and climb." },
        { id: "lg", letter: "G", color: "#3b82f6", x: 410, y: 450, role: "BLOCK", job: "Drive block." },
        { id: "rg", letter: "G", color: "#3b82f6", x: 590, y: 450, role: "BLOCK", job: "Drive block." },
        { id: "lt", letter: "T", color: "#3b82f6", x: 320, y: 450, role: "BLOCK", job: "Seal edge." },
        { id: "rt", letter: "T", color: "#3b82f6", x: 680, y: 450, role: "BLOCK", job: "Seal edge." },
        { id: "rb-lead", letter: "RB", color: "#3b82f6", x: 440, y: 540, role: "LEAD", job: "Lead block." },
        { id: "rb-ball", letter: "QB", color: "#eab308", x: 500, y: 590, role: "RUN", stroke: "#dc2626", job: "Ballcarrier." }
      ],
      defense: [
        { id: "dt-l", letter: "DT", x: 420, y: 340 },
        { id: "dt-r", letter: "DT", x: 580, y: 340 },
        { id: "de-l", letter: "DE", x: 260, y: 340 },
        { id: "de-r", letter: "DE", x: 740, y: 340 },
        { id: "lb-l", letter: "LB", x: 350, y: 230 },
        { id: "lb-r", letter: "LB", x: 650, y: 230 },
        { id: "cb-l", letter: "CB", x: 120, y: 280 },
        { id: "cb-r", letter: "CB", x: 880, y: 280 }
      ],
      blocks: [],
      routes: [],
      ball: { carrierId: "rb-ball", points: [] }
    };

    this.dragging = null;
    this.currentDrawingPoints = [];
    this.init();
  }

  PlayCreator.prototype.init = function () {
    if (!this.canvas) return;
    this.render();
    this.bindEvents();
  };

  PlayCreator.prototype.render = function () {
    this.canvas.innerHTML = "";
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("class", "creator-svg");
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.touchAction = "none";

    // Defs for markers
    var defs = document.createElementNS(NS, "defs");
    defs.innerHTML = '<marker id="arrow-lead" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#111"/></marker>' +
      '<marker id="arrow-run" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#dc2626"/></marker>' +
      '<marker id="arrow-block" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#3b82f6"/></marker>';
    svg.appendChild(defs);

    // Field background
    var rect = document.createElementNS(NS, "rect");
    rect.setAttribute("width", String(W));
    rect.setAttribute("height", String(H));
    rect.setAttribute("fill", "#0f2316");
    svg.appendChild(rect);

    // Grid / Yardlines
    for (var y = 100; y <= 800; y += 100) {
      var line = document.createElementNS(NS, "line");
      line.setAttribute("x1", "50"); line.setAttribute("y1", String(y));
      line.setAttribute("x2", "950"); line.setAttribute("y2", String(y));
      line.setAttribute("stroke", y === 450 ? "#f6c344" : "rgba(255,255,255,0.12)");
      line.setAttribute("stroke-width", y === 450 ? "3" : "1");
      svg.appendChild(line);
    }

    // Line of Scrimmage label
    var losText = document.createElementNS(NS, "text");
    losText.setAttribute("x", "60"); losText.setAttribute("y", "442");
    losText.setAttribute("fill", "#f6c344"); losText.setAttribute("font-size", "14"); losText.setAttribute("font-weight", "800");
    losText.textContent = "LOS";
    svg.appendChild(losText);

    // Layers
    var routeGroup = document.createElementNS(NS, "g");
    routeGroup.setAttribute("class", "creator-routes");
    svg.appendChild(routeGroup);

    var playerGroup = document.createElementNS(NS, "g");
    playerGroup.setAttribute("class", "creator-players");
    svg.appendChild(playerGroup);

    this.svg = svg;
    this.routeGroup = routeGroup;
    this.playerGroup = playerGroup;
    this.canvas.appendChild(svg);

    this.renderRoutes();
    this.renderTokens();
  };

  PlayCreator.prototype.renderTokens = function () {
    var self = this;
    this.playerGroup.innerHTML = "";

    // Defense tokens (Squares)
    this.playData.defense.forEach(function (d) {
      var g = document.createElementNS(NS, "g");
      g.setAttribute("transform", "translate(" + d.x + "," + d.y + ")");
      g.setAttribute("data-player-id", d.id);
      g.style.cursor = "grab";

      var sq = document.createElementNS(NS, "rect");
      sq.setAttribute("x", "-22"); sq.setAttribute("y", "-22");
      sq.setAttribute("width", "44"); sq.setAttribute("height", "44");
      sq.setAttribute("rx", "4");
      sq.setAttribute("fill", "#f8fafc"); sq.setAttribute("stroke", "#111"); sq.setAttribute("stroke-width", "2.5");

      var text = document.createElementNS(NS, "text");
      text.setAttribute("x", "0"); text.setAttribute("y", "6");
      text.setAttribute("fill", "#111"); text.setAttribute("font-size", "16"); text.setAttribute("font-weight", "800");
      text.setAttribute("text-anchor", "middle"); text.setAttribute("pointer-events", "none");
      text.textContent = d.letter;

      g.appendChild(sq); g.appendChild(text);
      self.playerGroup.appendChild(g);
    });

    // Offense tokens (Circles)
    this.playData.offense.forEach(function (p) {
      var g = document.createElementNS(NS, "g");
      g.setAttribute("transform", "translate(" + p.x + "," + p.y + ")");
      g.setAttribute("data-player-id", p.id);
      g.style.cursor = "grab";

      var isSelected = self.selectedPlayerId === p.id;
      if (isSelected) {
        var sel = document.createElementNS(NS, "circle");
        sel.setAttribute("r", "38"); sel.setAttribute("fill", "none");
        sel.setAttribute("stroke", "#fff"); sel.setAttribute("stroke-width", "3");
        g.appendChild(sel);
      }

      var circ = document.createElementNS(NS, "circle");
      circ.setAttribute("r", "34");
      circ.setAttribute("fill", p.color || "#3b82f6");
      circ.setAttribute("stroke", p.stroke || "#111");
      circ.setAttribute("stroke-width", p.stroke ? "3.5" : "2.5");

      var text = document.createElementNS(NS, "text");
      text.setAttribute("x", "0"); text.setAttribute("y", "6");
      text.setAttribute("fill", "#fff"); text.setAttribute("font-size", "18"); text.setAttribute("font-weight", "800");
      text.setAttribute("text-anchor", "middle"); text.setAttribute("pointer-events", "none");
      text.textContent = p.letter;

      g.appendChild(circ); g.appendChild(text);
      self.playerGroup.appendChild(g);
    });
  };

  PlayCreator.prototype.renderRoutes = function () {
    var self = this;
    this.routeGroup.innerHTML = "";

    // Draw Blocks
    this.playData.blocks.forEach(function (b) {
      var offP = self.findPlayer(b.from);
      var defP = self.findPlayer(b.toDefenderId);
      if (offP && defP) {
        var line = document.createElementNS(NS, "line");
        line.setAttribute("x1", String(offP.x)); line.setAttribute("y1", String(offP.y));
        line.setAttribute("x2", String(defP.x)); line.setAttribute("y2", String(defP.y));
        line.setAttribute("stroke", "#3b82f6"); line.setAttribute("stroke-width", "4");
        line.setAttribute("marker-end", "url(#arrow-block)");
        self.routeGroup.appendChild(line);
      }
    });

    // Draw Routes
    this.playData.routes.forEach(function (r) {
      if (r.points && r.points.length > 1) {
        var dStr = "M " + r.points[0].x + "," + r.points[0].y;
        for (var i = 1; i < r.points.length; i++) {
          dStr += " L " + r.points[i].x + "," + r.points[i].y;
        }
        var path = document.createElementNS(NS, "path");
        path.setAttribute("d", dStr);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", r.color || "#111");
        path.setAttribute("stroke-width", "4");
        if (r.style === "dashed") path.setAttribute("stroke-dasharray", "8,6");
        path.setAttribute("marker-end", r.color === "#dc2626" ? "url(#arrow-run)" : "url(#arrow-lead)");
        self.routeGroup.appendChild(path);
      }
    });
  };

  PlayCreator.prototype.findPlayer = function (id) {
    var p = this.playData.offense.find(function (o) { return o.id === id; });
    if (p) return p;
    return this.playData.defense.find(function (d) { return d.id === id; });
  };

  PlayCreator.prototype.bindEvents = function () {
    var self = this;
    if (!this.svg) return;

    function getCoords(e) {
      var rect = self.svg.getBoundingClientRect();
      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      var clientY = e.touches ? e.touches[0].clientY : e.clientY;
      var scaleX = W / rect.width;
      var scaleY = H / rect.height;
      return {
        x: Math.round((clientX - rect.left) * scaleX),
        y: Math.round((clientY - rect.top) * scaleY)
      };
    }

    this.svg.addEventListener("pointerdown", function (e) {
      var target = e.target.closest("[data-player-id]");
      var pt = getCoords(e);
      if (target) {
        var id = target.getAttribute("data-player-id");
        self.selectedPlayerId = id;
        if (self.mode === "move") {
          self.dragging = { id: id, player: self.findPlayer(id) };
        } else if (self.mode === "route") {
          self.currentDrawingPoints = [{ x: pt.x, y: pt.y }];
        }
        self.renderTokens();
      }
    });

    window.addEventListener("pointermove", function (e) {
      if (self.dragging && self.mode === "move") {
        var pt = getCoords(e);
        self.dragging.player.x = Math.max(50, Math.min(950, pt.x));
        self.dragging.player.y = Math.max(50, Math.min(850, pt.y));
        self.renderTokens();
        self.renderRoutes();
      }
    });

    window.addEventListener("pointerup", function (e) {
      if (self.dragging) {
        self.dragging = null;
      }
    });
  };

  PlayCreator.prototype.setMode = function (mode) {
    this.mode = mode;
  };

  PlayCreator.prototype.loadPlay = function (playObj) {
    this.playData = JSON.parse(JSON.stringify(playObj));
    this.render();
  };

  PlayCreator.prototype.savePlayToPlaybook = function () {
    if (root.CustomPlaybook) {
      var saved = root.CustomPlaybook.addPlay(this.playData);
      return saved;
    }
    return null;
  };

  root.PlayCreator = PlayCreator;
})(typeof window !== "undefined" ? window : globalThis);
