import readline from "readline";
import { readFile, listFiles, createFile, createFolder, deletePath, walkDir } from "./fileManager.js";
import { askCodestral, askAgent } from "./mistral.js";
import { applyAction } from "./patcher.js";


const AGENT_ID = process.env.MISTRAL_AGENT_ID || null;


export async function runCli(argv) {
const cmd = argv[0];
const rest = argv.slice(1);


// JSON-based AI command: gendev ai '{...}'
if (cmd === "ai") {
const json = JSON.parse(rest.join(" "));
// prefer agent endpoint if agent id present, else codestral chat
const res = AGENT_ID ? await askAgent(AGENT_ID, json) : await askCodestral(json);


// If the response contains actions[] run them (safe-by-default: require confirmation)
if (Array.isArray(res.actions) && res.actions.length > 0) {
// auto-execute actions only when env AUTO_APPLY=1 is set
if (process.env.AUTO_APPLY === "1") {
const results = res.actions.map(a => applyAction(a));
res._applied = results;
}
}


return res;
}


// Simple filesystem commands
switch (cmd) {
case "read": return readFile(rest.join(" "));
case "ls": return listFiles(rest[0] || ".");
case "mkfile": return createFile(rest[0], rest.slice(1).join(" ") || "");
case "mkdir": return createFolder(rest[0]);
case "rm": return deletePath(rest[0]);
case "project": {
const files = walkDir(rest[0] || ".");
return { status: "ok", count: files.length, files };
}
case "search": {
const term = rest.join(" ");
const files = walkDir(".");
const found = files.filter(f => {
try { const c = fs.readFileSync(f, 'utf8'); return c.toLowerCase().includes(term.toLowerCase()); } catch { return false; }
});
return { status: "ok", matches: found };
}
default:
return { status: "error", message: `unknown command: ${cmd}` };
}
}


export async function runInteractiveIfNeeded() {
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: 'gendev> '});
rl.prompt();


for await (const line of rl) {
const trimmed = line.trim();
if (trimmed === "exit" || trimmed === "quit") { rl.close(); break; }
if (trimmed === "help") { console.log(JSON.stringify(help(), null, 2)); rl.prompt(); continue; }


try {
// Support direct JSON for ai commands
if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
const json = JSON.parse(trimmed);
const res = AGENT_ID ? await askAgent(AGENT_ID, json) : await askCodestral(json);
console.log(JSON.stringify(res, null, 2));
rl.prompt();
continue;
        }
  const parts = trimmed.split(/\s+/);
      const out = await runCli(parts);
      console.log(JSON.stringify(out, null, 2));
    } catch (err) {
      console.error("error:", err.message);
    }

    rl.prompt();
  }
}

function help() {
  return {
    name: "GenDevCli",
    develope
