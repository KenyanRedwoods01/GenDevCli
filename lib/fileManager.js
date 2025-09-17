import fs from "fs";
import path from "path";


export function readFile(filePath) {
try {
return { status: "ok", path: filePath, content: fs.readFileSync(filePath, "utf8") };
} catch (err) {
return { status: "error", message: err.message };
}
}


export function listFiles(dirPath = ".") {
try {
const list = fs.readdirSync(dirPath);
return { status: "ok", path: dirPath, list };
} catch (err) {
return { status: "error", message: err.message };
}
}


export function createFile(filePath, content = "") {
try {
const dir = path.dirname(filePath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(filePath, content, "utf8");
return { status: "ok", message: `File created: ${filePath}` };
} catch (err) {
return { status: "error", message: err.message };
}
}


export function createFolder(dirPath) {
try {
if (!fs.existsSync(dirPath)) {
fs.mkdirSync(dirPath, { recursive: true });
return { status: "ok", message: `Folder created: ${dirPath}` };
}
return { status: "ok", message: `Folder exists: ${dirPath}` };
} catch (err) {
return { status: "error", message: err.message };
}
}


export function deletePath(targetPath) {
try {
const stat = fs.statSync(targetPath);
if (stat.isDirectory()) fs.rmdirSync(targetPath, { recursive: true });
else fs.unlinkSync(targetPath);
return { status: "ok", message: `Deleted: ${targetPath}` };
} catch (err) {
return { status: "error", message: err.message };
}
}


// Simple walker excluding common noisy folders
export function walkDir(root = ".", ignore = ["node_modules", ".git", "vendor", "dist", "build"]) {
const results = [];
function _walk(dir) {
try {
const list = fs.readdirSync(dir);
for (const file of list) {
if (ignore.includes(file)) continue;
const full = path.join(dir, file);
const stat = fs.statSync(full);
if (stat && stat.isDirectory()) _walk(full);
else results.push(full);
}
} catch (err) {
// ignore permission errors etc.
}
}
_walk(root);
return results;
                                     }
