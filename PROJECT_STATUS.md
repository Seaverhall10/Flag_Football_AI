# Project Status

## Latest owner corrections

- The current six-play offense is QB direct snap: QB catches the snap and runs.
- The other two backs are WING-L and WING-R, with both spread and tight spacing.
- The animation must give young players enough room to see every route, block, and lane.
- The public app has one drill only: five-player half offense versus four-player half defense.
- The drill opens in an edge-to-edge Kid View with separate OFFENSE and DEFENSE teaching views.
- The Center takes one fixed angle to the Linebacker's starting landmark, makes a short controlled push, then stops while the defender separates.
- The whole public site must work as one organized mobile coaching app, not a collection of desktop pages that merely shrink.
- The four primary destinations are Home, Plays, Drill, and Coach. Schedule remains hidden.

## Verified locally

- A 390×844 live-site audit measured the pre-change playbook at 3.3 screens, notes at 3.2 screens, and roster at 4.9 screens; the drill had no visible route back to the rest of the app.
- The rebuilt Home screen leads with exactly two practice actions: Run the blocking drill and Watch a play.
- Every interactive page receives the same four-destination app shell. The current destination is identified in both the compact phone header and bottom navigation.
- The playbook uses a swipeable compact play picker, two compact wing-spacing choices, the full 16-player animation, and four primary rep controls. Speed, scrubber, job cards, and general cues are secondary phone disclosures.
- Notes no longer duplicates the six-play sideline caller. Notes, rep tracker, backup, and printables are separated by task; roster views collapse independently on phones.
- Phone browser journeys passed all 12 playbook cases (six runs × two Wing spacings) with 16 players and eight jobs, and all eight drill setups with nine players, five offensive jobs, and four defensive jobs.
- Tablet, laptop, and desktop checks covered Home, Plays, Drill, Coach, Notes, and Roster: 18 of 18 page/viewport cases had four primary destinations, no horizontal overflow, and no browser errors.
- `node scripts/verify_project.mjs` passes 251 of 251 checks for this mobile information-architecture release candidate.

- The full-team field is now 940 visual units tall instead of 640.
- Spread Wings start at x=160 and x=840; Tight Wings start at x=395 and x=605 beside the QB.
- All six calls were tested in both Wing formations: 12 of 12 cases show 16 players and eight offensive jobs.
- QB owns the direct snap and run on every call; play-side Wing leads and backside Wing fakes.
- Tapping a job dims the other 15 players and isolates the selected route or block.
- The single half-team drill contains Center, Guard, Tackle, Runner, and Lead RB versus DL, LB, CB, and a selectable DL/LB.
- All 16 teaching cases were tested: Inside/Outside × Left/Right × Two-DL/Two-LB × Offense/Defense view.
- The drill shows five offensive jobs and four defensive-integrity jobs; tapping one isolates the matchup.
- Teaching views change visual emphasis only; a browser check at the controlled-push beat confirmed all nine player coordinates remain identical when switching views.
- All responsibility paths are solid and direct. Phones use an edge-to-edge single column. Laptops and desktops use a 620-pixel field beside a compact teaching-control column so the complete rep and primary controls remain visible together.
- Speed, scrubber, and beat dots are collapsed under Coach Controls. The four primary controls remain immediately visible.
- The Center and Linebacker follow independent fixed waypoints. Browser checks confirmed Center/LB positions at all seven exact beats, including visible fit, short push, separation, and pursuit.
- Four official NFL/NFL Play Football clips are linked below the drill: offensive contact, game blocking technique, defensive shedding, and a real run-lane example.
- Both animations advance slowly to Direct Snap after 1.2 seconds rather than jumping to the finish.
- Complete local user journeys passed at 390×844 phone, 768×1024 tablet, 1280×720 laptop, and 1440×900 desktop sizes with no horizontal overflow or console errors.
- At every audited size, all nine players, the full field, cue, and Play/Back/Next/Reset were visible together. Defense view preserved coordinates; Next/Back/Reset landed on exact beats; player spotlight, Coach Controls, setup changes, and all four official clip links worked.
- Legacy `drill.html`, `stations.html`, `practice.html`, and `js/grid5v4.js` are removed.
- `node scripts/verify_project.mjs` passes 240 of 240 checks for the current release candidate.
- Pull request #4 merged as release commit `b3192ed`.
- GitHub Pages deployment `32749342671` passed verification and deployment.
- The cache-busted public playbook passed all 12 QB/Wing cases, with 16 players and eight jobs in every case.
- The cache-busted public drill passed all eight lane/side/front cases, with nine players, five offensive jobs, and four defensive jobs in every case.
- Public slow motion advanced only to Direct Snap after 1.2 seconds on both pages; neither animation jumped to the finish.
- Public desktop and 390×844 phone checks found no overflow or browser errors.
- Public legacy URLs `drill.html`, `stations.html`, and `practice.html` return HTTP 404.

## Unknown

- The exact current-season Edge/DE alignment interpretation until the league or officials confirm it.
- Field acceptance with actual 5–7-year-old players has not yet occurred.

## Next

1. Run an anonymous field-acceptance session with coaches and 5–7-year-old players.
2. Confirm the current-season Edge/DE interpretation with the league before changing that alignment.
3. Keep all removed drill systems out unless the owner explicitly changes the one-drill rule.
