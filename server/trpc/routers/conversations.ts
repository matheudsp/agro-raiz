import { z } from "zod";

import { publicProcedure, router } from "../init";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MessageKind = "text" | "product" | "order";

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  kind: MessageKind;
  text: string;
  productId: string | null;
  orderId: string | null;
  readAt: string | null;
  createdAt: string;
};

export type Conversation = {
  id: string;
  buyerId: string;
  producerId: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  createdAt: string;
};

// ─── Seed data ────────────────────────────────────────────────────────────────

const conversations = new Map<string, Conversation>([
  [
    "conv-1",
    {
      id: "conv-1",
      buyerId: "buyer-1",
      producerId: "1",
      lastMessage: "Posso separar mais 5 unidades de alface pra você!",
      lastMessageAt: new Date().toISOString(),
      unreadCount: 2,
      createdAt: new Date(Date.now() - 86_400_000).toISOString(),
    },
  ],
  [
    "conv-2",
    {
      id: "conv-2",
      buyerId: "buyer-1",
      producerId: "2",
      lastMessage: "O melado está fresquinho, colhido ontem 🍯",
      lastMessageAt: new Date(Date.now() - 3_600_000).toISOString(),
      unreadCount: 1,
      createdAt: new Date(Date.now() - 172_800_000).toISOString(),
    },
  ],
]);

const messages = new Map<string, Message[]>([
  [
    "conv-1",
    [
      {
        id: "m-1",
        conversationId: "conv-1",
        senderId: "1",
        kind: "text",
        text: "Olá! Tenho 25 unidades de alface orgânica disponíveis 🥬",
        productId: null,
        orderId: null,
        readAt: new Date().toISOString(),
        createdAt: new Date(Date.now() - 3_000_000).toISOString(),
      },
      {
        id: "m-2",
        conversationId: "conv-1",
        senderId: "buyer-1",
        kind: "text",
        text: "Oi João! Qual o prazo de entrega para Canavieira?",
        productId: null,
        orderId: null,
        readAt: new Date().toISOString(),
        createdAt: new Date(Date.now() - 2_700_000).toISOString(),
      },
      {
        id: "m-3",
        conversationId: "conv-1",
        senderId: "1",
        kind: "text",
        text: "Entrego amanhã antes das 8h. Fresquinha do dia! 😊",
        productId: null,
        orderId: null,
        readAt: new Date().toISOString(),
        createdAt: new Date(Date.now() - 2_400_000).toISOString(),
      },
      {
        id: "m-4",
        conversationId: "conv-1",
        senderId: "1",
        kind: "product",
        text: "Esse é o produto disponível:",
        productId: "1",
        orderId: null,
        readAt: new Date().toISOString(),
        createdAt: new Date(Date.now() - 2_100_000).toISOString(),
      },
      {
        id: "m-5",
        conversationId: "conv-1",
        senderId: "buyer-1",
        kind: "text",
        text: "Perfeito! Vou querer 5 unidades.",
        productId: null,
        orderId: null,
        readAt: new Date().toISOString(),
        createdAt: new Date(Date.now() - 1_800_000).toISOString(),
      },
      {
        id: "m-6",
        conversationId: "conv-1",
        senderId: "1",
        kind: "order",
        text: "Pedido confirmado! Aqui está o resumo:",
        productId: null,
        orderId: "order-1",
        readAt: new Date().toISOString(),
        createdAt: new Date(Date.now() - 1_500_000).toISOString(),
      },
      {
        id: "m-7",
        conversationId: "conv-1",
        senderId: "1",
        kind: "text",
        text: "Posso separar mais 5 unidades de alface pra você!",
        productId: null,
        orderId: null,
        readAt: null,
        createdAt: new Date(Date.now() - 600_000).toISOString(),
      },
    ],
  ],
  [
    "conv-2",
    [
      {
        id: "m-8",
        conversationId: "conv-2",
        senderId: "2",
        kind: "text",
        text: "O melado está fresquinho, colhido ontem 🍯",
        productId: null,
        orderId: null,
        readAt: null,
        createdAt: new Date(Date.now() - 3_600_000).toISOString(),
      },
    ],
  ],
]);

// ─── Router ───────────────────────────────────────────────────────────────────

export const conversationsRouter = router({
  // All conversations for a user (buyer or producer)
  list: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ input }) =>
      [...conversations.values()]
        .filter((c) => c.buyerId === input.userId || c.producerId === input.userId)
        .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt)),
    ),

  // Find or open a thread — called when buyer taps "Falar com produtor"
  getOrCreate: publicProcedure
    .input(z.object({ buyerId: z.string(), producerId: z.string() }))
    .mutation(({ input }) => {
      const existing = [...conversations.values()].find(
        (c) => c.buyerId === input.buyerId && c.producerId === input.producerId,
      );
      if (existing) return existing;

      const id = `conv-${crypto.randomUUID()}`;
      const now = new Date().toISOString();
      const conv: Conversation = {
        id,
        buyerId: input.buyerId,
        producerId: input.producerId,
        lastMessage: "",
        lastMessageAt: now,
        unreadCount: 0,
        createdAt: now,
      };
      conversations.set(id, conv);
      messages.set(id, []);
      return conv;
    }),

  // Full message history for a conversation
  messages: publicProcedure.input(z.object({ conversationId: z.string() })).query(({ input }) => {
    const msgs = messages.get(input.conversationId);
    if (!msgs) throw new Error("Conversa não encontrada");
    return msgs.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }),

  // Send a message (text, product card or order card)
  send: publicProcedure
    .input(
      z.object({
        conversationId: z.string(),
        senderId: z.string(),
        kind: z.enum(["text", "product", "order"]),
        text: z.string().min(1).max(1000),
        productId: z.string().optional(),
        orderId: z.string().optional(),
      }),
    )
    .mutation(({ input }) => {
      const conv = conversations.get(input.conversationId);
      if (!conv) throw new Error("Conversa não encontrada");

      const now = new Date().toISOString();
      const msg: Message = {
        id: crypto.randomUUID(),
        conversationId: input.conversationId,
        senderId: input.senderId,
        kind: input.kind,
        text: input.text,
        productId: input.productId ?? null,
        orderId: input.orderId ?? null,
        readAt: null,
        createdAt: now,
      };

      const thread = messages.get(input.conversationId) ?? [];
      thread.push(msg);
      messages.set(input.conversationId, thread);

      conv.lastMessage = input.text;
      conv.lastMessageAt = now;
      conv.unreadCount += 1;

      return msg;
    }),

  // Mark all messages in a conversation as read (called when user opens chat)
  markRead: publicProcedure
    .input(z.object({ conversationId: z.string(), userId: z.string() }))
    .mutation(({ input }) => {
      const conv = conversations.get(input.conversationId);
      if (!conv) throw new Error("Conversa não encontrada");

      const now = new Date().toISOString();
      const thread = messages.get(input.conversationId) ?? [];
      thread.forEach((m) => {
        if (m.senderId !== input.userId && !m.readAt) m.readAt = now;
      });
      conv.unreadCount = 0;

      return { conversationId: input.conversationId };
    }),
});
