/** Secure invitation email is disabled until server-backed membership exists. */
(function (root) {
  "use strict";

  var MESSAGE = "Secure invitation email delivery is not available yet.";

  function buildEmailHtml() { return ""; }
  async function sendAutomatedInvite() { throw new Error(MESSAGE); }

  root.EmailService = {
    buildEmailHtml: buildEmailHtml,
    sendAutomatedInvite: sendAutomatedInvite,
    isAvailable: function () { return false; },
    unavailableMessage: MESSAGE
  };
})(typeof window !== "undefined" ? window : globalThis);
