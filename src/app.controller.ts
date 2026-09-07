import express, { Express, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import { limiter } from "./Middlewares/rateLimit.middleware";
import corsOptions from "./Utils/cors/cors";
import connectDB from "./DB/connection";
import {
  globalErrorHandler,
  NotFoundException,
} from "./Utils/response/error.response";
import env from "./Config/config.service";
import chalk from "chalk";
import { authRouter, companyRouter, userRouter } from "./Modules";
import cronJob from "./Utils/cron-job/cron";

const bootstrap = async (): Promise<void> => {
  const app: Express = express();

  app.use(helmet(), cors(corsOptions), limiter);
  app.use(express.json());
  await connectDB();
  await cronJob();

  app.get("/", (req: Request, res: Response) => {
    return res.status(200).json({ message: "welcome ya handasaaa" });
  });

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/user", userRouter);
  app.use("/api/v1/company", companyRouter);

  app.use("/:dummy", () => {
    throw new NotFoundException("Not Found Handler");
  });

  app.use(globalErrorHandler);

  app.listen(env.PORT, () => {
    console.log(
      chalk.bgGreen(`Server has been run on http://127.0.0.1:${env.PORT}`),
    );
  });
};

export default bootstrap;
