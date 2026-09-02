/**
 * Custom Playbook Manager
 * Supports isolated custom playbooks per team and generic example plays for new
 * teams, and preservation of the current Seahawks seed play library.
 */
(function (root) {
  "use strict";

  function getActiveTeamId() {
    return (root.TeamManager && root.TeamManager.getActiveTeamId()) || "seahawks-youth-flag";
  }

  function getTeamStorageKey(teamId) {
    teamId = teamId || getActiveTeamId();
    if (teamId === "seahawks-youth-flag" || teamId === "lions-k1-flag") {
      return "lions_custom_plays";
    }
    return "team_" + teamId + "_custom_plays";
  }

  function getTeamPlays(teamId) {
    teamId = teamId || getActiveTeamId();
    // The primary Seahawks workspace carries forward the 14 owner-provided
    // sheets until its replacement playbook is explicitly approved.
    if (teamId === "seahawks-youth-flag" || teamId === "lions-k1-flag") {
      return root.SEAHAWKS_PLAYS || root.COACH_PLAYS || root.LIONS_PLAYS || [];
    }

    var key = getTeamStorageKey(teamId);
    var stored = localStorage.getItem(key);
    if (stored) {
      try {
        var parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }

    // Default to the 6 generic example plays for any new local workspace.
    var examples = root.GENERIC_EXAMPLE_PLAYS || [];
    var initial = JSON.parse(JSON.stringify(examples));
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }

  function saveTeamPlays(teamId, plays) {
    teamId = teamId || getActiveTeamId();
    if (teamId === "seahawks-youth-flag" || teamId === "lions-k1-flag") return;
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

  function resetToExamples() {
    var examples = root.GENERIC_EXAMPLE_PLAYS || [];
    var fresh = JSON.parse(JSON.stringify(examples));
    saveTeamPlays(null, fresh);
    return fresh;
  }

  root.CustomPlaybook = {
    getTeamPlays: getTeamPlays,
    saveTeamPlays: saveTeamPlays,
    addPlay: addPlay,
    deletePlay: deletePlay,
    clearExamplePlays: clearExamplePlays,
    resetToExamples: resetToExamples
  };
})(typeof window !== "undefined" ? window : globalThis);
