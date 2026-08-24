# 🏈 Cy-Fair K/1 Lions — Flag Football AI

> **Live Coach Web Application:** [https://seaverhall10.github.io/Flag_Football_AI/](https://seaverhall10.github.io/Flag_Football_AI/)  
> **GitHub Repository:** [https://github.com/Seaverhall10/Flag_Football_AI](https://github.com/Seaverhall10/Flag_Football_AI)  
> **Canonical Local Workspace:** `C:\Users\User\Documents\Flag_Football_AI`

A modern, responsive, mobile-first coaching and sideline web application for the **Cy-Fair K/1 Lions** (CFSA 8-on-8 flag football, ages 5–6). Designed for high contrast and readability on outdoor mobile devices in bright sunlight.

---

## 🌟 Interactive Features

- **📖 Full-Team Slow-Motion Playbook (`playbook.html`):** Seven teaching beats show all eight offensive players and all eight look-team defenders. Every lineman has a named block/help job, while Runner, Lead, and Fake routes remain visually distinct.
- **⏱️ 5v4 Drill with 30-Second Play Clock (`drill.html`):** 18-rep scripted practice drill with a built-in Web Audio play clock, audio beeps, visual warning pulses, and rep counter.
- **📋 60-Minute Practice Plan (`practice.html`):** Paced station-by-station schedule with interactive practice stopwatch and persistent gear cart checklist.
- **⚡ Sideline Command Center (`app.html`):** Rapid play-calling interface with large touch targets, color-coded callouts, and audio cadence tones.
- **📊 Clean-Rep Stop Rule Tracker (`tracker.html`):** Digital tap-to-score matrix for tracking clean reps across practices, calculating progress towards the 5-of-6 stop rule target with browser `localStorage` auto-saving.
- **🛡️ Jarvis-Governed Collaboration:** Football authority, child privacy, agent roles, release gates, and public verification are kept in the repository so every AI works from the same system.
- **🖨️ Printable Resource Suite:** Print-optimized, laminated-card-ready sheets:
  - [Sideline Card](sideline.html)
  - [Wristband Inserts](wristbands.html)
  - [Play & Cue Flashcards](flashcards.html)
  - [Station Posters](stations.html)
  - [Parent Handout](parent.html)
  - [Runner Guide](runner-guide.html)

---

## 🏈 The Six Locked Runs

All plays use a **direct snap to the designated runner** from shotgun depth (~3 yards). Landmarks are fixed cone locations.

| Run | Call Symbol | Landmark Hole | Key Assignment |
|---|---|---|---|
| **Inside Right** | Red Diamond | `C-RG` (A-Gap) | Lead hits A-gap first; Runner plants at cone and explodes north. |
| **Inside Left** | Blue Circle | `C-LG` (A-Gap) | Lead hits A-gap first; Runner follows lead, plants at cone. |
| **Off-Tackle Right** | Gold Star | `RG-RT` (B-Gap) | Lead blocks LB in alley; Runner plants outside foot and cuts up. |
| **Off-Tackle Left** | Green Triangle | `LG-LT` (B-Gap) | Lead blocks LB in alley; Runner plants outside foot and cuts up. |
| **Wide Right** | Orange Square | `RT outside hip` | Lead seals perimeter; Runner sweeps to outside cone, cuts north. |
| **Wide Left** | Purple Hexagon | `LT outside hip` | Lead seals perimeter; Runner sweeps to outside cone, cuts north. |

---

## 📣 Five Cues That Never Change

1. **OL (Line):** *Find your jersey. Head out. Hands inside.*
2. **Lead Blocker:** *Hole first. Then Linebacker.*
3. **Runner:** *Follow. Plant. Go.*
4. **Front 3 Defense:** *Stay home, then flag.*
5. **Cornerback (CB):** *Nothing outside. Force in.*

---

## 🛑 The Stop Rule

> **No new offense is installed** until all six runs average **5-of-6 clean reps** (snap, assignments, landmark, legal contact) in two consecutive practice sessions.

---

## 🛠️ Project Structure

```text
Flag_Football_AI/
├── .github/
│   └── workflows/
│       └── pages.yml        # GitHub Pages auto-deploy workflow
├── css/
│   └── styles.css           # Responsive outdoor theme & print styles
├── js/
│   ├── app.js               # Core app utilities & state persistence
│   ├── sim.js               # Governed seven-beat, full-team play teacher
│   ├── timers.js            # Web Audio chimes, 30s play clock & stopwatch
│   └── tracker.js           # 5-of-6 clean rep matrix logic
├── index.html               # Team Hub & Quick-Jump Dashboard
├── app.html                 # Sideline Command Center
├── playbook.html            # Interactive Playbook & Field Diagrams
├── practice.html            # 60-Minute Practice Plan & Station Timers
├── drill.html               # 5v4 Drill & 30s Play Clock
├── runner.html              # Runner Looks & Cues
├── tracker.html             # Clean-Rep Stop Rule Tracker
├── schedule.html            # Dormant schedule tool (hidden from navigation)
├── sideline.html            # Printable Sideline Card
├── wristbands.html          # Printable Wristband Strips
├── flashcards.html          # Printable Play & Cue Flashcards
├── stations.html            # Printable Station Cards
├── parent.html              # Parent Info Handout
├── runner-guide.html        # Printable Runner Guide
├── styles.css               # Root stylesheet alias
├── .nojekyll                # GitHub Pages asset routing rule
├── AGENTS.md                # Rules every AI and human contributor follows
├── PROJECT_AUTHORITY.md     # Football, safety, privacy, and teaching truth
├── AI_CHANGE_PROTOCOL.md    # Branch, review, deployment, and rollback rules
├── PROJECT_STATUS.md        # Verified state, unknowns, and next work
└── README.md                # Project documentation
```

---

## 📱 Offline & Sunlight Optimization

- **Zero Runtime Dependencies:** Pure vanilla HTML5, CSS3, and modern JS.
- **Instant Load Time:** Loads in milliseconds even on spotty field cell connections.
- **Local State Persistence:** Checked equipment lists, rep logs, and schedule edits persist in `localStorage`.
- **Outdoor Contrast:** High-contrast Navy `#07172c`, Gold `#f5b800`, and vivid run colors with heavy borders.
