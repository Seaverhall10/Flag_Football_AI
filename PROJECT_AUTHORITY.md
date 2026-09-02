# Seahawks Coach Product Authority

This file is the durable source of truth for the public app. The owner redirected the existing Coach AI product to Seth's Seahawks on 2026-09-01. The same repository, Firebase project, and release lane remain authoritative; contributors must not create another app.

## Product goal

Help young youth players answer three questions without reading a coach manual:

1. Where do I line up?
2. Who is my job?
3. Where do I go after the snap?

The app teaches one visual decision at a time. It does not add complexity merely because software can display it.

The current client-side password screen is a demo gate, not account security. Do not describe the app as private, signup-ready, or secure until real Firebase authentication, membership rules, and invitation tests pass.

## Team identity — owner correction 2026-09-01

- Primary team: Seahawks.
- Primary coach context: Seth; do not publish contact details or private roster information.
- Former Cy-Fair K/1 Lions branding and CFSA-specific public claims are retired.
- Owner-confirmed age group: 5–6-year-old players.
- Exact Seahawks league, roster size, blocking rules, and game format are not yet confirmed in this repository.
- Until those facts are supplied, use `Youth Flag Football` in public branding and label the current football system as carried-forward teaching content rather than Seahawks league authority.

## Current carried-forward play library

The public playbook currently preserves the 14 coach-sheet plays photographed by the owner. They remain the functional seed library while the Seahawks playbook is confirmed. Do not restore the old six QB-keeper runs, and do not claim the 14 sheets are official Seahawks calls without a new owner decision.

- Current diagram format: 8-on-8 flag. Seahawks league applicability is unconfirmed.
- Formation is the sheet: circles labeled `C`, `G`, `T`, `W`, `RB` as drawn. Two RBs are both labeled `RB` (color/outline distinguishes them).
- Do not invent `QB`, `WING-L`, `WING-R`, `LT`, or `LG` unless that letter is actually on that photo.
- Most plays are five on the line (`T G C G T`) plus `W` plus two backs. If a photo has 7 or 9 offense tokens, match that photo.
- Center is yellow. Play-side is often purple/blue. Backside is grey/white. Ball path is red dashed. Other routes are solid black.
- Offense tokens are circles; defense tokens are squares labeled `CB`, `DE`, `DT`, `LB`.
- Each play's blocking map and ball path come from that photo. Do not reuse one blocking map for all 14 plays.
- Spread/tight wing toggles and Red Diamond / Blue Circle / Gold Star six-call chrome are retired.

## Fourteen carried-forward coach-sheet calls

| Play | Call | What the sheet shows |
| --- | --- | --- |
| Play 1 | Off-Tackle Right | Deep RB through the right tackle gap; other RB leads to the right DE |
| Play 2 | Off-Tackle Left | Deep RB off-tackle left; other RB leads to the left DE |
| Play 3 | Sweep Right | Middle RB sweeps right; Wing fakes left |
| Play 4 | Sweep Left | Middle RB sweeps left; fake right |
| Play 5 | Wing Pass Right | RB rolls right; ball to the Wing deep right |
| Play 6 | Reverse Left | Pitch to the Wing sweeping left |
| Play 7 | A-Gap Right | RB through C–RG; other RB leads; right CB slides |
| Play 8 | A-Gap Left | RB through C–LG; play-side is left/purple |
| Play 9 | Toss Right | I-backs; lead to the right CB; sweep outside the Wing |
| Play 10 | Toss Left | Lead to the left CB; sweep left |
| Play 11 | Boot Right | Keep right; backside RB and Wing lead the edge |
| Play 12 | Sweep Left | Wing leads left; other RB crosses |
| Play 13 | Wide Sweep Right | Split backs; wide sweep right |
| Play 14 | Wide Sweep Left | Split backs; wide sweep left |

## Fixed offensive responsibilities

- Each lineman's job is the defender that player's arrow points at on that sheet.
- `C` snaps, then follows the curved or straight arrow drawn on that play.
- The red-outlined / red-path `RB` is the ball (or the passer/pitcher until the ball leaves).
- The other `RB` leads, fakes, or blocks as drawn.
- `W` blocks or runs the route drawn on that sheet.
- Assignments may include a CB when the photo points a lead arrow at that square.
- Do not restore QB direct-snap keeper runs as the public playbook rule.

## Teaching defense

The full-team teaching look uses:

- `Edge-L`, `DT-L`, `DT-R`, `Edge-R` across the front;
- `LB-L` and `LB-R` at least three yards off;
- `CB-L` and `CB-R` wider and deeper than the Edges.

No line defender is head-up on Center or in either A gap. The exact current-season Edge/DE starting interpretation still needs confirmation from the league or officials, so the diagram is a teaching look rather than a claim about every legal opponent front.

## Safe contact cues

1. Two-point stance.
2. Eyes up and head out of contact.
3. Six-inch call-side step.
4. Open hands inside the legal torso frame; elbows in.
5. Run the feet under control and stay square.
6. Whistle immediately for unsafe balance, head position, or hands.

Never teach or depict head/neck contact, holding, wrapping, tackling, blocks in the back, launching, intentional knockdowns away from the play, or Oklahoma/bull-in-the-ring/head-on collision drills.

## Learning design

- Show all players before the snap with enough vertical and horizontal space to distinguish every route.
- Use one cue per beat: Line Up, Direct Snap, First Step, Fit, Lane, One Cut, Finish.
- Keep ball path (red dashed), lead/fake routes, and block arrows visually distinct, matching that play's photo.
- A child can tap a job card to highlight only that responsibility without removing the full-team context.
- Use position labels, not child names.
- Score the play, not the child.
- Do not add a play until every current run meets the scorecard gate and has zero unsafe blocks.

## Mobile coaching experience

- The public site is one coaching app, not a collection of unrelated pages.
- Primary navigation is limited to `Home`, `Plays`, `Drill`, and `Coach` on phones and desktops.
- Home presents two dominant choices: run the one approved drill or teach a slow-motion play.
- Roster, notes, tracker, backup, and print resources live under Coach and do not compete with the practice actions.
- The playbook puts play selection, the coach-sheet photo beside the live recreation, and Play/Back/Next/Reset in that order. Speed, scrubbing, assignments, and general cues are secondary disclosures on phones.
- The drill opens directly to the teaching field; its setup, Offense/Defense view, field, cue, and four rep controls remain the primary surface.
- Schedule stays out of visible navigation until the owner explicitly restores it.
- Do not put AI, agent, council, governance, or technical language in the child/coach interface.

## The only current drill

The public teaching app has one carried-forward drill: half offense versus half defense. Preserve it until the owner supplies Seahawks-specific replacements; do not call it an official Seahawks league drill.

- Offense: Center, Guard, Tackle, QB/Runner receiving the direct snap, and one Lead Running Back.
- Defense: defensive lineman, linebacker, cornerback, and a fourth defender selectable as either another defensive lineman or another linebacker.
- Coaches select Inside or Outside and Left or Right before the rep.
- Every view names each offensive blocking target and each defender's lane-integrity job.
- With two DL: Guard owns inside DL, Tackle owns outside DL/Edge, Center snaps and takes one direct angle to the play-side LB, Lead RB escorts the called lane, and Corner is unblocked.
- With two LB: Guard owns DL, Tackle helps on the outside half of that DL, Center snaps and takes one direct angle to the inside LB, Lead RB owns the outside/play-side LB, and Corner is unblocked.
- The Center targets the Linebacker's original fit landmark, uses open hands inside the legal torso and short controlled steps, then stops balanced when the Linebacker separates. The animation must never retarget the Center to the moving Linebacker.
- OFFENSE and DEFENSE views may change emphasis only. They may not change the assignment, beat, lane, or player coordinates.
- Responsibility lines are short, solid, and direct: gold Runner, white Lead, cyan blocks, and red defense.
- Defense learns alignment, leverage, controlled hands, separation from the block, shed direction, pursuit, and contain—not collision wins.
- The drill must animate Line Up, Direct Snap, First Step, Fit, Lane, Shed/Flag, and Finish in true slow motion.

## Current uncertainty

The Seahawks age group is owner-confirmed as 5–6. The league, roster size, field format, contact/blocking rules, eligible-receiver rules, equipment rules, and coach-on-field rules are not yet verified. Before changing the carried-forward 8-on-8 diagrams or teaching contact, obtain Seth's current league packet or direct league confirmation and record the evidence in a reviewed change.
