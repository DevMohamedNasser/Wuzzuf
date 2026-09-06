"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const user_model_1 = require("../../DB/Models/user.model");
const chalk_1 = __importDefault(require("chalk"));
const cronJob = async () => {
    node_cron_1.default.schedule("0 */6 * * *", async () => {
        const clearExpiredOTPs = await user_model_1.userModel.updateMany({ OTP: { $exists: true } }, {
            $pull: {
                OTP: {
                    expiresIn: { $lte: new Date() },
                },
            },
        });
        console.log(chalk_1.default.blue(`Clear expired OTPs from DB, count: ${clearExpiredOTPs.modifiedCount}`));
    });
};
exports.default = cronJob;
