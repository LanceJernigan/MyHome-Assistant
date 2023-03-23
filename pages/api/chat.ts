import type { NextApiRequest, NextApiResponse } from "next";

interface chatParams {
  role: string;
  content: string;
}

interface chatRequest {
  params: chatParams[];
}

interface chatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
  };
  choices: {
      message: chatParams;
      finish_reasoning: string;
      index: number;
  }[];
}

const chatHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).send("Successful Routing to /chat");
};

export default chatHandler;
