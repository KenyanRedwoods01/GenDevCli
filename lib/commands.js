import readline from "readline";
import { readFile, listFiles, createFile, createFolder, deletePath, walkDir, fileExists } from "./fileManager.js";
import { askCodestral, askAgent } from "./mistral.js";
import { applyAction, applyActions, validateAction } from "./patcher.js";
import { showInfo, showError, showSuccess } from "./ui.js";
import * as plugins from "./plugins/index.js";
import { loadConfig, saveConfig, resetConfig } from "./utils/configManager.js";

const AGENT_ID = process.env.MISTRAL_AGENT_ID || null;

// Plugin system initialization
const pluginCommands = {};
for (const [name, plugin] of Object.entries(plugins)) {
  if (plugin.init) {
    pluginCommands[name] = plugin.init();
  }
}

export async function runCli(argv) {
  const cmd = argv[0];
  const rest = argv.slice(1);

  // Check if command is handled by a plugin
  if (pluginCommands[cmd]) {
    return await pluginCommands[cmd](rest);
  }

  // JSON-based AI command: gendev ai '{...}'
  if (cmd === "ai") {
    if (rest.length === 0) {
      return { status: "error", message: "No JSON prompt provided" };
    }
    
    try {
      const json = JSON.parse(rest.join(" "));
      return await handleAICommand(json);
    } catch (err) {
      return { status: "error", message: "Invalid JSON format", error: err.message };
    }
  }

  // Configuration commands
  if (cmd === "config") {
    return handleConfigCommand(rest);
  }

  // Apply actions from a file
  if (cmd === "apply") {
    if (rest.length === 0) {
      return { status: "error", message: "No actions file specified" };
    }
    
    const actionsFile = rest[0];
    if (!fileExists(actionsFile)) {
      return { status: "error", message: `Actions file not found: ${actionsFile}` };
    }
    
    try {
      const actionsContent = readFile(actionsFile);
      if (actionsContent.status === "error") {
        return actionsContent;
      }
      
      const actions = JSON.parse(actionsContent.content);
      if (!Array.isArray(actions)) {
        return { status: "error", message: "Actions file should contain an array of actions" };
      }
      
      const results = applyActions(actions);
      return { status: "ok", message: "Actions applied", results };
    } catch (err) {
      return { status: "error", message: "Failed to parse actions file", error: err.message };
    }
  }

  // Simple filesystem commands
  switch (cmd) {
    case "read": 
      if (rest.length === 0) {
        return { status: "error", message: "No file specified" };
      }
      return readFile(rest.join(" "));
    
    case "ls": 
      return listFiles(rest[0] || ".");
    
    case "mkfile": 
      if (rest.length === 0) {
        return { status: "error", message: "No file specified" };
      }
      return createFile(rest[0], rest.slice(1).join(" ") || "");
    
    case "mkdir": 
      if (rest.length === 0) {
        return { status: "error", message: "No directory specified" };
      }
      return createFolder(rest[0]);
    
    case "rm": 
      if (rest.length === 0) {
        return { status: "error", message: "No path specified" };
      }
      return deletePath(rest[0]);
    
    case "project": {
      const files = walkDir(rest[0] || ".");
      return { status: "ok", count: files.length, files };
    }
    
    case "search": {
      if (rest.length === 0) {
        return { status: "error", message: "No search term specified" };
      }
      
      const term = rest.join(" ");
      const files = walkDir(".");
      const found = files.filter(f => {
        try { 
          const c = readFile(f).content; 
          return c.toLowerCase().includes(term.toLowerCase()); 
        } catch { 
          return false; 
        }
      });
      return { status: "ok", term, matches: found };
    }
    
    case "analyze": {
      return await plugins.codeAnalysis.analyzeProject(rest[0] || ".");
    }
    
    case "test": {
      return await plugins.testGenerator.generateTests(rest[0] || ".");
    }
    
    case "deploy": {
      return await plugins.deployment.deploy(rest[0] || ".");
    }
    
    default:
      return { status: "error", message: `unknown command: ${cmd}` };
  }
}

async function handleAICommand(json) {
  // prefer agent endpoint if agent id present, else codestral chat
  const res = AGENT_ID ? await askAgent(AGENT_ID, json) : await askCodestral(json);

  // If the response contains actions[] run them (safe-by-default: require confirmation)
  if (Array.isArray(res.actions) && res.actions.length > 0) {
    // auto-execute actions only when env AUTO_APPLY=1 is set
    if (process.env.AUTO_APPLY === "1") {
      const results = applyActions(res.actions);
      res._applied = results;
    } else {
      // Show preview and ask for confirmation
      res._preview = res.actions.map(a => ({ type: a.type, path: a.path }));
      res._message = "Set AUTO_APPLY=1 to auto-apply these actions or use 'gendev apply actions.json'";
    }
  }

  return res;
}

function handleConfigCommand(args) {
  if (args.length === 0) {
    return { status: "error", message: "Config command requires action: get, set, list, or reset" };
  }
  
  const [action, key, value] = args;
  
  switch (action) {
    case "get":
      if (!key) {
        return { status: "error", message: "Config get requires a key" };
      }
      return { status: "ok", [key]: loadConfig(key) };
    
    case "set":
      if (!key || !value) {
        return { status: "error", message: "Config set requires both key and value" };
      }
      saveConfig(key, value);
      return { status: "ok", message: `Config ${key} set to ${value}` };
    
    case "list":
      return { status: "ok", config: loadConfig() };
    
    case "reset":
      resetConfig();
      return { status: "ok", message: "Config reset to defaults" };
    
    default:
      return { status: "error", message: "Unknown config action. Use get/set/list/reset" };
  }
}

export async function runInteractiveIfNeeded() {
  const rl = readline.createInterface({ 
    input: process.stdin, 
    output: process.stdout, 
    prompt: 'gendev> '
  });
  
  rl.prompt();

  for await (const line of rl) {
    const trimmed = line.trim();
    if (trimmed === "exit" || trimmed === "quit") { 
      rl.close(); 
      break; 
    }
    
    if (trimmed === "") {
      rl.prompt();
      continue;
    }
    
    if (trimmed === "help") { 
      console.log(JSON.stringify(help(), null, 2)); 
      rl.prompt(); 
      continue; 
    }

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
      showError(err.message);
    }

    rl.prompt();
  }
}

function help() {
  return {
    name: "GenDevCli",
    developer: "RedwoodsKenyan",
    usage: [
      "gendev",
      "gendev --help",
      "gendev read ./src/index.js",
      "gendev ls ./src",
      "gendev mkfile ./src/new.js \"console.log('hi')\"",
      "gendev mkdir ./data",
      "gendev ai '{\"task\":\"analyze_file\",\"file\":\"src/app.js\"}'",
      "gendev project .",
      "gendev search login",
      "gendev analyze",
      "gendev test",
      "gendev config get auto_apply",
      "gendev config set theme dark"
    ],
    notes: "AI replies expected to be JSON. Set MISTRAL_API_KEY & MISTRAL_AGENT_ID as env variables. Use AUTO_APPLY=1 to have actions auto-run."
  };
      }
