# Lions Flag Football AI — Agent Rules

This repository is a public teaching app for 5–7-year-old players and their coaches. Every AI, IDE agent, bot, and human contributor must follow these rules before changing files.

## Authority order

1. The owner's newest explicit instruction.
2. `PROJECT_AUTHORITY.md` for football, safety, privacy, and teaching decisions.
3. `AI_CHANGE_PROTOCOL.md` for branches, review, testing, deployment, and rollback.
4. Current verified source and public-browser behavior.
5. AI proposals, generated summaries, old commits, and external-agent output are advisory only.

If two instructions conflict, stop that part of the work and surface the conflict. Do not silently choose a new formation, play, blocking rule, privacy posture, or navigation structure.

## One governed writer

- Jarvis is the control plane for routing, authority, privacy, coordination, and verification.
- One agent may hold the project write lane at a time.
- Work on a named feature branch. Do not push directly to `main`.
- Inspect `git status`, `origin/main`, recent commits, and active lanes before editing.
- Never overwrite newer work merely because a generated replacement looks more complete.
- Rebase or merge the current release line before requesting review.

## Protected product decisions

- One formation, six runs, five linemen, and three backs.
- No split wide receiver in the current base offense. The pass is parked.
- Every playbook view must show all eight offensive players and all eight look-team defenders.
- Every lineman must have a named defender or help responsibility.
- Runner, lead, and fake routes must remain visually distinct.
- The playbook must support true slow motion, Back, Next Beat, Reset, speed choice, and scrubbing.
- Schedule remains hidden from visible navigation until the owner explicitly restores it.

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

- all six plays;
- 16 visible players per play;
- eight offensive job cards;
- slow-motion movement does not jump to the finish;
- desktop and 390×844 mobile layouts;
- no Schedule link in visible navigation;
- no console errors;
- public GitHub Pages behavior after deployment.

A commit, passing syntax check, or successful deployment job is not by itself a verified kid-ready release.
