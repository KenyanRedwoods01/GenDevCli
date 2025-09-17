import { readFile, createFile, walkDir, fileExists } from "../fileManager.js";
import path from "path";
import { askCodestral } from "../mistral.js";

export function init() {
  return async function generateTests(args) {
    const targetPath = args[0] || ".";
    return await generateTests(targetPath);
  };
}

export async function generateTests(projectPath = ".") {
  try {
    const files = walkDir(projectPath);
    const testFiles = [];
    const testResults = [];

    // Find source files that might need tests (JavaScript/TypeScript)
    const sourceFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.js', '.ts', '.jsx', '.tsx'].includes(ext) && 
             !file.includes('node_modules') && 
             !file.includes('test') && 
             !file.includes('spec') &&
             !file.includes('dist') &&
             !file.includes('build');
    });

    // Limit to 3 files to avoid excessive API calls
    for (const file of sourceFiles.slice(0, 3)) {
      const content = readFile(file).content;
      const testContent = await generateTestForFile(file, content);
      
      if (testContent) {
        const testFilePath = file.replace(/\.(js|ts|jsx|tsx)$/, '.test.$1');
        const result = createFile(testFilePath, testContent);
        testFiles.push(testFilePath);
        testResults.push(result);
      }
    }

    return { 
      status: "ok", 
      message: `Generated ${testFiles.length} test files`,
      files: testFiles,
      results: testResults
    };
  } catch (error) {
    return { status: "error", message: `Test generation failed: ${error.message}` };
  }
}

async function generateTestForFile(filePath, content) {
  const prompt = {
    task: "generate_test",
    file: filePath,
    content: content,
    framework: "jest",
    instructions: "Generate comprehensive unit tests with multiple test cases covering edge cases and error conditions. Return only the test code in your response."
  };

  const response = await askCodestral(prompt);
  
  if (response.status === "ok" && response.testCode) {
    return response.testCode;
  }
  
  if (response.status === "ok" && response.content) {
    return response.content;
  }
  
  return null;
        }
