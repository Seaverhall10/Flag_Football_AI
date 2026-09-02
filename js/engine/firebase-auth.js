/**
 * Authentication boundary for the public demo.
 * This file exposes status only. It does not create, cache, or authorize users.
 */
(function (root) {
  "use strict";

  var MESSAGE = "Secure sign-in setup is pending Firebase owner access.";

  function isReady() { return false; }
  function getCurrentUser() { return null; }
  function setCurrentUser() { return false; }
  async function signInWithGoogle() { return null; }
  function signOut() { return false; }

  function updateAuthUi() {
    if (typeof document === "undefined") return;
    document.querySelectorAll(".google-auth-container").forEach(function (container) {
      container.innerHTML = '<p class="tiny" role="status">' + MESSAGE + '</p>';
    });
  }

  root.FirebaseAuthManager = {
    getCurrentUser: getCurrentUser,
    setCurrentUser: setCurrentUser,
    signInWithGoogle: signInWithGoogle,
    signOut: signOut,
    updateAuthUi: updateAuthUi,
    isReady: isReady,
    unavailableMessage: MESSAGE
  };
})(typeof window !== "undefined" ? window : globalThis);
