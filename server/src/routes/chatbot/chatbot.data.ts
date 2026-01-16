export type UserRole = "buyer" | "seller" | "guest";

export interface ChatbotRule {
  intent: string;
  keywords: string[];
  replies: Record<UserRole, string>;
}

export const chatbotRules: ChatbotRule[] = [
  {
    intent: "greeting",
    keywords: ["hi", "hello", "hey", "good morning", "good evening"],
    replies: {
      guest: "Hello! Welcome to our student freelancing platform. How can I help you?",
      buyer: "Hi! Looking to hire a student? I can help you find services.",
      seller: "Hello! Ready to sell your skills? I can help you manage gigs and orders."
    }
  },
  {
    intent: "create_gig",
    keywords: ["create gig", "post gig", "add gig"],
    replies: {
      seller: "To create a gig: Dashboard → Create Gig → Fill details → Publish.",
      buyer: "Only sellers can create gigs. You can switch to a seller account from settings.",
      guest: "Please log in as a seller to create a gig."
    }
  },
  {
    intent: "place_order",
    keywords: ["place order", "buy service", "order gig"],
    replies: {
      buyer: "Open a gig, choose a package, and click Order to continue.",
      seller: "Sellers cannot place orders. Switch to a buyer account to purchase services.",
      guest: "Please log in to place an order."
    }
  }
];
