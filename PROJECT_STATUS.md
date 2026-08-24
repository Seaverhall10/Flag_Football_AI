# Project Status

## Latest owner corrections

- The current six-play offense is QB direct snap: QB catches the snap and runs.
- The other two backs are WING-L and WING-R, with both spread and tight spacing.
- The animation must give young players enough room to see every route, block, and lane.
- The public app has one drill only: five-player half offense versus four-player half defense.

## Verified locally

- The full-team field is now 940 visual units tall instead of 640.
- Spread Wings start at x=160 and x=840; Tight Wings start at x=395 and x=605 beside the QB.
- All six calls were tested in both Wing formations: 12 of 12 cases show 16 players and eight offensive jobs.
- QB owns the direct snap and run on every call; play-side Wing leads and backside Wing fakes.
- Tapping a job dims the other 15 players and isolates the selected route or block.
- The single half-team drill contains Center, Guard, Tackle, Runner, and Lead RB versus DL, LB, CB, and a selectable DL/LB.
- All eight drill combinations were tested: Inside/Outside × Left/Right × Two-DL/Two-LB.
- The drill shows five offensive jobs and four defensive-integrity jobs; tapping one isolates the matchup.
- Both animations advance slowly to Direct Snap after 1.2 seconds rather than jumping to the finish.
- Desktop and 390×844 phone layouts have no horizontal overflow or console errors.
- Legacy `drill.html`, `stations.html`, `practice.html`, and `js/grid5v4.js` are removed.
- `node scripts/verify_project.mjs` passes 225 of 225 checks.

## Unknown

- The exact current-season Edge/DE alignment interpretation until the league or officials confirm it.
- Field acceptance with actual 5–7-year-old players has not yet occurred.

## Next

1. Review and merge the governed feature branch.
2. Confirm GitHub Pages deployment succeeds.
3. Repeat the critical playbook and drill checks on cache-busted public URLs.
4. Record the released commit and public evidence here.
