import { ChatOllama } from "@langchain/ollama";
import { HumanMessage } from "@langchain/core/messages";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { expect, test } from "vitest";
import { todoListMiddleware, createAgent } from "langchain";

const model = new ChatOllama({
  model: process.env.OLLAMA_CHAT_MODEL,
  temperature: 0,
});

export const loadAgent = async (model: BaseChatModel) => {
  return createAgent({
    model: model,
    middleware: [todoListMiddleware()],
  });
};

test("ollama agent can answer about Tokyo ramen shops", async () => {
  const agent = await loadAgent(model);

  // Use the agent
  const result = await agent.invoke({
    messages: [new HumanMessage("Help me refactor my codebase")],
  });
  expect(result.todos.length).toBeTruthy();
});
