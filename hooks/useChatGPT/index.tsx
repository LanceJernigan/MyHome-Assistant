const useChatGPT: (messages: { role: string; content: string }[]) => Promise<{
  choices: {
    finish_reason: string;
    index: number;
    message: { role: string; content: string };
  }[];
  created: number;
  id: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}> = (messages) =>
  fetch("/api/chat", {
    method: "post",
    body: JSON.stringify({
      messages,
    }),
  })
    .then((result) => result.json())
    .then((result) => result.result);

export default useChatGPT;
