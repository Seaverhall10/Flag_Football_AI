/**
 * Auth & Role-Based Access Control (RBAC) Guard
 * Manages user tiers: HEAD_COACH, ASSISTANT_COACH, PARENT_PLAYER.
 */
(function (root) {
  "use strict";

  var ROLE_STORAGE_KEY = "coach_active_user_session";

  var ROLES = {
    HEAD_COACH: "HEAD_COACH",
    ASSISTANT_COACH: "ASSISTANT_COACH",
    PARENT_PLAYER: "PARENT_PLAYER"
  };

  var PERMISSION_MAP = {
    HEAD_COACH: [
      "manage_playbook", "edit_plays", "delete_plays", "ai_ingest",
      "manage_roster", "manage_staff", "manage_settings",
      "call_plays", "run_drills", "view_plays", "rotate_lineup",
      "log_tracker", "view_notes", "edit_notes", "view_schedule"
    ],
    ASSISTANT_COACH: [
      "call_plays", "run_drills", "view_plays", "rotate_lineup",
      "log_tracker", "view_notes", "edit_notes", "view_schedule"
    ],
    PARENT_PLAYER: [
      "view_plays", "view_drills", "view_schedule"
    ]
  };

  function getSession() {
    try {
      var raw = localStorage.getItem(ROLE_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    // Local demo capability only. This controls UI visibility and is not a
    // security boundary; production roles require verified Firebase claims.
    return {
      role: ROLES.HEAD_COACH,
      email: "",
      teamId: (root.TeamManager && root.TeamManager.getActiveTeamId()) || "seahawks-youth-flag",
      isLocalDemo: true
    };
  }

  function setSession(sessionData) {
    try {
      localStorage.setItem(ROLE_STORAGE_KEY, JSON.stringify(sessionData));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:changed", { detail: sessionData }));
      }
      applyUiGuards();
    } catch (e) {}
  }

  function getRole() {
    return getSession().role || ROLES.HEAD_COACH;
  }

  function setRole(role, teamId, email) {
    var validRole = ROLES[role.toUpperCase()] || ROLES.HEAD_COACH;
    var current = getSession();
    setSession({
      role: validRole,
      teamId: teamId || current.teamId || "seahawks-youth-flag",
      email: email || current.email || ""
    });
  }

  function can(permission) {
    var role = getRole();
    var allowed = PERMISSION_MAP[role] || [];
    return allowed.indexOf(permission) !== -1;
  }

  function isHeadCoach() { return getRole() === ROLES.HEAD_COACH; }
  function isAssistantCoach() { return getRole() === ROLES.ASSISTANT_COACH; }
  function isParentOrPlayer() { return getRole() === ROLES.PARENT_PLAYER; }

  function applyUiGuards() {
    if (typeof document === "undefined") return;
    var role = getRole();

    // Guard elements with data-role-min="HEAD_COACH"
    document.querySelectorAll('[data-role-min="HEAD_COACH"]').forEach(function (el) {
      el.style.display = isHeadCoach() ? "" : "none";
    });

    // Guard elements with data-role-min="ASSISTANT_COACH"
    document.querySelectorAll('[data-role-min="ASSISTANT_COACH"]').forEach(function (el) {
      el.style.display = isParentOrPlayer() ? "none" : "";
    });

    // Guard elements with data-permission-req="..."
    document.querySelectorAll("[data-permission-req]").forEach(function (el) {
      var req = el.getAttribute("data-permission-req");
      el.style.display = can(req) ? "" : "none";
    });

    // Toggle body classes for global CSS styling
    document.body.classList.toggle("role-head-coach", isHeadCoach());
    document.body.classList.toggle("role-assistant-coach", isAssistantCoach());
    document.body.classList.toggle("role-parent-player", isParentOrPlayer());
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", applyUiGuards);
    } else {
      applyUiGuards();
    }
  }

  root.AuthGuard = {
    ROLES: ROLES,
    getSession: getSession,
    setSession: setSession,
    getRole: getRole,
    setRole: setRole,
    can: can,
    isHeadCoach: isHeadCoach,
    isAssistantCoach: isAssistantCoach,
    isParentOrPlayer: isParentOrPlayer,
    applyUiGuards: applyUiGuards
  };
})(typeof window !== "undefined" ? window : globalThis);
