import { describe, it, expect, vi } from "vitest";
import { Stack, processN } from "jth-runtime";
import { createInfer, conversation, extractContent } from "../src/ollama.mjs";

// Mock Ollama client
function mockOllama(response) {
  return {
    chat: vi.fn().mockResolvedValue(response),
  };
}

describe("conversation", () => {
  it("converts strings to alternating user/assistant messages", () => {
    const s = new Stack();
    s.push("hello", "hi there", "how are you?");
    conversation()(s);
    expect(s.toArray()).toEqual([
      [
        { role: "user", content: "hello" },
        { role: "assistant", content: "hi there" },
        { role: "user", content: "how are you?" },
      ],
    ]);
  });

  it("uses custom roles", () => {
    const s = new Stack();
    s.push("you are helpful", "hello");
    conversation(["system", "user"])(s);
    expect(s.toArray()).toEqual([
      [
        { role: "system", content: "you are helpful" },
        { role: "user", content: "hello" },
      ],
    ]);
  });

  it("passes through non-string objects", () => {
    const s = new Stack();
    const msg = { role: "system", content: "custom" };
    s.push(msg);
    conversation()(s);
    expect(s.toArray()).toEqual([[msg]]);
  });

  it("empty stack produces empty array", () => {
    const s = new Stack();
    conversation()(s);
    expect(s.toArray()).toEqual([[]]);
  });
});

describe("createInfer", () => {
  it("calls ollama.chat with model and messages", async () => {
    const response = { message: { content: "Hello!" } };
    const ollamaMock = mockOllama(response);
    const infer = createInfer(ollamaMock);

    const s = new Stack();
    const messages = [{ role: "user", content: "Hi" }];
    s.push(messages);

    // Async operators must go through processN for auto-async promotion
    await processN(s, [infer()]);
    expect(ollamaMock.chat).toHaveBeenCalledWith({
      model: "qwen3:0.6b",
      messages: [messages],
      think: false,
    });
    expect(s.toArray()).toEqual([response]);
  });

  it("accepts custom model config", async () => {
    const response = { message: { content: "OK" } };
    const ollamaMock = mockOllama(response);
    const infer = createInfer(ollamaMock);

    const s = new Stack();
    s.push([{ role: "user", content: "test" }]);
    await processN(s, [infer({ model: "llama3", think: true })]);

    expect(ollamaMock.chat).toHaveBeenCalledWith({
      model: "llama3",
      messages: expect.any(Array),
      think: true,
    });
  });
});

describe("extractContent", () => {
  it("extracts message content from response", () => {
    const s = new Stack();
    s.push({ message: { content: "Hello world" } });
    extractContent(s);
    expect(s.toArray()).toEqual(["Hello world"]);
  });

  it("returns undefined for missing content", () => {
    const s = new Stack();
    s.push({});
    extractContent(s);
    expect(s.toArray()).toEqual([undefined]);
  });

  it("returns undefined for null response", () => {
    const s = new Stack();
    s.push(null);
    extractContent(s);
    expect(s.toArray()).toEqual([undefined]);
  });
});
