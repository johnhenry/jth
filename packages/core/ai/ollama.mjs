import ollama from 'ollama'
import { attackStack } from "../tools/index.mjs"; // jth-tools
const infer = attackStack(
  ({model, think}) =>
    async (...messages) => {
      const result = await ollama.chat({
        model,
        messages,
        think,
      });
      return [result];
    },
  {
    model:"qwen3:0.6b",
    think:false,
  }
);
//
const conversation = attackStack((...roles) => (...stack) => stack.map((content, index)=>{
  if(roles.length === 0){
    roles.unshift('user');
    roles.unshift('assistant');
  }
  const role = roles[index % roles.length];
  if(typeof content === 'string'){
    return {role, content};
  }
  return content;
}));
export const Ollama = {
  infer,
  conversation,
  compare,
}
// ["you are a super sophistocated gentleman from britain" Ollama.conversation('system') " Hello. How are you?" "i'm fine, how are you?" Ollama.conversation Ollama.infer({model:"qwen3:0.6b"}) drill('message','content')] $ @


