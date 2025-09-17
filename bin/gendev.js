#!/usr/bin/env node
import { runInteractiveIfNeeded, runCli } from "../lib/commands.js";
import { showWelcome } from "../lib/ui.js";


const argv = process.argv.slice(2);


async function main() {
// If no args -> show GUI welcome and interactive shell prompt
if (argv.length === 0) {
showWelcome();
await runInteractiveIfNeeded();
return;
}


// Otherwise treat as single-shot CLI
const output = await runCli(argv);
// Print JSON pretty
console.log(JSON.stringify(output, null, 2));
}


main().catch(err => {
console.error("Fatal:", err);
process.exit(1);
});
