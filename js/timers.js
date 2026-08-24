/**
 * Cy-Fair K/1 Lions — Audio Chimes & Interactive Timers
 * Web Audio API synthesizer for clean whistle/beeps + 30s Play Clock & Practice Timer.
 */

class SoundEffects {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
  }

  playBeep(freq = 880, duration = 0.15, type = "sine") {
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio play error", e);
    }
  }

  playWhistle() {
    this.init();
    if (!this.ctx) return;
    try {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc1.type = "triangle";
      osc2.type = "sine";
      osc1.frequency.setValueAtTime(2400, this.ctx.currentTime);
      osc2.frequency.setValueAtTime(2450, this.ctx.currentTime);
      
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.45);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc1.start();
      osc2.start();
      osc1.stop(this.ctx.currentTime + 0.45);
      osc2.stop(this.ctx.currentTime + 0.45);
    } catch (e) {
      console.warn("Whistle error", e);
    }
  }

  playCadence() {
    this.playBeep(520, 0.1);
    setTimeout(() => this.playBeep(650, 0.15), 180);
  }
}

const sfx = new SoundEffects();

function unlockWebAudio() {
  sfx.init();
  if (sfx.ctx && sfx.ctx.state === "suspended") {
    sfx.ctx.resume();
  }
}

let wakeLock = null;
async function requestWakeLock() {
  try {
    if (navigator.wakeLock && navigator.wakeLock.request) {
      wakeLock = await navigator.wakeLock.request("screen");
      if (wakeLock) {
        wakeLock.addEventListener("release", () => {});
      }
    }
  } catch (e) {}
}
async function releaseWakeLock() {
  try {
    if (wakeLock) {
      await wakeLock.release();
      wakeLock = null;
    }
  } catch (e) {
    wakeLock = null;
  }
}
function anyTimerRunning() {
  return !!(drillClockInstance && drillClockInstance.isRunning) ||
    !!(practiceTimerInstance && practiceTimerInstance.isRunning);
}
function syncWakeLock() {
  if (anyTimerRunning()) requestWakeLock();
  else releaseWakeLock();
}
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && anyTimerRunning()) {
    requestWakeLock();
  }
});
document.addEventListener("touchstart", unlockWebAudio, { passive: true });
document.addEventListener("pointerdown", unlockWebAudio, { passive: true });

/**
 * 30-Second 5v4 Drill Play Clock
 */
class DrillPlayClock {
  constructor(displayId, currentRepId, callInfoId) {
    this.display = document.getElementById(displayId);
    this.currentRepEl = document.getElementById(currentRepId);
    this.callInfoEl = document.getElementById(callInfoId);
    this.duration = 30;
    this.timeLeft = 30;
    this.timer = null;
    this.isRunning = false;
    this.currentRep = 1;
    this.totalReps = 18;

    this.repScript = [
      { rep: "1", call: "Inside Right", color: "Red Diamond", hole: "C-RG", check: "Snap + hole" },
      { rep: "2", call: "Inside Right", color: "Red Diamond", hole: "C-RG", check: "Snap + hole" },
      { rep: "3", call: "Inside Right", color: "Red Diamond", hole: "C-RG", check: "Snap + hole" },
      { rep: "4", call: "Inside Left", color: "Blue Circle", hole: "C-LG", check: "Snap + hole" },
      { rep: "5", call: "Inside Left", color: "Blue Circle", hole: "C-LG", check: "Snap + hole" },
      { rep: "6", call: "Inside Left", color: "Blue Circle", hole: "C-LG", check: "Snap + hole" },
      { rep: "7", call: "Off-Tackle Right", color: "Gold Star", hole: "RG-RT", check: "Lead: hole, LB" },
      { rep: "8", call: "Off-Tackle Right", color: "Gold Star", hole: "RG-RT", check: "Lead: hole, LB" },
      { rep: "9", call: "Off-Tackle Right", color: "Gold Star", hole: "RG-RT", check: "Lead: hole, LB" },
      { rep: "10", call: "Off-Tackle Left", color: "Green Triangle", hole: "LG-LT", check: "Lead: hole, LB" },
      { rep: "11", call: "Off-Tackle Left", color: "Green Triangle", hole: "LG-LT", check: "Lead: hole, LB" },
      { rep: "12", call: "Off-Tackle Left", color: "Green Triangle", hole: "LG-LT", check: "Lead: hole, LB" },
      { rep: "13", call: "Wide Right", color: "Orange Square", hole: "RT outside hip", check: "CB nothing outside" },
      { rep: "14", call: "Wide Right", color: "Orange Square", hole: "RT outside hip", check: "CB nothing outside" },
      { rep: "15", call: "Wide Right", color: "Orange Square", hole: "RT outside hip", check: "CB nothing outside" },
      { rep: "16", call: "Wide Left", color: "Purple Hexagon", hole: "LT outside hip", check: "CB nothing outside" },
      { rep: "17", call: "Wide Left", color: "Purple Hexagon", hole: "LT outside hip", check: "CB nothing outside" },
      { rep: "18", call: "Wide Left", color: "Purple Hexagon", hole: "LT outside hip", check: "CB nothing outside" }
    ];
  }

  updateDisplay() {
    if (!this.display) return;
    this.display.textContent = `${this.timeLeft}s`;
    
    if (this.timeLeft <= 5 && this.timeLeft > 0) {
      this.display.classList.add("pulse-urgent");
    } else {
      this.display.classList.remove("pulse-urgent");
    }

    if (this.currentRepEl) {
      this.currentRepEl.textContent = `Rep ${this.currentRep} of ${this.totalReps}`;
    }

    if (this.callInfoEl && this.repScript[this.currentRep - 1]) {
      const item = this.repScript[this.currentRep - 1];
      this.callInfoEl.innerHTML = `<strong>${item.call}</strong> · ${item.color} · <span class="landmark-pill">${item.hole}</span><br><small>Key Focus: ${item.check}</small>`;
    }
  }

  start() {
    unlockWebAudio();
    sfx.init();
    if (this.isRunning) return;
    this.isRunning = true;
    syncWakeLock();
    sfx.playCadence();

    this.timer = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 5 && this.timeLeft > 0) {
        sfx.playBeep(600, 0.08);
      }

      if (this.timeLeft <= 0) {
        sfx.playWhistle();
        this.nextRep();
      } else {
        this.updateDisplay();
      }
    }, 1000);

    this.updateDisplay();
  }

  pause() {
    this.isRunning = false;
    clearInterval(this.timer);
    this.updateDisplay();
    syncWakeLock();
  }

  reset() {
    this.pause();
    this.timeLeft = this.duration;
    this.updateDisplay();
  }

  nextRep() {
    if (this.currentRep < this.totalReps) {
      this.currentRep++;
      this.timeLeft = this.duration;
      this.updateDisplay();
      if (this.isRunning) {
        sfx.playCadence();
      }
    } else {
      this.pause();
      this.timeLeft = 0;
      this.updateDisplay();
      if (this.callInfoEl) {
        this.callInfoEl.innerHTML = `<strong style="color:#2e7d32">18 Reps Complete!</strong> Great job Lions.`;
      }
    }
  }

  prevRep() {
    if (this.currentRep > 1) {
      this.currentRep--;
      this.reset();
    }
  }
}

/**
 * 60-Minute Practice Timer
 */
class PracticeTimer {
  constructor(displayId, stationNameId) {
    this.display = document.getElementById(displayId);
    this.stationEl = document.getElementById(stationNameId);
    this.totalSeconds = 60 * 60;
    this.elapsedSeconds = 0;
    this.timer = null;
    this.isRunning = false;

    this.stations = [
      { startMin: 0, endMin: 8, name: "Arrival & Flags", desc: "Flags / belts on, cones on 6 landmarks, no player names on boards." },
      { startMin: 8, endMin: 15, name: "Warm Movement", desc: "Find jersey. Head out. Hands inside. Light tags." },
      { startMin: 15, endMin: 25, name: "Snap Station", desc: "Shotgun ~3 yds. Direct snap to designated runner only." },
      { startMin: 25, endMin: 40, name: "5v4 Drill (18 Reps)", desc: "30-sec next-ball tempo. Snap + assignment + landmark." },
      { startMin: 40, endMin: 52, name: "Six-Run Cycle", desc: "One color at a time. Cones are the hole landmarks." },
      { startMin: 52, endMin: 58, name: "Front & CB Defense", desc: "Front stay home, then flag. CB nothing outside." },
      { startMin: 58, endMin: 60, name: "Close & Tracker", desc: "Water, one cue repeat, mark tracker for 5-of-6 rule." }
    ];
  }

  formatTime(secs) {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  getCurrentStation() {
    const currentMin = Math.floor(this.elapsedSeconds / 60);
    return this.stations.find(st => currentMin >= st.startMin && currentMin < st.endMin) || this.stations[this.stations.length - 1];
  }

  updateDisplay() {
    if (!this.display) return;
    this.display.textContent = this.formatTime(this.elapsedSeconds);

    const station = this.getCurrentStation();
    if (this.stationEl && station) {
      this.stationEl.innerHTML = `<strong>${station.name} (${station.startMin}–${station.endMin}m)</strong>: ${station.desc}`;
    }
  }

  start() {
    unlockWebAudio();
    sfx.init();
    if (this.isRunning) return;
    this.isRunning = true;
    syncWakeLock();
    this.timer = setInterval(() => {
      this.elapsedSeconds++;
      
      // Check for station transition chime
      const currentMin = this.elapsedSeconds / 60;
      if (Number.isInteger(currentMin) && this.stations.some(s => s.startMin === currentMin)) {
        sfx.playWhistle();
      }

      if (this.elapsedSeconds >= this.totalSeconds) {
        this.pause();
        sfx.playWhistle();
      }
      this.updateDisplay();
    }, 1000);
    this.updateDisplay();
  }

  pause() {
    this.isRunning = false;
    clearInterval(this.timer);
    this.updateDisplay();
    syncWakeLock();
  }

  reset() {
    this.pause();
    this.elapsedSeconds = 0;
    this.updateDisplay();
  }

  jumpToStation(min) {
    this.elapsedSeconds = min * 60;
    this.updateDisplay();
  }
}

// Global instances
let drillClockInstance = null;
let practiceTimerInstance = null;

function initTimers() {
  if (document.getElementById("play-clock-display")) {
    drillClockInstance = new DrillPlayClock("play-clock-display", "play-clock-rep", "play-clock-info");
    drillClockInstance.updateDisplay();

    document.getElementById("btn-drill-start")?.addEventListener("click", () => drillClockInstance.start());
    document.getElementById("btn-drill-pause")?.addEventListener("click", () => drillClockInstance.pause());
    document.getElementById("btn-drill-reset")?.addEventListener("click", () => drillClockInstance.reset());
    document.getElementById("btn-drill-next")?.addEventListener("click", () => drillClockInstance.nextRep());
    document.getElementById("btn-drill-prev")?.addEventListener("click", () => drillClockInstance.prevRep());

    const field = document.getElementById("field-mode");
    const fieldDigits = document.getElementById("field-mode-digits");
    const origUpdate = drillClockInstance.updateDisplay.bind(drillClockInstance);
    drillClockInstance.updateDisplay = function () {
      origUpdate();
      if (fieldDigits && this.display) fieldDigits.textContent = this.display.textContent;
    };
    document.getElementById("btn-drill-field")?.addEventListener("click", () => {
      if (!field) return;
      field.classList.add("is-on");
      field.setAttribute("aria-hidden", "false");
      if (fieldDigits) fieldDigits.textContent = drillClockInstance.display.textContent;
    });
    field?.addEventListener("click", () => {
      field.classList.remove("is-on");
      field.setAttribute("aria-hidden", "true");
    });
  }

  if (document.getElementById("practice-timer-display")) {
    practiceTimerInstance = new PracticeTimer("practice-timer-display", "practice-station-info");
    practiceTimerInstance.updateDisplay();

    document.getElementById("btn-practice-start")?.addEventListener("click", () => practiceTimerInstance.start());
    document.getElementById("btn-practice-pause")?.addEventListener("click", () => practiceTimerInstance.pause());
    document.getElementById("btn-practice-reset")?.addEventListener("click", () => practiceTimerInstance.reset());
  }
}

document.addEventListener("DOMContentLoaded", initTimers);
