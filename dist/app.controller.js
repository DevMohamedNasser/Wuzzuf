"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const rateLimit_middleware_1 = require("./Middlewares/rateLimit.middleware");
const cors_2 = __importDefault(require("./Utils/cors/cors"));
const connection_1 = __importDefault(require("./DB/connection"));
const error_response_1 = require("./Utils/response/error.response");
const config_service_1 = __importDefault(require("./Config/config.service"));
const chalk_1 = __importDefault(require("chalk"));
const Modules_1 = require("./Modules");
const cron_1 = __importDefault(require("./Utils/cron-job/cron"));
const bootstrap = async () => {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)(), (0, cors_1.default)(cors_2.default), rateLimit_middleware_1.limiter);
    app.use(express_1.default.json());
    await (0, connection_1.default)();
    await (0, cron_1.default)();
    app.get("/", (req, res) => {
        return res.status(200).json({ message: "welcome ya handasaaa" });
    });
    app.use("/api/v1/auth", Modules_1.authRouter);
    app.use("/api/v1/user", Modules_1.userRouter);
    app.use("/api/v1/company", Modules_1.companyRouter);
    app.use("/api/v1/job", Modules_1.JobRouter);
    app.use("/:dummy", () => {
        throw new error_response_1.NotFoundException("Not Found Handler");
    });
    app.use(error_response_1.globalErrorHandler);
    app.listen(config_service_1.default.PORT, () => {
        console.log(chalk_1.default.bgGreen(`Server has been run on http://127.0.0.1:${config_service_1.default.PORT}`));
    });
};
exports.default = bootstrap;
