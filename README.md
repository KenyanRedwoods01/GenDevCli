# 🚀 GenDevCli — Advanced Terminal Agent  

![npm](https://img.shields.io/npm/v/gendevcli?color=blueviolet&style=for-the-badge)  
![GitHub stars](https://img.shields.io/github/stars/RedwoodsKenyan/gendevcli?style=for-the-badge)  
![GitHub issues](https://img.shields.io/github/issues/RedwoodsKenyan/gendevcli?style=for-the-badge)  
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)  

---

## ✨ Overview  

**GenDevCli** is an **AI-powered Advanced Terminal Agent** ⚡ designed for developers.  
It brings the power of **Mistral AI, Codestral**, and structured **JSON prompting** into your terminal.  

👉 Works on **Linux, macOS, Windows, Termux** — anywhere Node.js runs.  
👉 Built for **developers who love speed, automation, and smart AI tooling**.  

---

## 🎨 Welcome UI Preview  

When you run `gendev` with no arguments:  

╭──────────────────────────────────────────────────────────╮
│ │
│ ██████╗ ███████╗███╗ ██╗██████╗ ███████╗██╗ ██╗ │
│ ██╔══██╗██╔════╝████╗ ██║██╔══██╗██╔════╝╚██╗ ██╔╝ │
│ ██████╔╝█████╗ ██╔██╗ ██║██║ ██║█████╗ ╚████╔╝ │
│ ██╔═══╝ ██╔══╝ ██║╚██╗██║██║ ██║██╔══╝ ╚██╔╝ │
│ ██║ ███████╗██║ ╚████║██████╔╝███████╗ ██║ │
│ ╚═╝ ╚══════╝╚═╝ ╚═══╝╚═════╝ ╚══════╝ ╚═╝ │
│ │
│ 🚀 Developer: RedwoodsKenyan │
│ 💼 Powered by: BaruchSoft DevTeams │
╰──────────────────────────────────────────────────────────╯
---

## ⚡ Features  

✅ **AI Agents** — Mistral + Codestral integration  
✅ **JSON Prompting** — structured requests for reproducible outputs  
✅ **File & Folder Management** — create, edit, read files via CLI  
✅ **Project Scanning** — read through your project files & suggest improvements  
✅ **Cross-Platform** — works on Linux, macOS, Windows, Termux  
✅ **Beautiful Terminal UI** — ASCII + neon styled welcome screen  
✅ **Custom Commands** — extend GenDevCli with your own plugins  

---

## 📦 Installation  

```bash
# Install globally
npm install -g gendevcli

# Verify installation
gendev --version
🚀 Usage
1. Interactive Mode
gendev


This opens the Advanced Terminal Agent UI.

2. Run AI Command
gendev run --model mistral "Generate a Node.js Express server with JWT auth"

3. JSON Prompting
gendev json '{
  "task": "create",
  "type": "file",
  "path": "src/app.js",
  "content": "console.log(\"Hello World from GenDevCli\")"
}'
4. Folder Creation
gendev json '{
  "task": "create",
  "type": "folder",
  "path": "src/utils"
}'

📂 Project Structure
GenDevCli/
 ┣ 📂 bin/           # CLI entrypoint
 ┣ 📂 src/           # Core logic
 ┃ ┣ 📜 index.js     # Main CLI handler
 ┃ ┣ 📜 ai.js        # AI integrations (Mistral, Codestral)
 ┃ ┣ 📜 fs-tools.js  # File/folder management
 ┃ ┣ 📜 ui.js        # Terminal welcome screen
 ┣ 📜 package.json
 ┣ 📜 README.md
 ┗ 📜 LICENSE
🛠 Contributing

We welcome contributions!

Fork the repo

Create your feature branch (git checkout -b feature/YourFeature)

Commit changes (git commit -m 'Add some feature')

Push to branch (git push origin feature/YourFeature)

Open a Pull Request

📧 Contact

👨‍💻 Developer: RedwoodsKenyan
💼 Powered by: BaruchSoft DevTeams
📩 Email: redwoodkenya@gmail.com

📱 Phone: +254769148939
📜 License

This project is licensed under the MIT License — see the LICENSE
 file for details.
