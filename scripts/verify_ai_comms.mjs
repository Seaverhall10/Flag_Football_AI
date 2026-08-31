import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const checks = [];

function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/^\uFEFF/, "");
}

function check(name, condition) {
  const ok = Boolean(condition);
  checks.push({ name, ok });
  if (!ok) failures.push(name);
}

const requiredFiles = [
  "AGENTS.md",
  "COUNCIL_BOARD.md",
  "AI_CHANGE_PROTOCOL.md",
  "COUNCIL_DECISIONS.md",
  ".github/ISSUE_TEMPLATE/ai-work-lane.yml",
  ".github/pull_request_template.md"
];

for (const file of requiredFiles) {
  check(`required communication file ${file}`, fs.existsSync(path.join(root, file)));
}

const agents = read("AGENTS.md");
const board = read("COUNCIL_BOARD.md");
const protocol = read("AI_CHANGE_PROTOCOL.md");
const decisions = read("COUNCIL_DECISIONS.md");
const issueTemplate = read(".github/ISSUE_TEMPLATE/ai-work-lane.yml");
const prTemplate = read(".github/pull_request_template.md");
const joined = [agents, board, protocol, decisions, issueTemplate, prTemplate].join("\n");

for (const agent of ["Jarvis", "Codex", "GrokBot", "Antigravity"]) {
  check(`communication system names ${agent}`, joined.includes(agent));
}

for (const type of ["CLAIM", "PROPOSAL", "FINDING", "REVIEW", "BLOCKED", "HANDOFF"]) {
  check(`message type ${type}`, board.includes(`\`${type}\``) && issueTemplate.includes(`- ${type}`));
}

for (const field of [
  "AGENT:",
  "TYPE:",
  "STATUS REQUESTED:",
  "BASE COMMIT:",
  "BRANCH:",
  "FILES CLAIMED:",
  "EVIDENCE:",
  "AUTHORITY / PRIVACY IMPACT:",
  "TESTS:",
  "ROLLBACK:",
  "REQUEST TO TEAM:"
]) {
  check(`comment contract field ${field}`, board.includes(field));
}

for (const field of ["RESULT:", "VERIFIED:", "NOT VERIFIED:", "NEXT OWNER:"]) {
  check(`handoff contract field ${field}`, board.includes(field));
}

check("Huddle Issue #6 is canonical", /issues\/6/.test(joined));
check("feature issues use the work-lane template", joined.includes("ai-work-lane.yml"));
check("one writer remains enforced", /one (?:builder|writer)/i.test(joined));
check("external output remains advisory", /external-agent output[^\n]*advisory/i.test(joined));
check("prepared prompts are not completed reviews", /prepared prompt[^\n]*not a completed review/i.test(board));
check("no freeform ai-comms folder", /Do not create a freeform `ai-comms`/i.test(board));
check("PR template captures verified limits", prTemplate.includes("Verified:") && prTemplate.includes("Not verified:"));

for (const item of checks) console.log(`${item.ok ? "PASS" : "FAIL"}  ${item.name}`);
console.log(`\n${checks.length - failures.length}/${checks.length} checks passed.`);

if (failures.length) {
  console.error("\nAI communication verification blocked:\n- " + failures.join("\n- "));
  process.exit(1);
}
