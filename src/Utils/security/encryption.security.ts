import crypto, { createDecipheriv } from "node:crypto";
import env from "../../Config/config.service";

const IV_LENGTH = 16;
const ENCRYPTION_KEY_SECRET = Buffer.from(env.ENC_KEY);

export const encrypt = (plainTxt: string) => {
  const iv: Buffer = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    ENCRYPTION_KEY_SECRET,
    iv,
  );

  let encryptedData = cipher.update(plainTxt, "utf-8", "hex");
  encryptedData += cipher.final("hex");

  return `${iv.toString("hex")}:${encryptedData}`;
};

export const decrypt = (cipher: string) => {
  const [ivHex, encryptedData] = cipher.split(":");
  if (!ivHex || !encryptedData) throw new Error("Invalid cipher format!!!");

  const binaryLikeIv: Buffer = Buffer.from(ivHex, "hex");

  const decipher = createDecipheriv(
    "aes-256-cbc",
    ENCRYPTION_KEY_SECRET,
    binaryLikeIv,
  );

  let decryptedData: string = decipher.update(encryptedData, "hex", "utf-8");
  decryptedData += decipher.final("utf-8");

  return decryptedData;
};
