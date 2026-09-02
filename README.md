# Seahawks Coach AI

> Live Firebase demo: https://coach-ai-assist.web.app/
>
> GitHub Pages release: https://seaverhall10.github.io/Flag_Football_AI/
>
> Repository: https://github.com/Seaverhall10/Flag_Football_AI

One mobile-first coaching application for Seth's Seahawks. The owner redirected the existing Lions project to the Seahawks on 2026-09-01; this repository and Firebase project remain the single product. Do not create another app or Firebase project.

## Current product boundary

- Public identity: Seahawks Coach / Youth Flag Football.
- Primary phone destinations: Home, Plays, Drill, Coach.
- Current play library: 14 owner-provided coach sheets carried forward as provisional Seahawks seed content.
- Current drill: one 5-on-4 half-team teaching animation carried forward until Seahawks-specific material is approved.
- Local roster labels and notes stay in that browser. Use jersey numbers or anonymous labels only.
- The owner confirmed the players are 5–6 years old. Exact Seahawks league, format, roster size, and rules still need confirmation from Seth's current league packet.

## Security status

The public site is a hosted demo, not a verified private team service. Secure signup, cross-device team sharing, and invitations remain disabled until Firebase owner access, real authentication, membership rules, privacy tests, and public-browser verification are complete. Never describe the client-side password screen as real security.

## Governance

- `PROJECT_AUTHORITY.md` — current team, football, safety, privacy, and uncertainty boundaries.
- `AGENTS.md` — rules for human and AI contributors.
- `AI_CHANGE_PROTOCOL.md` — one writer, branch, review, testing, release, and rollback.
- `COUNCIL_BOARD.md` — GitHub Huddle communication contract.
- `PROJECT_STATUS.md` — verified state and next actions.

## Main files

```text
index.html                 Seahawks practice home
playbook.html              14-play slow-motion teacher
drills.html                single half-team teaching drill
app.html                   sideline coach tools
js/engine/team-manager.js  Seahawks default plus legacy local-data migration
js/sim.js                  possession-aware play animation
js/half-drill.js           half-team drill animation
css/styles.css             authoritative visual design
```

## Release checks

```powershell
node scripts/verify_ai_comms.mjs
node scripts/verify_project.mjs
```

A release also requires desktop and 390×844 browser checks, all 14 plays, the drill controls, no visible Schedule navigation, no console errors, successful deployment, and a cache-busted verification of the public URL.
