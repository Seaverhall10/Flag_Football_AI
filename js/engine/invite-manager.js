/**
 * Coach Invite & Secure Team Onboarding Manager
 * Generates secure invite links, SMS/Email sharing, and processes incoming coach registrations.
 */
(function (root) {
  "use strict";

  function generateInviteLink(opts) {
    opts = opts || {};
    var baseUrl = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, "/");
    var team = (root.TeamManager && root.TeamManager.getActiveTeam()) || { id: "new-team", name: "My Team", sportId: "flag-football-5v5" };
    
    var teamName = encodeURIComponent(opts.teamName || team.name || "New Team");
    var sportId = encodeURIComponent(opts.sportId || team.sportId || "flag-football-5v5");
    var email = encodeURIComponent(opts.email || "seaverhall@gmail.com");
    var role = encodeURIComponent(opts.role || "coach");
    var token = "inv_" + Date.now().toString(36);

    return baseUrl + "invite.html?join=" + token + "&team=" + teamName + "&sport=" + sportId + "&email=" + email + "&role=" + role;
  }

  function shareViaSms(opts) {
    var link = generateInviteLink(opts);
    var teamName = opts.teamName || "the team";
    var text = encodeURIComponent("Hey Coach! Here is your private coaching link for " + teamName + " plays, drills, and roster on Coach AI Assist: " + link);
    window.open("sms:?body=" + text, "_blank");
  }

  function shareViaEmail(opts) {
    var link = generateInviteLink(opts);
    var email = opts.email || "sethharrison@gmail.com";
    var teamName = opts.teamName || "Seahawks";
    var subject = encodeURIComponent("🏈 Coaching App Access for " + teamName);
    var body = encodeURIComponent("Hey Coach,\n\nHere is your private link to access the " + teamName + " playbook, animated 5v4 practice drills, and lineup tools on Coach AI Assist:\n\n" + link + "\n\nTap the link above on your phone or computer to open your team workspace.\n\nSee you on the field!");
    window.location.href = "mailto:" + email + "?subject=" + subject + "&body=" + body;
  }

  function checkIncomingInvite() {
    if (typeof window === "undefined") return null;
    var params = new URLSearchParams(window.location.search);
    var token = params.get("join");
    if (!token) return null;

    var teamName = params.get("team") || "New Team";
    var sportId = params.get("sport") || "flag-football-5v5";
    var email = params.get("email") || "";
    var role = params.get("role") || "coach";

    // Auto-create and switch to this team if not already present
    if (root.TeamManager) {
      var teams = root.TeamManager.getTeams();
      var existing = teams.find(function (t) { return t.name.toLowerCase() === teamName.toLowerCase(); });
      if (!existing) {
        existing = root.TeamManager.createTeam({
          name: teamName,
          sportId: sportId,
          division: "Coached by " + (email ? email.split("@")[0] : "Coach")
        });
      } else {
        root.TeamManager.setActiveTeam(existing.id);
      }
    }

    // Unlock session gate and set role
    try {
      sessionStorage.setItem("lions-site-gate-v1", "1");
      if (root.AuthGuard) {
        root.AuthGuard.setRole(role, existing ? existing.id : "new-team", email);
      }
    } catch (e) {}

    return { token: token, teamName: teamName, sportId: sportId, email: email, role: role };
  }

  root.InviteManager = {
    generateInviteLink: generateInviteLink,
    shareViaSms: shareViaSms,
    shareViaEmail: shareViaEmail,
    checkIncomingInvite: checkIncomingInvite
  };
})(typeof window !== "undefined" ? window : globalThis);
