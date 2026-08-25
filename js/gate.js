(function () {
  var STORAGE_KEY = "lions-site-gate-v1";
  var TEAM_PASS = "Lions2026";
  var root = document.documentElement;

  function isOpen() {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch (err) {
      return false;
    }
  }

  function rememberOpen() {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch (err) {}
  }

  var style = document.createElement("style");
  style.textContent = [
    "html.is-locked { background:#0A1628; }",
    "html.is-locked body { background:#0A1628; margin:0; }",
    "html.is-locked body > *:not(#lions-gate) { visibility:hidden !important; }",
    "html.is-locked #lions-gate { visibility:visible; position:fixed; inset:0; z-index:99999; }",
    "#lions-gate { display:flex; align-items:center; justify-content:center; box-sizing:border-box; padding:24px 16px; background:#0A1628; color:#f4f6f8; font-family:system-ui,-apple-system,Segoe UI,sans-serif; }",
    "#lions-gate .lg-box { width:min(360px,100%); text-align:center; }",
    "#lions-gate .lg-mark { width:72px; height:72px; margin:0 auto 14px; }",
    "#lions-gate .lg-mark svg { width:72px; height:72px; display:block; }",
    "#lions-gate h1 { margin:0 0 18px; font-size:1.45rem; font-weight:800; letter-spacing:.02em; color:#D4A017; }",
    "#lions-gate form { display:flex; flex-direction:column; gap:12px; }",
    "#lions-gate input[type=password] { width:100%; box-sizing:border-box; min-height:52px; padding:12px 14px; border:2px solid #D4A017; border-radius:10px; background:#15263c; color:#f4f6f8; font-size:1.1rem; text-align:center; }",
    "#lions-gate input[type=password]:focus { outline:3px solid #e8b423; outline-offset:2px; }",
    "#lions-gate button { min-height:52px; border:0; border-radius:10px; background:#D4A017; color:#071018; font-size:1.15rem; font-weight:800; letter-spacing:.08em; cursor:pointer; }",
    "#lions-gate button:focus { outline:3px solid #e8b423; outline-offset:2px; }",
    "#lions-gate .lg-msg { min-height:1.3em; margin:8px 0 0; color:#ffb4b4; font-size:.95rem; font-weight:700; }",
    "#lions-gate.is-wrong .lg-box { animation:lg-shake .4s ease; }",
    "@keyframes lg-shake { 0%,100%{ transform:translateX(0); } 20%{ transform:translateX(-10px); } 40%{ transform:translateX(10px); } 60%{ transform:translateX(-7px); } 80%{ transform:translateX(7px); } }"
  ].join("\n");
  (document.head || root).appendChild(style);

  if (isOpen()) return;

  root.classList.add("is-locked");

  function openSite(panel) {
    rememberOpen();
    root.classList.remove("is-locked");
    if (panel && panel.parentNode) panel.parentNode.removeChild(panel);
  }

  function showPanel() {
    if (document.getElementById("lions-gate") || isOpen()) return;
    var panel = document.createElement("div");
    panel.id = "lions-gate";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "lions-gate-title");
    panel.innerHTML =
      '<div class="lg-box">' +
        '<div class="lg-mark" aria-hidden="true">' +
          '<svg viewBox="0 0 36 36" fill="#D4A017">' +
            '<path d="M18 3 C13 3 9 6 8 11 C7 15 9 18 9 20 C7 20 5 22 5 25 C5 29 9 32 14 32 C15 32 16 34 18 34 C20 34 21 32 22 32 C27 32 31 29 31 25 C31 22 29 20 27 20 C27 18 29 15 28 11 C27 6 23 3 18 3 Z M13 15 C14.1 15 15 15.9 15 17 C15 18.1 14.1 19 13 19 C11.9 19 11 18.1 11 17 C11 15.9 11.9 15 13 15 Z M23 15 C24.1 15 25 15.9 25 17 C25 18.1 24.1 19 23 19 C21.9 19 21 18.1 21 17 C21 15.9 21.9 15 23 15 Z M18 26 C15.5 26 14 24.5 14 23.5 L22 23.5 C22 24.5 20.5 26 18 26 Z"/>' +
          "</svg>" +
        "</div>" +
        '<h1 id="lions-gate-title">Cy-Fair K/1 Lions</h1>' +
        "<form>" +
          '<input type="password" name="team" autocomplete="current-password" placeholder="Password" aria-label="Password">' +
          '<button type="submit">GO</button>' +
        "</form>" +
        '<p class="lg-msg" aria-live="polite"></p>' +
      "</div>";
    document.body.appendChild(panel);

    var form = panel.querySelector("form");
    var input = panel.querySelector("input");
    var msg = panel.querySelector(".lg-msg");

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (input.value === TEAM_PASS) {
        openSite(panel);
        return;
      }
      msg.textContent = "Try again";
      panel.classList.remove("is-wrong");
      void panel.offsetWidth;
      panel.classList.add("is-wrong");
      input.value = "";
      input.focus();
    });

    input.focus();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showPanel);
  } else {
    showPanel();
  }
})();
