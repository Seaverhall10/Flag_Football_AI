/**
 * Team invitation boundary.
 * Secure invitations stay disabled until Firebase Auth, membership storage,
 * and server-enforced invitation rules are configured and verified.
 */
(function (root) {
  "use strict";

  var UNAVAILABLE_MESSAGE = "Secure team invitations are not available yet.";

  function isAvailable() { return false; }

  function generateInviteLink(opts) {
    return "";
  }

  function shareViaSms(opts) {
    alert(UNAVAILABLE_MESSAGE);
    return false;
  }

  function shareViaEmail(opts) {
    alert(UNAVAILABLE_MESSAGE);
    return false;
  }

  function checkIncomingInvite() {
    return null;
  }

  root.InviteManager = {
    generateInviteLink: generateInviteLink,
    shareViaSms: shareViaSms,
    shareViaEmail: shareViaEmail,
    checkIncomingInvite: checkIncomingInvite,
    isAvailable: isAvailable,
    unavailableMessage: UNAVAILABLE_MESSAGE
  };
})(typeof window !== "undefined" ? window : globalThis);
