import env from "../../Config/config.service";
import bcrypt from "bcrypt";

export const generateHash = async (
  text: string,
  salt: number = env.SALT,
): Promise<string> => {
  return await bcrypt.hash(text, salt);
};

export const compareHash = async (
  cipherTxt: string,
  plainTxt: string,
): Promise<boolean> => {
  return await bcrypt.compare(plainTxt, cipherTxt);
};
