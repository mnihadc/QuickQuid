import { ChatMessage } from "./chatbot.types.js";

const conversations = new Map<string, ChatMessage[]>();

export function saveMessage(msg: ChatMessage) {
  if (!conversations.has(msg.userId)) {
    conversations.set(msg.userId, []);
  }
  conversations.get(msg.userId)!.push(msg);
}

export function getHistory(userId: string) {
  return conversations.get(userId) || [];
}
