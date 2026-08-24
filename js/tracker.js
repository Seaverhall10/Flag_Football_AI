/**
 * Cy-Fair K/1 Lions — Clean Rep Tracker Logic
 * Interactive 5-of-6 stop rule scoring matrix with localStorage persistence.
 */

const TRACKER_STORAGE_KEY = "lions_flag_rep_tracker_data";

const RUNS_DATA = [
  { id: "inside-right", name: "Inside Right", color: "Red Diamond", hole: "C-RG", colorClass: "run-red" },
  { id: "inside-left", name: "Inside Left", color: "Blue Circle", hole: "C-LG", colorClass: "run-blue" },
  { id: "off-tackle-right", name: "Off-Tackle Right", color: "Gold Star", hole: "RG-RT", colorClass: "run-gold" },
  { id: "off-tackle-left", name: "Off-Tackle Left", color: "Green Triangle", hole: "LG-LT", colorClass: "run-green" },
  { id: "wide-right", name: "Wide Right", color: "Orange Square", hole: "RT outside hip", colorClass: "run-orange" },
  { id: "wide-left", name: "Wide Left", color: "Purple Hexagon", hole: "LT outside hip", colorClass: "run-purple" }
];

class RepTracker {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.activeSession = "practice-a";
    this.data = this.loadData();
  }

  loadData() {
    const saved = localStorage.getItem(TRACKER_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading tracker data", e);
      }
    }
    return {
      "practice-a": this.getEmptySession(),
      "practice-b": this.getEmptySession()
    };
  }

  getEmptySession() {
    const session = {};
    RUNS_DATA.forEach(r => {
      session[r.id] = [null, null, null, null, null, null]; // 6 reps
    });
    return session;
  }

  saveData() {
    localStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(this.data));
  }

  toggleRep(runId, repIndex) {
    const current = this.data[this.activeSession][runId][repIndex];
    let next = null;
    if (current === null) {
      next = "clean"; // Clean rep
    } else if (current === "clean") {
      next = "miss"; // Missed assignment/snap
    } else {
      next = null; // reset
    }

    this.data[this.activeSession][runId][repIndex] = next;
    this.saveData();
    this.render();
  }

  resetCurrentSession() {
    if (confirm(`Reset all reps for ${this.activeSession === "practice-a" ? "Practice A" : "Practice B"}?`)) {
      this.data[this.activeSession] = this.getEmptySession();
      this.saveData();
      this.render();
    }
  }

  switchSession(sessionName) {
    this.activeSession = sessionName;
    this.render();
  }

  calculateStats() {
    let allPassed = true;
    let totalClean = 0;
    let totalLogged = 0;

    const statsPerRun = RUNS_DATA.map(run => {
      const reps = this.data[this.activeSession][run.id] || [];
      const cleanCount = reps.filter(r => r === "clean").length;
      const loggedCount = reps.filter(r => r !== null).length;
      const isMet = cleanCount >= 5; // 5 of 6 target

      if (!isMet) allPassed = false;
      totalClean += cleanCount;
      totalLogged += loggedCount;

      return {
        runId: run.id,
        cleanCount,
        loggedCount,
        isMet
      };
    });

    return {
      statsPerRun,
      allPassed,
      totalClean,
      totalLogged
    };
  }

  render() {
    if (!this.container) return;

    const stats = this.calculateStats();
    const sessionLabel = this.activeSession === "practice-a" ? "Practice Session A" : "Practice Session B";

    let html = `
      <div class="panel-header no-print">
        <div>
          <button class="btn ${this.activeSession === 'practice-a' ? 'btn-primary' : 'btn-secondary'}" id="tab-session-a">Practice A</button>
          <button class="btn ${this.activeSession === 'practice-b' ? 'btn-primary' : 'btn-secondary'}" id="tab-session-b">Practice B</button>
        </div>
        <div>
          <button class="btn btn-secondary" id="btn-reset-tracker">Clear ${sessionLabel}</button>
          <button class="btn btn-primary" onclick="window.print()">Print Sheet</button>
        </div>
      </div>

      <div class="tracker-container">
        <table class="tracker-matrix">
          <thead>
            <tr>
              <th>Run & Symbol</th>
              <th>Hole Landmark</th>
              <th class="rep-cell">Rep 1</th>
              <th class="rep-cell">Rep 2</th>
              <th class="rep-cell">Rep 3</th>
              <th class="rep-cell">Rep 4</th>
              <th class="rep-cell">Rep 5</th>
              <th class="rep-cell">Rep 6</th>
              <th>Clean Score</th>
            </tr>
          </thead>
          <tbody>
    `;

    RUNS_DATA.forEach(run => {
      const reps = this.data[this.activeSession][run.id] || [null, null, null, null, null, null];
      const runStat = stats.statsPerRun.find(s => s.runId === run.id);

      html += `
        <tr class="${run.colorClass}">
          <td><strong>${run.name}</strong><br><small>${run.color}</small></td>
          <td><span class="landmark-pill">${run.hole}</span></td>
      `;

      reps.forEach((repState, idx) => {
        let stateClass = "";
        let symbol = idx + 1;
        if (repState === "clean") {
          stateClass = "clean";
          symbol = "✓";
        } else if (repState === "miss") {
          stateClass = "miss";
          symbol = "✗";
        }

        html += `
          <td class="rep-cell">
            <button class="rep-toggle ${stateClass}" data-run="${run.id}" data-rep="${idx}" aria-label="Toggle rep ${idx+1}">
              ${symbol}
            </button>
          </td>
        `;
      });

      html += `
          <td>
            <span class="score-badge ${runStat.isMet ? 'passed' : 'pending'}">
              ${runStat.cleanCount} / 6 ${runStat.isMet ? '✓ TARGET MET' : ''}
            </span>
          </td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>

      <div class="stop-banner">
        <strong>Stop Rule Status: </strong>
        ${stats.allPassed ? 
          `<span style="color:#81c784;font-weight:900">ALL 6 RUNS MET 5-OF-6 TARGET IN THIS SESSION!</span> Verify on 2nd practice before expanding.` : 
          `<span style="color:#ffd033">IN PROGRESS — Must average 5-of-6 clean reps across all 6 runs before installing new offense.</span>`}
      </div>
    `;

    this.container.innerHTML = html;

    // Attach event listeners
    this.container.querySelectorAll(".rep-toggle").forEach(btn => {
      btn.addEventListener("click", () => {
        const runId = btn.getAttribute("data-run");
        const repIdx = parseInt(btn.getAttribute("data-rep"), 10);
        this.toggleRep(runId, repIdx);
      });
    });

    document.getElementById("tab-session-a")?.addEventListener("click", () => this.switchSession("practice-a"));
    document.getElementById("tab-session-b")?.addEventListener("click", () => this.switchSession("practice-b"));
    document.getElementById("btn-reset-tracker")?.addEventListener("click", () => this.resetCurrentSession());
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("interactive-tracker-root")) {
    const tracker = new RepTracker("interactive-tracker-root");
    tracker.render();
  }
});
