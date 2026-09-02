/**
 * Custom Playbook Manager
 * Supports isolated custom playbooks per team, generic starter plays for new teams, and full Lions playbook preservation.
 */
(function (root) {
  "use strict";

  function getActiveTeamId() {
    return (root.TeamManager && root.TeamManager.getActiveTeamId()) || "lions-k1-flag";
  }

  function getTeamStorageKey(teamId) {
    teamId = teamId || getActiveTeamId();
    if (teamId === "lions-k1-flag") {
      return "lions_custom_plays";
    }
    return "team_" + teamId + "_custom_plays";
  }

  function getTeamPlays(teamId) {
    teamId = teamId || getActiveTeamId();
    // Lions K/1 team always loads the governed 14-play authority
    if (teamId === "lions-k1-flag") {
      return root.LIONS_PLAYS || [];
    }

    var key = getTeamStorageKey(teamId);
    var stored = localStorage.getItem(key);
    if (stored) {
      try {
        var parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }

    // Default to the 6 generic starter plays for any new team
    var starter = root.GENERIC_STARTER_PLAYS || [];
    var initial = JSON.parse(JSON.stringify(starter));
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }

  function saveTeamPlays(teamId, plays) {
    teamId = teamId || getActiveTeamId();
    if (teamId === "lions-k1-flag") return; // Keep Lions locked
    var key = getTeamStorageKey(teamId);
    localStorage.setItem(key, JSON.stringify(plays));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("playbook:changed", { detail: { teamId: teamId, plays: plays } }));
    }
  }

  function addPlay(playObj) {
    var plays = getTeamPlays();
    var newId = "custom-" + Date.now();
    var newPlay = Object.assign({}, playObj, { id: newId });
    plays.push(newPlay);
    saveTeamPlays(null, plays);
    return newPlay;
  }

  function deletePlay(playId) {
    var plays = getTeamPlays();
    plays = plays.filter(function (p) { return p.id !== playId; });
    saveTeamPlays(null, plays);
    return plays;
  }

  function clearExamplePlays() {
    saveTeamPlays(null, []);
    return [];
  }

  function resetToStarter() {
    var starter = root.GENERIC_STARTER_PLAYS || [];
    var fresh = JSON.parse(JSON.stringify(starter));
    saveTeamPlays(null, fresh);
    return fresh;
  }

  root.CustomPlaybook = {
    getTeamPlays: getTeamPlays,
    saveTeamPlays: saveTeamPlays,
    addPlay: addPlay,
    deletePlay: deletePlay,
    clearExamplePlays: clearExamplePlays,
    resetToStarter: resetToStarter
  };
})(typeof window !== "undefined" ? window : globalThis);
