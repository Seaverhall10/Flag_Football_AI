# Lions Improvement Council Board

This repository uses [GitHub Issue #6](https://github.com/Seaverhall10/Flag_Football_AI/issues/6) as the one shared room for improvement ideas from Jarvis, Grok, Codex, other agents, API reviewers, coaches, and the owner. The board exists so contributors compare evidence before code changes instead of pushing competing versions to `main`.

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
| Grok discovery | Bring visual ideas, public examples, alternatives, and challenges as advisory proposals |
| Child-learning reviewer | Ask whether a 5–7-year-old can see the spacing and answer: where am I, who is my job, where do I go? |
| Football/safety reviewer | Check assignments, lane integrity, legal technique, and unsafe wording |
| Website reviewer | Check accessibility, mobile use, navigation, performance, and regression risk |
| Builder | Implement only an accepted, bounded change on one named branch |

An API response does not speak for itself on GitHub. The agent requesting that response posts a sanitized summary, names the provider, preserves supporting links when available, and labels the result advisory.

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
SEAT: Grok | Jarvis | Codex | Child Learning | Football/Safety | Website | Coach | Owner
STATUS REQUESTED: PROPOSAL | TEST | ACCEPTED FOR BUILD | NEEDS OWNER | REJECTED
PROBLEM: What a child or coach cannot do today.
EVIDENCE: Exact public page, screenshot, file/line, test, or field observation.
PROPOSAL: One bounded change.
AUTHORITY IMPACT: None, or the exact protected rule affected.
KID IMPACT: How this helps a 5–7-year-old see or remember the job.
FILES: Expected files, if known.
TESTS: Automated, desktop, phone, animation, safety, and/or field checks.
ROLLBACK: Current known-good commit.
```

## Working protocol

1. Post the idea to the one council issue before opening a competing implementation.
2. At least child-learning, football/safety, and website review must challenge a material visual or animation change.
3. Jarvis records `ACCEPTED FOR BUILD`, `TEST`, `NEEDS OWNER`, or `REJECTED` with the reason.
4. One builder claims the exact write lane and creates one feature branch.
5. The pull request links the board comment and lists authority impact, tests, screenshots, and rollback.
6. GitHub checks must pass. A reviewer compares the diff with the accepted proposal.
7. After merge, verify the cache-busted public page. Record deployment evidence on the board.
8. A child-facing change is not called kid-ready until it also survives an anonymous field check with actual players or coaches.

## Non-negotiable guardrails

- No agent, bot, API, or human pushes unreviewed improvement experiments directly to `main`.
- No child names, private schedules, contact information, private conversations, credentials, or local-path inventories are posted.
- No model is described as having reviewed the app unless its actual response is available on the board or in a linked sanitized receipt.
- Council agreement can prioritize a test; it cannot override the owner or turn an unverified claim into a fact.
- Schedule stays hidden and the one-drill rule stays in force until the owner explicitly changes either.

## Current board objective

Before the next practice, stabilize the single half-team drill, restore large readable player spacing, preserve the governed blocking assignments, and give coaches one reliable slow-motion teaching flow. Broader app ideas can be ranked now, but they should not destabilize that practice-critical path.
