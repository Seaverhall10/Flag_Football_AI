/**
 * Live Game Play Counter & Drag-and-Drop Lineup Engine
 * Tracks live plays, active 5-on-5 positions, player reps, and league mandatory play minimums.
 */
(function (root) {
  "use strict";

  var DEFAULT_QUOTA = 10;

  function GameTracker(opts) {
    opts = opts || {};
    this.teamId = opts.teamId || (root.TeamManager && root.TeamManager.getActiveTeamId()) || "team_seahawks_5v5";
    this.storageKey = "game_tracker_" + this.teamId;
    this.state = this.loadState();
  }

  GameTracker.prototype.getDefaultRoster = function () {
    var rawRoster = [];
    if (root.LineupManager) {
      rawRoster = root.LineupManager.getRoster(this.teamId) || [];
    }
    if (!rawRoster || rawRoster.length === 0) {
      rawRoster = [
        { id: "p1", name: "Player #1", num: "#10", defaultPos: "C" },
        { id: "p2", name: "Player #2", num: "#2", defaultPos: "G" },
        { id: "p3", name: "Player #3", num: "#14", defaultPos: "T" },
        { id: "p4", name: "Player #4", num: "#7", defaultPos: "W" },
        { id: "p5", name: "Player #5", num: "#9", defaultPos: "RB" },
        { id: "p6", name: "Player #6", num: "#4", defaultPos: "C" },
        { id: "p7", name: "Player #7", num: "#11", defaultPos: "G" },
        { id: "p8", name: "Player #8", num: "#5", defaultPos: "T" }
      ];
    }
    return rawRoster.map(function (p, idx) {
      var numStr = p.num || (p.number ? ('#' + String(p.number).replace(/^#/, '')) : ('#' + (idx + 1)));
      var nameStr = p.name || ('Player ' + numStr);
      return {
        id: p.id != null ? p.id : ('p' + (idx + 1)),
        num: numStr,
        number: numStr.replace(/^#/, ''),
        name: nameStr,
        defaultPos: p.defaultPos || p.pos || "FLEX"
      };
    });
  };

  GameTracker.prototype.loadState = function () {
    try {
      var raw = localStorage.getItem(this.storageKey);
      if (raw) return JSON.parse(raw);
    } catch (e) {}

    var roster = this.getDefaultRoster();
    var activeLineup = {
      "C": roster[0] ? roster[0].id : null,
      "G": roster[1] ? roster[1].id : null,
      "T": roster[2] ? roster[2].id : null,
      "W": roster[3] ? roster[3].id : null,
      "RB": roster[4] ? roster[4].id : null
    };

    var playerStats = {};
    roster.forEach(function (p) {
      playerStats[p.id] = { totalPlays: 0, positions: {}, quota: DEFAULT_QUOTA };
    });

    return {
      gameId: "game_" + Date.now().toString(36),
      opponent: "Opponent",
      quarter: 1,
      totalPlays: 0,
      quotaTarget: DEFAULT_QUOTA,
      activeLineup: activeLineup,
      playerStats: playerStats,
      playHistory: []
    };
  };

  GameTracker.prototype.saveState = function () {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {}
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("tracker:updated", { detail: this.state }));
    }
  };

  GameTracker.prototype.logPlayRep = function (playCallName) {
    playCallName = playCallName || "Run Play";
    this.state.totalPlays += 1;

    var activePlayerIds = Object.values(this.state.activeLineup).filter(Boolean);
    var self = this;

    Object.keys(this.state.activeLineup).forEach(function (pos) {
      var pId = self.state.activeLineup[pos];
      if (pId) {
        if (!self.state.playerStats[pId]) {
          self.state.playerStats[pId] = { totalPlays: 0, positions: {}, quota: self.state.quotaTarget };
        }
        self.state.playerStats[pId].totalPlays += 1;
        self.state.playerStats[pId].positions[pos] = (self.state.playerStats[pId].positions[pos] || 0) + 1;
      }
    });

    this.state.playHistory.unshift({
      playNum: this.state.totalPlays,
      call: playCallName,
      quarter: this.state.quarter,
      timestamp: Date.now(),
      lineup: Object.assign({}, this.state.activeLineup)
    });

    this.saveState();
    return this.state;
  };

  GameTracker.prototype.undoLastPlay = function () {
    if (!this.state.playHistory.length) return;
    var last = this.state.playHistory.shift();
    this.state.totalPlays = Math.max(0, this.state.totalPlays - 1);

    var self = this;
    Object.keys(last.lineup).forEach(function (pos) {
      var pId = last.lineup[pos];
      if (pId && self.state.playerStats[pId]) {
        self.state.playerStats[pId].totalPlays = Math.max(0, self.state.playerStats[pId].totalPlays - 1);
        if (self.state.playerStats[pId].positions[pos]) {
          self.state.playerStats[pId].positions[pos] -= 1;
        }
      }
    });

    this.saveState();
  };

  GameTracker.prototype.substitute = function (pos, playerId) {
    // If player is already in another position, swap them
    var currentPos = null;
    for (var k in this.state.activeLineup) {
      if (this.state.activeLineup[k] === playerId) {
        currentPos = k;
        break;
      }
    }

    var replacedPlayerId = this.state.activeLineup[pos];
    this.state.activeLineup[pos] = playerId;

    if (currentPos && currentPos !== pos) {
      this.state.activeLineup[currentPos] = replacedPlayerId;
    }

    this.saveState();
  };

  GameTracker.prototype.applySquadPreset = function (preset) {
    var roster = this.getDefaultRoster();
    if (preset === "A") {
      this.state.activeLineup = {
        "C": roster[0] ? roster[0].id : null,
        "G": roster[1] ? roster[1].id : null,
        "T": roster[2] ? roster[2].id : null,
        "W": roster[3] ? roster[3].id : null,
        "RB": roster[4] ? roster[4].id : null
      };
    } else if (preset === "B") {
      this.state.activeLineup = {
        "C": roster[5] ? roster[5].id : (roster[0] ? roster[0].id : null),
        "G": roster[6] ? roster[6].id : (roster[1] ? roster[1].id : null),
        "T": roster[7] ? roster[7].id : (roster[2] ? roster[2].id : null),
        "W": roster[3] ? roster[3].id : null,
        "RB": roster[4] ? roster[4].id : null
      };
    }
    this.saveState();
  };

  GameTracker.prototype.resetGame = function () {
    var roster = this.getDefaultRoster();
    var playerStats = {};
    roster.forEach(function (p) {
      playerStats[p.id] = { totalPlays: 0, positions: {}, quota: DEFAULT_QUOTA };
    });

    this.state.gameId = "game_" + Date.now().toString(36);
    this.state.totalPlays = 0;
    this.state.playerStats = playerStats;
    this.state.playHistory = [];
    this.saveState();
  };

  root.GameTracker = GameTracker;
})(typeof window !== "undefined" ? window : globalThis);
