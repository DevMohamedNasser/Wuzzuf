import chalk from "chalk";
import bootstrap from "./app.controller";

bootstrap().catch((error: unknown) => {
  console.log(chalk.red("Failed to start app", error));
  process.exit(1);
});
