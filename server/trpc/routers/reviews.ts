import { z } from "zod";

import { publicProcedure, router } from "../init";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Review = {
  id: string;
  producerId: string;
  productId: string | null;
  buyerId: string;
  buyerName: string;
  rating: number; // 1–5
  comment: string;
  createdAt: string;
};

// ─── Seed data ────────────────────────────────────────────────────────────────

const reviews = new Map<string, Review>([
  [
    "r-1",
    {
      id: "r-1",
      producerId: "1",
      productId: "1",
      buyerId: "buyer-1",
      buyerName: "Ana Paula",
      rating: 5,
      comment: "Alface fresquíssima! Chegou cedo e estava perfeita.",
      createdAt: new Date(Date.now() - 86_400_000).toISOString(),
    },
  ],
  [
    "r-2",
    {
      id: "r-2",
      producerId: "1",
      productId: null,
      buyerId: "buyer-2",
      buyerName: "Carlos Melo",
      rating: 5,
      comment: "João é muito pontual e atencioso. Recomendo!",
      createdAt: new Date(Date.now() - 172_800_000).toISOString(),
    },
  ],
  [
    "r-3",
    {
      id: "r-3",
      producerId: "2",
      productId: "3",
      buyerId: "buyer-3",
      buyerName: "Fernanda S.",
      rating: 5,
      comment: "Melado incrível, sem comparação com o de mercado.",
      createdAt: new Date(Date.now() - 259_200_000).toISOString(),
    },
  ],
  [
    "r-4",
    {
      id: "r-4",
      producerId: "3",
      productId: null,
      buyerId: "buyer-4",
      buyerName: "Ricardo N.",
      rating: 5,
      comment: "Cooperativa excelente. Produtos frescos e entrega pontual.",
      createdAt: new Date(Date.now() - 345_600_000).toISOString(),
    },
  ],
]);

// ─── Router ───────────────────────────────────────────────────────────────────

export const reviewsRouter = router({
  // Reviews for a producer or a specific product
  list: publicProcedure
    .input(
      z.object({
        producerId: z.string().optional(),
        productId: z.string().optional(),
      }),
    )
    .query(({ input }) => {
      let list = [...reviews.values()];
      if (input.producerId) list = list.filter((r) => r.producerId === input.producerId);
      if (input.productId) list = list.filter((r) => r.productId === input.productId);
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }),

  // Average rating for a producer
  averageRating: publicProcedure.input(z.object({ producerId: z.string() })).query(({ input }) => {
    const list = [...reviews.values()].filter((r) => r.producerId === input.producerId);
    if (list.length === 0) return { average: 0, count: 0 };
    const avg = list.reduce((s, r) => s + r.rating, 0) / list.length;
    return { average: Math.round(avg * 10) / 10, count: list.length };
  }),

  // Buyer submits a review after order is delivered
  create: publicProcedure
    .input(
      z.object({
        producerId: z.string(),
        productId: z.string().optional(),
        buyerId: z.string(),
        buyerName: z.string(),
        rating: z.number().int().min(1).max(5),
        comment: z.string().min(5).max(500),
      }),
    )
    .mutation(({ input }) => {
      const id = crypto.randomUUID();
      const review: Review = {
        id,
        producerId: input.producerId,
        productId: input.productId ?? null,
        buyerId: input.buyerId,
        buyerName: input.buyerName,
        rating: input.rating,
        comment: input.comment,
        createdAt: new Date().toISOString(),
      };
      reviews.set(id, review);
      return review;
    }),
});
