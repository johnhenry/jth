/**
 * Ollama AI integration for jth.
 *
 * Provides stack-based operators for chatting with local LLMs via the
 * Ollama REST API.  The `ollama` npm package is a peer dependency — if
 * not installed the import will fail gracefully at registration time.
 */
import { op, variadic } from "jth-runtime";

/**
 * infer — send a chat completion request to Ollama.
 *
 * Stack effect: ( ...messages -- response )
 *   messages: array of { role, content } objects
 *   response: the full Ollama response object
 *
 * Config (optional): { model: "qwen3:0.6b", think: false }
 */
export function createInfer(ollama) {
  return function infer(config = {}) {
    const { model = "qwen3:0.6b", think = false } = config;

    return variadic(async (...messages) => {
      const result = await ollama.chat({ model, messages, think });
      return [result];
    });
  };
}

/**
 * conversation — convert stack items into a messages array.
 *
 * Stack effect: ( ...strings -- [...messages] )
 *   Alternates roles: user, assistant, user, assistant, ...
 *   With config roles: the provided roles cycle through the stack.
 *
 * Config (optional): array of role strings, e.g. ["system", "user"]
 */
export function conversation(roles = []) {
  const defaultRoles = roles.length > 0 ? roles : ["user", "assistant"];

  return variadic((...items) => {
    const messages = items.map((content, index) => {
      const role = defaultRoles[index % defaultRoles.length];
      if (typeof content === "string") {
        return { role, content };
      }
      return content;
    });
    return [messages];
  });
}

/**
 * extractContent — drill into an Ollama response to get the message content.
 *
 * Stack effect: ( response -- content_string )
 */
export const extractContent = op(1)((response) => {
  if (response && response.message && response.message.content) {
    return [response.message.content];
  }
  return [undefined];
});
