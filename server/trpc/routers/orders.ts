import { z } from "zod";

import { publicProcedure, router } from "../init";

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderStatus = "pendente" | "confirmado" | "preparando" | "pronto" | "entregue" | "cancelado";
export type DeliveryMode = "entrega" | "retirada" | "feira";

export type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number; // BRL cents
  subtotal: number; // BRL cents
  unit: string;
};

export type Order = {
  id: string;
  buyerId: string;
  producerId: string;
  items: OrderItem[];
  status: OrderStatus;
  deliveryMode: DeliveryMode;
  deliveryAddress: string | null;
  scheduledDate: string | null;
  totalCents: number;
  note: string;
  createdAt: string;
  updatedAt: string;
};

// ─── Status machine ───────────────────────────────────────────────────────────

const ALLOWED: Record<OrderStatus, OrderStatus[]> = {
  pendente: ["confirmado", "cancelado"],
  confirmado: ["preparando", "cancelado"],
  preparando: ["pronto", "cancelado"],
  pronto: ["entregue"],
  entregue: [],
  cancelado: [],
};

// ─── Seed data ────────────────────────────────────────────────────────────────

const orders = new Map<string, Order>([
  [
    "order-1",
    {
      id: "order-1",
      buyerId: "buyer-1",
      producerId: "1",
      items: [
        {
          productId: "1",
          productName: "Alface Crespa Orgânica",
          quantity: 5,
          unitPrice: 400,
          subtotal: 2000,
          unit: "unid.",
        },
      ],
      status: "confirmado",
      deliveryMode: "entrega",
      deliveryAddress: "Rua das Flores, 12 – Canavieira/PI",
      scheduledDate: new Date(Date.now() + 86_400_000).toISOString(),
      totalCents: 2000,
      note: "",
      createdAt: new Date(Date.now() - 3_600_000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
]);

// ─── Router ───────────────────────────────────────────────────────────────────

export const ordersRouter = router({
  // List orders — filter by buyer or producer
  list: publicProcedure
    .input(
      z
        .object({
          buyerId: z.string().optional(),
          producerId: z.string().optional(),
          status: z.enum(["pendente", "confirmado", "preparando", "pronto", "entregue", "cancelado"]).optional(),
        })
        .optional(),
    )
    .query(({ input }) => {
      let list = [...orders.values()];
      if (input?.buyerId) list = list.filter((o) => o.buyerId === input.buyerId);
      if (input?.producerId) list = list.filter((o) => o.producerId === input.producerId);
      if (input?.status) list = list.filter((o) => o.status === input.status);
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }),

  // Single order (for status tracking screen)
  get: publicProcedure.input(z.object({ id: z.string() })).query(({ input }) => {
    const o = orders.get(input.id);
    if (!o) throw new Error("Pedido não encontrado");
    return o;
  }),

  // Buyer places an order
  create: publicProcedure
    .input(
      z.object({
        buyerId: z.string(),
        producerId: z.string(),
        items: z
          .array(
            z.object({
              productId: z.string(),
              productName: z.string(),
              quantity: z.number().int().positive(),
              unitPrice: z.number().int().positive(),
              unit: z.string(),
            }),
          )
          .min(1),
        deliveryMode: z.enum(["entrega", "retirada", "feira"]),
        deliveryAddress: z.string().optional(),
        scheduledDate: z.string().optional(),
        note: z.string().max(300).optional(),
      }),
    )
    .mutation(({ input }) => {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const items: OrderItem[] = input.items.map((i) => ({
        ...i,
        subtotal: i.quantity * i.unitPrice,
      }));
      const order: Order = {
        id,
        buyerId: input.buyerId,
        producerId: input.producerId,
        items,
        status: "pendente",
        deliveryMode: input.deliveryMode,
        deliveryAddress: input.deliveryAddress ?? null,
        scheduledDate: input.scheduledDate ?? null,
        totalCents: items.reduce((s, i) => s + i.subtotal, 0),
        note: input.note ?? "",
        createdAt: now,
        updatedAt: now,
      };
      orders.set(id, order);
      return order;
    }),

  // Producer (or system) advances order through the status machine
  updateStatus: publicProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["pendente", "confirmado", "preparando", "pronto", "entregue", "cancelado"]),
      }),
    )
    .mutation(({ input }) => {
      const order = orders.get(input.id);
      if (!order) throw new Error("Pedido não encontrado");
      if (!ALLOWED[order.status].includes(input.status)) {
        throw new Error(`Transição inválida: "${order.status}" → "${input.status}"`);
      }
      order.status = input.status;
      order.updatedAt = new Date().toISOString();
      return order;
    }),
});
