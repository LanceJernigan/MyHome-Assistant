import type { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const chatHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Inserting a default request body message for testing purposes
  // Can be removed once chat is implemented in front-end
  const body = JSON.parse(req.body);

  await openai
    .createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: body.messages
        ? body.messages
        : [{ role: "user", content: "Say this is a test!" }],
    })
    .then((response) => {
      res.status(200).json({ result: response.data });
    })
    .catch((e) => {
      res.status(500).send(e);
    });
};

export default chatHandler;
