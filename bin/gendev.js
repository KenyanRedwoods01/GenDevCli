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

  // Handle help command
  if (argv[0] === '--help' || argv[0] === '-h') {
    const help = {
      usage: "gendev [command] [options]",
      commands: {
        "read <file>": "Read and display a file",
        "ls [dir]": "List files in directory",
        "mkfile <file> [content]": "Create a new file",
        "mkdir <dir>": "Create a new directory",
        "rm <path>": "Remove a file or directory",
        "project [dir]": "Scan project structure",
        "search <term>": "Search for term in project files",
        "analyze [dir]": "Analyze project code quality",
        "test [dir]": "Generate tests for project",
        "ai <json>": "Send JSON prompt to AI",
        "config <get|set|list> [key] [value]": "Manage configuration"
      },
      examples: [
        "gendev read src/index.js",
        "gendev mkfile src/new.js \"console.log('hello')\"",
        "gendev ai '{\"task\": \"review_code\", \"file\": \"src/app.js\"}'",
        "gendev config set auto_apply false"
      ]
    };
    console.log(JSON.stringify(help, null, 2));
    return;
  }

  // Otherwise treat as single-shot CLI
  const output = await runCli(argv);
  // Print JSON pretty
  console.log(JSON.stringify(output, null, 2));
}

main().catch(err => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
