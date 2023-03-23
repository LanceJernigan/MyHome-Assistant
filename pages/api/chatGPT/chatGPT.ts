import type { NextApiRequest, NextApiResponse } from "next";
import { reqParams, chatResponse } from './types';

const chatHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200);
};

export default chatHandler;
