/**
 * Unified Game Play Counter & Practice Rep Tracker
 * Live Sideline Mode: 1-Tap Play Logger, Active 5v5 Lineup Cards, Drag/Tap Subs, Mandatory Play Quota Alert.
 * Practice Mode: 5-of-6 Stop Rule scoring matrix.
 */
(function (root) {
  "use strict";

  var TRACKER_STORAGE_KEY = "coach_flag_rep_tracker_data";

  var RUNS_DATA = [
    { id: "inside-right", name: "Inside Right", color: "Red Diamond", hole: "C-RG", colorClass: "run-red" },
    { id: "inside-left", name: "Inside Left", color: "Blue Circle", hole: "C-LG", colorClass: "run-blue" },
    { id: "off-tackle-right", name: "Off-Tackle Right", color: "Gold Star", hole: "RG-RT", colorClass: "run-gold" },
    { id: "off-tackle-left", name: "Off-Tackle Left", color: "Green Triangle", hole: "LG-LT", colorClass: "run-green" },
    { id: "wide-right", name: "Wide Right", color: "Orange Square", hole: "RT outside hip", colorClass: "run-orange" },
    { id: "wide-left", name: "Wide Left", color: "Purple Hexagon", hole: "LT outside hip", colorClass: "run-purple" }
  ];

  class TrackerManager {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      this.mode = "game"; // "game" or "practice"
      this.gameTracker = new root.GameTracker();
      this.activePracticeSession = "practice-a";
      this.practiceData = this.loadPracticeData();
    }

    loadPracticeData() {
      try {
        var raw = localStorage.getItem(TRACKER_STORAGE_KEY) || localStorage.getItem("lions_flag_rep_tracker_data");
        if (raw) return JSON.parse(raw);
      } catch (e) {}
      return {
        "practice-a": this.getEmptyPracticeSession(),
        "practice-b": this.getEmptyPracticeSession()
      };
    }

    getEmptyPracticeSession() {
      var session = {};
      RUNS_DATA.forEach(function (r) {
        session[r.id] = [null, null, null, null, null, null];
      });
      return session;
    }

    savePracticeData() {
      try {
        localStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(this.practiceData));
      } catch (e) {}
    }

    togglePracticeRep(runId, repIndex) {
      var current = this.practiceData[this.activePracticeSession][runId][repIndex];
      var next = null;
      if (current === null) next = "clean";
      else if (current === "clean") next = "miss";
      else next = null;

      this.practiceData[this.activePracticeSession][runId][repIndex] = next;
      this.savePracticeData();
      this.render();
    }

    render() {
      if (!this.container) return;

      var html = `
        <div class="tracker-mode-bar no-print" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px;">
          <div style="display:flex;gap:6px;">
            <button type="button" class="btn ${this.mode === 'game' ? 'btn-primary' : 'btn-secondary'}" id="btn-mode-game" style="font-weight:800;padding:10px 18px;">🏈 Live Game Play Counter</button>
            <button type="button" class="btn ${this.mode === 'practice' ? 'btn-primary' : 'btn-secondary'}" id="btn-mode-practice" style="font-weight:700;padding:10px 18px;">📋 Practice 5-of-6 Matrix</button>
          </div>
        </div>
      `;

      if (this.mode === "game") {
        html += this.renderGameMode();
      } else {
        html += this.renderPracticeMode();
      }

      this.container.innerHTML = html;
      this.attachListeners();

    }

    renderGameMode() {
      var state = this.gameTracker.state;
      var roster = this.gameTracker.getDefaultRoster();
      var activeLineup = state.activeLineup;

      // Calculate roster rep stats
      var totalPlays = state.totalPlays;
      var activeIds = Object.values(activeLineup).filter(Boolean);

      var positionsList = ["C", "G", "T", "W", "RB"];

      function formatNum(p) {
        if (!p) return "#--";
        if (p.num) return p.num.startsWith("#") ? p.num : "#" + p.num;
        if (p.number) return "#" + String(p.number).replace(/^#/, "");
        return "#" + (p.id || "--");
      }

      function formatName(p) {
        if (!p) return "Unassigned";
        if (p.name && !p.name.includes("undefined")) return p.name;
        return "Player " + formatNum(p);
      }

      function matchPlayer(p, id) {
        if (!p || id == null) return false;
        return String(p.id) === String(id);
      }

      var fieldCardsHtml = positionsList.map(function (pos) {
        var pId = activeLineup[pos];
        var player = roster.find(function (p) { return matchPlayer(p, pId); }) || { name: "Unassigned", num: "#--" };
        var playerNum = formatNum(player);
        var playerName = formatName(player);
        var pStats = (pId && state.playerStats[pId]) || { totalPlays: 0, quota: state.quotaTarget };
        var quotaPct = Math.min(100, Math.round((pStats.totalPlays / pStats.quota) * 100));
        var badgeColor = pStats.totalPlays >= pStats.quota ? "#4ade80" : (pStats.totalPlays >= pStats.quota * 0.5 ? "#facc15" : "#f87171");

        return `
          <div class="game-pos-card" data-pos="${pos}" style="background:var(--navy-light);border:2px solid rgba(255,255,255,0.12);border-radius:10px;padding:12px;cursor:pointer;flex:1;min-width:110px;text-align:center;box-shadow:0 4px 10px rgba(0,0,0,0.3);">
            <div style="font-size:0.75rem;font-weight:800;color:var(--gold);text-transform:uppercase;">${pos}</div>
            <div style="font-size:1.15rem;font-weight:800;color:#fff;margin:4px 0 2px;">${playerNum}</div>
            <div style="font-size:0.85rem;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${playerName}</div>
            <div style="margin-top:6px;font-size:0.75rem;font-weight:800;color:${badgeColor};">${pStats.totalPlays}/${pStats.quota} reps</div>
          </div>
        `;
      }).join("");

      var nextRotationHtml = roster.filter(function (p) {
        return !activeIds.some(function (aid) { return matchPlayer(p, aid); });
      }).map(function (p) {
        var pStats = state.playerStats[p.id] || { totalPlays: 0, quota: state.quotaTarget };
        var badge = pStats.totalPlays >= pStats.quota ? "🟢" : (pStats.totalPlays >= pStats.quota * 0.5 ? "🟡" : "🔴");
        var playerNum = formatNum(p);
        var playerName = formatName(p);
        return `
          <button type="button" class="btn-next-rotation-player" data-player-id="${p.id}" style="background:rgba(255,255,255,0.06);border:1px solid var(--line-strong);border-radius:8px;padding:8px 12px;color:#fff;font-size:0.85rem;cursor:pointer;display:inline-flex;align-items:center;gap:6px;">
            <span>${badge}</span>
            <strong>${playerNum} ${playerName}</strong>
            <span style="color:var(--muted);font-size:0.75rem;">(${pStats.totalPlays} reps)</span>
          </button>
        `;
      }).join("");

      var quotaRowsHtml = roster.map(function (p) {
        var pStats = state.playerStats[p.id] || { totalPlays: 0, quota: state.quotaTarget };
        var pct = Math.min(100, Math.round((pStats.totalPlays / pStats.quota) * 100));
        var barColor = pct >= 100 ? "#4ade80" : (pct >= 50 ? "#facc15" : "#f87171");
        var statusLabel = pct >= 100 ? "✓ Quota Met" : `Needs ${pStats.quota - pStats.totalPlays} more`;
        var playerNum = formatNum(p);
        var playerName = formatName(p);

        return `
          <div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:0.85rem;">
            <div style="width:140px;font-weight:700;color:#fff;">${playerNum} ${playerName}</div>
            <div style="flex:1;background:rgba(255,255,255,0.1);border-radius:6px;height:12px;overflow:hidden;">
              <div style="background:${barColor};width:${pct}%;height:100%;transition:width 0.3s ease;"></div>
            </div>
            <div style="width:70px;text-align:right;font-weight:800;color:#fff;">${pStats.totalPlays} / ${pStats.quota}</div>
            <div style="width:100px;text-align:right;font-size:0.75rem;color:${barColor};font-weight:700;">${statusLabel}</div>
          </div>
        `;
      }).join("");

      return `
        <!-- Game Header / Scoreboard Counter -->
        <div style="background:linear-gradient(135deg, #0d1f35, #081422);border:1px solid var(--line-strong);border-radius:12px;padding:16px 20px;margin-bottom:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
            <div>
              <span class="sport-badge">LIVE GAME TRACKER</span>
              <h2 style="margin:4px 0 0;color:#fff;font-size:1.4rem;">Game Total: <span style="color:var(--gold);font-size:1.8rem;font-weight:900;">${totalPlays}</span> Plays Run</h2>
            </div>
            <div style="display:flex;gap:8px;">
              <button type="button" class="btn btn-secondary" id="btn-squad-a" style="padding:6px 12px;font-size:0.85rem;">Squad A</button>
              <button type="button" class="btn btn-secondary" id="btn-squad-b" style="padding:6px 12px;font-size:0.85rem;">Squad B</button>
              <button type="button" class="btn btn-secondary" id="btn-undo-play" style="padding:6px 12px;font-size:0.85rem;" ${totalPlays === 0 ? 'disabled' : ''}>↩️ Undo</button>
              <button type="button" class="btn btn-secondary" id="btn-reset-game" style="padding:6px 12px;font-size:0.85rem;color:#f87171;">Reset</button>
            </div>
          </div>
        </div>

        <!-- Active 5-on-5 Field Cards -->
        <div style="margin-bottom:16px;">
          <div style="font-size:0.85rem;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:8px;">Active Field Lineup (Tap Position to Sub):</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${fieldCardsHtml}
          </div>
        </div>

        <!-- Giant 1-Thumb Action Button -->
        <div style="margin:20px 0;">
          <button type="button" id="btn-log-play-rep" style="width:100%;padding:22px;background:var(--gold);color:#071018;font-size:1.35rem;font-weight:900;border:none;border-radius:12px;cursor:pointer;box-shadow:0 6px 20px rgba(246,195,68,0.4);letter-spacing:0.04em;display:flex;align-items:center;justify-content:center;gap:12px;transition:transform 0.1s ease;">
            <span>✅</span>
            <span>LOG PLAY COMPLETED (+1)</span>
          </button>
        </div>

        <!-- Next rotation group -->
        <div style="background:rgba(0,0,0,0.25);border:1px solid var(--line-strong);border-radius:10px;padding:14px;margin-bottom:20px;">
          <div style="font-size:0.8rem;font-weight:800;color:var(--gold);text-transform:uppercase;margin-bottom:8px;">Next Rotation (Tap to move into the game group):</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${nextRotationHtml || '<span class="tiny" style="color:var(--muted)">All rostered players are in the current game group.</span>'}
          </div>
        </div>

        <!-- Coach playing-time check -->
        <div style="background:rgba(13,31,53,0.6);border:1px solid var(--line-strong);border-radius:12px;padding:16px;margin-bottom:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <h3 style="margin:0;color:#fff;font-size:1rem;">Playing-Time Check (Coach target: ${state.quotaTarget}+ Plays)</h3>
            <span class="tiny" style="color:var(--muted)">Not verified league compliance</span>
          </div>
          <div>${quotaRowsHtml}</div>
        </div>
      `;
    }

    renderPracticeMode() {
      var stats = this.calculatePracticeStats();
      var sessionLabel = this.activePracticeSession === "practice-a" ? "Practice Session A" : "Practice Session B";

      var rowsHtml = RUNS_DATA.map(run => {
        var reps = this.practiceData[this.activePracticeSession][run.id] || [null, null, null, null, null, null];
        var runStat = stats.statsPerRun.find(s => s.runId === run.id);

        var repCellsHtml = reps.map((repState, idx) => {
          var stateClass = "";
          var symbol = idx + 1;
          if (repState === "clean") { stateClass = "clean"; symbol = "✓"; }
          else if (repState === "miss") { stateClass = "miss"; symbol = "✗"; }

          return `
            <td class="rep-cell">
              <button class="rep-toggle ${stateClass}" data-run="${run.id}" data-rep="${idx}" aria-label="Toggle rep ${idx+1}">
                ${symbol}
              </button>
            </td>
          `;
        }).join("");

        return `
          <tr class="${run.colorClass}">
            <td><strong>${run.name}</strong><br><small>${run.color}</small></td>
            <td><span class="landmark-pill">${run.hole}</span></td>
            ${repCellsHtml}
            <td>
              <span class="score-badge ${runStat.isMet ? 'passed' : 'pending'}">
                ${runStat.cleanCount} / 6 ${runStat.isMet ? '✓ TARGET MET' : ''}
              </span>
            </td>
          </tr>
        `;
      }).join("");

      return `
        <div class="panel-header no-print">
          <div>
            <button class="btn ${this.activePracticeSession === 'practice-a' ? 'btn-primary' : 'btn-secondary'}" id="tab-session-a">Practice A</button>
            <button class="btn ${this.activePracticeSession === 'practice-b' ? 'btn-primary' : 'btn-secondary'}" id="tab-session-b">Practice B</button>
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
              ${rowsHtml}
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
    }

    calculatePracticeStats() {
      var allPassed = true;
      var totalClean = 0;
      var totalLogged = 0;

      var self = this;
      var statsPerRun = RUNS_DATA.map(function (run) {
        var reps = self.practiceData[self.activePracticeSession][run.id] || [];
        var cleanCount = reps.filter(function (r) { return r === "clean"; }).length;
        var loggedCount = reps.filter(function (r) { return r !== null; }).length;
        var isMet = cleanCount >= 5;

        if (!isMet) allPassed = false;
        totalClean += cleanCount;
        totalLogged += loggedCount;

        return { runId: run.id, cleanCount: cleanCount, loggedCount: loggedCount, isMet: isMet };
      });

      return { statsPerRun: statsPerRun, allPassed: allPassed, totalClean: totalClean, totalLogged: totalLogged };
    }

    attachListeners() {
      var self = this;

      // Mode toggles
      document.getElementById("btn-mode-game")?.addEventListener("click", function () {
        self.mode = "game";
        self.render();
      });
      document.getElementById("btn-mode-practice")?.addEventListener("click", function () {
        self.mode = "practice";
        self.render();
      });

      // Game mode actions
      document.getElementById("btn-log-play-rep")?.addEventListener("click", function () {
        self.gameTracker.logPlayRep("Game Down");
        self.render();
      });

      document.getElementById("btn-undo-play")?.addEventListener("click", function () {
        self.gameTracker.undoLastPlay();
        self.render();
      });

      document.getElementById("btn-squad-a")?.addEventListener("click", function () {
        self.gameTracker.applySquadPreset("A");
        self.render();
      });

      document.getElementById("btn-squad-b")?.addEventListener("click", function () {
        self.gameTracker.applySquadPreset("B");
        self.render();
      });

      document.getElementById("btn-reset-game")?.addEventListener("click", function () {
        if (confirm("Reset current game play counter?")) {
          self.gameTracker.resetGame();
          self.render();
        }
      });

      // Position card tap to sub
      this.container.querySelectorAll(".game-pos-card").forEach(function (card) {
        card.addEventListener("click", function () {
          var pos = card.getAttribute("data-pos");
          var roster = self.gameTracker.getDefaultRoster();
          var pNames = roster.map(function (p, idx) {
            var numStr = p.num || (p.number ? ('#' + String(p.number).replace(/^#/, '')) : ('#' + (idx + 1)));
            var nameStr = p.name || ('Player ' + numStr);
            return (idx + 1) + ". " + numStr + " " + nameStr;
          }).join("\n");
          var choice = prompt("Sub into " + pos + " (Enter player # 1-" + roster.length + "):\n" + pNames);
          var idx = parseInt(choice, 10) - 1;
          if (roster[idx]) {
            self.gameTracker.substitute(pos, roster[idx].id);
            self.render();
          }
        });
      });

      // Move a child from the next-rotation group into the current game group.
      this.container.querySelectorAll(".btn-next-rotation-player").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var pId = btn.getAttribute("data-player-id");
          var pos = prompt("Sub this player into which position? (C, G, T, W, RB):", "C");
          if (pos && ["C", "G", "T", "W", "RB"].indexOf(pos.toUpperCase()) !== -1) {
            self.gameTracker.substitute(pos.toUpperCase(), pId);
            self.render();
          }
        });
      });

      // Practice mode actions
      this.container.querySelectorAll(".rep-toggle").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var runId = btn.getAttribute("data-run");
          var repIdx = parseInt(btn.getAttribute("data-rep"), 10);
          self.togglePracticeRep(runId, repIdx);
        });
      });

      document.getElementById("tab-session-a")?.addEventListener("click", function () {
        self.activePracticeSession = "practice-a";
        self.render();
      });
      document.getElementById("tab-session-b")?.addEventListener("click", function () {
        self.activePracticeSession = "practice-b";
        self.render();
      });
      document.getElementById("btn-reset-tracker")?.addEventListener("click", function () {
        if (confirm("Reset practice reps for this session?")) {
          self.practiceData[self.activePracticeSession] = self.getEmptyPracticeSession();
          self.savePracticeData();
          self.render();
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("interactive-tracker-root")) {
      var manager = new TrackerManager("interactive-tracker-root");
      manager.render();
    }
  });

  root.TrackerManager = TrackerManager;
})(typeof window !== "undefined" ? window : globalThis);
