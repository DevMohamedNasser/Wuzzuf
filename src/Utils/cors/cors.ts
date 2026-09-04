import { CorsOptions } from "cors";
import env from "../../Config/config.service";

const whiteList: string[] = env.WHITE_LIST.split(",");

const corsOptions: CorsOptions = {
  origin: (requestOrigin, cb) => {
    if (!requestOrigin)
      // undefined = curl or postman
      return cb(null, true);

    if (whiteList.includes(requestOrigin)) return cb(null, true);

    return cb(new Error("Not allowed by cors"));
  },
};

export default corsOptions;
