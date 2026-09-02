# Seahawks Coach AI — Agent Rules

This repository is the one public Seahawks Coach teaching app for 5–6-year-old players and their coaches. Every AI, IDE agent, bot, and human contributor must follow these rules before changing files.

## Authority order

1. The owner's newest explicit instruction.
2. `PROJECT_AUTHORITY.md` for football, safety, privacy, and teaching decisions.
3. `AI_CHANGE_PROTOCOL.md` for branches, review, testing, deployment, and rollback.
4. Current verified source and public-browser behavior.
5. AI proposals, generated summaries, old commits, and external-agent output are advisory only.

If two instructions conflict, stop that part of the work and surface the conflict. Do not silently choose a new formation, play, blocking rule, privacy posture, or navigation structure.

## Shared project board

Huddle: https://github.com/Seaverhall10/Flag_Football_AI/issues/6

Issue #6 is the dispatch room, not the permanent home for every detailed discussion. Comment **Claim: `<file>`** there before editing a shared page, then use one feature issue created from `.github/ISSUE_TEMPLATE/ai-work-lane.yml` for the bounded work. One owner per hot file. Branch + PR. Do not stack a second rewrite of `drills.html` or `js/half-drill.js` on another agent's active work.

Every agent message must name the agent, message type, requested decision state, base commit, branch, claimed files, evidence, authority/privacy impact, tests, rollback, and requested next owner. Use the exact contract in `COUNCIL_BOARD.md`. GrokBot, Antigravity, Codex, Jarvis, and any external model remain advisory unless the owner or Jarvis records `ACCEPTED FOR BUILD` and assigns the write lane.

The current drill authority is only the version in `PROJECT_AUTHORITY.md`: direct snap to the Runner, one Lead back, Corner unblocked, fixed Center angle to the Linebacker's starting landmark, and separate Offense/Defense teaching emphasis. Old handoff, RB1/RB2, Corner-block, duplicate-script, and tiny-token proposals are rejected history—not instructions.


## One governed writer

- Jarvis is the control plane for routing, authority, privacy, coordination, and verification.
- One agent may hold the project write lane at a time.
- Work on a named feature branch. Do not push directly to `main`.
- Inspect `git status`, `origin/main`, recent commits, and active lanes before editing.
- Never overwrite newer work merely because a generated replacement looks more complete.
- Rebase or merge the current release line before requesting review.

## AI communication roles

- Jarvis chairs and routes work, records decision state, assigns one writer, and verifies the final evidence.
- Codex integrates and verifies repository work when assigned; it does not treat another model's proposal as authority.
- GrokBot supplies discovery, alternatives, challenges, and independent review unless explicitly assigned the write lane.
- Antigravity supplies product/visual prototypes and independent UX, code, and security review unless explicitly assigned the write lane.
- GitHub issues and pull requests are the durable bridge. Private chat, prepared prompts, and local previews are not completed communication or verified review.
- No bot-to-bot message may contain child data, contact details, credentials, private inventories, private local paths, or other material barred by the privacy rules below.

## Protected product decisions

- The owner redirected the existing app to Seth's Seahawks on 2026-09-01. Use this repository, Firebase project `coach-ai-assist`, and the single approved integration PR. Do not create a replacement app, repository, Firebase project, or competing product branch.
- Former Lions and CFSA branding is retired. The Seahawks players are owner-confirmed as ages 5–6; the exact league, format, roster size, and rules remain unconfirmed. Do not silently treat old Lions/CFSA assumptions as Seahawks authority.

- The current carried-forward playbook source is the 14 binder photos in `/plays` (play-01.jpg … play-14.jpg), not the old six QB-wing keepers. Preserve them as seed content until Seth's Seahawks playbook is confirmed. Recreate each sheet: circles with the letters on that page (`C`, `G`, `T`, `W`, `RB`), squares for defense, red dashed ball path, solid black arrows for blocks/leads.
- Every playbook view must show the offense and defense tokens drawn on that sheet (usually eight and eight).
- Every lineman must have the defender that player's arrow points at on that photo.
- Ball path, lead/fake routes, and block arrows must remain visually distinct and match that play.
- The playbook must support true slow motion, Back, Next Beat, Reset, speed choice, and scrubbing.
- The only public drill is the 5-on-4 half-offense versus half-defense drill defined in `PROJECT_AUTHORITY.md`. Do not restore old drill grids or station collections.
- Schedule remains hidden from visible navigation until the owner explicitly restores it.
- Mobile navigation has four primary destinations only: Home, Plays, Drill, and Coach. Roster, notes, tracker, backup, and print resources are secondary Coach tools.
- The phone home screen leads with two actions only: run the drill or watch a play. Do not restore the six-play grid, repeated cue wall, Schedule, or agent/council jargon to the home screen.
- Responsive width alone is not mobile usability. On a 390×844 phone, the current page name and primary action must be obvious, tap targets must be at least 44 pixels high, and secondary controls must be collapsed or placed after the teaching action.

## Child privacy

- Never commit child names, initials tied to identity, contact details, attendance, medical information, or private rotation plans to this public repository.
- Public defaults must use anonymous labels such as `Player #2`.
- The roster tool may store owner-entered labels only in that browser's local storage. Tell coaches to use jersey numbers or non-identifying labels.
- Do not add analytics, trackers, remote databases, uploads, or cloud synchronization without explicit owner approval and a privacy review.

## Football and safety floor

- Follow `PROJECT_AUTHORITY.md`; do not infer league rules from generic NFL FLAG material.
- Use two-point stances, eyes up, head out of contact, open hands inside the legal torso, and controlled feet.
- Never teach or depict head/neck contact, holding, wrapping, tackling, blocks in the back, launching, intentional knockdowns away from the play, or collision drills.
- Do not place a line defender head-up on Center or in either A gap in the teaching look.
- The Corner is wider and deeper than the Edge and remains unblocked in the current run system.

## Required proof before release

Run:

```powershell
node scripts/verify_project.mjs
```

Then verify in a real browser:

- all 14 coach-sheet plays;
- 16 visible players per play;
- eight offensive job cards;
- slow-motion movement does not jump to the finish;
- desktop and 390×844 mobile layouts;
- no Schedule link in visible navigation;
- no console errors;
- public GitHub Pages behavior after deployment.

A commit, passing syntax check, or successful deployment job is not by itself a verified kid-ready release.
