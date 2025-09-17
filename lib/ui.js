import chalk from "chalk";
import boxen from "boxen";
import figlet from "figlet";
import gradient from "gradient-string";


export function showWelcome() {
const banner = figlet.textSync("GenDevCli", { font: "ANSI Shadow" });
const gradientBanner = gradient.pastel.multiline(banner);


const welcomeBox = boxen(
`\n${gradientBanner}\n\n${chalk.yellow("🚀 Developer: RedwoodsKenyan")}\n${chalk.cyan("⚡ Advanced Terminal Agent for Developers")}\n${chalk.green("✨ Powered by BaruchSoft DevTeams")}\n\nType ${chalk.magenta("gendev --help")} to see available commands.\n`,
{
borderColor: "cyan",
borderStyle: "round",
padding: 1,
margin: 1,
align: "center",
}
);


console.log(welcomeBox);
}
