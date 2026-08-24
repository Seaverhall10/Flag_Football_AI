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

for (const file of ["AGENTS.md", "PROJECT_AUTHORITY.md", "AI_CHANGE_PROTOCOL.md", "PROJECT_STATUS.md"]) {
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
const authority = read("PROJECT_AUTHORITY.md");

const runKeys = [...playbook.matchAll(/data-run-key=["']([^"']+)["']/g)].map((match) => match[1]);
pass("exactly six unique play selectors", runKeys.length === 6 && new Set(runKeys).size === 6, runKeys.join(", "));
pass("playbook loads governed simulator", /src=["']js\/sim\.js(?:\?[^"']*)?["']/i.test(playbook));
pass("playbook does not load replacement field simulator", !/src=["']js\/field-diagram\.js/i.test(playbook));

for (const id of ["sim-root", "sim-play", "sim-back", "sim-next", "sim-reset", "sim-slider", "sim-assignments"]) {
  pass(`playbook control #${id}`, new RegExp(`id=["']${id}["']`).test(playbook));
}

for (const id of ["LT", "LG", "C", "RG", "RT", "RB1", "RB2", "RB3"]) {
  pass(`offense position ${id}`, new RegExp(`\\b${id}\\b`).test(sim));
}
for (const id of ["EL", "DTL", "DTR", "ER", "LBL", "LBR", "CBL", "CBR"]) {
  pass(`defense position ${id}`, new RegExp(`\\b${id}\\b`).test(sim));
}

pass("no split wide receiver in governed playbook", !/wide receiver|data-pos=["']WR["']/i.test(`${playbook}\n${sim}\n${roster}`));
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
