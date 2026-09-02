import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const checks = [];

function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/^\uFEFF/, "");
}

function pass(name, condition, detail = "") {
  checks.push({ name, ok: Boolean(condition), detail });
  if (!condition) failures.push(`${name}${detail ? `: ${detail}` : ""}`);
}

function walk(dir, extension) {
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", "node_modules"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...walk(full, extension));
    else if (!extension || full.endsWith(extension)) result.push(full);
  }
  return result;
}

for (const file of ["AGENTS.md", "PROJECT_AUTHORITY.md", "AI_CHANGE_PROTOCOL.md", "PROJECT_STATUS.md", "COUNCIL_BOARD.md", "COUNCIL_DECISIONS.md"]) {
  pass(`required authority file ${file}`, fs.existsSync(path.join(root, file)));
}

const htmlFiles = walk(root, ".html");
const jsFiles = walk(path.join(root, "js"), ".js");
const html = new Map(htmlFiles.map((file) => [path.relative(root, file), fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "")]));

for (const [relative, source] of html) {
  pass(`Schedule hidden in ${relative}`, !/href=["']schedule\.html(?:[?#][^"']*)?["']/i.test(source));
  pass(`single stylesheet authority in ${relative}`, !/href=["']styles\.css(?:[?#][^"']*)?["']/i.test(source));

  for (const match of source.matchAll(/(?:src|href)=["']([^"']+)["']/gi)) {
    const target = match[1].split(/[?#]/)[0];
    if (!target || /^(?:https?:|mailto:|tel:|data:|javascript:|#)/i.test(target)) continue;
    if (target.includes("${")) continue;
    const resolved = path.resolve(path.dirname(path.join(root, relative)), target);
    pass(`asset ${relative} -> ${target}`, fs.existsSync(resolved));
  }
}

const playbook = read("playbook.html");
const sim = read("js/sim.js");
const roster = read("js/roster.js");
const drills = read("drills.html");
const halfDrill = read("js/half-drill.js");
const authority = read("PROJECT_AUTHORITY.md");
const styles = read("css/styles.css");
const appShell = read("js/app.js");
const home = read("index.html");
const notes = read("notes.html");
const rosterPage = read("roster.html");
const teamManager = read("js/engine/team-manager.js");
const gate = read("js/gate.js");
const firebaseAuth = read("js/engine/firebase-auth.js");
const inviteManager = read("js/engine/invite-manager.js");
const invitePage = read("invite.html");
const emailService = read("js/engine/email-service.js");
const schedule = read("js/schedule.js");

const primaryPublicPages = [
  "index.html", "playbook.html", "drills.html", "app.html", "notes.html",
  "roster.html", "parent.html", "runner.html", "runner-guide.html",
  "flashcards.html", "sideline.html", "wristbands.html", "tracker.html",
  "schedule.html", "invite.html"
];
pass("public pages use Seahawks identity",
  primaryPublicPages.every((file) => /Seahawks/i.test(read(file))),
  primaryPublicPages.filter((file) => !/Seahawks/i.test(read(file))).join(", "));
pass("former Lions and CFSA branding is absent from public pages",
  primaryPublicPages.every((file) => !/Cy-Fair|CFSA|K\/1 Lions|Lions Coach/i.test(read(file))),
  primaryPublicPages.filter((file) => /Cy-Fair|CFSA|K\/1 Lions|Lions Coach/i.test(read(file))).join(", "));
pass("Seahawks is the default team",
  /DEFAULT_TEAM_ID\s*=\s*["']seahawks-youth-flag["']/.test(teamManager) &&
  /name:\s*["']Seahawks["']/.test(teamManager));
pass("legacy team metadata migrates without deleting browser data",
  /LEGACY_TEAM_ID\s*=\s*["']lions-k1-flag["']/.test(teamManager) &&
  /migrateFormerDefault/.test(teamManager) &&
  !/removeItem\(/.test(teamManager));
pass("public gate is an honest demo, not a shared password",
  /Public demo/i.test(gate) && /Open demo/i.test(gate) &&
  !/TEAM_PASS|type=["']password["']|URLSearchParams|[?&]join=/i.test(gate));
pass("Firebase auth has no simulated account fallback or personal-email prompt",
  /Secure sign-in setup is pending Firebase owner access/i.test(firebaseAuth) &&
  !/prompt\s*\(|provider:\s*["'](?:demo|local|simulated)["']|setRole\s*\(|sethharrison|seaverhall@gmail/i.test(firebaseAuth));
pass("secure invitations stay disabled until backend enforcement exists",
  /Secure team invitations are not available yet/i.test(inviteManager) &&
  /disabled/i.test(invitePage) &&
  !/URLSearchParams|location\.search/.test(inviteManager));
pass("invite email service performs no external data transfer",
  /not available yet/i.test(emailService) &&
  !/formsubmit|fetch\s*\(|XMLHttpRequest|navigator\.sendBeacon/i.test(emailService));
pass("public source contains no seeded personal email address",
  !/sethharrison|seaverhall@gmail/i.test([...primaryPublicPages.map(read), firebaseAuth, inviteManager, emailService].join("\n")));
pass("schedule ships empty until Seahawks details are confirmed",
  /const DEFAULT_SCHEDULE\s*=\s*\[\s*\]/.test(schedule) &&
  !/Cy-Fair|CFSA/i.test(schedule));

pass("shared mobile shell has four primary destinations",
  ["index.html", "playbook.html", "drills.html", "app.html"].every((href) => appShell.includes(`href: "${href}"`)) &&
  (appShell.match(/label:\s*"(?:Home|Plays|Drill|Coach)"/g) || []).length === 4);
pass("shared shell injects one mobile tab bar", /className\s*=\s*["']tabbar no-print["']/.test(appShell));
pass("mobile tab bar uses four equal columns", /\.tabbar\s*\{[^}]*grid-template-columns:\s*repeat\(4/i.test(styles));
pass("mobile top app bar exists", /className\s*=\s*["']mobile-appbar no-print["']/.test(appShell));
pass("home leads with drill and play choices", /Run the blocking drill/i.test(home) && /Watch a play/i.test(home));
pass("home no longer duplicates all six play calls", !/class=["'][^"']*run-tile/i.test(home));
pass("playbook uses horizontal phone play picker", /\.playbook-page\s+\.play-picker\s+\.btn-grid[\s\S]*?overflow-x:\s*auto/i.test(styles));
pass("playbook secondary teaching is collapsible", (playbook.match(/<details\s+class=["'][^"']*playbook-more/g) || []).length >= 3);
pass("playbook coach controls are secondary", /<details\s+class=["'][^"']*playbook-coach-controls/i.test(playbook));
pass("notes does not duplicate the sideline play caller", !/class=["'][^"']*play-btn/i.test(notes) && !/id=["']call["']/.test(notes));
pass("notes separates secondary tools", (notes.match(/<details\s+class=["'][^"']*coach-more/g) || []).length === 3);
pass("roster views collapse independently on phones", (rosterPage.match(/<details\s+class=["'][^"']*mobile-collapse/g) || []).length === 3 && /querySelectorAll\(["']\.mobile-collapse["']\)/.test(appShell));
pass("roster is a secondary Coach tool, not primary navigation",
  [...html.entries()].every(([file, source]) => file === "app.html" || !/href=["']roster\.html["']/i.test(source)) &&
  /More coach tools[\s\S]*href=["']roster\.html["']/i.test(read("app.html")));
pass("game rotation UI has no starter ranking labels",
  !/\bstarter(?:s)?\b|second string|2nd string|first string/i.test(`${rosterPage}\n${read("app.html")}\n${playbook}\n${sim}`));
pass("rotation planner uses child-positive Next Rotation language",
  /Next Rotation/.test(rosterPage) && /Next Rotation/.test(roster) && !/>\s*Bench(?:\s|<)/i.test(`${rosterPage}\n${roster}`));
pass("rotation planner states local-only privacy and save behavior",
  /Coach-only and local to this device/i.test(rosterPage) &&
  /Saved automatically on this device/i.test(rosterPage) &&
  /localStorage\.setItem/.test(roster));
pass("owner-confirmed Seahawks age is recorded", /5[–-]6-year-old players/i.test(authority));

const runKeys = [...playbook.matchAll(/data-run-key=["']([^"']+)["']/g)].map((match) => match[1]);
const expectedKeys = Array.from({ length: 14 }, (_, i) => `play-${String(i + 1).padStart(2, "0")}`);
pass("exactly 14 unique play selectors", runKeys.length === 14 && new Set(runKeys).size === 14, runKeys.join(", "));
pass("play keys are play-01 through play-14", expectedKeys.every((key) => runKeys.includes(key)), runKeys.join(", "));
pass("playbook includes coach photos", /plays\/play-01\.jpg/.test(playbook) && fs.existsSync(path.join(root, "plays/play-01.jpg")));
pass("playbook loads governed simulator", /src=["']js\/sim\.js(?:\?[^"']*)?["']/i.test(playbook));
pass("playbook does not load replacement field simulator", !/src=["']js\/field-diagram\.js/i.test(playbook));
const playsData = fs.existsSync(path.join(root, "js/plays-data.js")) ? read("js/plays-data.js") : "";
pass("plays-data defines 14 plays", expectedKeys.every((key) => playsData.includes(`id: "${key}"`) || playsData.includes(`id: '${key}'`)), "missing play ids in js/plays-data.js");
pass("sim or plays-data lists all 14 plays", expectedKeys.every((key) => sim.includes(key) || playsData.includes(key)));
pass("playbook lineup tools are collapsed behind one tap", /<details\s+class=["'][^"']*quick-squad-bar/i.test(playbook));
pass("playbook keeps live field primary on phones", /\.play-teacher\s*\{[\s\S]*?100dvh\s*-\s*198px/i.test(styles));
pass("ball possession uses the explicit carrier id", sim.includes("play.ball.carrierId === id") && !sim.includes("return isBallBack(p);"));
pass("ball attaches to the carrier after the exchange", /data-possession/.test(sim) && /has-possession/.test(sim) && /ballPosAt\(state\.t, poses\)/.test(sim));
pass("playbook arrows use compact fixed-size markers", /markerUnits=["']userSpaceOnUse["']/.test(sim) && /markerWidth=["']14["']/.test(sim));
pass("coach sheet does not force itself over the phone field", /sheetPane\.style\.removeProperty\(["']display["']\)/.test(sim) && !/sheetPane\.style\.display\s*=\s*["']block["']/.test(sim));
pass("Back and Next Beat are visible teaching controls", !/<button[^>]+id=["']sim-(?:back|next)["'][^>]*\shidden(?:\s|>)/i.test(playbook));
pass("speed scrub and GIF remain available as secondary controls", /playbook-coach-controls/.test(playbook) && /id=["']sim-slider["']/.test(playbook) && /id=["']sim-gif["']/.test(playbook) && !/\.playbook-coach-controls\s*\{\s*display:\s*none/i.test(styles));
pass("Slow-Mo is the real default animation speed", /speed:\s*11000/.test(sim) && /slow:\s*11000/.test(sim));

for (const id of ["sim-root", "sim-play", "sim-back", "sim-next", "sim-reset", "sim-slider", "sim-assignments"]) {
  pass(`playbook control #${id}`, new RegExp(`id=["']${id}["']`).test(playbook));
}

for (const letter of ["C", "G", "T", "W", "RB"]) {
  pass(`offense letter ${letter} in plays-data`, new RegExp(`letter:\s*["']${letter}["']`).test(playsData) || new RegExp(`"${letter}"`).test(playsData));
}
for (const letter of ["DT", "DE", "LB", "CB"]) {
  pass(`defense letter ${letter} in plays-data`, new RegExp(`letter:\s*["']${letter}["']`).test(playsData) || playsData.includes(`"${letter}"`));
}

pass("no split wide receiver in governed playbook", !/wide receiver|data-pos=["']WR["']/i.test(`${playbook}\n${sim}\n${roster}`));
pass("old six QB keepers are gone from playbook", !/data-run-key=["']inside-right["']/.test(playbook) && !/QB Keeper/.test(playbook));
pass("spread/tight wing toggles removed", !/data-sim-formation=["']wide["']/.test(playbook) && !/data-sim-formation=["']tight["']/.test(playbook));
pass("authority locks 14 coach-sheet plays", /14 coach-sheet plays photographed by the owner/i.test(authority));
pass("authority does not restore QB as the public runner", !/QB catches the direct snap and is the Runner/i.test(authority));

const drillPages = [...html.keys()].filter((relative) => /^drills?\.html$/i.test(relative));
pass("exactly one public drill page", drillPages.length === 1 && drillPages[0] === "drills.html", drillPages.join(", "));
pass("legacy drill page removed", !fs.existsSync(path.join(root, "drill.html")));
pass("legacy station drill page removed", !fs.existsSync(path.join(root, "stations.html")));
pass("legacy multi-station practice page removed", !fs.existsSync(path.join(root, "practice.html")));
pass("legacy grid drill code removed", !fs.existsSync(path.join(root, "js", "grid5v4.js")));
pass("single drill loads governed half-team animation", /src=["']js\/half-drill\.js(?:\?[^"']*)?["']/i.test(drills));
pass("single drill has one animation authority", !fs.existsSync(path.join(root, "js", "half-drill.v2.js")));
pass("single drill has inside and outside choices", /data-half-lane=["']inside["']/.test(drills) && /data-half-lane=["']outside["']/.test(drills));
pass("single drill has left and right choices", /data-half-side=["']left["']/.test(drills) && /data-half-side=["']right["']/.test(drills));
pass("single drill has two-DL and two-LB choices", /data-half-front=["']two-dl["']/.test(drills) && /data-half-front=["']two-lb["']/.test(drills));
for (const id of ["C", "G", "T", "RUN", "LEAD", "DL", "LB", "CB", "FLEX"]) {
  pass(`half-team drill position ${id}`, new RegExp(`\\b${id}\\b`).test(halfDrill));
}
for (const id of ["half-drill-root", "half-play", "half-back", "half-next", "half-reset", "half-slider", "half-offense-jobs", "half-defense-jobs"]) {
  pass(`single drill control #${id}`, new RegExp(`id=["']${id}["']`).test(drills));
}
pass("authority preserves one carried-forward half-team drill", /one carried-forward drill: half offense versus half defense/i.test(authority));
pass("drill keeps Corner unblocked", /CB:\s*`Unblocked contain/i.test(halfDrill) && !/target:\s*["']CB["']/.test(halfDrill));
pass("drill sends Center directly to Linebacker", /C:\s*\{\s*target:\s*["']LB["']/i.test(halfDrill));
pass("two-DL Lead escorts lane and two-LB Lead blocks outside LB", /LEAD:\s*\{\s*target:\s*["']LANE["']/i.test(halfDrill) && /LEAD:\s*\{\s*target:\s*["']FLEX["']/i.test(halfDrill));
pass("offense and defense teaching views exist", /data-half-view=["']offense["']/.test(drills) && /data-half-view=["']defense["']/.test(drills));
pass("drill paths are solid and direct", !/stroke-dasharray/i.test(halfDrill));
pass("Center and Linebacker use fixed independent landmarks", /function\s+centerLandmarks\s*\(/.test(halfDrill) && !/function\s+reactToBall\s*\(/.test(halfDrill));
pass("drill avoids unsafe child action words", !/\b(?:kick|hold|fight|wrap|pancake|blast|smash|knockdown)\b|drive\s+through/i.test(`${drills.replace(/<[^>]*>/g, " ")}\n${halfDrill}`));
pass("drill exposes role spotlight", /id=["']half-spotlight["']/.test(drills));
pass("drill exposes visual-first kid mode", /class=["'][^"']*kid-demo-mode/.test(drills) && /id=["']half-mode["'][^>]*>CHANGE SETUP</i.test(drills));
pass("kid field is full-width on phones and paired with controls on desktop", /kid-demo-mode\s+\.sim-root\.half-drill-root\s*\{[\s\S]*?max-width:\s*none/i.test(styles) && /@media\s*\(min-width:\s*960px\)[\s\S]*?grid-template-columns:\s*minmax\(0,\s*620px\)\s+minmax\(300px,\s*1fr\)/i.test(styles));
pass("secondary speed and scrub controls are collapsed", /<details\s+class=["']half-coach-controls["']/i.test(drills) && /<summary>COACH CONTROLS<\/summary>/i.test(drills));
pass("drill links four official NFL or NFL-team examples", (drills.match(/class=["']half-clip-card["']/g) || []).length === 4 && (drills.match(/href=["']https:\/\/(?:www\.)?(?:nfl\.com|playfootball\.nfl\.com|youtube\.com)\//g) || []).length === 4);
pass("no three-point stance instruction", !/3-point stance|three-point stance/i.test(`${drills}\n${playbook}\n${sim}`));
pass("authority protects Center and A gaps", /No line defender is head-up on Center or in either A gap/i.test(authority));
pass("authority protects child privacy", /Never commit child names/i.test(read("AGENTS.md")));

const defaultRoster = roster.match(/const DEFAULT_ROSTER\s*=\s*\[([\s\S]*?)\n\];/);
pass("default roster exists", Boolean(defaultRoster));
if (defaultRoster) {
  const names = [...defaultRoster[1].matchAll(/name:\s*["']([^"']+)["']/g)].map((match) => match[1]);
  pass("public roster defaults are anonymous", names.length > 0 && names.every((name) => /^Player #\d+$/.test(name)), names.join(", "));
}

pass("root stylesheet is compatibility alias", read("styles.css").trim() === '@import url("css/styles.css");');

for (const file of jsFiles) {
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  pass(`JavaScript syntax ${path.relative(root, file)}`, result.status === 0, (result.stderr || "").trim());
}

for (const check of checks) console.log(`${check.ok ? "PASS" : "FAIL"}  ${check.name}${check.ok || !check.detail ? "" : ` — ${check.detail}`}`);
console.log(`\n${checks.length - failures.length}/${checks.length} checks passed.`);

if (failures.length) {
  console.error("\nRelease blocked:\n- " + failures.join("\n- "));
  process.exit(1);
}
