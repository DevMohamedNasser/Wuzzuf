import { Server, Socket } from "socket.io";
import { Server as httpServer } from "node:http";
import { HUserDocument } from "../../DB/Models/user.model";
import { decodedToken } from "../../Middlewares/authentication.middleware";
import { tokenTypeEnum } from "../enums/token.enum";
import chalk from "chalk";

export interface authedSocket extends Socket {
  user?: HUserDocument;
}

let io: Server | null = null;
export const getIo = (): Server | null => io;

const initializeSocket = (httpServer: httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  //   socket middleware
  io.use(async (socket: authedSocket, next) => {
    try {
      const authorization = socket.handshake.auth.token;

      const { user } = await decodedToken({
        authorization,
        tokenType: tokenTypeEnum.Access,
      });

      socket.user = user;
      next();
    } catch (error) {
      next(
        new Error(
          (error as Error).message || "Unauthorized socket (check headers)",
        ),
      );
    }
  });

  io.on("connection", (socket: authedSocket) => {
    const user = socket.user!;
    const userId = user._id.toString();

    socket.join(userId); // join user in room
  });

  console.log(chalk.green(`[socket] connected successfully`));
  return io;
};

export default initializeSocket;
