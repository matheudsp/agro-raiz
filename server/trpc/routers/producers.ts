import { z } from "zod";

import { publicProcedure, router } from "../init";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DeliveryOption = "entrega" | "retirada" | "feira";

export type Producer = {
  id: string;
  name: string;
  type: string;
  bio: string;
  city: string;
  state: string;
  location: string; // formatted "City – ST"
  initials: string;
  avatarBg: string;
  rating: number;
  reviewCount: number;
  productCount: number;
  deliveryOptions: DeliveryOption[];
  tags: string[];
  whatsapp: string | null; // international format, e.g. "5589912345678"
  verified: boolean;
  active: boolean;
  createdAt: string;
};

// ─── Seed data ────────────────────────────────────────────────────────────────

const producers = new Map<string, Producer>([
  [
    "1",
    {
      id: "1",
      name: "João Silva",
      type: "Agricultor Familiar",
      bio: "Cultivo orgânico há 15 anos. Especialidade em hortaliças e temperos. Entrego direto na sua porta todo dia cedo.",
      city: "Canavieira",
      state: "PI",
      location: "Canavieira – PI",
      initials: "JS",
      avatarBg: "#C8E6C9",
      rating: 4.9,
      reviewCount: 128,
      productCount: 12,
      deliveryOptions: ["entrega", "retirada"],
      tags: ["Orgânico", "Hortaliças", "Agroecológico"],
      whatsapp: "5589912340001",
      verified: true,
      active: true,
      createdAt: "2024-01-10T00:00:00.000Z",
    },
  ],
  [
    "2",
    {
      id: "2",
      name: "Antônio Lima",
      type: "Agricultor Familiar",
      bio: "Frutas da época e derivados da cana. Melado e rapadura artesanais feitos com tradição familiar.",
      city: "Canavieira",
      state: "PI",
      location: "Canavieira – PI",
      initials: "AL",
      avatarBg: "#DCEDC8",
      rating: 4.8,
      reviewCount: 96,
      productCount: 8,
      deliveryOptions: ["entrega", "feira"],
      tags: ["Artesanal", "Frutas", "Derivados da Cana"],
      whatsapp: "5589912340002",
      verified: true,
      active: true,
      createdAt: "2024-02-15T00:00:00.000Z",
    },
  ],
  [
    "3",
    {
      id: "3",
      name: "Mulheres do Campo",
      type: "Cooperativa",
      bio: "Cooperativa de agricultoras familiares. Produzimos alimentos agroecológicos e fortalecemos a renda das mulheres do campo.",
      city: "Canavieira",
      state: "PI",
      location: "Canavieira – PI",
      initials: "MC",
      avatarBg: "#F0F4C3",
      rating: 4.9,
      reviewCount: 112,
      productCount: 20,
      deliveryOptions: ["entrega", "retirada", "feira"],
      tags: ["Cooperativa", "Orgânico", "Agroecológico"],
      whatsapp: "5589912340003",
      verified: true,
      active: true,
      createdAt: "2024-01-20T00:00:00.000Z",
    },
  ],
  [
    "4",
    {
      id: "4",
      name: "Maria Oliveira",
      type: "Agricultora Familiar",
      bio: "Cultivo de mandioca, milho e feijão. Farinha artesanal produzida na roça com equipamentos tradicionais.",
      city: "Canavieira",
      state: "PI",
      location: "Canavieira – PI",
      initials: "MO",
      avatarBg: "#FFE0B2",
      rating: 4.7,
      reviewCount: 64,
      productCount: 6,
      deliveryOptions: ["retirada", "feira"],
      tags: ["Produção Local", "Grãos", "Artesanal"],
      whatsapp: "5589912340004",
      verified: false,
      active: true,
      createdAt: "2024-03-01T00:00:00.000Z",
    },
  ],
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const producersRouter = router({
  // All producers — optional city filter
  list: publicProcedure.input(z.object({ city: z.string().optional() }).optional()).query(({ input }) => {
    let list = [...producers.values()].filter((p) => p.active);
    if (input?.city) list = list.filter((p) => p.city === input.city);
    return list;
  }),

  // Top-rated for the home screen hero section
  featured: publicProcedure.query(() =>
    [...producers.values()]
      .filter((p) => p.active && p.verified)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5),
  ),

  // Single producer profile
  get: publicProcedure.input(z.object({ id: z.string() })).query(({ input }) => {
    const p = producers.get(input.id);
    if (!p) throw new Error("Produtor não encontrado");
    return p;
  }),

  // Self-registration (producer on-boarding flow)
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100),
        type: z.string().min(2).max(60),
        bio: z.string().min(10).max(500),
        city: z.string().min(2),
        state: z.string().length(2),
        deliveryOptions: z.array(z.enum(["entrega", "retirada", "feira"])).min(1),
        tags: z.array(z.string()).optional(),
        whatsapp: z
          .string()
          .regex(/^\d{12,13}$/, "Use formato internacional sem + (ex: 5589912345678)")
          .optional(),
      }),
    )
    .mutation(({ input }) => {
      const id = crypto.randomUUID();
      const producer: Producer = {
        id,
        name: input.name,
        type: input.type,
        bio: input.bio,
        city: input.city,
        state: input.state,
        location: `${input.city} – ${input.state}`,
        initials: makeInitials(input.name),
        avatarBg: "#C8E6C9",
        rating: 0,
        reviewCount: 0,
        productCount: 0,
        deliveryOptions: input.deliveryOptions,
        tags: input.tags ?? [],
        whatsapp: input.whatsapp ?? null,
        verified: false,
        active: true,
        createdAt: new Date().toISOString(),
      };
      producers.set(id, producer);
      return producer;
    }),

  // Update profile (bio, delivery options, whatsapp)
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        bio: z.string().min(10).max(500).optional(),
        deliveryOptions: z
          .array(z.enum(["entrega", "retirada", "feira"]))
          .min(1)
          .optional(),
        tags: z.array(z.string()).optional(),
        whatsapp: z
          .string()
          .regex(/^\d{12,13}$/)
          .optional(),
      }),
    )
    .mutation(({ input }) => {
      const p = producers.get(input.id);
      if (!p) throw new Error("Produtor não encontrado");
      if (input.bio !== undefined) p.bio = input.bio;
      if (input.deliveryOptions !== undefined) p.deliveryOptions = input.deliveryOptions;
      if (input.tags !== undefined) p.tags = input.tags;
      if (input.whatsapp !== undefined) p.whatsapp = input.whatsapp;
      return p;
    }),
});
