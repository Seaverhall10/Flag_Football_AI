/**
 * Cy-Fair K/1 Lions — chrome + play-caller helpers
 */
(function () {
  const TABS = [
    { href: "schedule.html", label: "Schedule" },
    { href: "playbook.html", label: "Playbook" },
    { href: "roster.html", label: "Roster" },
    { href: "drills.html", label: "Drills" },
    { href: "notes.html", label: "Notes" }
  ];

  function currentPage() {
    const file = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    return file === "" ? "index.html" : file;
  }

  function navHtml(page) {
    return TABS.map((t) => {
      const active = page === t.href ? " active" : "";
      return `<a href="${t.href}" class="${active.trim()}">${t.label}</a>`;
    }).join("");
  }

  function ensureChrome() {
    const page = currentPage();
    let mast = document.querySelector("header.mast");
    if (!mast) {
      mast = document.createElement("header");
      mast.className = "mast";
      const skip = document.querySelector(".skip-link");
      document.body.insertBefore(mast, skip && skip.nextSibling ? skip.nextSibling : document.body.firstChild);
    }
    mast.innerHTML = `
      <div class="mast-inner">
        <a href="index.html" class="brand-group">
          <div class="brand-text">
            <h1>LIONS</h1>
          </div>
          <span class="brand-kicker">K/1</span>
        </a>
        <nav class="nav" aria-label="Coach navigation">${navHtml(page)}</nav>
      </div>`;

    let tabbar = document.querySelector("nav.tabbar");
    if (!tabbar) {
      tabbar = document.createElement("nav");
      tabbar.className = "tabbar";
      tabbar.setAttribute("aria-label", "Primary");
      document.body.appendChild(tabbar);
    }
    tabbar.innerHTML = navHtml(page);
  }

  document.addEventListener("DOMContentLoaded", () => {
    ensureChrome();

    const callDisplay = document.getElementById("call");
    const callSub = document.getElementById("call-sub");
    const playButtons = document.querySelectorAll(".play-btn");

    if (callDisplay && playButtons.length > 0) {
      playButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          const callName = btn.getAttribute("data-name");
          const callSymbol = btn.getAttribute("data-symbol");
          const callHole = btn.getAttribute("data-hole");
          const callColor = btn.getAttribute("data-color");
          if (window.sfx) window.sfx.playCadence();
          callDisplay.innerHTML = `<span style="color:${callColor}">${callName}</span>`;
          if (callSub) callSub.textContent = `${callSymbol} · ${callHole}`;
          playButtons.forEach((b) => { b.style.outline = "none"; });
          btn.style.outline = `3px solid ${callColor || "var(--gold)"}`;
        });
      });
    }

    const checkboxes = document.querySelectorAll(".checklist-item input[type='checkbox']");
    if (checkboxes.length > 0) {
      const savedState = JSON.parse(localStorage.getItem("lions_checklist_state") || "{}");
      checkboxes.forEach((cb, idx) => {
        const key = `item_${idx}`;
        if (savedState[key] !== undefined) cb.checked = savedState[key];
        cb.addEventListener("change", () => {
          savedState[key] = cb.checked;
          localStorage.setItem("lions_checklist_state", JSON.stringify(savedState));
        });
      });
    }
  });
})();
