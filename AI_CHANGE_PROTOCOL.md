# AI Collaboration and Release Protocol

This is the working agreement for Jarvis, Codex, Google Antigravity, Grok, Gemini, Claude, and any future contributor. All research, claims, audits, and tickets also follow `AI_TRUTH_AND_EVIDENCE.md`.

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

## Ticket states

GitHub Issues are the ticket system. Chat messages and model output are drafts until a durable ticket exists.

1. **PROPOSAL:** evidence-backed idea or audit; no edit authority.
2. **NEEDS OWNER:** product, football, privacy, security, infrastructure, cost, or truth decision is missing.
3. **ACCEPTED FOR BUILD:** owner or Jarvis records one writer, exact files, tests, and rollback.
4. **CLAIMED / IN PROGRESS:** assigned writer has posted the Huddle claim and opened a named branch.
5. **REVIEW:** implementation and evidence are ready for independent challenge.
6. **VERIFIED:** accepted tests passed against the exact commit.
7. **RELEASED:** exact merged commit is deployed and publicly checked.
8. **BLOCKED / REJECTED:** the ticket names the blocker or decision and does not silently continue.

Use `.github/ISSUE_TEMPLATE/ai-audit-enhancement.yml` for audits, research gaps, bugs, and enhancement proposals. Use `.github/ISSUE_TEMPLATE/ai-work-lane.yml` when a proposal has become a bounded implementation lane.

## Required workflow

1. **Inspect:** fetch `origin/main`; inspect branch, status, recent commits, live page, and active project lane.
2. **Draft a ticket:** use the audit/enhancement form and separate verified evidence, interpretation, contrary evidence, and unknowns. An external AI drafts in chat and posts only after explicit owner instruction.
3. **Decide:** the owner or Jarvis records `ACCEPTED FOR BUILD` or another ticket state. A proposal is never self-authorizing.
4. **Claim:** after acceptance, post the exact files, base commit, branch, tests, and rollback on Issue #6 using the contract in `COUNCIL_BOARD.md`.
5. **Feature issue:** create or reuse one bounded issue from `.github/ISSUE_TEMPLATE/ai-work-lane.yml`; detailed implementation evidence and decisions live there.
6. **Branch:** use `agent/<name>-<task>` or `codex/<task>`. Never write directly to `main`.
7. **Build narrowly:** preserve unrelated changes. New features must not replace verified teaching paths without an explicit migration decision.
8. **Run the gates:** `node scripts/verify_ai_comms.mjs` when communication files change, then `node scripts/verify_project.mjs`.
9. **Browser QA:** exercise every affected control on desktop and mobile; inspect visuals and console output when product behavior changes.
10. **Review:** GrokBot, Antigravity, Gemini, Codex, or a human reviewer compares the diff with the accepted proposal, `PROJECT_AUTHORITY.md`, `AI_TRUTH_AND_EVIDENCE.md`, this protocol, and the owner's newest instruction without becoming a second writer.
11. **Release:** merge only after gates pass. GitHub Pages deploys only from `main`.
12. **Public verification:** reload the public URL with a cache-busting query, repeat the critical checks, and record the deployed commit on the feature issue and Huddle.
13. **Handoff:** update `PROJECT_STATUS.md` and `COUNCIL_DECISIONS.md` with Verified, Inference, Unknown, Not tested, and Next sections.

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

They must also provide the strongest contrary evidence or alternative explanation, name unknowns and untested claims, and use the evidence labels in `AI_TRUTH_AND_EVIDENCE.md`.

They must also name their agent, message type, exact base commit or pull request, permissions, personally completed checks, unverified claims, and requested next owner. Use the GitHub comment and handoff contracts in `COUNCIL_BOARD.md`.

Proposals are welcome. Draft tickets are welcome. Posting, direct uncoordinated pushes, infrastructure changes, spending, sharing, merging, and deployment require the recorded authority described above.
