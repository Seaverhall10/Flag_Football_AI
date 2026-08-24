# AI Collaboration and Release Protocol

This is the working agreement for Jarvis, Codex, Google Antigravity, Grok, Gemini, Claude, and any future contributor.

## Roles

- **Owner:** sets product intent and approves material football, privacy, or release changes.
- **Jarvis:** routes the project, resolves authority, enforces the single-writer lane, and verifies evidence.
- **Builder:** implements one bounded branch. A builder does not redefine the football system.
- **Reviewer:** checks rules, privacy, child usability, source quality, and regressions without becoming a second writer.
- **GitHub:** durable review and release record. A local preview or agent chat is not deployment.

## Required workflow

1. **Inspect:** fetch `origin/main`; inspect branch, status, recent commits, live page, and active project lane.
2. **Declare:** state exact files, protected decisions, tests, and rollback commit before editing.
3. **Branch:** use `agent/<name>-<task>` or `codex/<task>`. Never write directly to `main`.
4. **Build narrowly:** preserve unrelated changes. New features must not replace verified teaching paths without an explicit migration decision.
5. **Run the repository gate:** `node scripts/verify_project.mjs`.
6. **Browser QA:** exercise every affected control on desktop and mobile; inspect visuals and console output.
7. **Review:** compare the diff with `PROJECT_AUTHORITY.md`, this protocol, and the owner's newest instruction.
8. **Release:** merge only after gates pass. GitHub Pages deploys only from `main`.
9. **Public verification:** reload the public URL with a cache-busting query, repeat the critical checks, and record the deployed commit.
10. **Handoff:** update `PROJECT_STATUS.md` with Verified, Inference, Unknown, and Next sections.

## Stop conditions

Stop and report instead of guessing when a change would:

- alter the formation, six calls, player ownership, contact technique, or defensive legality;
- expose child or family information;
- add analytics, accounts, remote storage, uploads, paid services, or new external data flow;
- overwrite a newer branch or unreviewed dirty work;
- restore a hidden navigation item without owner direction;
- claim current-season rule certainty without a current packet or league confirmation.

## Acceptance gates

A release is accepted only when all are true:

- football contract passes;
- privacy scan passes;
- JavaScript syntax passes;
- all local assets resolve;
- all six play selectors work;
- every play shows 8 offense + 8 defense and 8 offensive jobs;
- slow motion visibly advances through seven beats;
- mobile has no horizontal page overflow;
- Schedule is absent from visible navigation;
- browser console has no errors;
- GitHub Pages workflow succeeds;
- public page matches the released commit.

## How to contribute ideas safely

External agents should return a short proposal with:

- problem observed;
- evidence;
- proposed files;
- authority affected;
- privacy impact;
- visual impact for a 5–7-year-old;
- tests;
- rollback.

Proposals are welcome. Direct uncoordinated pushes are not.
