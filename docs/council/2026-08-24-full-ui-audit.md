# Full drill-page user audit — 2026-08-24

## Why this audit was required

The prior release passed structural checks but failed as a complete user experience. On a 1280×720 laptop, the page was 1447 pixels tall and the field alone was 937 pixels tall. Play, Back, Next, and Reset were below the fold. Tablet also had horizontal overflow. Passing code checks did not make the page usable.

## Governing user outcome

A coach must be able to see the complete rep and operate its primary controls without hunting or scrolling. Children must be able to identify every player, lane, assignment arrow, and teaching beat. Secondary controls must not compete with the rep.

## Responsive acceptance results

| Surface | Before | Audited candidate | Result |
| --- | --- | --- | --- |
| Phone 390×844 | 967px page; 381px field | 862px page; 381px edge-to-edge field | Primary journey visible; no overflow |
| Tablet 768×1024 | 1129px page; 619px field; horizontal overflow | One-screen page; centered 620×538 field | No overflow |
| Laptop 1280×720 | 1447px page; 937px field; controls below fold | 620×538 field beside compact controls | Complete rep and primary controls visible together |
| Desktop 1440×900 | 1447px page; 937px field | One-screen 980px teaching stage | No overflow |

## User journey tested at all four sizes

- Nine player tokens rendered.
- OFFENSE and DEFENSE views switched without changing any player coordinate.
- NEXT BEAT landed on Direct Snap.
- Center spotlight opened and explained the job.
- Coach Controls opened and exposed speed and scrubber.
- No horizontal overflow or browser errors occurred.

Additional complete-page checks:

- CHANGE SETUP exposed all three setup choices.
- Outside Left with the two-LB front rendered nine players and the correct call.
- Returning to Kid View restored the compact teaching layout.
- The NFL clip section opened and contained four official links.
- Slow Play reached only Direct Snap after 1.2 seconds.
- Next, Back, and Reset landed exactly on beats 3, 2, and 1.

## Durable UI rules

1. The 1280×720 laptop is the governing desktop acceptance surface.
2. The full field, cue, and Play/Back/Next/Reset must be simultaneously visible at that size.
3. Use a 620-pixel field beside a control column at widths of 960 pixels and above.
4. Keep phone and tablet layouts single-column.
5. Keep interactive targets at least 44 pixels tall.
6. Keep speed, scrubber, and beat dots collapsed under Coach Controls by default.
7. Never accept a size change from CSS measurements alone. Inspect screenshots and run the complete user journey at all four sizes.
8. Automated repository checks are necessary but are not visual acceptance.
