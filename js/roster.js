/**
 * Cy-Fair K/1 Lions - Roster & Depth Chart Manager
 * 8v8: 5 OL + RB1 RB2 RB3 vs 3 DL, 2 LB, 2 CB, 1 S.
 */

const ROSTER_STORAGE_KEY = "lions_team_roster_data_v9_names";
const CARRY_STORAGE_KEY = "lions_player_carries";
const FIELD_STORAGE_KEY = "lions_minifield_spots";

const DEFAULT_ROSTER = [
  { id: 1,  number: "", name: "Keegan",   offensePos: "RB1",          defensePos: "CB", q1: "Offense", q2: "Defense", q3: "Offense", q4: "Defense" },
  { id: 2,  number: "", name: "Hunter",   offensePos: "RB2",          defensePos: "LB", q1: "Defense", q2: "Offense", q3: "Defense", q4: "Offense" },
  { id: 3,  number: "", name: "Bo",       offensePos: "RB3",          defensePos: "S",  q1: "Offense", q2: "Defense", q3: "Offense", q4: "Defense" },
  { id: 4,  number: "", name: "Liam",     offensePos: "Center",       defensePos: "DL", q1: "Defense", q2: "Offense", q3: "Defense", q4: "Offense" },
  { id: 5,  number: "", name: "Case",     offensePos: "Left Guard",   defensePos: "DL", q1: "Offense", q2: "Defense", q3: "Offense", q4: "Defense" },
  { id: 6,  number: "", name: "Big Wade", offensePos: "Right Guard",  defensePos: "DL", q1: "Defense", q2: "Offense", q3: "Defense", q4: "Offense" },
  { id: 7,  number: "", name: "Lil Wade", offensePos: "Left Tackle",  defensePos: "LB", q1: "Offense", q2: "Defense", q3: "Offense", q4: "Defense" },
  { id: 8,  number: "", name: "Carl",     offensePos: "Right Tackle", defensePos: "CB", q1: "Defense", q2: "Offense", q3: "Defense", q4: "Offense" },
  { id: 9,  number: "", name: "Walker",   offensePos: "RB1",          defensePos: "CB", q1: "Offense", q2: "Bench",    q3: "Defense", q4: "Offense" },
  { id: 10, number: "", name: "James",    offensePos: "RB2",          defensePos: "LB", q1: "Bench",   q2: "Offense", q3: "Offense", q4: "Defense" },
  { id: 11, number: "", name: "Wiley",    offensePos: "RB3",          defensePos: "S",  q1: "Offense", q2: "Defense", q3: "Bench",    q4: "Offense" },
  { id: 12, number: "", name: "Wenton",   offensePos: "Center",       defensePos: "DL", q1: "Defense", q2: "Offense", q3: "Offense", q4: "Defense" },
  { id: 13, number: "", name: "Luke",     offensePos: "Left Guard",   defensePos: "DL", q1: "Offense", q2: "Defense", q3: "Offense", q4: "Bench" },
  { id: 14, number: "", name: "Gentry",   offensePos: "Right Guard",  defensePos: "LB", q1: "Defense", q2: "Offense", q3: "Defense", q4: "Offense" }
];

const OFFENSE_SPOTS = [
  { key: "LT", label: "LT", match: "Left Tackle" },
  { key: "LG", label: "LG", match: "Left Guard" },
  { key: "C", label: "C", match: "Center" },
  { key: "RG", label: "RG", match: "Right Guard" },
  { key: "RT", label: "RT", match: "Right Tackle" },
  { key: "RB1", label: "RB1", match: "RB1" },
  { key: "RB2", label: "RB2", match: "RB2" },
  { key: "RB3", label: "RB3", match: "RB3" }
];

const DEFENSE_SPOTS = [
  { key: "DL1", label: "DL", match: "DL" },
  { key: "DL2", label: "DL", match: "DL" },
  { key: "DL3", label: "DL", match: "DL" },
  { key: "LB1", label: "LB", match: "LB" },
  { key: "LB2", label: "LB", match: "LB" },
  { key: "CB1", label: "CB", match: "CB" },
  { key: "CB2", label: "CB", match: "CB" },
  { key: "S", label: "S", match: "S" }
];

function jerseyLabel(p) {
  const n = (p.number || "").toString().trim();
  return n ? (p.name + " #" + n) : p.name;
}

class RosterManager {
  constructor() {
    this.players = this.loadRoster();
    this.carries = this.loadCarries();
    this.spots = this.loadSpots();
  }

  loadRoster() {
    const saved = localStorage.getItem(ROSTER_STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_ROSTER;
  }

  loadCarries() {
    try {
      return JSON.parse(localStorage.getItem(CARRY_STORAGE_KEY) || "{}");
    } catch (e) {
      return {};
    }
  }

  saveCarries() {
    localStorage.setItem(CARRY_STORAGE_KEY, JSON.stringify(this.carries));
  }

  loadSpots() {
    try {
      const saved = JSON.parse(localStorage.getItem(FIELD_STORAGE_KEY) || "null");
      if (saved) return saved;
    } catch (e) { /* fall through */ }
    return this.autoSpots();
  }

  autoSpots() {
    const spots = {};
    OFFENSE_SPOTS.forEach((s) => {
      const match = this.players.find((p) => p.offensePos === s.match && !Object.values(spots).includes(p.id));
      spots[s.key] = match ? match.id : null;
    });
    DEFENSE_SPOTS.forEach((s) => {
      const match = this.players.find((p) => p.defensePos === s.match && !Object.values(spots).includes("d" + p.id) && !Object.keys(spots).some((k) => k.startsWith(s.match) && spots[k] === p.id && DEFENSE_SPOTS.some((d) => d.key === k)));
      const used = DEFENSE_SPOTS.filter((d) => spots[d.key]).map((d) => spots[d.key]);
      const next = this.players.find((p) => p.defensePos === s.match && used.indexOf(p.id) === -1);
      spots[s.key] = next ? next.id : null;
    });
    return spots;
  }

  saveSpots() {
    localStorage.setItem(FIELD_STORAGE_KEY, JSON.stringify(this.spots));
  }

  saveRoster() {
    localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify(this.players));
    this.renderAll();
  }

  addPlayer(number, name, offensePos, defensePos) {
    const newId = Date.now();
    this.players.push({
      id: newId,
      number: number || "--",
      name: name || ("Player #" + (number || "--")),
      offensePos: offensePos || "RB1",
      defensePos: defensePos || "DL",
      q1: "Offense",
      q2: "Defense",
      q3: "Offense",
      q4: "Defense"
    });
    this.saveRoster();
  }

  deletePlayer(id) {
    if (confirm("Remove player from roster?")) {
      this.players = this.players.filter(p => p.id !== id);
      this.saveRoster();
    }
  }

  updatePlayer(id, field, value) {
    const p = this.players.find(pl => pl.id === id);
    if (p) {
      if (field === "name") {
        p.name = value;
      } else {
        p[field] = value;
      }
      this.saveRoster();
    }
  }

  giveCarry(id) {
    this.carries[id] = (this.carries[id] || 0) + 1;
    this.saveCarries();
    this.renderRosterTable();
  }

  activeQuarters(p) {
    return ["q1", "q2", "q3", "q4"].filter((q) => p[q] === "Offense" || p[q] === "Defense").length;
  }

  renderPlaytimeValidator() {
    const el = document.getElementById("playtime-validator");
    if (!el) return;
    const short = this.players.filter((p) => this.activeQuarters(p) < 2);
    if (this.players.length === 0) {
      el.className = "playtime-banner playtime-ok";
      el.textContent = "50% playtime OK";
      return;
    }
    if (short.length === 0) {
      el.className = "playtime-banner playtime-ok";
      el.textContent = "50% playtime OK";
    } else {
      el.className = "playtime-banner playtime-flag";
      const list = short.map((p) => jerseyLabel(p)).join(", ");
      el.textContent = "Playtime flag: " + list + " under 2 active quarters";
    }
  }

  renderRosterTable() {
    const tbody = document.getElementById("roster-table-body");
    if (!tbody) return;

    tbody.innerHTML = this.players.map((p) => `
      <tr>
        <td style="font-weight:900;font-size:1.1rem;color:#07172c;text-align:center">#${p.number}</td>
        <td>${jerseyLabel(p)}</td>
        <td>
          <select class="editable-cell" onchange="rosterManager.updatePlayer(${p.id}, 'offensePos', this.value)">
            <option value="Center" ${p.offensePos === 'Center' ? 'selected' : ''}>Center (C)</option>
            <option value="Left Guard" ${p.offensePos === 'Left Guard' ? 'selected' : ''}>Left Guard (LG)</option>
            <option value="Right Guard" ${p.offensePos === 'Right Guard' ? 'selected' : ''}>Right Guard (RG)</option>
            <option value="Left Tackle" ${p.offensePos === 'Left Tackle' ? 'selected' : ''}>Left Tackle (LT)</option>
            <option value="Right Tackle" ${p.offensePos === 'Right Tackle' ? 'selected' : ''}>Right Tackle (RT)</option>
            <option value="RB1" ${p.offensePos === 'RB1' ? 'selected' : ''}>RB1</option>
            <option value="RB2" ${p.offensePos === 'RB2' ? 'selected' : ''}>RB2</option>
            <option value="RB3" ${p.offensePos === 'RB3' ? 'selected' : ''}>RB3</option>
          </select>
        </td>
        <td>
          <select class="editable-cell" onchange="rosterManager.updatePlayer(${p.id}, 'defensePos', this.value)">
            <option value="DL" ${p.defensePos === 'DL' ? 'selected' : ''}>DL</option>
            <option value="LB" ${p.defensePos === 'LB' ? 'selected' : ''}>LB</option>
            <option value="CB" ${p.defensePos === 'CB' ? 'selected' : ''}>CB</option>
            <option value="S" ${p.defensePos === 'S' ? 'selected' : ''}>S</option>
          </select>
        </td>
        <td class="no-print" style="text-align:center">
          <span class="carry-count">${this.carries[p.id] || 0}</span>
          <button class="btn btn-secondary" type="button" style="padding:4px 8px;font-size:0.72rem;margin-left:6px" onclick="rosterManager.giveCarry(${p.id})">Gave a carry</button>
        </td>
        <td class="no-print" style="text-align:center">
          <button class="btn btn-danger" style="padding:2px 8px;font-size:0.75rem" onclick="rosterManager.deletePlayer(${p.id})">X</button>
        </td>
      </tr>
    `).join("");
  }

  renderQuarterRotation() {
    const tbody = document.getElementById("rotation-table-body");
    if (!tbody) return;

    tbody.innerHTML = this.players.map(p => `
      <tr>
        <td style="font-weight:900">${jerseyLabel(p)}</td>
        ${['q1', 'q2', 'q3', 'q4'].map(q => `
          <td style="text-align:center">
            <select class="editable-cell" onchange="rosterManager.updatePlayer(${p.id}, '${q}', this.value)" style="font-weight:800;background:${p[q] === 'Offense' ? '#e3f2fd' : p[q] === 'Defense' ? '#e8f5e9' : '#fff3e0'}">
              <option value="Offense" ${p[q] === 'Offense' ? 'selected' : ''}>Offense</option>
              <option value="Defense" ${p[q] === 'Defense' ? 'selected' : ''}>Defense</option>
              <option value="Bench" ${p[q] === 'Bench' ? 'selected' : ''}>Bench (Rest)</option>
            </select>
          </td>
        `).join("")}
      </tr>
    `).join("");
  }

  playerById(id) {
    return this.players.find((p) => p.id === id);
  }

  assignSpot(key) {
    const nums = this.players.map((p) => "#" + p.number).join(", ");
    const chosen = prompt("Assign jersey to " + key + " (enter number, blank to clear). " + nums);
    if (chosen === null) return;
    const trimmed = chosen.replace("#", "").trim();
    if (!trimmed) {
      this.spots[key] = null;
    } else {
      const p = this.players.find((pl) => String(pl.number) === trimmed);
      this.spots[key] = p ? p.id : null;
    }
    this.saveSpots();
    this.renderMiniField();
  }

  spotChip(spot) {
    const p = this.playerById(this.spots[spot.key]);
    const num = p ? "#" + p.number : "—";
    return `<button type="button" class="field-spot" data-spot="${spot.key}" onclick="rosterManager.assignSpot('${spot.key}')"><span class="field-pos">${spot.label}</span><span class="field-num">${num}</span></button>`;
  }

  renderMiniField() {
    const el = document.getElementById("mini-field");
    if (!el) return;
    const o = {};
    OFFENSE_SPOTS.forEach((s) => { o[s.key] = this.spotChip(s); });
    const d = {};
    DEFENSE_SPOTS.forEach((s) => { d[s.key] = this.spotChip(s); });
    el.innerHTML = `
      <div class="mini-field-board">
        <div class="mini-side">
          <div class="tiny" style="text-align:center;font-weight:800;margin-bottom:6px">OFFENSE</div>
          <div class="field-row">${o.RB1}${o.RB2}${o.RB3}</div>
          <div class="field-row">${o.LT}${o.LG}${o.C}${o.RG}${o.RT}</div>
        </div>
        <div class="mini-los">LOS</div>
        <div class="mini-side">
          <div class="tiny" style="text-align:center;font-weight:800;margin-bottom:6px">DEFENSE</div>
          <div class="field-row">${d.DL1}${d.DL2}${d.DL3}</div>
          <div class="field-row">${d.LB1}${d.LB2}</div>
          <div class="field-row">${d.CB1}${d.S}${d.CB2}</div>
        </div>
      </div>
      <p class="tiny no-print">Tap a spot to assign a player. First names only.</p>
    `;
  }

  renderDepthChart() {
    const container = document.getElementById("depth-chart-grid");
    if (!container) return;

    const findPos = (posName) => {
      const match = this.players.filter(p => p.offensePos === posName);
      return match.map(m => jerseyLabel(m)).join("<br>") || "-";
    };

    const findDefPos = (posName) => {
      const match = this.players.filter(p => p.defensePos === posName);
      return match.map(m => jerseyLabel(m)).join("<br>") || "-";
    };

    container.innerHTML = `
      <div class="grid-2">
        <div class="panel" style="border-left:6px solid #f5b800">
          <h3 style="color:#07172c;margin-bottom:10px">OFFENSE 8 — 5 OL + RB1 RB2 RB3</h3>
          <table style="font-size:0.88rem">
            <thead><tr><th>Position</th><th>1st / 2nd String</th></tr></thead>
            <tbody>
              <tr><td><strong>Center (C)</strong></td><td>${findPos("Center")}</td></tr>
              <tr><td><strong>Left Guard (LG)</strong></td><td>${findPos("Left Guard")}</td></tr>
              <tr><td><strong>Right Guard (RG)</strong></td><td>${findPos("Right Guard")}</td></tr>
              <tr><td><strong>Left Tackle (LT)</strong></td><td>${findPos("Left Tackle")}</td></tr>
              <tr><td><strong>Right Tackle (RT)</strong></td><td>${findPos("Right Tackle")}</td></tr>
              <tr><td><strong>RB1</strong></td><td>${findPos("RB1")}</td></tr>
              <tr><td><strong>RB2</strong></td><td>${findPos("RB2")}</td></tr>
              <tr><td><strong>RB3</strong></td><td>${findPos("RB3")}</td></tr>
            </tbody>
          </table>
        </div>

        <div class="panel" style="border-left:6px solid #16365c">
          <h3 style="color:#07172c;margin-bottom:10px">DEFENSE 8 — 3 DL, 2 LB, 2 CB, 1 S</h3>
          <table style="font-size:0.88rem">
            <thead><tr><th>Position</th><th>Players</th></tr></thead>
            <tbody>
              <tr><td><strong>DL (x3)</strong></td><td>${findDefPos("DL")}</td></tr>
              <tr><td><strong>LB (x2)</strong></td><td>${findDefPos("LB")}</td></tr>
              <tr><td><strong>CB (x2)</strong></td><td>${findDefPos("CB")}</td></tr>
              <tr><td><strong>S (x1)</strong></td><td>${findDefPos("S")}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderAll() {
    this.renderRosterTable();
    this.renderQuarterRotation();
    this.renderDepthChart();
    this.renderPlaytimeValidator();
    this.renderMiniField();
  }
}

let rosterManager = null;

document.addEventListener("DOMContentLoaded", () => {
  rosterManager = new RosterManager();
  rosterManager.renderAll();

  document.getElementById("btn-add-player")?.addEventListener("click", () => {
    const num = prompt("Enter Jersey Number (e.g. 10):");
    if (num !== null) {
      rosterManager.addPlayer(num, name || ("Player #" + num), "RB1", "DL");
    }
  });

  document.getElementById("btn-reset-roster")?.addEventListener("click", () => {
    if (confirm("Reset roster to defaults?")) {
      localStorage.removeItem(ROSTER_STORAGE_KEY);
      rosterManager.players = JSON.parse(JSON.stringify(DEFAULT_ROSTER));
      rosterManager.saveRoster();
    }
  });
});
