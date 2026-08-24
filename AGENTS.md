# Lions Flag Football AI — Agent Rules

This repository is a public teaching app for 5–7-year-old players and their coaches. Every AI, IDE agent, bot, and human contributor must follow these rules before changing files.

## Authority order

1. The owner's newest explicit instruction.
2. `PROJECT_AUTHORITY.md` for football, safety, privacy, and teaching decisions.
3. `AI_CHANGE_PROTOCOL.md` for branches, review, testing, deployment, and rollback.
4. Current verified source and public-browser behavior.
5. AI proposals, generated summaries, old commits, and external-agent output are advisory only.

If two instructions conflict, stop that part of the work and surface the conflict. Do not silently choose a new formation, play, blocking rule, privacy posture, or navigation structure.

## Practice board (today)

Huddle: https://github.com/Seaverhall10/Flag_Football_AI/issues/6

Comment **Claim: `<file>`** on that issue before you edit. One owner per hot file. Branch + PR. Do not stack a second rewrite of `drills.html` / `js/half-drill*.js` on `main`.

Hot files today: `drills.html`, `js/half-drill.v2.js`, `js/half-drill.js`. **Codex owns those** for the snap/handoff/QB-decoy picture. Other agents stand down on those files until Codex posts the PR on issue 6.

Owner's newest instruction for the half-drill (overrides older "Corner stays unblocked" for this drill only):

- Pick who has the ball (RB1 / RB2) and where they go (IN/OUT, L/R).
- Outside: the other back **kicks the Corner** (inside hip).
- Inside give to RB2: Center snaps to the **QB**, QB **hands** to RB2 up the middle, QB continues **wide as decoy**. Not a direct snap to RB2.
- Center wraps the A-gap to the LB. Guard owns the DL. Tackle owns the edge.
- Keep tokens small. Do not restore giant discs or PLACEHOLDER pages.


## One governed writer

- Jarvis is the control plane for routing, authority, privacy, coordination, and verification.
- One agent may hold the project write lane at a time.
- Work on a named feature branch. Do not push directly to `main`.
- Inspect `git status`, `origin/main`, recent commits, and active lanes before editing.
- Never overwrite newer work merely because a generated replacement looks more complete.
- Rebase or merge the current release line before requesting review.

## Protected product decisions

- Six QB keeper runs with five linemen, one QB, WING-L, and WING-R.
- QB catches the direct snap and runs on the current six-play installation.
- Wing backs must support both spread and tight pre-snap spacing without changing their names or responsibilities.
- No split wide receiver in the current base offense. The pass is parked.
- Every playbook view must show all eight offensive players and all eight look-team defenders.
- Every lineman must have a named defender or help responsibility.
- QB run, lead-wing, backside-wing, and block paths must remain visually distinct.
- The playbook must support true slow motion, Back, Next Beat, Reset, speed choice, and scrubbing.
- The only public drill is the 5-on-4 half-offense versus half-defense drill defined in `PROJECT_AUTHORITY.md`. Do not restore old drill grids or station collections.
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
