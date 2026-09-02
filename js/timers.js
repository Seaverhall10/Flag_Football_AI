/**
 * Seahawks Coach — Drill & Practice Command Center
 * Screen WakeLock, Audio Synthesizer, 18-Rep Visual Stepper, 60-Min Practice Tracker.
 */

class SoundEffects {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBeep(freq = 880, duration = 0.12, type = 'sine') {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  playWhistle() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(2400, this.ctx.currentTime);
      osc2.frequency.setValueAtTime(2460, this.ctx.currentTime);
      
      gain.gain.setValueAtTime(0.28, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.45);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc1.start();
      osc2.start();
      osc1.stop(this.ctx.currentTime + 0.45);
      osc2.stop(this.ctx.currentTime + 0.45);
    } catch (e) {}
  }

  playCadence() {
    this.playBeep(520, 0.09);
    setTimeout(() => this.playBeep(650, 0.14), 140);
  }
}

const sfx = new SoundEffects();
window.sfx = sfx;

document.addEventListener('touchstart', () => sfx.init(), { once: true });
document.addEventListener('click', () => sfx.init(), { once: true });

class WakeLockController {
  constructor() {
    this.wakeLock = null;
    this.isSupported = 'wakeLock' in navigator;
  }

  async requestLock() {
    if (!this.isSupported) return;
    try {
      if (!this.wakeLock) {
        this.wakeLock = await navigator.wakeLock.request('screen');
        this.wakeLock.addEventListener('release', () => {
          this.wakeLock = null;
        });
      }
    } catch (err) {}
  }

  releaseLock() {
    if (this.wakeLock) {
      this.wakeLock.release().catch(() => {});
      this.wakeLock = null;
    }
  }
}

const wakeController = new WakeLockController();

/**
 * 18-Rep Drill Script Data
 */
const DRILL_REPS = [
  { rep: 1, runKey: 'inside-right', name: 'Inside Right', color: '#dc2626', colorName: 'Red Diamond', hole: 'C-RG A-Gap', cue: 'Center drive block left · Lead attack A-gap · Runner follow & plant' },
  { rep: 2, runKey: 'inside-right', name: 'Inside Right', color: '#dc2626', colorName: 'Red Diamond', hole: 'C-RG A-Gap', cue: 'Quick 3-yd snap · Lead seal LB · Runner drive north' },
  { rep: 3, runKey: 'inside-right', name: 'Inside Right', color: '#dc2626', colorName: 'Red Diamond', hole: 'C-RG A-Gap', cue: 'Next-ball tempo · Front stay home, flag' },
  { rep: 4, runKey: 'inside-left', name: 'Inside Left', color: '#2563eb', colorName: 'Blue Circle', hole: 'C-LG A-Gap', cue: 'Center drive block right · Lead attack C-LG gap · Runner plant on cone' },
  { rep: 5, runKey: 'inside-left', name: 'Inside Left', color: '#2563eb', colorName: 'Blue Circle', hole: 'C-LG A-Gap', cue: 'Clean snap into chest · Lead fit on LB · Runner accelerate' },
  { rep: 6, runKey: 'inside-left', name: 'Inside Left', color: '#2563eb', colorName: 'Blue Circle', hole: 'C-LG A-Gap', cue: 'Offense line find jersey · Hands inside · CB stay home' },
  { rep: 7, runKey: 'off-tackle-right', name: 'Off-Tackle Right', color: '#d97706', colorName: 'Gold Star', hole: 'RG-RT B-Gap', cue: 'RG down block inside · RT kick-out DE · Lead seal LB outside' },
  { rep: 8, runKey: 'off-tackle-right', name: 'Off-Tackle Right', color: '#d97706', colorName: 'Gold Star', hole: 'RG-RT B-Gap', cue: 'Lead attack alley first · Runner plant outside foot and cut north' },
  { rep: 9, runKey: 'off-tackle-right', name: 'Off-Tackle Right', color: '#d97706', colorName: 'Gold Star', hole: 'RG-RT B-Gap', cue: 'Front stay home · Pull flags at LOS · Next ball ready' },
  { rep: 10, runKey: 'off-tackle-left', name: 'Off-Tackle Left', color: '#16a34a', colorName: 'Green Triangle', hole: 'LG-LT B-Gap', cue: 'LG down block inside · LT kick-out DE · Lead attack alley' },
  { rep: 11, runKey: 'off-tackle-left', name: 'Off-Tackle Left', color: '#16a34a', colorName: 'Green Triangle', hole: 'LG-LT B-Gap', cue: 'Runner press hole · Plant hard on cone · Drive upfield' },
  { rep: 12, runKey: 'off-tackle-left', name: 'Off-Tackle Left', color: '#16a34a', colorName: 'Green Triangle', hole: 'LG-LT B-Gap', cue: 'Backside linemen cutoff · WR stalk block CB' },
  { rep: 13, runKey: 'wide-right', name: 'Wide Right', color: '#ea580c', colorName: 'Orange Square', hole: 'RT Outside Hip', cue: 'RT & RG reach block inside · Lead pull wide right · CB nothing outside' },
  { rep: 14, runKey: 'wide-right', name: 'Wide Right', color: '#ea580c', colorName: 'Orange Square', hole: 'RT Outside Hip', cue: 'Runner sweep wide · Plant on outside cone · Turn corner north' },
  { rep: 15, runKey: 'wide-right', name: 'Wide Right', color: '#ea580c', colorName: 'Orange Square', hole: 'RT Outside Hip', cue: 'CB keep outside arm free · Force runner inside to pursuit' },
  { rep: 16, runKey: 'wide-left', name: 'Wide Left', color: '#9333ea', colorName: 'Purple Hexagon', hole: 'LT Outside Hip', cue: 'LT & LG reach block inside · Lead pull wide left · CB contain' },
  { rep: 17, runKey: 'wide-left', name: 'Wide Left', color: '#9333ea', colorName: 'Purple Hexagon', hole: 'LT Outside Hip', cue: 'Runner angle to outside cone · Plant hard · Accelerate north' },
  { rep: 18, runKey: 'wide-left', name: 'Wide Left', color: '#9333ea', colorName: 'Purple Hexagon', hole: 'LT Outside Hip', cue: 'Final rep! Clean snap · Perfect assignments · 1-2-3 SEAHAWKS!' }
];

/**
 * 18-Rep Drill Play Clock & Visual Stepper
 */
class DrillPlayClock {
  constructor() {
    this.duration = 30;
    this.timeLeft = 30;
    this.timer = null;
    this.isRunning = false;
    this.currentRep = 1;
    this.totalReps = 18;
  }

  getCurrentRepData() {
    return DRILL_REPS[this.currentRep - 1] || DRILL_REPS[0];
  }

  updateUI() {
    const repData = this.getCurrentRepData();
    const display = document.getElementById('play-clock-display');
    const progressBar = document.getElementById('play-clock-progress-bar');
    const repBadge = document.getElementById('play-clock-rep-badge');
    const playTitle = document.getElementById('active-rep-play-title');
    const holeBadge = document.getElementById('active-rep-hole-badge');
    const cueText = document.getElementById('active-rep-cue-text');

    if (display) {
      display.textContent = `${this.timeLeft}s`;
      if (this.timeLeft <= 5 && this.timeLeft > 0) {
        display.classList.add('pulse-urgent');
      } else {
        display.classList.remove('pulse-urgent');
      }
    }

    if (progressBar) {
      const pct = ((this.duration - this.timeLeft) / this.duration) * 100;
      progressBar.style.width = `${pct}%`;
      progressBar.style.background = this.timeLeft <= 5 ? '#ef4444' : '#f59e0b';
    }

    if (repBadge) {
      repBadge.textContent = `REP ${this.currentRep} OF ${this.totalReps}`;
    }

    if (playTitle) {
      playTitle.innerHTML = `<span style="color:${repData.color}">${repData.name}</span> <small style="color:#94a3b8;font-size:0.85rem">(${repData.colorName})</small>`;
    }

    if (holeBadge) {
      holeBadge.textContent = `Hole: ${repData.hole}`;
      holeBadge.style.borderColor = repData.color;
    }

    if (cueText) {
      cueText.innerHTML = `<strong>Coaching Key:</strong> ${repData.cue}`;
    }

    // Update 18-Rep Stepper Pills
    document.querySelectorAll('.rep-pill-btn').forEach((btn, idx) => {
      const repNum = idx + 1;
      btn.classList.remove('active', 'completed');
      if (repNum === this.currentRep) {
        btn.classList.add('active');
      } else if (repNum < this.currentRep) {
        btn.classList.add('completed');
      }
    });
  }

  start() {
    sfx.init();
    wakeController.requestLock();
    if (this.isRunning) return;
    this.isRunning = true;
    sfx.playCadence();

    this.timer = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 5 && this.timeLeft > 0) {
        sfx.playBeep(680, 0.08);
      }

      if (this.timeLeft <= 0) {
        sfx.playWhistle();
        this.nextRep(true);
      } else {
        this.updateUI();
      }
    }, 1000);

    this.updateUI();
  }

  pause() {
    this.isRunning = false;
    clearInterval(this.timer);
    wakeController.releaseLock();
    this.updateUI();
  }

  reset() {
    this.pause();
    this.timeLeft = this.duration;
    this.updateUI();
  }

  setRep(repNum) {
    if (repNum >= 1 && repNum <= this.totalReps) {
      this.currentRep = repNum;
      this.timeLeft = this.duration;
      this.updateUI();
    }
  }

  nextRep(autoStart = false) {
    if (this.currentRep < this.totalReps) {
      this.currentRep++;
      this.timeLeft = this.duration;
      this.updateUI();
      if (autoStart && this.isRunning) {
        sfx.playCadence();
      }
    } else {
      this.pause();
      this.timeLeft = 0;
      this.updateUI();
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
 * 60-Minute Practice Stopwatch
 */
class PracticeTimer {
  constructor() {
    this.totalSeconds = 60 * 60;
    this.elapsedSeconds = 0;
    this.timer = null;
    this.isRunning = false;

    this.stations = [
      { id: 1, startMin: 0, endMin: 8, name: 'Arrival & Cones Setup', desc: 'Belt clips tight, 6 landmark cones set, footballs prepped.' },
      { id: 2, startMin: 8, endMin: 15, name: 'Warm Movement & Agility', desc: 'Find jersey, head out, hands inside. Light tag drills.' },
      { id: 3, startMin: 15, endMin: 25, name: 'Shotgun Snap Station', desc: 'Direct 3-yard snap into chest. 10 reps per runner.' },
      { id: 4, startMin: 25, endMin: 40, name: '18-Rep 5v4 Tempo Drill', desc: '30-second next-ball tempo. Snap + assignment + landmark.' },
      { id: 5, startMin: 40, endMin: 52, name: 'Six-Run Cycle', desc: 'Full 8v8 team execution. Lead blocks hole first, then LB.' },
      { id: 6, startMin: 52, endMin: 58, name: 'Front 3 & CB Contain', desc: 'Front stay home, flag. CB keep outside arm free.' },
      { id: 7, startMin: 58, endMin: 60, name: 'Huddle Close & Rep Tracker', desc: 'Water, 1-2-3 Seahawks breakdown, record clean reps on tracker.' }
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

  updateUI() {
    const display = document.getElementById('practice-stopwatch-display');
    const activeStationBadge = document.getElementById('practice-active-station-badge');
    const progressBar = document.getElementById('practice-overall-progress-bar');
    const stationDesc = document.getElementById('practice-station-desc');

    if (display) display.textContent = this.formatTime(this.elapsedSeconds);

    const station = this.getCurrentStation();
    if (activeStationBadge && station) {
      activeStationBadge.textContent = `STATION ${station.id}: ${station.name.toUpperCase()} (${station.startMin}–${station.endMin}M)`;
    }

    if (stationDesc && station) {
      stationDesc.textContent = station.desc;
    }

    if (progressBar) {
      const pct = (this.elapsedSeconds / this.totalSeconds) * 100;
      progressBar.style.width = `${pct}%`;
    }

    // Highlight active station card
    document.querySelectorAll('.station-card').forEach((card, idx) => {
      card.classList.remove('active-station');
      if (idx + 1 === station.id) {
        card.classList.add('active-station');
      }
    });
  }

  start() {
    sfx.init();
    wakeController.requestLock();
    if (this.isRunning) return;
    this.isRunning = true;

    this.timer = setInterval(() => {
      this.elapsedSeconds++;

      const currentMin = this.elapsedSeconds / 60;
      if (Number.isInteger(currentMin) && this.stations.some(s => s.startMin === currentMin)) {
        sfx.playWhistle();
      }

      if (this.elapsedSeconds >= this.totalSeconds) {
        this.pause();
        sfx.playWhistle();
      }
      this.updateUI();
    }, 1000);

    this.updateUI();
  }

  pause() {
    this.isRunning = false;
    clearInterval(this.timer);
    wakeController.releaseLock();
    this.updateUI();
  }

  reset() {
    this.pause();
    this.elapsedSeconds = 0;
    this.updateUI();
  }

  jumpToStation(stationId) {
    const st = this.stations.find(s => s.id === stationId);
    if (st) {
      this.elapsedSeconds = st.startMin * 60;
      this.updateUI();
      sfx.playWhistle();
    }
  }
}

let drillClockInstance = null;
let practiceTimerInstance = null;

function renderRepStepper() {
  const container = document.getElementById('rep-stepper-container');
  if (!container) return;

  container.innerHTML = DRILL_REPS.map(r => `
    <button class="rep-pill-btn ${r.rep === 1 ? 'active' : ''}" data-rep="${r.rep}" onclick="drillClockInstance.setRep(${r.rep})" style="border-color:${r.color}">
      <span class="rep-num">${r.rep}</span>
      <span class="rep-dot" style="background:${r.color}"></span>
    </button>
  `).join('');
}

function updateChecklistProgress() {
  const cbs = document.querySelectorAll('.checklist-item input[type="checkbox"]');
  const checked = document.querySelectorAll('.checklist-item input[type="checkbox"]:checked');
  const bar = document.getElementById('cart-progress-bar');
  const label = document.getElementById('cart-progress-label');

  if (cbs.length > 0) {
    const pct = Math.round((checked.length / cbs.length) * 100);
    if (bar) bar.style.width = `${pct}%`;
    if (label) label.textContent = `${checked.length}/${cbs.length} Packed (${pct}%)`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  drillClockInstance = new DrillPlayClock();
  practiceTimerInstance = new PracticeTimer();

  renderRepStepper();
  drillClockInstance.updateUI();
  practiceTimerInstance.updateUI();

  // Play Clock Controls
  document.getElementById('btn-playclock-start')?.addEventListener('click', () => drillClockInstance.start());
  document.getElementById('btn-playclock-pause')?.addEventListener('click', () => drillClockInstance.pause());
  document.getElementById('btn-playclock-next')?.addEventListener('click', () => drillClockInstance.nextRep(false));
  document.getElementById('btn-playclock-prev')?.addEventListener('click', () => drillClockInstance.prevRep());
  document.getElementById('btn-playclock-reset')?.addEventListener('click', () => drillClockInstance.reset());

  // Practice Stopwatch Controls
  document.getElementById('btn-stopwatch-start')?.addEventListener('click', () => practiceTimerInstance.start());
  document.getElementById('btn-stopwatch-pause')?.addEventListener('click', () => practiceTimerInstance.pause());
  document.getElementById('btn-stopwatch-reset')?.addEventListener('click', () => practiceTimerInstance.reset());

  // Fullscreen Play Clock
  document.getElementById('btn-drill-fullscreen')?.addEventListener('click', () => {
    const widget = document.getElementById('drill-commander-card');
    if (widget) {
      if (!document.fullscreenElement) {
        widget.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.().catch(() => {});
      }
    }
  });

  // Checklist listeners
  document.querySelectorAll('.checklist-item input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', updateChecklistProgress);
  });
  updateChecklistProgress();
});
