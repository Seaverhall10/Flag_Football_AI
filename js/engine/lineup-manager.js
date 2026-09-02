/**
 * Quick Squad Lineup & Real-Time Position Assignment Manager
 * Allows coaches in practice to 1-tap assign active players to positions, rotate squads, and personalize animations.
 */
(function (root) {
  "use strict";

  var LINEUP_STORAGE_KEY_PREFIX = "coach_active_lineup_";

  var DEFAULT_POSITIONS_8V8 = [
    { id: "c", letter: "C", name: "Center", defaultPlayerNumber: "10" },
    { id: "lg", letter: "G", name: "Left Guard", defaultPlayerNumber: "12" },
    { id: "rg", letter: "G", name: "Right Guard", defaultPlayerNumber: "15" },
    { id: "lt", letter: "T", name: "Left Tackle", defaultPlayerNumber: "21" },
    { id: "rt", letter: "T", name: "Right Tackle", defaultPlayerNumber: "24" },
    { id: "w", letter: "W", name: "Wing", defaultPlayerNumber: "7" },
    { id: "rb-lead", letter: "RB", name: "Lead RB", defaultPlayerNumber: "33" },
    { id: "rb-ball", letter: "RB", name: "Ballcarrier (Gold RB)", defaultPlayerNumber: "2" }
  ];

  function getStorageKey() {
    var teamId = (root.TeamManager && root.TeamManager.getActiveTeamId()) || "seahawks-youth-flag";
    return LINEUP_STORAGE_KEY_PREFIX + teamId;
  }

  function getRoster() {
    if (root.TeamManager) {
      var rosterKey = root.TeamManager.getTeamStorageKey(null, "roster");
      var stored = localStorage.getItem(rosterKey);
      if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
      }
    }
    var defStored = localStorage.getItem("lions_team_roster_data");
    if (defStored) {
      try { return JSON.parse(defStored); } catch (e) {}
    }
    return [
      { id: 1, number: "2", name: "Player #2" },
      { id: 2, number: "7", name: "Player #7" },
      { id: 3, number: "10", name: "Player #10" },
      { id: 4, number: "12", name: "Player #12" },
      { id: 5, number: "15", name: "Player #15" },
      { id: 6, number: "21", name: "Player #21" },
      { id: 7, number: "24", name: "Player #24" },
      { id: 8, number: "33", name: "Player #33" },
      { id: 9, number: "44", name: "Player #44" },
      { id: 10, number: "55", name: "Player #55" },
      { id: 11, number: "88", name: "Player #88" }
    ];
  }

  function getLineup() {
    var key = getStorageKey();
    var stored = localStorage.getItem(key);
    if (stored) {
      try {
        var parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object") return parsed;
      } catch (e) {}
    }

    // Generate initial lineup from active roster
    var roster = getRoster();
    var initial = {};
    DEFAULT_POSITIONS_8V8.forEach(function (pos, idx) {
      var match = roster.find(function (p) { return String(p.number) === String(pos.defaultPlayerNumber); }) || roster[idx % roster.length];
      initial[pos.id] = {
        number: match ? match.number : pos.defaultPlayerNumber,
        name: match ? match.name : ("Player #" + pos.defaultPlayerNumber),
        letter: pos.letter,
        posName: pos.name
      };
    });
    saveLineup(initial);
    return initial;
  }

  function saveLineup(lineup) {
    var key = getStorageKey();
    localStorage.setItem(key, JSON.stringify(lineup));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("lineup:changed", { detail: lineup }));
    }
  }

  function assignPlayer(posId, player) {
    var lineup = getLineup();
    lineup[posId] = {
      number: player.number || "--",
      name: player.name || ("Player #" + player.number),
      letter: lineup[posId] ? lineup[posId].letter : "",
      posName: lineup[posId] ? lineup[posId].posName : ""
    };
    saveLineup(lineup);
    return lineup;
  }

  function getPlayerForPos(posId) {
    var lineup = getLineup();
    return lineup[posId] || null;
  }

  function rotateLineup() {
    var lineup = getLineup();
    var posKeys = DEFAULT_POSITIONS_8V8.map(function (p) { return p.id; });
    var players = posKeys.map(function (k) { return lineup[k]; });
    
    // Shift players by 1 position
    var last = players.pop();
    players.unshift(last);

    var newLineup = {};
    posKeys.forEach(function (k, idx) {
      newLineup[k] = Object.assign({}, players[idx], {
        letter: lineup[k] ? lineup[k].letter : "",
        posName: lineup[k] ? lineup[k].posName : ""
      });
    });

    saveLineup(newLineup);
    return newLineup;
  }

  function applySquadPreset(preset) {
    var roster = getRoster();
    var lineup = {};
    var offset = (preset === "B" || preset === "2") ? 3 : 0;

    DEFAULT_POSITIONS_8V8.forEach(function (pos, idx) {
      var p = roster[(idx + offset) % roster.length];
      lineup[pos.id] = {
        number: p ? p.number : pos.defaultPlayerNumber,
        name: p ? p.name : ("Player #" + pos.defaultPlayerNumber),
        letter: pos.letter,
        posName: pos.name
      };
    });

    saveLineup(lineup);
    return lineup;
  }

  root.LineupManager = {
    DEFAULT_POSITIONS_8V8: DEFAULT_POSITIONS_8V8,
    getRoster: getRoster,
    getLineup: getLineup,
    saveLineup: saveLineup,
    assignPlayer: assignPlayer,
    getPlayerForPos: getPlayerForPos,
    rotateLineup: rotateLineup,
    applySquadPreset: applySquadPreset
  };
})(typeof window !== "undefined" ? window : globalThis);
