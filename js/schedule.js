const MAPS_URL = "https://maps.google.com/?q=youth+flag+football+field";
const SCHEDULE_KEY = "lions_season_schedule";

// The Seahawks league and season schedule have not been supplied. Never ship
// another team's dates or locations as if they belong to this team.
const DEFAULT_SCHEDULE = [];

function loadSchedule() {
  const saved = localStorage.getItem(SCHEDULE_KEY);
  return saved ? JSON.parse(saved) : DEFAULT_SCHEDULE.map((e) => Object.assign({}, e));
}

function saveSchedule(events) {
  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(events));
  renderSchedule();
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function icsStamp(d) {
  return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + "T" + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + "Z";
}

function parseEventStart(evt) {
  const now = new Date();
  const raw = (evt.date || "") + " " + (evt.time || "");
  const parsed = Date.parse(raw);
  if (!isNaN(parsed)) return new Date(parsed);
  const m = String(evt.time || "").match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  const d = new Date(Date.UTC(now.getFullYear(), 8, 1, 16, 0, 0));
  if (m) {
    let h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    const ap = (m[3] || "").toUpperCase();
    if (ap === "PM" && h < 12) h += 12;
    if (ap === "AM" && h === 12) h = 0;
    d.setUTCHours(h + 5, min, 0, 0);
  }
  return d;
}

function downloadIcs(idx) {
  const evt = loadSchedule()[idx];
  if (!evt) return;
  const start = parseEventStart(evt);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const uid = "seahawks-" + idx + "-" + Date.now() + "@coach-ai-assist";
  const loc = (evt.loc || "Youth flag football field").replace(/\n/g, " ");
  const desc = (evt.notes || "").replace(/\n/g, " ");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Seahawks Coach//Schedule//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:" + uid,
    "DTSTAMP:" + icsStamp(new Date()),
    "DTSTART:" + icsStamp(start),
    "DTEND:" + icsStamp(end),
    "SUMMARY:Seahawks " + (evt.type || "Team Event"),
    "LOCATION:" + loc,
    "DESCRIPTION:" + (evt.type || "Event") + " " + desc,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "seahawks-team-event.ics";
  a.click();
  URL.revokeObjectURL(a.href);
}

function toggleJersey(idx) {
  const events = loadSchedule();
  const e = events[idx];
  if (!e || String(e.type).toLowerCase() !== "game") return;
  e.jersey = e.jersey === "Away Gold" ? "Home Navy" : "Away Gold";
  saveSchedule(events);
}

function renderSchedule() {
  const events = loadSchedule();
  const tbody = document.getElementById("schedule-body");
  if (!tbody) return;
  tbody.innerHTML = events.map((evt, idx) => {
    const isGame = String(evt.type).toLowerCase() === "game";
    const jersey = evt.jersey || "Home Navy";
    const jerseyClass = jersey === "Away Gold" ? "jersey-away" : "jersey-home";
    const jerseyCell = isGame
      ? `<button type="button" class="jersey-badge ${jerseyClass}" onclick="toggleJersey(${idx})">${jersey}</button>`
      : "";
    return `
        <tr>
          <td><strong>${evt.type}</strong></td>
          <td>${evt.date}</td>
          <td>${evt.time}</td>
          <td><a href="${MAPS_URL}" target="_blank" rel="noopener">${evt.loc}</a></td>
          <td>${evt.notes || "-"}</td>
          <td class="no-print">${jerseyCell}</td>
          <td class="no-print">
            <button class="btn btn-secondary" type="button" onclick="downloadIcs(${idx})">Add to Calendar</button>
            <button class="btn btn-danger" type="button" onclick="deleteEvent(${idx})">X</button>
          </td>
        </tr>`;
  }).join("");
}

function deleteEvent(idx) {
  const events = loadSchedule();
  events.splice(idx, 1);
  saveSchedule(events);
}

document.getElementById("btn-add-event")?.addEventListener("click", () => {
  const panel = document.getElementById("add-event-panel");
  panel.style.display = panel.style.display === "none" ? "block" : "none";
});
document.getElementById("btn-cancel-add")?.addEventListener("click", () => {
  document.getElementById("add-event-panel").style.display = "none";
});
document.getElementById("event-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const events = loadSchedule();
  const type = document.getElementById("evt-type").value;
  events.push({
    type,
    date: document.getElementById("evt-date").value,
    time: document.getElementById("evt-time").value,
    loc: document.getElementById("evt-loc").value,
    notes: document.getElementById("evt-notes").value,
    jersey: type === "Game" ? "Home Navy" : undefined
  });
  saveSchedule(events);
  document.getElementById("event-form").reset();
  document.getElementById("add-event-panel").style.display = "none";
});
document.addEventListener("DOMContentLoaded", renderSchedule);
