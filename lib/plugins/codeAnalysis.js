import { readFile, walkDir, fileExists } from "../fileManager.js";
import path from "path";

export function init() {
  return async function analyze(args) {
    const targetPath = args[0] || ".";
    return await analyzeProject(targetPath);
  };
}

export async function analyzeProject(projectPath = ".") {
  try {
    const analysis = {
      summary: {},
      files: {},
      dependencies: {},
      issues: [],
      suggestions: [],
      timestamp: new Date().toISOString()
    };

    // Get package.json information if it exists
    const packageJsonPath = path.join(projectPath, "package.json");
    if (fileExists(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(readFile(packageJsonPath).content);
        analysis.dependencies = {
          production: packageJson.dependencies || {},
          development: packageJson.devDependencies || {},
          scripts: packageJson.scripts || {}
        };
        analysis.summary.packageName = packageJson.name;
        analysis.summary.version = packageJson.version;
      } catch (e) {
        analysis.issues.push("Invalid package.json format");
      }
    }

    // Analyze file structure
    const files = walkDir(projectPath);
    analysis.summary.totalFiles = files.length;
    
    // Count files by type
    const fileTypes = {};
    files.forEach(file => {
      const ext = path.extname(file).toLowerCase() || "none";
      fileTypes[ext] = (fileTypes[ext] || 0) + 1;
    });
    analysis.summary.fileTypes = fileTypes;

    // Check for common project structure files
    const importantFiles = {
      "README.md": "Documentation file",
      ".gitignore": "Git ignore rules",
      "package.json": "Node.js project file",
      "Dockerfile": "Docker configuration",
      ".env": "Environment variables",
      "docker-compose.yml": "Docker compose configuration"
    };

    for (const [file, description] of Object.entries(importantFiles)) {
      const found = files.some(f => f.includes(file));
      analysis.files[file] = { exists: found, description };
      
      if (!found && file !== ".env") { // .env should typically not be in repo
        analysis.issues.push(`Missing ${file} - ${description}`);
        analysis.suggestions.push(`Create a ${file} file`);
      }
    }

    // Check for test files
    const testFiles = files.filter(f => 
      f.includes('test') || f.includes('spec') || f.includes('__tests__')
    );
    analysis.summary.testFiles = testFiles.length;
    
    if (testFiles.length === 0) {
      analysis.issues.push("No test files found");
      analysis.suggestions.push("Add test files to ensure code quality");
    }

    // Check for large files
    const largeFiles = [];
    for (const file of files.slice(0, 50)) { // Check first 50 files for size
      try {
        const stats = require("fs").statSync(file);
        if (stats.size > 1000000) { // 1MB
          largeFiles.push({ file, size: stats.size });
        }
      } catch (e) {
        // Skip files we can't stat
      }
    }
    
    if (largeFiles.length > 0) {
      analysis.issues.push("Found large files that might need optimization");
      analysis.largeFiles = largeFiles;
    }

    return { status: "ok", analysis };
  } catch (error) {
    return { status: "error", message: `Analysis failed: ${error.message}` };
  }
    }
