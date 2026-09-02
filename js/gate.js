(function () {
  var STORAGE_KEY = "lions-site-gate-v1";
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
    "#lions-gate .lg-mark { width:72px; height:72px; margin:0 auto 14px; border-radius:20px; display:grid; place-items:center; background:#69be28; color:#00111f; font-size:2rem; font-weight:950; box-shadow:0 0 0 4px rgba(105,190,40,.18); }",
    "#lions-gate h1 { margin:0 0 18px; font-size:1.45rem; font-weight:800; letter-spacing:.02em; color:#69be28; }",
    "#lions-gate .lg-note { margin:0; color:#c5ccd6; line-height:1.5; }",
    "#lions-gate form { display:flex; flex-direction:column; gap:12px; }",
    "#lions-gate button { min-height:52px; border:0; border-radius:10px; background:#69be28; color:#00111f; font-size:1.15rem; font-weight:800; letter-spacing:.08em; cursor:pointer; }",
    "#lions-gate button:focus { outline:3px solid #8eea4c; outline-offset:2px; }",
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

  function getGateTitle() {
    try {
      var activeId = localStorage.getItem("coach_active_team_id");
      var indexRaw = localStorage.getItem("coach_teams_index");
      if (indexRaw && activeId) {
        var teams = JSON.parse(indexRaw);
        var active = teams.find(function (t) { return t.id === activeId; });
        if (active && active.name) return active.name;
      }
    } catch (e) {}
    return "Seahawks Coach";
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
        '<div class="lg-mark" aria-hidden="true">S</div>' +
        '<h1 id="lions-gate-title">' + getGateTitle() + '</h1>' +
        "<form>" +
          '<p class="lg-note">Public demo. Team data stays on this device. Secure accounts and private invitations are not enabled yet.</p>' +
          '<button type="submit">OPEN DEMO</button>' +
        "</form>" +
      "</div>";
    document.body.appendChild(panel);

    var form = panel.querySelector("form");

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      openSite(panel);
    });
    form.querySelector("button").focus();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showPanel);
  } else {
    showPanel();
  }
})();
