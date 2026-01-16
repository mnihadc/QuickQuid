export type Role = "buyer" | "seller";

export interface ChatMessage {
  userId: string;
  role: Role;
  message: string;
  timestamp: number;
}

export interface ChatResponse {
  reply: string;
  action?: string;
}
