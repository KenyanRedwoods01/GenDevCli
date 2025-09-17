import { readFile, walkDir } from "../fileManager.js";
import path from "path";

export function scanForSecrets(projectPath = ".") {
  const secrets = [];
  const files = walkDir(projectPath);
  
  // Common secret patterns
  const secretPatterns = [
    /(aws|access|secret)[_\-]?key(=|:)\s*["']?[A-Za-z0-9\/+=]{20,}["']?/i,
    /(password|pwd|passwd)(=|:)\s*["']?.{6,}["']?/i,
    /(api[_-]?key|token)(=|:)\s*["']?[A-Za-z0-9_\-]{20,}["']?/i,
    /(private[_-]?key)(=|:)\s*["']?-----BEGIN.*PRIVATE KEY-----/is,
    /(bearer)(=|:)\s*["']?eyJhbGciOiJ[A-Za-z0-9_\-]{100,}["']?/i
  ];
  
  // Files that commonly contain secrets
  const sensitiveFiles = [
    '.env',
    'config.json',
    'credentials',
    'secrets.yml',
    'aws.yml',
    'config.yml'
  ];
  
  for (const file of files) {
    const fileName = path.basename(file);
    
    // Check if file is sensitive
    if (sensitiveFiles.includes(fileName)) {
      secrets.push({
        file,
        type: "sensitive_file",
        message: "Potentially sensitive file found",
        severity: "medium"
      });
    }
    
    // Check file content for secrets
    try {
      const content = readFile(file).content;
      
      for (const pattern of secretPatterns) {
        if (pattern.test(content)) {
          secrets.push({
            file,
            type: "possible_secret",
            message: "Possible secret or API key found",
            severity: "high"
          });
          break; // Don't report multiple times for same file
        }
      }
    } catch (e) {
      // Skip files we can't read
    }
  }
  
  return secrets;
}

export function checkDependencies(projectPath = ".") {
  const issues = [];
  const packageJsonPath = path.join(projectPath, "package.json");
  
  try {
    if (require("fs").existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFile(packageJsonPath).content);
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };
      
      // Known vulnerable packages (this would typically come from a database)
      const vulnerablePackages = {
        "lodash": "<4.17.12",
        "express": "<4.17.1",
        "axios": "<0.21.1"
      };
      
      for (const [pkg, version] of Object.entries(allDeps)) {
        if (vulnerablePackages[pkg]) {
          issues.push({
            package: pkg,
            version: version,
            message: `Potential vulnerability in ${pkg}, consider updating`,
            severity: "medium"
          });
        }
      }
    }
  } catch (e) {
    // Skip if no package.json or invalid JSON
  }
  
  return issues;
    }
