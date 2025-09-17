import fs from "fs";
import { execSync } from "child_process";
import path from "path";
import { showInfo, showError } from "./ui.js";

export function applyAction(action) {
  try {
    if (action.type === "create_file") {
      const dir = path.dirname(action.path);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(action.path, action.content || "", "utf8");
      showInfo(`Created file: ${action.path}`);
      return { status: "ok", message: `created ${action.path}` };
    }

    if (action.type === "patch_file") {
      if (action.patchFormat === "unified") {
        // Write temp patch file then use patch utility
        const tmp = "/tmp/gendev_patch.diff";
        fs.writeFileSync(tmp, action.content, "utf8");
        
        try {
          execSync(`patch -p0 < ${tmp}`, { stdio: 'pipe' });
          fs.unlinkSync(tmp);
          showInfo(`Applied patch to: ${action.path}`);
          return { status: "ok", message: `applied patch to ${action.path}` };
        } catch (patchError) {
          fs.unlinkSync(tmp);
          throw new Error(`Patch failed: ${patchError.message}`);
        }
      } else {
        // Full file replacement
        fs.writeFileSync(action.path, action.content, "utf8");
        showInfo(`Replaced file: ${action.path}`);
        return { status: "ok", message: `replaced ${action.path}` };
      }
    }

    if (action.type === "delete_file") {
      if (fs.existsSync(action.path)) {
        fs.unlinkSync(action.path);
        showInfo(`Deleted file: ${action.path}`);
        return { status: "ok", message: `deleted ${action.path}` };
      }
      return { status: "ok", message: `file not found: ${action.path}` };
    }

    if (action.type === "run_command") {
      try {
        const output = execSync(action.command, { 
          encoding: 'utf8',
          cwd: action.cwd || process.cwd()
        });
        showInfo(`Command executed: ${action.command}`);
        return { status: "ok", message: `command executed`, output };
      } catch (cmdError) {
        throw new Error(`Command failed: ${cmdError.message}`);
      }
    }

    return { status: "error", message: "unknown action type" };
  } catch (err) {
    showError(`Action failed: ${err.message}`);
    return { status: "error", message: err.message };
  }
}

export function validateAction(action) {
  const requiredFields = {
    "create_file": ["type", "path"],
    "patch_file": ["type", "path", "content"],
    "delete_file": ["type", "path"],
    "run_command": ["type", "command"]
  };

  if (!requiredFields[action.type]) {
    return { valid: false, error: `Unknown action type: ${action.type}` };
  }

  for (const field of requiredFields[action.type]) {
    if (!action[field]) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }

  // Additional validation for specific action types
  if (action.type === "create_file" && action.path.includes("..")) {
    return { valid: false, error: "Path cannot contain '..'" };
  }

  if (action.type === "run_command" && action.command.includes("rm -rf /")) {
    return { valid: false, error: "Dangerous command detected" };
  }

  return { valid: true };
}

export function applyActions(actions) {
  const results = [];
  
  for (const action of actions) {
    const validation = validateAction(action);
    if (!validation.valid) {
      results.push({ status: "error", message: validation.error });
      continue;
    }
    
    results.push(applyAction(action));
  }
  
  return results;
}
