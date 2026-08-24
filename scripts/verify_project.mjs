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

const runKeys = [...playbook.matchAll(/data-run-key=["']([^"']+)["']/g)].map((match) => match[1]);
pass("exactly six unique play selectors", runKeys.length === 6 && new Set(runKeys).size === 6, runKeys.join(", "));
pass("playbook loads governed simulator", /src=["']js\/sim\.js(?:\?[^"']*)?["']/i.test(playbook));
pass("playbook does not load replacement field simulator", !/src=["']js\/field-diagram\.js/i.test(playbook));

for (const id of ["sim-root", "sim-play", "sim-back", "sim-next", "sim-reset", "sim-slider", "sim-assignments"]) {
  pass(`playbook control #${id}`, new RegExp(`id=["']${id}["']`).test(playbook));
}

for (const id of ["LT", "LG", "C", "RG", "RT", "QB", "WBL", "WBR"]) {
  pass(`offense position ${id}`, new RegExp(`\\b${id}\\b`).test(sim));
}
for (const id of ["EL", "DTL", "DTR", "ER", "LBL", "LBR", "CBL", "CBR"]) {
  pass(`defense position ${id}`, new RegExp(`\\b${id}\\b`).test(sim));
}

pass("no split wide receiver in governed playbook", !/wide receiver|data-pos=["']WR["']/i.test(`${playbook}\n${sim}\n${roster}`));
pass("no interchangeable RB1 RB2 RB3 model", !/\\bRB[123]\\b/.test(`${playbook}\n${sim}\n${authority}\n${roster}`));
pass("all six current calls are QB runs", (sim.match(/name:\s*["']QB\s/g) || []).length === 6);
pass("spread Wing formation control", /data-sim-formation=["']wide["']/.test(playbook));
pass("tight Wing formation control", /data-sim-formation=["']tight["']/.test(playbook));
pass("playbook uses tall teaching field", /const H\s*=\s*940/.test(sim));
pass("authority locks direct snap to QB", /QB catches the direct snap and is the Runner/i.test(authority));
pass("authority locks spread and tight Wings", /Spread Wings and Tight Wings/i.test(authority));

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
pass("authority locks one half-team drill", /The public teaching app has one drill: half offense versus half defense/i.test(authority));
pass("drill keeps Corner unblocked", /CB:\s*`Unblocked contain/i.test(halfDrill) && !/target:\s*["']CB["']/.test(halfDrill));
pass("drill sends Center directly to Linebacker", /C:\s*\{\s*target:\s*["']LB["']/i.test(halfDrill));
pass("two-DL Lead escorts lane and two-LB Lead blocks outside LB", /LEAD:\s*\{\s*target:\s*["']LANE["']/i.test(halfDrill) && /LEAD:\s*\{\s*target:\s*["']FLEX["']/i.test(halfDrill));
pass("offense and defense teaching views exist", /data-half-view=["']offense["']/.test(drills) && /data-half-view=["']defense["']/.test(drills));
pass("drill paths are solid and direct", !/stroke-dasharray/i.test(halfDrill));
pass("Center and Linebacker use fixed independent landmarks", /function\s+centerLandmarks\s*\(/.test(halfDrill) && !/function\s+reactToBall\s*\(/.test(halfDrill));
pass("drill avoids unsafe child action words", !/\b(?:kick|hold|fight|wrap|pancake|blast|smash|knockdown)\b|drive\s+through/i.test(`${drills.replace(/<[^>]*>/g, " ")}\n${halfDrill}`));
pass("drill exposes role spotlight", /id=["']half-spotlight["']/.test(drills));
pass("drill exposes visual-first kid mode", /class=["'][^"']*kid-demo-mode/.test(drills) && /id=["']half-mode["'][^>]*>CHANGE SETUP</i.test(drills));
pass("kid field removes the desktop width cap", /kid-demo-mode\s+\.sim-root\.half-drill-root\s*\{[\s\S]*?max-width:\s*none/i.test(styles));
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
