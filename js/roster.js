/**
 * Cy-Fair K/1 Lions - Roster & Depth Chart Manager
 * 8v8: 5 OL + RB1 RB2 RB3 vs 3 DL, 2 LB, 2 CB, 1 S.
 */

const ROSTER_STORAGE_KEY = "lions_team_roster_data_v8v8_rb";

const DEFAULT_ROSTER = [
  { id: 1, number: "2", name: "Player #2", offensePos: "RB1", defensePos: "CB", q1: "Offense", q2: "Defense", q3: "Offense", q4: "Defense" },
  { id: 2, number: "7", name: "Player #7", offensePos: "RB2", defensePos: "LB", q1: "Offense", q2: "Defense", q3: "Offense", q4: "Defense" },
  { id: 3, number: "10", name: "Player #10", offensePos: "Center", defensePos: "DL", q1: "Offense", q2: "Defense", q3: "Offense", q4: "Defense" },
  { id: 4, number: "12", name: "Player #12", offensePos: "Left Guard", defensePos: "DL", q1: "Offense", q2: "Bench", q3: "Defense", q4: "Offense" },
  { id: 5, number: "15", name: "Player #15", offensePos: "Right Guard", defensePos: "CB", q1: "Offense", q2: "Defense", q3: "Bench", q4: "Offense" },
  { id: 6, number: "21", name: "Player #21", offensePos: "Left Tackle", defensePos: "LB", q1: "Offense", q2: "Offense", q3: "Defense", q4: "Defense" },
  { id: 7, number: "24", name: "Player #24", offensePos: "Right Tackle", defensePos: "DL", q1: "Offense", q2: "Defense", q3: "Offense", q4: "Bench" },
  { id: 8, number: "33", name: "Player #33", offensePos: "RB3", defensePos: "S", q1: "Offense", q2: "Offense", q3: "Defense", q4: "Defense" },
  { id: 9, number: "44", name: "Player #44", offensePos: "RB1", defensePos: "CB", q1: "Bench", q2: "Offense", q3: "Defense", q4: "Offense" },
  { id: 10, number: "55", name: "Player #55", offensePos: "RB2", defensePos: "LB", q1: "Defense", q2: "Offense", q3: "Offense", q4: "Defense" },
  { id: 11, number: "88", name: "Player #88", offensePos: "Left Guard", defensePos: "DL", q1: "Defense", q2: "Bench", q3: "Offense", q4: "Defense" }
];

class RosterManager {
  constructor() {
    this.players = this.loadRoster();
  }

  loadRoster() {
    const saved = localStorage.getItem(ROSTER_STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_ROSTER;
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
      name: name || `Player #${number}`,
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
      p[field] = value;
      this.saveRoster();
    }
  }

  renderRosterTable() {
    const tbody = document.getElementById("roster-table-body");
    if (!tbody) return;

    tbody.innerHTML = this.players.map((p) => `
      <tr>
        <td style="font-weight:900;font-size:1.1rem;color:#07172c;text-align:center">#${p.number}</td>
        <td>
          <input type="text" value="${p.name}" class="editable-cell" onchange="rosterManager.updatePlayer(${p.id}, 'name', this.value)" style="font-weight:700;width:100%">
        </td>
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
        <td style="font-weight:900">#${p.number} ${p.name}</td>
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

  renderDepthChart() {
    const container = document.getElementById("depth-chart-grid");
    if (!container) return;

    const findPos = (posName) => {
      const match = this.players.filter(p => p.offensePos === posName);
      return match.map(m => `#${m.number} ${m.name}`).join("<br>") || "-";
    };

    const findDefPos = (posName) => {
      const match = this.players.filter(p => p.defensePos === posName);
      return match.map(m => `#${m.number} ${m.name}`).join("<br>") || "-";
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
  }
}

let rosterManager = null;

document.addEventListener("DOMContentLoaded", () => {
  rosterManager = new RosterManager();
  rosterManager.renderAll();

  document.getElementById("btn-add-player")?.addEventListener("click", () => {
    const num = prompt("Enter Jersey Number (e.g. 10):");
    if (num !== null) {
      const name = prompt("Enter Player Label:", `Player #${num}`);
      rosterManager.addPlayer(num, name, "RB1", "DL");
    }
  });

  document.getElementById("btn-reset-roster")?.addEventListener("click", () => {
    if (confirm("Reset roster to defaults?")) {
      localStorage.removeItem(ROSTER_STORAGE_KEY);
      rosterManager.players = DEFAULT_ROSTER;
      rosterManager.saveRoster();
    }
  });
});
