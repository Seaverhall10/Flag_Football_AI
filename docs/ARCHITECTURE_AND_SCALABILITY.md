# Seahawks Coach Architecture and Future Scalability Guide

This document describes the current Seahawks-focused Coach AI app and its future scalability. The Seahawks are the only active product identity. Multi-team support remains architecture, not a claim that multiple live apps or secure team accounts exist.

## Current truth boundary

- One repository and one Firebase project are the canonical product.
- The public Firebase site is a demo. Secure accounts, private invitations, remote roster storage, and role enforcement are not enabled yet.
- Team-entered roster, notes, tracker, and schedule data remain in that browser's local storage.
- Keys containing `lions` are retained only as legacy compatibility so an existing coach does not lose browser-local data.
- The Seahawks league, age group, player count, rules, and official playbook still require owner confirmation.

---

## 1. High-Level Architecture

The platform is designed to scale to **any youth sports team, division, or sport** while maintaining strict data isolation, zero cloud leakage of child data by default, and backward compatibility for legacy team profiles.

```
┌─────────────────────────────────────────────────────────────┐
│                       Web App Shell                         │
│   (Masthead · App Bar · Tab Bar · Dynamic Team Branding)     │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
┌──────────────▼─────────────┐ ┌──────────────▼───────────────┐
│       Team Manager         │ │     Future Auth Guard        │
│ (Seahawks + legacy import) │ │  (Firebase owner access      │
└──────────────┬─────────────┘ │   Parent/Player Gating)      │
               │               └──────────────┬───────────────┘
               │                              │
┌──────────────▼──────────────────────────────▼───────────────┐
│                       Core Engines                          │
│  • Custom Playbook Engine (Isolated Playbooks per Team)     │
│  • Lineup Manager (1-Tap Squad A/B & +1 Rotation)           │
│  • Board Engine (SVG Field, Pitch, Court Renderers)         │
│  • Drill Engine (Configurable Practice Rep Framework)       │
│  • AI Vision Ingest Engine (Gemini Multimodal Vision API)   │
│  • Tactical Play Creator (Drag-and-Drop Whiteboard)         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Team Storage & Namespace Isolation

All user-generated content (plays, rosters, notes, drill setups) is namespaced per team in browser LocalStorage:

| Data Type | Preserved Legacy Key | Future Namespaced Format |
| :--- | :--- | :--- |
| **Team Metadata Index** | `coach_teams_index` | `coach_teams_index` |
| **Active Team ID** | `coach_active_team_id` | `coach_active_team_id` |
| **Seed Playbook** | `LIONS_PLAYS` alias (read-only compatibility) | `SEAHAWKS_PLAYS` |
| **Active Lineup** | `lions_active_lineup` | `coach_active_lineup_<teamId>` |
| **Team Roster** | `lions_team_roster_data` | `team_<teamId>_roster` |
| **Coach Notes** | `lions_coach_scratchpad_notes` | `team_<teamId>_notes` |
| **Rep Tracker** | `lions_interactive_tracker_data` | `team_<teamId>_tracker` |

### Team Creation & Switcher (`js/engine/team-manager.js`)
- The active default is `seahawks-youth-flag`. The former `lions-k1-flag` identifier is migrated to it without deleting the legacy browser data.
- When switching teams, the UI emits a `team:switched` event, triggering instant re-renders across all active views without page reloads.

---

## 3. Planned Role-Based Access Control (`js/engine/auth-guard.js`)

These roles describe the intended model after Firebase Authentication and server-enforced authorization are configured. The public demo does not currently issue or accept secure invitation links:
- **Head Coach (`HEAD_COACH`)**: Full administrative privileges (create/edit/delete plays, AI photo ingest, manage staff, edit depth chart).
- **Assistant Coach (`ASSISTANT_COACH`)**: Practice running and sideline execution (slow-motion animator, 5v4 drill spotlight, 1-tap lineup rotation, sideline play caller).
- **Parent / Player (`PARENT_PLAYER`)**: Clean, distraction-free "Kid Mode" (watch slow-mo play routes, view safe stance cues, check schedules, zero edit access).

---

## 4. Proposed AI Playbook & Vision Ingest Pipeline (`js/engine/ai-ingest.js`)

This pipeline is not part of the current public release. Any future upload or external-AI workflow requires explicit owner approval, a child-privacy review, a documented data path, and a verified deletion policy before implementation.

---

## 5. Deployment & Verification

- **Canonical hosted demo**: `https://coach-ai-assist.web.app`
- **Automated verification gate**: `node scripts/verify_project.mjs`
- Hosting success does not prove secure accounts, correct rules, or a kid-ready release. Record the deployed source commit and complete public browser QA after each authorized deployment.
