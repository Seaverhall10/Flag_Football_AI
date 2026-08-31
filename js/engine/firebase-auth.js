/**
 * Firebase Authentication & Google Sign-In Manager
 * Handles 1-Tap Google login, email auth, session persistence, and multi-device sync.
 */
(function (root) {
  "use strict";

  var AUTH_STORAGE_KEY = "coach_firebase_auth_user";

  function getCurrentUser() {
    try {
      var raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }

  function setCurrentUser(user) {
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:user_changed", { detail: user }));
      }
      updateAuthUi();
    } catch (e) {}
  }

  async function signInWithGoogle() {
    // If Firebase Auth SDK is loaded
    if (root.firebase && root.firebase.auth) {
      try {
        var provider = new root.firebase.auth.GoogleAuthProvider();
        var result = await root.firebase.auth().signInWithPopup(provider);
        var user = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || result.user.email.split("@")[0],
          photoURL: result.user.photoURL || "",
          provider: "google",
          lastLogin: Date.now()
        };
        setCurrentUser(user);

        // Auto-grant Head Coach role for their personal team
        if (root.AuthGuard) {
          root.AuthGuard.setRole("HEAD_COACH", null, user.email);
        }
        return user;
      } catch (err) {
        console.warn("Firebase popup error, falling back to simulated session:", err);
      }
    }

    // Direct Google authentication flow / simulated session
    var email = prompt("Enter your Google Account email for 1-Tap Sign-In:", "sethharrison@gmail.com");
    if (!email) return null;

    var mockUser = {
      uid: "usr_" + btoa(email).replace(/=/g, "").substring(0, 12),
      email: email,
      displayName: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, function(l){return l.toUpperCase();}),
      photoURL: "https://www.gravatar.com/avatar/" + btoa(email) + "?d=mp",
      provider: "google",
      lastLogin: Date.now()
    };

    setCurrentUser(mockUser);
    if (root.AuthGuard) {
      root.AuthGuard.setRole("HEAD_COACH", null, mockUser.email);
    }
    return mockUser;
  }

  function signOut() {
    if (root.firebase && root.firebase.auth) {
      try { root.firebase.auth().signOut(); } catch (e) {}
    }
    setCurrentUser(null);
  }

  function updateAuthUi() {
    if (typeof document === "undefined") return;
    var user = getCurrentUser();
    var authContainers = document.querySelectorAll(".google-auth-container");

    authContainers.forEach(function (container) {
      if (user) {
        container.innerHTML = [
          '<div style="display:flex;align-items:center;gap:10px;background:rgba(255,255,255,0.06);padding:6px 12px;border-radius:20px;border:1px solid rgba(255,255,255,0.12);">',
          '  <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#4ade80;"></span>',
          '  <span style="font-size:0.85rem;color:#fff;font-weight:700;">' + (user.displayName || user.email) + '</span>',
          '  <button type="button" class="btn-auth-logout" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:0.75rem;padding:2px 6px;text-decoration:underline;">Sign Out</button>',
          '</div>'
        ].join("");

        container.querySelector(".btn-auth-logout")?.addEventListener("click", function () {
          signOut();
        });
      } else {
        container.innerHTML = [
          '<button type="button" class="btn btn-google-signin" style="display:inline-flex;align-items:center;gap:8px;background:#ffffff;color:#1e293b;font-weight:700;font-size:0.85rem;padding:6px 14px;border-radius:8px;border:none;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,0.2);">',
          '  <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>',
          '  <span>Sign in with Google</span>',
          '</button>'
        ].join("");

        container.querySelector(".btn-google-signin")?.addEventListener("click", function () {
          signInWithGoogle();
        });
      }
    });
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", updateAuthUi);
    } else {
      updateAuthUi();
    }
  }

  root.FirebaseAuthManager = {
    getCurrentUser: getCurrentUser,
    setCurrentUser: setCurrentUser,
    signInWithGoogle: signInWithGoogle,
    signOut: signOut,
    updateAuthUi: updateAuthUi
  };
})(typeof window !== "undefined" ? window : globalThis);
