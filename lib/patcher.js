import fs from "fs";
import { execSync } from "child_process";


// Simple patch applier supporting raw replace or unified diff
export function applyAction(action) {
try {
if (action.type === "create_file") {
const dir = require("path").dirname(action.path);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(action.path, action.content || "", "utf8");
return { status: "ok", message: `created ${action.path}` };
}


if (action.type === "patch_file") {
// action.content expected to be a unified diff or full replacement
if (action.patchFormat === "unified") {
// write temp patch then use patch util
const tmp = "/tmp/gendev_patch.diff";
fs.writeFileSync(tmp, action.content, "utf8");
execSync(`patch -p0 < ${tmp}`);
fs.unlinkSync(tmp);
return { status: "ok", message: `applied patch to ${action.path}` };
} else {
// full replace
fs.writeFileSync(action.path, action.content, "utf8");
return { status: "ok", message: `replaced ${action.path}` };
}
}


return { status: "error", message: "unknown action type" };
} catch (err) {
return { status: "error", message: err.message };
}
                 }
