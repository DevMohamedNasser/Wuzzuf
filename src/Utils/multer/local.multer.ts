import multer, { FileFilterCallback, StorageEngine } from "multer";
import path from "node:path";
import fs from "node:fs";
import { Request } from "express";

export const localFileMulter = ({
  customPath = "general",
  validation,
  maxSizeMB = 5,
}: {
  customPath?: string;
  validation: string[];
  maxSizeMB: number;
}) => {
  const basePath = `/uploads/${customPath}/`;

  const storage: StorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
      let userBasePath = basePath;
      if (req.user?._id) userBasePath += `${req.user._id}`;
      // /uploads/users/_id
      const fullPath = path.resolve(`./src/${userBasePath}`);
      if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });

      cb(null, fullPath);
    },
    filename: (req: Request, file, cb) => {
      const uniqueSuffix =
        Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        "-" +
        file.originalname;
      cb(null, file.fieldname + "-" + uniqueSuffix);
    },
  });

  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    // console.log(file);
  // console.log("mimetype:", file.mimetype); //  😡 postman always returns: application/octet-stream
  // console.log("validation:", validation);
  //   if (!validation.includes(file.mimetype))
  //     return cb(new Error("Invalid file type"));

    return cb(null, true);
  };

  return multer({
    fileFilter,
    storage,
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
  });
};
