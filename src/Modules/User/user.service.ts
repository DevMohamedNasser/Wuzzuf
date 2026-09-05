import { Request, Response } from "express";


class UserService {
    constructor() {}


      updateAcc = async (req: Request, res: Response): Promise<Response> => {
      return res.status(200).json({message: ""})
    }

    //   login = async (req: Request, res: Response): Promise<Response> => {
  //     return res.status(200).json({message: ""})
  //   }

}

export default new UserService();