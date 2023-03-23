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
  res.status(200).json(sampleData);
};

export default chatHandler;

const sampleData = {
  id: 1,
  object: "chat.completion",
  created: 2,
  model: "text-davinci-002-render-sha",
  usage: {
    prompt_tokens: 2,
    completion_tokens: 1,
    total_tokens: 3,
  },
  choices: [
    {
      message: {
        role: "user",
        content: "Here is message 1",
      },
      finish_reasoning: "stop",
      index: 0,
    },
    {
      message: {
        role: "user",
        content: "Here is message 2",
      },
      finish_reasoning: "stop",
      index: 1,
    },
    {
      message: {
        role: "user",
        content: "Here is message 3",
      },
      finish_reasoning: "stop",
      index: 2,
    },
  ],
};
