/**
 * Cy-Fair K/1 Lions — Core Application Utilities
 * Features: 1-Tap GPS Field navigation, .ics Calendar generator, JSON Team Data Backup/Restore, checklist sync.
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Highlight Active Nav Tab based on current page URL
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav a");
  
  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (href === currentPath || (currentPath === "" && href === "index.html")) {
      link.classList.add("active");
    }
  });

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
  const cleanTitle = encodeURIComponent(eventTitle || "Cy-Fair Lions Flag Football");
  const cleanLoc = encodeURIComponent(location || "CFSA Complex");
  const cleanDesc = encodeURIComponent(description || "Cy-Fair K/1 Lions Flag Football 8-on-8");

  // Simple ICS string
  const icsData = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Cy-Fair Lions Flag Football//EN",
    "BEGIN:VEVENT",
    `SUMMARY:${eventTitle || 'Lions Flag Football'}`,
    `DESCRIPTION:${description || 'Cy-Fair K/1 Lions'}`,
    `LOCATION:${location || 'CFSA Complex'}`,
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
  downloadAnchor.setAttribute("download", `Lions_Flag_Football_Backup_${new Date().toISOString().slice(0,10)}.json`);
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
