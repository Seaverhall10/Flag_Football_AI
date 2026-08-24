# Mobile App Information-Architecture Audit — 2026-08-24

## Owner correction

The site must be a clean, organized mobile coaching tool. Responsive widths are not enough. The drill and playbook are the practice priorities; administration must not compete with them.

## Verified pre-change public behavior at 390 × 844

| Page | Measured height | Primary problem |
| --- | ---: | --- |
| Home | 1.0 screens | No navigation or page title; opened with five cues and six equal play tiles instead of a practice decision |
| Playbook | 3.3 screens | Six-link desktop header, explanatory banner, six buttons, and formation card delayed the animation |
| Drill | 1.0 screens | Strong teaching field but no visible route back to Plays, Home, or Coach |
| Sideline/Coach | 1.6 screens | Six-link header plus a second Quick Navigation block duplicated the site structure |
| Notes | 3.2 screens | Duplicated the entire play caller before notes, tracker, backup, and printables |
| Roster | 4.9 screens | Depth chart, rotations, and player administration were one continuous phone page |

All measured public pages avoided horizontal document overflow. That proved why overflow alone is an inadequate mobile gate.

## Adopted information architecture

1. **Home** — two choices: Run the Drill or Watch a Play.
2. **Plays** — pick run, set Wing spacing, watch all 16 players, use four rep controls; open assignments or coach controls only when needed.
3. **Drill** — enter the one approved half-team drill immediately; switch Offense/Defense and run the rep.
4. **Coach** — sideline caller first; roster, notes, tracker, backup, and print resources are secondary tools.

The primary navigation is identical on every interactive page. Schedule remains hidden. The interface uses football and coaching language only; project governance remains in repository documents.

## Mobile acceptance checks

- 390 × 844 viewport with no horizontal page overflow.
- Four primary navigation targets, each at least 44 pixels high.
- Current page visible in the compact header and navigation.
- Home's two practice choices visible together on the first screen.
- Playbook preserves six calls, two Wing formations, 16 players, eight jobs, and Play/Back/Next/Reset.
- Drill preserves nine players, Offense/Defense teaching views, and Play/Back/Next/Reset.
- Secondary controls are collapsed, not deleted.
- No visible Schedule link and no child identity data.

## Remaining boundary

Browser verification can establish layout and interaction. Only a field session with anonymous 5–7-year-old players and coaches can establish that the final teaching picture is understood during practice.

## Verified release candidate

- Phone Home, Notes, Roster, and Coach first screens fit within one 390 × 844 viewport; the Playbook is 1.5 viewports with secondary sections closed.
- All four bottom navigation targets render 54 pixels high on the phone.
- All 12 Playbook combinations retain 16 players and eight job cards.
- All eight drill setup combinations retain nine players, five offensive jobs, and four defensive jobs; Offense/Defense views preserve identical coordinates.
- Home, Plays, Drill, Coach, Notes, and Roster passed at 768 × 1024, 1280 × 720, and 1440 × 900 with no page overflow or browser log errors.
- The repository verifier passes 251 of 251 checks.
