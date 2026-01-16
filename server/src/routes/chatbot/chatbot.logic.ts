import { Role } from "./chatbot.types.js";

export function handleChat(
  role: Role,
  message: string
) {
  const text = message.toLowerCase();

  if (role === "buyer") {
    if (text.includes("list")) {
      return { reply: "Here are the available listings 👇", action: "FETCH_LISTINGS" };
    }
    if (text.includes("order")) {
      return { reply: "Sure, which item do you want to order?" };
    }
  }

  if (role === "seller") {
    if (text.includes("create")) {
      return { reply: "Tell me the listing title and price." };
    }
    if (text.includes("orders")) {
      return { reply: "Fetching your orders 📦", action: "FETCH_SELLER_ORDERS" };
    }
  }

  return { reply: "I didn’t understand that. Can you rephrase?" };
}
