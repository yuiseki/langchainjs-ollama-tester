import { Ollama } from "@langchain/ollama";
import { expect, test } from "vitest";

test("ollama invoke", async () => {
  const llm = new Ollama({
    baseUrl: process.env.OLLAMA_BASE_URL,
    model: process.env.OLLAMA_CHAT_MODEL,
    temperature: 0.0,
  });

  const answer = await llm.invoke(`why is the sky blue?`);

  expect(answer.length).toBeTruthy();
});
