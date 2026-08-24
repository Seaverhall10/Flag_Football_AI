/**
 * Cy-Fair K/1 Lions — Advanced Roster & Depth Chart Manager
 * Features: Visual 8-on-8 field formation depth chart, CFSA 50% fair play compliance engine, ball-carries tracker.
 */

const ROSTER_STORAGE_KEY = "lions_team_roster_data";

const DEFAULT_ROSTER = [
  { id: 1, number: "2", name: "Player #2", offensePos: "Runner", defensePos: "Cornerback", q1: "Offense", q2: "Defense", q3: "Offense", q4: "Defense", carries: 4 },
  { id: 2, number: "7", name: "Player #7", offensePos: "Lead Blocker", defensePos: "Front Mid (MLB)", q1: "Offense", q2: "Defense", q3: "Offense", q4: "Defense", carries: 2 },
  { id: 3, number: "10", name: "Player #10", offensePos: "Center", defensePos: "Front Left", q1: "Offense", q2: "Defense", q3: "Offense", q4: "Defense", carries: 0 },
  { id: 4, number: "12", name: "Player #12", offensePos: "Left Guard", defensePos: "Front Right", q1: "Offense", q2: "Bench", q3: "Defense", q4: "Offense", carries: 1 },
  { id: 5, number: "15", name: "Player #15", offensePos: "Right Guard", defensePos: "Cornerback", q1: "Offense", q2: "Defense", q3: "Bench", q4: "Offense", carries: 1 },
  { id: 6, number: "21", name: "Player #21", offensePos: "Left Tackle", defensePos: "Front Mid", q1: "Offense", q2: "Offense", q3: "Defense", q4: "Defense", carries: 0 },
  { id: 7, number: "24", name: "Player #24", offensePos: "Right Tackle", defensePos: "Front Left", q1: "Offense", q2: "Defense", q3: "Offense", q4: "Bench", carries: 1 },
  { id: 8, number: "33", name: "Player #33", offensePos: "Extra Back (RB3)", defensePos: "Safety", q1: "Offense", q2: "Offense", q3: "Defense", q4: "Defense", carries: 2 },
  { id: 9, number: "44", name: "Player #44", offensePos: "Runner (2nd)", defensePos: "Cornerback", q1: "Bench", q2: "Offense", q3: "Defense", q4: "Offense", carries: 3 },
  { id: 10, number: "55", name: "Player #55", offensePos: "Lead (2nd)", defensePos: "Front Right", q1: "Defense", q2: "Offense", q3: "Offense", q4: "Defense", carries: 1 },
  { id: 11, number: "88", name: "Player #88", offensePos: "Guard (2nd)", defensePos: "Front Left", q1: "Defense", q2: "Bench", q3: "Offense", q4: "Defense", carries: 0 }
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
      offensePos: offensePos || "Line",
      defensePos: defensePos || "Front",
      q1: "Offense",
      q2: "Defense",
      q3: "Offense",
      q4: "Defense",
      carries: 0
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

  incrementCarries(id) {
    const p = this.players.find(pl => pl.id === id);
    if (p) {
      p.carries = (p.carries || 0) + 1;
      this.saveRoster();
    }
  }

  decrementCarries(id) {
    const p = this.players.find(pl => pl.id === id);
    if (p && p.carries > 0) {
      p.carries = p.carries - 1;
      this.saveRoster();
    }
  }

  checkCompliance() {
    let nonCompliantCount = 0;
    const playerReports = this.players.map(p => {
      const activeQuarters = ['q1', 'q2', 'q3', 'q4'].filter(q => p[q] !== "Bench").length;
      const isCompliant = activeQuarters >= 2;
      if (!isCompliant) nonCompliantCount++;
      return { id: p.id, name: p.name, number: p.number, activeQuarters, isCompliant };
    });

    return {
      isAllCompliant: nonCompliantCount === 0,
      nonCompliantCount,
      playerReports
    };
  }

  renderRosterTable() {
    const tbody = document.getElementById("roster-table-body");
    if (!tbody) return;

    tbody.innerHTML = this.players.map((p) => `
      <tr>
        <td style="font-weight:900;font-size:1.1rem;color:var(--navy);text-align:center">#${p.number}</td>
        <td>
          <input type="text" value="${p.name}" class="editable-cell" onchange="rosterManager.updatePlayer(${p.id}, 'name', this.value)" style="font-weight:700;width:100%">
        </td>
        <td>
          <select class="editable-cell" onchange="rosterManager.updatePlayer(${p.id}, 'offensePos', this.value)">
            <option value="Runner" ${p.offensePos === 'Runner' ? 'selected' : ''}>Designated Runner</option>
            <option value="Lead Blocker" ${p.offensePos === 'Lead Blocker' ? 'selected' : ''}>Lead Blocker</option>
            <option value="Center" ${p.offensePos === 'Center' ? 'selected' : ''}>Center (C)</option>
            <option value="Left Guard" ${p.offensePos === 'Left Guard' ? 'selected' : ''}>Left Guard (LG)</option>
            <option value="Right Guard" ${p.offensePos === 'Right Guard' ? 'selected' : ''}>Right Guard (RG)</option>
            <option value="Left Tackle" ${p.offensePos === 'Left Tackle' ? 'selected' : ''}>Left Tackle (LT)</option>
            <option value="Right Tackle" ${p.offensePos === 'Right Tackle' ? 'selected' : ''}>Right Tackle (RT)</option>
            <option value="Extra Back (RB3)" ${p.offensePos === 'Extra Back (RB3)' ? 'selected' : ''}>Extra Back / Fake (RB3)</option>
            <option value="Runner (2nd)" ${p.offensePos === 'Runner (2nd)' ? 'selected' : ''}>Runner (2nd String)</option>
            <option value="Lead (2nd)" ${p.offensePos === 'Lead (2nd)' ? 'selected' : ''}>Lead (2nd String)</option>
            <option value="Guard (2nd)" ${p.offensePos === 'Guard (2nd)' ? 'selected' : ''}>Guard (2nd String)</option>
          </select>
        </td>
        <td>
          <select class="editable-cell" onchange="rosterManager.updatePlayer(${p.id}, 'defensePos', this.value)">
            <option value="Front Mid (MLB)" ${p.defensePos === 'Front Mid (MLB)' ? 'selected' : ''}>Middle Linebacker (MLB)</option>
            <option value="Front Left" ${p.defensePos === 'Front Left' ? 'selected' : ''}>Front Left (DL)</option>
            <option value="Front Right" ${p.defensePos === 'Front Right' ? 'selected' : ''}>Front Right (DL)</option>
            <option value="Cornerback" ${p.defensePos === 'Cornerback' ? 'selected' : ''}>Cornerback (Contain)</option>
            <option value="Safety" ${p.defensePos === 'Safety' ? 'selected' : ''}>Safety</option>
          </select>
        </td>
        <td style="text-align:center" class="no-print">
          <div style="display:inline-flex;align-items:center;gap:4px">
            <button class="btn btn-secondary" style="padding:2px 6px;font-size:0.75rem" onclick="rosterManager.decrementCarries(${p.id})">-</button>
            <strong style="min-width:18px;font-size:0.95rem">${p.carries || 0}</strong>
            <button class="btn btn-secondary" style="padding:2px 6px;font-size:0.75rem" onclick="rosterManager.incrementCarries(${p.id})">+</button>
          </div>
        </td>
        <td class="no-print" style="text-align:center">
          <button class="btn btn-danger" style="padding:2px 8px;font-size:0.75rem" onclick="rosterManager.deletePlayer(${p.id})">✕</button>
        </td>
      </tr>
    `).join("");
  }

  renderQuarterRotation() {
    const tbody = document.getElementById("rotation-table-body");
    const complianceBadge = document.getElementById("compliance-status-badge");
    if (!tbody) return;

    const compliance = this.checkCompliance();
    if (complianceBadge) {
      if (compliance.isAllCompliant) {
        complianceBadge.innerHTML = `<span style="background:#dcfce7;color:#166534;padding:4px 10px;border-radius:999px;font-weight:800;font-size:0.85rem">✓ CFSA Compliant: All ${this.players.length} Lions Active 2+ Quarters</span>`;
      } else {
        complianceBadge.innerHTML = `<span style="background:#fee2e2;color:#991b1b;padding:4px 10px;border-radius:999px;font-weight:800;font-size:0.85rem">⚠️ ${compliance.nonCompliantCount} Player(s) Under 2 Quarters</span>`;
      }
    }

    tbody.innerHTML = this.players.map(p => {
      const activeQtrs = ['q1', 'q2', 'q3', 'q4'].filter(q => p[q] !== "Bench").length;
      return `
        <tr>
          <td style="font-weight:800">
            #${p.number} ${p.name}
            <small style="display:block;color:${activeQtrs >= 2 ? 'var(--green)' : 'var(--red)'};font-size:0.75rem">
              ${activeQtrs} Qtrs ${activeQtrs >= 2 ? '✓' : '(Needs 2+)'}
            </small>
          </td>
          ${['q1', 'q2', 'q3', 'q4'].map(q => `
            <td style="text-align:center">
              <select class="editable-cell" onchange="rosterManager.updatePlayer(${p.id}, '${q}', this.value)" style="font-weight:750;background:${p[q] === 'Offense' ? '#eff6ff' : p[q] === 'Defense' ? '#f0fdf4' : '#fff7ed'}">
                <option value="Offense" ${p[q] === 'Offense' ? 'selected' : ''}>Offense</option>
                <option value="Defense" ${p[q] === 'Defense' ? 'selected' : ''}>Defense</option>
                <option value="Bench" ${p[q] === 'Bench' ? 'selected' : ''}>Bench (Rest)</option>
              </select>
            </td>
          `).join("")}
        </tr>
      `;
    }).join("");
  }

  renderDepthChart() {
    const container = document.getElementById("depth-chart-grid");
    if (!container) return;

    const findPos = (posName) => {
      const match = this.players.filter(p => p.offensePos.toLowerCase().includes(posName.toLowerCase()));
      return match.map(m => `#${m.number} ${m.name}`).join("<br>") || "—";
    };

    const findDefPos = (posName) => {
      const match = this.players.filter(p => p.defensePos.toLowerCase().includes(posName.toLowerCase()));
      return match.map(m => `#${m.number} ${m.name}`).join("<br>") || "—";
    };

    container.innerHTML = `
      <div class="grid-2">
        <div class="panel" style="border-left:5px solid var(--gold-bright)">
          <h3 style="color:var(--navy);margin-bottom:10px">OFFENSE 8-ON-8 DEPTH</h3>
          <table style="font-size:0.88rem">
            <thead><tr><th>Position</th><th>Active Starters & Rotation</th></tr></thead>
            <tbody>
              <tr><td><strong>Designated Runner (R)</strong></td><td><strong style="color:var(--red)">${findPos("Runner")}</strong></td></tr>
              <tr><td><strong>Lead Blocker (L)</strong></td><td><strong style="color:var(--gold)">${findPos("Lead")}</strong></td></tr>
              <tr><td><strong>Center (C)</strong></td><td>${findPos("Center")}</td></tr>
              <tr><td><strong>Left Guard (LG)</strong></td><td>${findPos("Left Guard")}</td></tr>
              <tr><td><strong>Right Guard (RG)</strong></td><td>${findPos("Right Guard")}</td></tr>
              <tr><td><strong>Left Tackle (LT)</strong></td><td>${findPos("Left Tackle")}</td></tr>
              <tr><td><strong>Right Tackle (RT)</strong></td><td>${findPos("Right Tackle")}</td></tr>
              <tr><td><strong>Extra Back / Fake (RB3)</strong></td><td>${findPos("Extra Back")}</td></tr>
            </tbody>
          </table>
        </div>

        <div class="panel" style="border-left:5px solid var(--navy)">
          <h3 style="color:var(--navy);margin-bottom:10px">DEFENSE LOOK TEAM DEPTH</h3>
          <table style="font-size:0.88rem">
            <thead><tr><th>Position</th><th>Defensive Starters</th></tr></thead>
            <tbody>
              <tr><td><strong>Middle Linebacker (MLB)</strong></td><td><strong>${findDefPos("MLB")}</strong></td></tr>
              <tr><td><strong>Front Left (DL)</strong></td><td>${findDefPos("Front Left")}</td></tr>
              <tr><td><strong>Front Right (DL)</strong></td><td>${findDefPos("Front Right")}</td></tr>
              <tr><td><strong>Cornerbacks (Contain)</strong></td><td><strong>${findDefPos("Cornerback")}</strong></td></tr>
              <tr><td><strong>Safety (S)</strong></td><td>${findDefPos("Safety")}</td></tr>
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
    if (num !== null && num.trim() !== "") {
      const name = prompt("Enter Player Name / Initial:", `Player #${num.trim()}`);
      rosterManager.addPlayer(num.trim(), name, "Line", "Front");
    }
  });

  document.getElementById("btn-reset-roster")?.addEventListener("click", () => {
    if (confirm("Reset roster to default K/1 squad?")) {
      localStorage.removeItem(ROSTER_STORAGE_KEY);
      rosterManager.players = DEFAULT_ROSTER;
      rosterManager.saveRoster();
    }
  });
});
