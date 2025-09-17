import chalk from "chalk";
import boxen from "boxen";
import figlet from "figlet";
import gradient from "gradient-string";

export function showWelcome() {
  const banner = figlet.textSync("GenDevCli", { font: "ANSI Shadow" });
  const gradientBanner = gradient.pastel.multiline(banner);

  const welcomeBox = boxen(
    `\n${gradientBanner}\n\n${chalk.yellow("🚀 Developer: RedwoodsKenyan")}\n${chalk.cyan("⚡ Advanced Terminal Agent for Developers")}\n\nType ${chalk.magenta("gendev --help")} to see available commands.\n`,
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

export function showError(message) {
  const errorBox = boxen(
    chalk.red(`❌ Error: ${message}`),
    {
      borderColor: "red",
      borderStyle: "round",
      padding: 1,
      margin: 1
    }
  );
  console.log(errorBox);
}

export function showSuccess(message) {
  const successBox = boxen(
    chalk.green(`✅ Success: ${message}`),
    {
      borderColor: "green",
      borderStyle: "round",
      padding: 1,
      margin: 1
    }
  );
  console.log(successBox);
}

export function showInfo(message) {
  const infoBox = boxen(
    chalk.blue(`ℹ️  Info: ${message}`),
    {
      borderColor: "blue",
      borderStyle: "round",
      padding: 1,
      margin: 1
    }
  );
  console.log(infoBox);
}
