import { ChatOllama } from "@langchain/ollama";
import { HumanMessage, isAIMessage } from "@langchain/core/messages";
import { Tool } from "@langchain/core/tools";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { expect, test } from "vitest";

// langgraph
import { createReactAgent } from "@langchain/langgraph/prebuilt";

// tool
import { OverpassTokyoRamenCount } from "../src/lib/overpass/tokyo_ramen";

const model = new ChatOllama({
  model: process.env.OLLAMA_CHAT_MODEL,
  temperature: 0,
});

export const loadAgent = async (model: BaseChatModel) => {
  const tools: Array<Tool> = [new OverpassTokyoRamenCount()];
  const prompt =
    "You are a specialist of ramen shops. Be sure to use overpass-tokyo-ramen-count tool and reply based on the results. Before you answer, think if you are right.";
  return createReactAgent({
    llm: model,
    tools: tools,
    stateModifier: prompt,
  });
};

test("ollama agent can answer about Tokyo ramen shops", async () => {
  const agent = await loadAgent(model);

  // Use the agent
  const stream = await agent
    .withConfig({
      maxConcurrency: 1,
    })
    .stream(
      {
        messages: [
          new HumanMessage("東京都23区で一番ラーメン屋が多いのはどこ？"),
        ],
      },
      {
        streamMode: "values",
        recursionLimit: 100,
      }
    );

  let finalAnswer = "";
  let usedTool = false;

  for await (const chunk of stream) {
    const lastMessage = chunk.messages[chunk.messages.length - 1];
    let content = "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let toolCalls: any[] = [];
    if (isAIMessage(lastMessage) === true) {
      content = lastMessage.content as string;
      toolCalls = lastMessage.tool_calls || [];
      finalAnswer = content;
      if (toolCalls.length > 0) {
        usedTool = true;
      }
    }
    console.dir(
      {
        content: content.length < 200 ? content : content.slice(0, 200) + "...",
        toolCalls,
      },
      { depth: null }
    );
  }

  expect(finalAnswer.length).toBeTruthy();
  expect(usedTool).toBe(true);
});
