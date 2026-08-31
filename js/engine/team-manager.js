/**
 * Team Manager & Multi-Sport Workspace Orchestrator
 * Supports switching between teams/sports, persistent storage per team, and seamless migration of existing Lions data.
 */
(function (root) {
  "use strict";

  var ACTIVE_TEAM_KEY = "coach_active_team_id";
  var TEAMS_META_KEY = "coach_teams_index";

  var DEFAULT_LIONS_TEAM = {
    id: "lions-k1-flag",
    name: "Cy-Fair K/1 Lions",
    shortName: "Lions",
    sportId: "flag-football-8v8",
    division: "K/1 Flag Football",
    logoColor: "#f59e0b",
    createdAt: "2026-08-25T00:00:00.000Z",
    isDefault: true
  };

  function getTeams() {
    var stored = localStorage.getItem(TEAMS_META_KEY);
    if (!stored) {
      var initial = [DEFAULT_LIONS_TEAM];
      localStorage.setItem(TEAMS_META_KEY, JSON.stringify(initial));
      return initial;
    }
    try {
      var parsed = JSON.parse(stored);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        parsed = [DEFAULT_LIONS_TEAM];
        localStorage.setItem(TEAMS_META_KEY, JSON.stringify(parsed));
      }
      return parsed;
    } catch (e) {
      return [DEFAULT_LIONS_TEAM];
    }
  }

  function saveTeams(teams) {
    localStorage.setItem(TEAMS_META_KEY, JSON.stringify(teams));
  }

  function getActiveTeamId() {
    var id = localStorage.getItem(ACTIVE_TEAM_KEY);
    var teams = getTeams();
    if (!id || !teams.some(function (t) { return t.id === id; })) {
      id = teams[0].id;
      localStorage.setItem(ACTIVE_TEAM_KEY, id);
    }
    return id;
  }

  function getActiveTeam() {
    var activeId = getActiveTeamId();
    var teams = getTeams();
    return teams.find(function (t) { return t.id === activeId; }) || teams[0];
  }

  function setActiveTeam(teamId) {
    var teams = getTeams();
    var found = teams.find(function (t) { return t.id === teamId; });
    if (found) {
      localStorage.setItem(ACTIVE_TEAM_KEY, teamId);
      window.dispatchEvent(new CustomEvent("team:changed", { detail: found }));
      return true;
    }
    return false;
  }

  function createTeam(teamData) {
    var teams = getTeams();
    var newId = "team-" + Date.now();
    var newTeam = {
      id: newId,
      name: teamData.name || "New Team",
      shortName: teamData.shortName || teamData.name || "Team",
      sportId: teamData.sportId || "flag-football-8v8",
      division: teamData.division || "Youth Rec",
      logoColor: teamData.logoColor || "#3b82f6",
      createdAt: new Date().toISOString()
    };
    teams.push(newTeam);
    saveTeams(teams);
    setActiveTeam(newId);
    return newTeam;
  }

  function deleteTeam(teamId) {
    var teams = getTeams();
    if (teams.length <= 1) {
      alert("Cannot delete the only team.");
      return false;
    }
    teams = teams.filter(function (t) { return t.id !== teamId; });
    saveTeams(teams);
    if (getActiveTeamId() === teamId) {
      setActiveTeam(teams[0].id);
    }
    return true;
  }

  function getTeamStorageKey(teamId, subKey) {
    teamId = teamId || getActiveTeamId();
    // For default Lions team, preserve existing keys for 100% backward compatibility
    if (teamId === "lions-k1-flag") {
      if (subKey === "roster") return "lions_team_roster_data";
      if (subKey === "notes") return "lions_coach_scratchpad_notes";
      if (subKey === "tracker") return "lions_flag_rep_tracker_data";
      if (subKey === "carries") return "lions_player_carries";
      if (subKey === "schedule") return "lions_season_schedule";
      if (subKey === "plays") return "lions_custom_plays";
    }
    return "team_" + teamId + "_" + subKey;
  }

  root.TeamManager = {
    getTeams: getTeams,
    getActiveTeam: getActiveTeam,
    getActiveTeamId: getActiveTeamId,
    setActiveTeam: setActiveTeam,
    createTeam: createTeam,
    deleteTeam: deleteTeam,
    getTeamStorageKey: getTeamStorageKey
  };
})(typeof window !== "undefined" ? window : globalThis);
