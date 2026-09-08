"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIo = void 0;
const socket_io_1 = require("socket.io");
const authentication_middleware_1 = require("../../Middlewares/authentication.middleware");
const token_enum_1 = require("../enums/token.enum");
const chalk_1 = __importDefault(require("chalk"));
let io = null;
const getIo = () => io;
exports.getIo = getIo;
const initializeSocket = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
        cors: { origin: "*" },
    });
    //   socket middleware
    io.use(async (socket, next) => {
        try {
            const authorization = socket.handshake.auth.token;
            const { user } = await (0, authentication_middleware_1.decodedToken)({
                authorization,
                tokenType: token_enum_1.tokenTypeEnum.Access,
            });
            socket.user = user;
            next();
        }
        catch (error) {
            next(new Error(error.message || "Unauthorized socket (check headers)"));
        }
    });
    io.on("connection", (socket) => {
        const user = socket.user;
        const userId = user._id.toString();
        socket.join(userId); // join user in room
    });
    console.log(chalk_1.default.green(`[socket] connected successfully`));
    return io;
};
exports.default = initializeSocket;
