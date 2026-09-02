# AI Collaboration and Release Protocol

This is the working agreement for Jarvis, Codex, Google Antigravity, Grok, Gemini, Claude, and any future contributor.

## Roles

- **Owner:** sets product intent and approves material football, privacy, or release changes.
- **Jarvis:** routes the project, resolves authority, enforces the single-writer lane, and verifies evidence.
- **Codex:** integrates or builds one accepted lane and independently verifies repository and browser evidence when assigned.
- **GrokBot:** supplies discovery, alternatives, challenges, and advisory review unless assigned the write lane.
- **Antigravity:** supplies visual/product prototypes and advisory UX, code, and security review unless assigned the write lane.
- **Builder:** implements one bounded branch. A builder does not redefine the football system.
- **Reviewer:** checks rules, privacy, child usability, source quality, and regressions without becoming a second writer.
- **GitHub:** durable review and release record. A local preview or agent chat is not deployment.
- **AI Huddle:** Issue #6 records claims and dispatch; one linked feature issue holds each substantial lane.

## Required workflow

1. **Inspect:** fetch `origin/main`; inspect branch, status, recent commits, live page, and active project lane.
2. **Claim:** post the exact files, base commit, branch, tests, and rollback on Issue #6 using the contract in `COUNCIL_BOARD.md`.
3. **Feature issue:** create or reuse one bounded issue from `.github/ISSUE_TEMPLATE/ai-work-lane.yml`; detailed evidence and decisions live there.
4. **Declare:** Jarvis or the owner records `ACCEPTED FOR BUILD`, exact files, protected decisions, tests, rollback commit, and one builder. Material visual changes require child-learning, football/safety, and website challenge.
5. **Branch:** use `agent/<name>-<task>` or `codex/<task>`. Never write directly to `main`.
6. **Build narrowly:** preserve unrelated changes. New features must not replace verified teaching paths without an explicit migration decision.
7. **Run the gates:** `node scripts/verify_ai_comms.mjs` when communication files change, then `node scripts/verify_project.mjs`.
8. **Browser QA:** exercise every affected control on desktop and mobile; inspect visuals and console output when product behavior changes.
9. **Review:** GrokBot, Antigravity, Codex, or a human reviewer compares the diff with the accepted proposal, `PROJECT_AUTHORITY.md`, this protocol, and the owner's newest instruction without becoming a second writer.
10. **Release:** merge only after gates pass. GitHub Pages deploys only from `main`.
11. **Public verification:** reload the public URL with a cache-busting query, repeat the critical checks, and record the deployed commit on the feature issue and Huddle.
12. **Handoff:** update `PROJECT_STATUS.md` and `COUNCIL_DECISIONS.md` with Verified, Inference, Unknown, and Next sections.

## Stop conditions

Stop and report instead of guessing when a change would:

- alter the 14-play coach-sheet authority, formation, player ownership, contact technique, or defensive legality;
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
- all 14 play selectors work;
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

They must also name their agent, message type, exact base commit or pull request, permissions, personally completed checks, unverified claims, and requested next owner. Use the GitHub comment and handoff contracts in `COUNCIL_BOARD.md`.

Proposals are welcome. Direct uncoordinated pushes are not.
