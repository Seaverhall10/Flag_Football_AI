/**
 * Team Manager & Multi-Sport Workspace Orchestrator
 * Supports switching between teams/sports, persistent storage per team, and
 * a non-destructive migration from the former Lions default to Seahawks.
 */
(function (root) {
  "use strict";

  var ACTIVE_TEAM_KEY = "coach_active_team_id";
  var TEAMS_META_KEY = "coach_teams_index";
  var DEFAULT_TEAM_ID = "seahawks-youth-flag";
  var LEGACY_TEAM_ID = "lions-k1-flag";

  var DEFAULT_SEAHAWKS_TEAM = {
    id: DEFAULT_TEAM_ID,
    name: "Seahawks",
    shortName: "Seahawks",
    sportId: "flag-football-8v8",
    division: "Ages 5–6 Flag Football",
    logoColor: "#69be28",
    createdAt: "2026-09-01T00:00:00.000Z",
    isDefault: true
  };

  function migrateFormerDefault(teams) {
    var changed = false;
    var migrated = teams.map(function (team) {
      if (!team || team.id !== LEGACY_TEAM_ID) return team;
      changed = true;
      return Object.assign({}, team, DEFAULT_SEAHAWKS_TEAM, {
        createdAt: team.createdAt || DEFAULT_SEAHAWKS_TEAM.createdAt,
        migratedFrom: LEGACY_TEAM_ID
      });
    });

    var seen = {};
    migrated = migrated.filter(function (team) {
      if (!team || seen[team.id]) {
        changed = true;
        return false;
      }
      seen[team.id] = true;
      return true;
    });

    if (localStorage.getItem(ACTIVE_TEAM_KEY) === LEGACY_TEAM_ID) {
      localStorage.setItem(ACTIVE_TEAM_KEY, DEFAULT_TEAM_ID);
      changed = true;
    }
    return { teams: migrated, changed: changed };
  }

  function getTeams() {
    var stored = localStorage.getItem(TEAMS_META_KEY);
    if (!stored) {
      var initial = [DEFAULT_SEAHAWKS_TEAM];
      localStorage.setItem(TEAMS_META_KEY, JSON.stringify(initial));
      return initial;
    }
    try {
      var parsed = JSON.parse(stored);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        parsed = [DEFAULT_SEAHAWKS_TEAM];
        localStorage.setItem(TEAMS_META_KEY, JSON.stringify(parsed));
      }
      var migration = migrateFormerDefault(parsed);
      parsed = migration.teams;
      if (migration.changed) localStorage.setItem(TEAMS_META_KEY, JSON.stringify(parsed));
      return parsed;
    } catch (e) {
      return [DEFAULT_SEAHAWKS_TEAM];
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
    // Keep the former browser keys as an internal compatibility layer so the
    // owner's existing local data survives the team-name migration.
    if (teamId === DEFAULT_TEAM_ID || teamId === LEGACY_TEAM_ID) {
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
    getTeamStorageKey: getTeamStorageKey,
    getDefaultTeamId: function () { return DEFAULT_TEAM_ID; }
  };
})(typeof window !== "undefined" ? window : globalThis);
