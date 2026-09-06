import cron from "node-cron";
import { userModel } from "../../DB/Models/user.model";
import chalk from "chalk";

const cronJob = async () => {
  cron.schedule("0 */6 * * *", async () => {
    const clearExpiredOTPs = await userModel.updateMany(
      { OTP: { $exists: true } },
      {
        $pull: {
          OTP: {
            expiresIn: { $lte: new Date() },
          },
        },
      },
    );

    console.log(
      chalk.blue(
        `Clear expired OTPs from DB, count: ${clearExpiredOTPs.modifiedCount}`,
      ),
    );
  });
};

export default cronJob;
