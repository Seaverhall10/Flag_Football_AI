# Council Decision Ledger

This file mirrors durable decisions from the GitHub council issue. The GitHub issue is the conversation room; this ledger is the repository record that travels with the code.

## 2026-08-24 practice-readiness review

Rollback baseline before council repair: `90bd722` (current incoming `main`). Last fully verified public baseline: `304d853`, which records release commit `b3192ed`.

| Proposal or observed change | State | Evidence and reason |
| --- | --- | --- |
| Use one GitHub Issue for all AI, agent, API, coach, and owner proposals | ACCEPTED FOR BUILD | Owner direction on 2026-08-24; prevents parallel direct changes and gives every recommendation a visible evidence trail |
| Keep one named builder and pull-request route to `main` | ACCEPTED FOR BUILD | `AGENTS.md` and `AI_CHANGE_PROTOCOL.md`; protects newer work and release checks |
| Restore a large teaching field, large tokens, and full-word controls | ACCEPTED FOR BUILD | Owner previously required more space; live 1280×720 and phone review showed tiny player tokens and abbreviated labels after the compact-board change |
| Keep hip/leverage markers as a visual teaching aid | TEST | Promising visual idea, but it must match the governed assignment and remain legible on phone and desktop |
| Let children drag the two backs during the authoritative animation | TEST | Direct manipulation may help alignment practice, but it can also distort the called path; field acceptance is required before release |
| Add an RB1/RB2 ball-carrier selector | NEEDS OWNER | Changes the current governed drill identity and increases pre-snap choices; do not infer approval from an external-agent commit |
| Center takes one direct angle to the Linebacker, fits, and makes a short controlled push | OWNER OVERRIDE — ACCEPTED | Owner correction on 2026-08-24. The Center targets the Linebacker's fixed starting landmark; Center and Linebacker use independent waypoints so there is no chasing, magnetizing, flipping, or dancing. |
| Separate OFFENSE and DEFENSE teaching views | OWNER OVERRIDE — ACCEPTED | Owner correction on 2026-08-24. Views change visual emphasis only and never change assignments or player coordinates. |
| Use only simple solid responsibility arrows | OWNER OVERRIDE — ACCEPTED | Owner correction on 2026-08-24. Removes dashed, multi-turn paths that confused the teaching picture. |
| Keep phones edge-to-edge but cap the desktop teaching board at 1080 pixels | SUPERSEDED | The first size correction reduced the field but still produced a 1447-pixel page on a 720-pixel laptop and left primary controls below the fold. |
| Put a 620-pixel field beside compact teaching controls on laptops/desktops | OWNER OVERRIDE — ACCEPTED | Owner correction on 2026-08-24 required a full-page user audit. The audited layout keeps all nine players, cue, and Play/Back/Next/Reset visible together; phones and tablets remain single-column. |
| Collapse speed, scrubber, and dots under Coach Controls | ACCEPTED FOR BUILD | Full-page user audit found that secondary controls competed with the main rep. Primary controls stay visible; advanced controls remain one tap away. |
| Other back “kicks” or blocks the Corner on outside runs | REJECTED | Conflicts with the protected rule that Corner is unblocked and introduces unsafe/unclear language for 5–7-year-olds |
| Shrink the board and player tokens to fit more controls above the fold | REJECTED | Directly conflicts with the owner's spacing correction and makes player labels too small to teach from a sideline screen |
| Load a duplicate `half-drill.v2.js` beside the governed script | REJECTED | Repository verification fails because `drills.html` no longer loads the governed `js/half-drill.js`; duplicate authorities invite drift |
| Field-check the final drill with anonymous 5–7-year-old players and coaches | TEST | Required before claiming the visual is kid-ready; no field-acceptance evidence exists yet |
| Treat the website as one mobile coaching app with Home, Plays, Drill, and Coach | OWNER OVERRIDE — ACCEPTED | Owner correction on 2026-08-24. A phone audit found six inconsistent navigation links, duplicated play calling, and critical actions buried across pages up to 4.9 screens long. |
| Lead Home with only Run the Drill and Watch a Play | OWNER OVERRIDE — ACCEPTED | These are the two practice actions. The six-play grid, cue wall, Schedule, and technical project language do not belong on the starting screen. |
| Put roster, notes, tracker, backup, and printables under Coach | OWNER OVERRIDE — ACCEPTED | Keeps administration available without competing with the child teaching flow. Secondary phone sections collapse until the coach asks for them. |
| Call a page mobile-friendly because it has no horizontal overflow | REJECTED | Width compliance did not produce a usable flow. Mobile acceptance also requires clear hierarchy, consistent navigation, 44-pixel targets, and the teaching action before secondary controls. |

## How to update this ledger

Only copy a decision here after the council issue records its state and reason. Football, safety, privacy, spending, or external-data changes require the owner. Implementation does not upgrade a decision to `VERIFIED`; automated gates, browser checks, deployment, and public verification are separate evidence.
