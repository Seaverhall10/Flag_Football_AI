/**
 * Seahawks Coach — Core Application Utilities
 * Features: 1-Tap GPS Field navigation, .ics Calendar generator, JSON Team Data Backup/Restore, checklist sync.
 */

document.addEventListener("DOMContentLoaded", () => {
  // One quiet app shell on every screen. Secondary tools live under Coach.
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const pageNames = {
    "index.html": "Home",
    "playbook.html": "Plays",
    "drills.html": "Drill",
    "app.html": "Coach",
    "notes.html": "Coach Notes",
    "roster.html": "Roster",
    "tracker.html": "Rep Tracker"
  };
  const primaryLinks = [
    { href: "index.html", label: "Home", pages: ["index.html"] },
    { href: "playbook.html", label: "Plays", pages: ["playbook.html"] },
    { href: "drills.html", label: "Drill", pages: ["drills.html"] },
    { href: "app.html", label: "Coach", pages: ["app.html", "notes.html", "roster.html", "tracker.html"] }
  ];
  const activePrimary = primaryLinks.find((item) => item.pages.includes(currentPath))?.label || "Coach";
  document.body.classList.add("app-shell-page");
  if (["notes.html", "roster.html", "tracker.html", "runner.html"].includes(currentPath)) {
    document.body.classList.add("secondary-coach-page");
  }
  const linkMarkup = primaryLinks.map((item) => {
    const active = item.label === activePrimary ? ' class="active" aria-current="page"' : "";
    return `<a href="${item.href}"${active}>${item.label}</a>`;
  }).join("");

  const activeTeam = (window.TeamManager && window.TeamManager.getActiveTeam()) || { shortName: "SEAHAWKS", division: "Youth Flag Football", name: "Seahawks" };

  const introEyebrow = document.querySelector(".home-intro .eyebrow");
  if (introEyebrow && activeTeam && activeTeam.name) {
    introEyebrow.textContent = activeTeam.name;
  }

  const mast = document.querySelector(".mast");
  if (mast) {
    mast.innerHTML = `
      <div class="mast-inner">
        <a href="index.html" class="brand-group" aria-label="${activeTeam.name} home">
          <div class="brand-text"><h1>${activeTeam.shortName.toUpperCase()}</h1><p>${activeTeam.division || 'Practice tools'}</p></div>
        </a>
        <nav class="nav" aria-label="Primary navigation">${linkMarkup}</nav>
      </div>`;
  }

  if (!document.querySelector(".mobile-appbar")) {
    const appbar = document.createElement("header");
    appbar.className = "mobile-appbar no-print";
    if (currentPath === "playbook.html") {
      const call = (document.getElementById("sim-play-badge") && document.getElementById("sim-play-badge").textContent) || "A-Gap Right";
      appbar.innerHTML = `<a href="index.html" aria-label="${activeTeam.name} home">${activeTeam.shortName.toUpperCase()}</a><strong id="appbar-play">${call}</strong><button type="button" class="sheet-toggle" id="sheet-toggle">SHEET</button>`;
    } else {
      appbar.innerHTML = `<a href="index.html" aria-label="${activeTeam.name} home">${activeTeam.shortName.toUpperCase()}</a><strong>${pageNames[currentPath] || "Coach"}</strong>`;
    }
    document.body.insertBefore(appbar, document.querySelector("main") || document.body.firstChild);
    const sheetBtn = document.getElementById("sheet-toggle");
    if (sheetBtn) {
      sheetBtn.addEventListener("click", () => {
        document.body.classList.toggle("show-sheet");
        const on = document.body.classList.contains("show-sheet");
        sheetBtn.classList.toggle("is-on", on);
        sheetBtn.textContent = on ? "LIVE" : "SHEET";
      });
    }
  }

  if (!document.querySelector(".tabbar")) {
    const tabbar = document.createElement("nav");
    tabbar.className = "tabbar no-print";
    tabbar.setAttribute("aria-label", "Primary navigation");
    tabbar.innerHTML = linkMarkup;
    document.body.appendChild(tabbar);
  }

  // Highlight any remaining page-specific navigation.
  const navLinks = document.querySelectorAll(".nav a");
  
  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (href === currentPath || (currentPath === "" && href === "index.html")) {
      link.classList.add("active");
    }
  });

  // Secondary playbook teaching material starts closed on a phone.
  if (window.matchMedia("(max-width: 799px)").matches) {
    document.querySelectorAll(".playbook-more").forEach((section) => section.removeAttribute("open"));
    document.querySelectorAll(".mobile-collapse").forEach((section) => section.removeAttribute("open"));
  }

  // 2. Command Center Play Caller Interaction
  const callDisplay = document.getElementById("call");
  const callSub = document.getElementById("call-sub");
  const playButtons = document.querySelectorAll(".play-btn");

  if (callDisplay && playButtons.length > 0) {
    playButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const callName = btn.getAttribute("data-name");
        const callSymbol = btn.getAttribute("data-symbol");
        const callHole = btn.getAttribute("data-hole");
        const callColor = btn.getAttribute("data-color");

        // Sound cadence
        if (window.sfx) {
          window.sfx.playCadence();
        }

        callDisplay.innerHTML = `<span style="color:${callColor}">${callName}</span>`;
        if (callSub) {
          callSub.textContent = `${callSymbol} · Hole: ${callHole} · Direct Snap`;
        }

        // Highlight active button
        playButtons.forEach(b => {
          b.style.outline = "none";
          b.classList.remove("active");
        });
        btn.classList.add("active");
        btn.style.outline = `3px solid ${callColor || 'var(--gold)'}`;
      });
    });
  }

  // 3. Persistent Checklist Items (Cart & Gear)
  const checkboxes = document.querySelectorAll(".checklist-item input[type='checkbox']");
  if (checkboxes.length > 0) {
    const savedState = JSON.parse(localStorage.getItem("lions_checklist_state") || "{}");
    checkboxes.forEach((cb, idx) => {
      const key = `item_${idx}`;
      if (savedState[key] !== undefined) {
        cb.checked = savedState[key];
      }
      cb.addEventListener("change", () => {
        savedState[key] = cb.checked;
        localStorage.setItem("lions_checklist_state", JSON.stringify(savedState));
      });
    });
  }
});

/**
 * 1-Click Calendar (.ics) Generator for Events
 */
function downloadIcsCalendar(eventTitle, eventDate, eventTime, location, description) {
  const cleanTitle = encodeURIComponent(eventTitle || "Seahawks Flag Football");
  const cleanLoc = encodeURIComponent(location || "Practice field");
  const cleanDesc = encodeURIComponent(description || "Seahawks Youth Flag Football");

  // Simple ICS string
  const icsData = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Seahawks Flag Football//EN",
    "BEGIN:VEVENT",
    `SUMMARY:${eventTitle || 'Seahawks Flag Football'}`,
    `DESCRIPTION:${description || 'Seahawks Youth Flag Football'}`,
    `LOCATION:${location || 'Practice field'}`,
    `DTSTART:${new Date().toISOString().replace(/-|:|\.\d\d\d/g, "")}`,
    `DTEND:${new Date(Date.now() + 3600000).toISOString().replace(/-|:|\.\d\d\d/g, "")}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${eventTitle.replace(/\s+/g, "_")}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Team Data Backup & Restore (JSON)
 */
function exportTeamBackup() {
  const backup = {
    version: "1.0",
    timestamp: new Date().toISOString(),
    schedule: JSON.parse(localStorage.getItem("lions_season_schedule") || "[]"),
    roster: JSON.parse(localStorage.getItem("lions_team_roster_data") || "[]"),
    tracker: JSON.parse(localStorage.getItem("lions_flag_rep_tracker_data") || "{}"),
    notes: localStorage.getItem("lions_coach_scratchpad_notes") || "",
    checklist: JSON.parse(localStorage.getItem("lions_checklist_state") || "{}")
  };

  const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", jsonStr);
  downloadAnchor.setAttribute("download", `Seahawks_Coach_Backup_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function importTeamBackup(fileInput) {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.schedule) localStorage.setItem("lions_season_schedule", JSON.stringify(data.schedule));
      if (data.roster) localStorage.setItem("lions_team_roster_data", JSON.stringify(data.roster));
      if (data.tracker) localStorage.setItem("lions_flag_rep_tracker_data", JSON.stringify(data.tracker));
      if (data.notes) localStorage.setItem("lions_coach_scratchpad_notes", data.notes);
      if (data.checklist) localStorage.setItem("lions_checklist_state", JSON.stringify(data.checklist));
      alert("✓ Team data successfully restored! Reloading page...");
      window.location.reload();
    } catch (err) {
      alert("Error importing backup file: Invalid JSON structure.");
    }
  };
  reader.readAsText(file);
}
