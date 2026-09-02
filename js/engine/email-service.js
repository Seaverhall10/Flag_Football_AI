/**
 * Invitation email boundary.
 * Network delivery stays disabled until secure invitations and an approved
 * email service have passed privacy review.
 */
(function (root) {
  "use strict";

  function buildEmailHtml(opts) {
    var teamName = opts.teamName || "Your Team";
    var roleTitle = opts.roleTitle || "Coach";
    var inviteUrl = opts.inviteUrl || "https://coach-ai-assist.web.app/invite.html";

    return [
      '<!DOCTYPE html>',
      '<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>',
      '<body style="margin:0;padding:24px;background-color:#050d18;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif;color:#f8fafc;">',
      '<div style="max-width:580px;margin:0 auto;background:#0d1f35;border:1px solid #1e3a5f;border-radius:14px;padding:32px 24px;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,0.4);">',
      '  <div style="display:inline-block;padding:8px 16px;background:rgba(246,195,68,0.15);border:1px solid #f6c344;border-radius:20px;color:#f6c344;font-size:13px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:16px;">Coach AI Assist</div>',
      '  <h1 style="color:#ffffff;font-size:24px;font-weight:800;margin:0 0 12px;">You\'ve been invited to join the ' + teamName + '!</h1>',
      '  <p style="color:#cbd5e1;font-size:16px;line-height:1.6;margin:0 0 24px;">You have been granted <strong style="color:#f6c344;">' + roleTitle + '</strong> access to the private team playbook, animated drills, live sideline caller, and practice tools.</p>',
      '  <div style="margin:28px 0;">',
      '    <a href="' + inviteUrl + '" style="background:#f6c344;color:#071018;padding:16px 32px;border-radius:10px;font-size:16px;font-weight:800;text-decoration:none;display:inline-block;box-shadow:0 4px 14px rgba(246,195,68,0.35);">Open Team Workspace ➔</a>',
      '  </div>',
      '  <p style="color:#94a3b8;font-size:13px;line-height:1.5;margin:24px 0 0;padding-top:20px;border-top:1px solid #1e3a5f;">Works on any phone, tablet, or desktop browser. No app store installation required.<br><span style="word-break:break-all;font-size:12px;color:#64748b;">' + inviteUrl + '</span></p>',
      '</div>',
      '</body></html>'
    ].join("\n");
  }

  async function sendAutomatedInvite(opts) {
    throw new Error("Secure invitation email delivery is not available yet.");
  }

  root.EmailService = {
    sendAutomatedInvite: sendAutomatedInvite,
    buildEmailHtml: buildEmailHtml
  };
})(typeof window !== "undefined" ? window : globalThis);
