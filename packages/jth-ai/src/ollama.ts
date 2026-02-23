import { op, variadic } from "jth-runtime";
import type { StackOperator } from "jth-runtime";

interface OllamaMessage {
  role: string;
  content: string;
}

interface OllamaResponse {
  message?: {
    content?: string;
  };
}

interface OllamaClient {
  chat(params: { model: string; messages: OllamaMessage[]; think: boolean }): Promise<OllamaResponse>;
}

interface InferConfig {
  model?: string;
  think?: boolean;
}

export function createInfer(ollama: OllamaClient) {
  return function infer(config: InferConfig = {}): StackOperator {
    const { model = "qwen3:0.6b", think = false } = config;

    return variadic(async (...messages: unknown[]) => {
      const result = await ollama.chat({ model, messages: messages as OllamaMessage[], think });
      return [result];
    });
  };
}

export function conversation(roles: string[] = []): StackOperator {
  const defaultRoles = roles.length > 0 ? roles : ["user", "assistant"];

  return variadic((...items: unknown[]) => {
    const messages = (items as Array<string | OllamaMessage>).map((content, index) => {
      const role = defaultRoles[index % defaultRoles.length];
      if (typeof content === "string") {
        return { role, content };
      }
      return content;
    });
    return [messages];
  });
}

export const extractContent: StackOperator = op(1)((response: unknown) => {
  const resp = response as OllamaResponse | null;
  if (resp && resp.message && resp.message.content) {
    return [resp.message.content];
  }
  return [undefined];
});
