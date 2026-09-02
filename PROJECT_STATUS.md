# Project Status

## Latest owner direction — 2026-09-01

- The app no longer focuses on the former Lions team.
- The one existing repository, Firebase project, and integration PR now serve Seth's Seahawks.
- Do not create a second app, repository, Firebase project, or competing implementation lane.

## Verified before the Seahawks migration

- Draft PR #17 contains the preserved owner multi-team workspace, governed AI Huddle protocol, and possession-aware motion/UI correction.
- The playbook correction passed 344/344 repository checks and a 14-play browser sweep with 16 visible players and 16 job cards per play.
- The ball attaches to the explicit carrier after the exchange; mobile and desktop layouts were checked.
- Firebase Hosting exists at `https://coach-ai-assist.web.app/`, but it was deployed from an uncommitted workspace rather than a reviewed Git commit.
- The hosted product is a demo, not secure multi-user software. Simulated sign-in and client-generated invitations are not accepted production behavior.

## Seahawks migration verified on the review branch

- Public/default identity is Seahawks Coach for 5–6-year-old players.
- Existing local browser data is preserved through legacy-key compatibility; no roster or notes are uploaded.
- The former Lions/CFSA brand and rules are not Seahawks authority.
- The 14 coach-sheet plays and one drill remain provisional carried-forward teaching content until Seth's current playbook and league rules are confirmed.
- Public personal-email defaults and insecure invitation behavior are removed or disabled in the reviewed branch.
- The coach rotation planner has no starter ranking or bench label. It uses anonymous labels, Position Rotation, and Next Rotation; changes save only on that device.
- Roster/rotation is removed from primary navigation and remains a secondary Coach tool with an explicit privacy warning.
- At 390×844, player rotations render as two-by-two quarter cards with 44-pixel controls and no page overflow.
- Asset versions were advanced so deployed phones do not retain the pre-Seahawks stylesheet and scripts.

## Current verification

- `node scripts/verify_ai_comms.mjs`: 38/38 passed.
- `node scripts/verify_project.mjs`: 351/351 passed.
- Browser: 16 players, eight offense plus eight defense jobs, compact 14×14 arrow markers, ball/carrier transforms matched after the catch, and no console errors.
- Browser rotation QA: assignment saved in place, survived reload, and displayed correctly at desktop and 390×844.
- This branch is not deployed. The Firebase URL continues to show the older build until an authorized merge and exact-commit deployment.

## Unknown

- Seth's current league, roster size, game format, and rule packet. The owner confirmed the players are ages 5–6.
- Whether the current 14 play sheets and 5-on-4 drill should become the Seahawks' official system or be replaced.
- Which Google account owns Firebase project `coach-ai-assist`.
- Real Firebase Auth provider status, membership schema, invitation rules, and deploy authority.
- Field acceptance with Seahawks coaches and players.

## Next

1. Review and merge PR #17 once the owner accepts the Seahawks direction and provisional football content.
2. Obtain Seth's current league packet and approved Seahawks playbook before changing football assignments.
3. Authenticate the Firebase owner account, then implement and test real authentication and least-privilege team invitations.
4. Deploy the exact reviewed commit once and verify the live phone application.
