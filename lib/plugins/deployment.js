import { readFile, fileExists, createFile } from "../fileManager.js";
import path from "path";
import { askCodestral } from "../mistral.js";

export function init() {
  return async function deploy(args) {
    const targetPath = args[0] || ".";
    return await deploy(targetPath);
  };
}

export async function deploy(projectPath = ".") {
  try {
    // Check if package.json exists
    const packageJsonPath = path.join(projectPath, "package.json");
    if (!fileExists(packageJsonPath)) {
      return { status: "error", message: "No package.json found - not a Node.js project" };
    }

    const packageJson = JSON.parse(readFile(packageJsonPath).content);
    
    // Generate Dockerfile if it doesn't exist
    const dockerfilePath = path.join(projectPath, "Dockerfile");
    if (!fileExists(dockerfilePath)) {
      const dockerfileContent = await generateDockerfile(packageJson);
      if (dockerfileContent) {
        createFile(dockerfilePath, dockerfileContent);
      }
    }

    // Generate docker-compose.yml if it doesn't exist
    const composePath = path.join(projectPath, "docker-compose.yml");
    if (!fileExists(composePath)) {
      const composeContent = generateDockerCompose(packageJson.name || "app");
      createFile(composePath, composeContent);
    }

    // Generate deployment instructions
    const instructions = generateDeploymentInstructions(packageJson.name || "app");

    return { 
      status: "ok", 
      message: "Deployment configuration generated",
      files: [
        dockerfilePath,
        composePath
      ].filter(f => fileExists(f)),
      instructions 
    };
  } catch (error) {
    return { status: "error", message: `Deployment setup failed: ${error.message}` };
  }
}

async function generateDockerfile(packageJson) {
  const prompt = {
    task: "generate_dockerfile",
    packageJson: packageJson,
    instructions: "Generate an optimized Dockerfile for a Node.js application. Include multi-stage build if appropriate."
  };

  const response = await askCodestral(prompt);
  
  if (response.status === "ok" && response.dockerfile) {
    return response.dockerfile;
  }
  
  if (response.status === "ok" && response.content) {
    return response.content;
  }
  
  // Fallback Dockerfile
  return `FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]`;
}

function generateDockerCompose(appName) {
  return `version: '3.8'
services:
  ${appName}:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
`;
}

function generateDeploymentInstructions(appName) {
  return {
    docker: [
      "docker build -t ${appName} .",
      "docker run -p 3000:3000 ${appName}"
    ],
    dockerCompose: [
      "docker-compose up -d",
      "docker-compose logs -f"
    ],
    cloud: [
      "Push to GitHub and connect to your favorite cloud provider",
      "Examples: Vercel, Netlify, AWS, Google Cloud, Azure"
    ]
  };
}
