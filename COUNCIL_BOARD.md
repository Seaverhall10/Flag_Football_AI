# Lions Improvement Council Board

This repository uses [GitHub Issue #6](https://github.com/Seaverhall10/Flag_Football_AI/issues/6) as the AI Huddle and dispatch room for Jarvis, GrokBot, Antigravity, Codex, other reviewers, coaches, and the owner. The Huddle records claims and routes each substantial lane to one feature issue created from `.github/ISSUE_TEMPLATE/ai-work-lane.yml`. Detailed evidence and decisions stay on that feature issue; implementation and review stay on its linked pull request.

Do not create a freeform `ai-comms` message folder. GitHub is the asynchronous communication system, while this file defines its contract and `COUNCIL_DECISIONS.md` preserves durable decisions with the code.

## Authority

1. The owner sets the product and football intent.
2. `PROJECT_AUTHORITY.md` controls football, safety, privacy, and learning rules until the owner explicitly changes it.
3. The council recommends and challenges. It does not silently change authority.
4. Jarvis chairs the board, records the decision state, assigns one write lane, and verifies the result.
5. GitHub pull requests are the only route into `main`.

## Council seats

| Seat | Job |
| --- | --- |
| Owner | Final call on football, safety, privacy, and product tradeoffs |
| Jarvis chair | Reconcile proposals, protect authority, assign one builder, verify release evidence |
| Codex integration | Build or integrate one accepted lane, run repository/browser verification, and report exact limits |
| GrokBot discovery | Bring visual ideas, public examples, alternatives, and challenges as advisory proposals |
| Antigravity review | Prototype or independently review product, visual, code, and security behavior without becoming a second writer |
| Child-learning reviewer | Ask whether a 5–7-year-old can see the spacing and answer: where am I, who is my job, where do I go? |
| Football/safety reviewer | Check assignments, lane integrity, legal technique, and unsafe wording |
| Website reviewer | Check accessibility, mobile use, navigation, performance, and regression risk |
| Builder | Implement only an accepted, bounded change on one named branch |

An API response does not speak for itself on GitHub. The agent requesting that response posts a sanitized summary, names the provider, preserves supporting links when available, and labels the result advisory.

## Message types

- `CLAIM` — reserves exact files for one bounded write lane.
- `PROPOSAL` — offers an evidence-backed change without permission to edit.
- `FINDING` — reports a reproducible observation, including uncertainty.
- `REVIEW` — challenges a proposal or pull request without becoming a second writer.
- `BLOCKED` — names the missing owner decision, evidence, permission, or external state.
- `HANDOFF` — closes an agent turn with verified, unverified, and next-owner fields.

## Decision states

- `PROPOSAL` — an idea awaiting evidence and review.
- `TEST` — worth prototyping or field-checking, but not accepted as truth.
- `ACCEPTED FOR BUILD` — authority is clear, one branch is assigned, and tests are named.
- `NEEDS OWNER` — changes football, safety, privacy, cost, external data flow, or a protected product decision.
- `REJECTED` — conflicts with authority, lacks evidence, duplicates a stronger path, or harms child comprehension.
- `VERIFIED` — merged, deployed, and checked on the public site; field acceptance remains separate when required.

## One comment format

Every council comment uses this compact structure:

```text
AGENT: Jarvis | Codex | GrokBot | Antigravity | Coach | Owner | Other
TYPE: CLAIM | PROPOSAL | FINDING | REVIEW | BLOCKED | HANDOFF
STATUS REQUESTED: PROPOSAL | TEST | ACCEPTED FOR BUILD | NEEDS OWNER | REJECTED | VERIFIED
BASE COMMIT: Exact commit inspected before the work.
BRANCH: Named feature branch, or none for advisory review.
FILES CLAIMED: Exact paths, or none for advisory review.
PROBLEM: What a child or coach cannot do today.
EVIDENCE: Exact public page, screenshot, file/line, test, or field observation.
PROPOSED ACTION: One bounded change.
AUTHORITY / PRIVACY IMPACT: None, or the exact protected rule affected.
KID IMPACT: How this helps a 5–7-year-old see or remember the job.
TESTS: Automated, desktop, phone, animation, safety, and/or field checks.
ROLLBACK: Current known-good commit.
REQUEST TO TEAM: Exact review, decision, or next action requested.
```

Every `HANDOFF` adds:

```text
RESULT: Implemented | Reviewed | Blocked | Advisory only
VERIFIED: Exact checks completed by this agent.
NOT VERIFIED: Anything not personally inspected or completed.
NEXT OWNER: Owner, Jarvis, Codex, GrokBot, Antigravity, or named human.
```

## Working protocol

1. Read `AGENTS.md`, project authority, project status, and the latest Huddle comments.
2. Post a `CLAIM` on Issue #6 with exact files, base commit, branch, tests, and rollback.
3. Create or reuse one bounded feature issue from the AI work-lane template and link it from the Huddle claim.
4. At least child-learning, football/safety, and website review must challenge a material visual or animation change.
5. Jarvis or the owner records `ACCEPTED FOR BUILD`, `TEST`, `NEEDS OWNER`, or `REJECTED` with the reason.
6. One builder uses one feature branch. GrokBot and Antigravity review without editing claimed files unless the lane is formally reassigned.
7. The pull request links the Huddle claim and feature issue and lists authority impact, tests, screenshots, and rollback.
8. GitHub checks must pass. A reviewer compares the diff with the accepted proposal and posts a structured `REVIEW` or `HANDOFF`.
9. After merge, verify the cache-busted public page and record deployment evidence on the feature issue and Huddle.
10. A child-facing change is not called kid-ready until it also survives an anonymous field check with actual players or coaches.

## Antigravity and external-agent receipt rule

An Antigravity, GrokBot, API, or other external review counts only when all of the following are recorded:

1. The exact commit or pull request reviewed.
2. The sanitized prompt or task contract.
3. The actual response or a faithful sanitized receipt.
4. Whether the agent had read-only, plan, or write permissions.
5. The checks the external agent personally ran.
6. A human/Jarvis/Codex verification of any material claim before acceptance.

A prepared prompt, launched application, or timeout is not a completed review.

## Non-negotiable guardrails

- No agent, bot, API, or human pushes unreviewed improvement experiments directly to `main`.
- No child names, private schedules, contact information, private conversations, credentials, or local-path inventories are posted.
- No model is described as having reviewed the app unless its actual response is available on the board or in a linked sanitized receipt.
- External-agent output is untrusted advisory input: it never auto-executes, never self-approves, and never grants another agent a write lane.
- Do not post credentials, personal email addresses, hidden prompts, provider payloads, absolute private paths, or private repository inventories in issues or pull requests.
- Council agreement can prioritize a test; it cannot override the owner or turn an unverified claim into a fact.
- Schedule stays hidden and the one-drill rule stays in force until the owner explicitly changes either.

## Current coordination objective

Preserve the verified Lions teaching app while the broader sports-coaching platform is designed in bounded, reviewable lanes. Communication-system work may improve routing and evidence, but it may not silently authorize accounts, uploads, analytics, cloud storage, AI data transfer, football changes, or deployment.
