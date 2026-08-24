# Cy-Fair K/1 Lions — Flag Football AI

> **Live app:** https://seaverhall10.github.io/Flag_Football_AI/
>
> **Repository:** https://github.com/Seaverhall10/Flag_Football_AI
>
> **Canonical local workspace:** `C:\Users\User\Documents\Flag_Football_AI`

A mobile-first visual coaching app for the Cy-Fair K/1 Lions (8-on-8 flag football, ages 5–6).

## Current teaching system

### QB + Wings playbook

The six current calls are QB keepers. The QB catches the direct snap and runs. WING-L and WING-R can use either spread or tight spacing; the play-side Wing leads and the backside Wing sells the fake.

| Call | Landmark | QB job |
| --- | --- | --- |
| QB Inside Right | C–RG | Catch, follow Lead Wing, plant once, north |
| QB Inside Left | C–LG | Catch, follow Lead Wing, plant once, north |
| QB Off-Tackle Right | RG–RT | Press alley, one cut, north |
| QB Off-Tackle Left | LG–LT | Press alley, one cut, north |
| QB Wide Right | Outside RT | Reach landmark, turn north |
| QB Wide Left | Outside LT | Reach landmark, turn north |

The playbook shows all eight offensive players and all eight look-team defenders through seven slow-motion teaching beats. Every lineman has a named target or help responsibility.

### The one drill

`drills.html` is the only public drill:

- Offense: Center, Guard, Tackle, Runner, and Lead RB.
- Defense: D-Lineman, Linebacker, Corner, plus either another D-Lineman or another Linebacker.
- Coach choices: Inside/Outside, Left/Right, and Two-DL/Two-LB front.
- Seven beats teach lineup, direct snap, first step, legal fit, lane, shed/flag, and finish.
- Job cards explain blocking targets, defensive gap integrity, separation, pursuit, and contain.

Old drill grids and station-poster collections are intentionally removed.

## Protected cues

1. **OL:** Find your jersey. Head out. Hands inside.
2. **QB:** See it. Catch it. Tuck it. Run.
3. **Wing/Lead RB:** Lane first. Then Linebacker.
4. **Defense:** Protect lane. Separate. Find ball. Shed.
5. **Corner:** Nothing outside. Force in.

## Governance

- `AGENTS.md` — rules for every human and AI contributor.
- `PROJECT_AUTHORITY.md` — football, safety, privacy, formation, and drill truth.
- `AI_CHANGE_PROTOCOL.md` — branch, review, testing, deployment, and rollback rules.
- `PROJECT_STATUS.md` — verified state, unknowns, and next work.
- `scripts/verify_project.mjs` — automated release gate.

## Main files

```text
playbook.html              QB direct-snap playbook with spread/tight Wings
drills.html                the single animated half-team drill
js/sim.js                  seven-beat full-team play animation
js/half-drill.js           seven-beat half-team drill animation
css/styles.css             authoritative visual design
roster.html + js/roster.js anonymous local-only roster tool
app.html                   sideline call interface
```

## Release check

```powershell
node scripts/verify_project.mjs
```

A release also requires real-browser checks on desktop and 390×844 phone, all play/drill choices, slow motion, assignments, page overflow, console errors, GitHub Pages deployment, and the cache-busted public pages.
