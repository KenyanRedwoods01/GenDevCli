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
    const files = [];
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      files.push({
        name: item,
        path: fullPath,
        type: stat.isDirectory() ? "directory" : "file",
        size: stat.size,
        modified: stat.mtime
      });
    }
    
    return { status: "ok", path: dirPath, files };
  } catch (err) {
    return { status: "error", message: err.message };
  }
}

export function createFile(filePath, content = "") {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
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
    if (!fs.existsSync(targetPath)) {
      return { status: "error", message: `Path does not exist: ${targetPath}` };
    }
    
    const stat = fs.statSync(targetPath);
    if (stat.isDirectory()) {
      fs.rmSync(targetPath, { recursive: true });
    } else {
      fs.unlinkSync(targetPath);
    }
    return { status: "ok", message: `Deleted: ${targetPath}` };
  } catch (err) {
    return { status: "error", message: err.message };
  }
}

export function walkDir(root = ".", ignore = ["node_modules", ".git", "vendor", "dist", "build", ".DS_Store"]) {
  const results = [];
  
  function _walk(dir) {
    try {
      const list = fs.readdirSync(dir);
      for (const file of list) {
        if (ignore.includes(file)) continue;
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
          _walk(fullPath);
        } else {
          results.push(fullPath);
        }
      }
    } catch (err) {
      // ignore permission errors etc.
    }
  }
  
  _walk(root);
  return results;
}

export function fileExists(filePath) {
  return fs.existsSync(filePath);
}

export function getFileStats(filePath) {
  try {
    const stat = fs.statSync(filePath);
    return {
      size: stat.size,
      modified: stat.mtime,
      created: stat.birthtime,
      isDirectory: stat.isDirectory(),
      isFile: stat.isFile()
    };
  } catch (err) {
    return null;
  }
                       }
