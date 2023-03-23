import type { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

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
  // Inserting a default request body message for testing purposes
  // Can be removed once chat is implemented in front-end
  await openai
    .createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: req.body.messages
        ? req.body.messages
        : [{"role": "user", "content": "Say this is a test!"}],
    })
    .then((response) => {
      console.log(response.data);
      res.status(200).json({ result: response.data });
    })
    .catch((e) => {
      console.error(`There was an error with ChatGPT: ${e}`);
      res.status(500).send(e);
    });
};

export default chatHandler;
