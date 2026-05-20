import { z } from "zod";

import { publicProcedure, router } from "../init";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProductTag = "Orgânico" | "Artesanal" | "Produção Local" | "Agroecológico" | "Sem Agrotóxico";
export type ProductUnit = "unid." | "kg" | "g" | "litro" | "dúzia" | "maço" | "caixa";

export type Product = {
  id: string;
  producerId: string;
  name: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  categoryLabel: string;
  // Price stored in BRL cents to avoid float arithmetic (400 = R$ 4,00)
  priceCents: number;
  unit: ProductUnit;
  quantityAvailable: number;
  tags: ProductTag[];
  badge: string;
  conservation: string;
  harvestDate: string | null; // ISO date of last harvest
  emoji: string;
  cardBg: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const productTagSchema = z.enum(["Orgânico", "Artesanal", "Produção Local", "Agroecológico", "Sem Agrotóxico"]);
const productUnitSchema = z.enum(["unid.", "kg", "g", "litro", "dúzia", "maço", "caixa"]);

const createProductSchema = z.object({
  producerId: z.string(),
  name: z.string().min(2).max(100),
  description: z.string().min(10).max(1000),
  shortDescription: z.string().min(5).max(200),
  categoryId: z.string(),
  categoryLabel: z.string(),
  priceCents: z.number().int().positive(),
  unit: productUnitSchema,
  quantityAvailable: z.number().int().nonnegative(),
  tags: z.array(productTagSchema),
  badge: z.string(),
  conservation: z.string(),
  emoji: z.string().optional(),
  cardBg: z.string().optional(),
});

// Exported so the client can type the onSubmit callback — types are safe to import per the project boundary rules.
export type CreateProductInput = z.infer<typeof createProductSchema>;

// ─── Seed data ────────────────────────────────────────────────────────────────

const products = new Map<string, Product>([
  [
    "1",
    {
      id: "1",
      producerId: "1",
      name: "Alface Crespa Orgânica",
      description:
        "Alface crespa cultivada sem agrotóxicos.\nFolhas macias, crocantes e cheias de sabor.\nPerfeita para saladas e refeições saudáveis.",
      shortDescription: "Alface fresca, orgânica, colhida no dia. Ideal para saladas.",
      categoryId: "1",
      categoryLabel: "Hortaliças",
      priceCents: 400,
      unit: "unid.",
      quantityAvailable: 25,
      tags: ["Orgânico", "Sem Agrotóxico"],
      badge: "100% Orgânico",
      conservation: "Manter refrigerado",
      harvestDate: new Date().toISOString(),
      emoji: "🥬",
      cardBg: "#E8F5E9",
      active: true,
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: new Date().toISOString(),
    },
  ],
  [
    "2",
    {
      id: "2",
      producerId: "2",
      name: "Frutas da Estação",
      description:
        "Cesta variada com as frutas da época, colhidas fresquinhas da roça.\nPode incluir laranja, limão, manga e outras conforme disponibilidade sazonal.",
      shortDescription: "Cesta com frutas frescas da época, direto da roça.",
      categoryId: "2",
      categoryLabel: "Frutas",
      priceCents: 600,
      unit: "kg",
      quantityAvailable: 50,
      tags: ["Orgânico"],
      badge: "Da Época",
      conservation: "Temperatura ambiente",
      harvestDate: new Date().toISOString(),
      emoji: "🍊",
      cardBg: "#FFF9C4",
      active: true,
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: new Date().toISOString(),
    },
  ],
  [
    "3",
    {
      id: "3",
      producerId: "2",
      name: "Melado de Cana",
      description:
        "Melado puro artesanal, produzido em engenho próprio.\nSem conservantes, sem aditivos. Adoce com tradição nordestina.",
      shortDescription: "Melado artesanal puro, sem conservantes, engenho próprio.",
      categoryId: "6",
      categoryLabel: "Artesanal",
      priceCents: 1000,
      unit: "unid.",
      quantityAvailable: 30,
      tags: ["Artesanal"],
      badge: "Artesanal",
      conservation: "Local fresco e seco",
      harvestDate: null,
      emoji: "🍯",
      cardBg: "#FFF3E0",
      active: true,
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: new Date().toISOString(),
    },
  ],
  [
    "4",
    {
      id: "4",
      producerId: "4",
      name: "Feijão Carioca",
      description:
        "Feijão produzido localmente, seco naturalmente.\nGrãos selecionados, sem carunchos. Ideal para o dia a dia.",
      shortDescription: "Feijão local selecionado, seco naturalmente.",
      categoryId: "4",
      categoryLabel: "Grãos e Cereais",
      priceCents: 800,
      unit: "kg",
      quantityAvailable: 100,
      tags: ["Produção Local"],
      badge: "Produção Local",
      conservation: "Local seco e arejado",
      harvestDate: null,
      emoji: "🫘",
      cardBg: "#EFEBE9",
      active: true,
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: new Date().toISOString(),
    },
  ],
  [
    "5",
    {
      id: "5",
      producerId: "1",
      name: "Coentro Fresco",
      description: "Coentro colhido na manhã do dia. Aromático e fresco, essencial na cozinha nordestina.",
      shortDescription: "Coentro colhido no dia, aromático e fresquinho.",
      categoryId: "8",
      categoryLabel: "Temperos e Ervas",
      priceCents: 150,
      unit: "maço",
      quantityAvailable: 40,
      tags: ["Orgânico", "Sem Agrotóxico"],
      badge: "Colhido no Dia",
      conservation: "Refrigerado ou em água",
      harvestDate: new Date().toISOString(),
      emoji: "🌿",
      cardBg: "#F1F8E9",
      active: true,
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: new Date().toISOString(),
    },
  ],
  [
    "6",
    {
      id: "6",
      producerId: "4",
      name: "Farinha de Mandioca",
      description: "Farinha artesanal de mandioca, torrada na medida certa.\nProduzida em casa de farinha tradicional.",
      shortDescription: "Farinha artesanal de mandioca, torrada em casa de farinha.",
      categoryId: "6",
      categoryLabel: "Artesanal",
      priceCents: 700,
      unit: "kg",
      quantityAvailable: 60,
      tags: ["Artesanal", "Produção Local"],
      badge: "Artesanal",
      conservation: "Local seco e arejado",
      harvestDate: null,
      emoji: "🌾",
      cardBg: "#FFF8E1",
      active: true,
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: new Date().toISOString(),
    },
  ],
]);

// ─── Router ───────────────────────────────────────────────────────────────────

export const productsRouter = router({
  // Paginated/filtered list
  list: publicProcedure
    .input(
      z
        .object({
          producerId: z.string().optional(),
          categoryId: z.string().optional(),
          tag: productTagSchema.optional(),
          search: z.string().optional(),
          activeOnly: z.boolean().optional().default(true),
        })
        .optional(),
    )
    .query(({ input }) => {
      let list = [...products.values()];
      if (input?.activeOnly !== false) list = list.filter((p) => p.active);
      if (input?.producerId) list = list.filter((p) => p.producerId === input.producerId);
      if (input?.categoryId) list = list.filter((p) => p.categoryId === input.categoryId);
      if (input?.tag) list = list.filter((p) => p.tags.includes(input.tag!));
      if (input?.search) {
        const q = input.search.toLowerCase();
        list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
      }
      return list;
    }),

  // Curated selection for the home screen
  featured: publicProcedure.query(() => [...products.values()].filter((p) => p.active).slice(0, 6)),

  // Single product detail
  get: publicProcedure.input(z.object({ id: z.string() })).query(({ input }) => {
    const p = products.get(input.id);
    if (!p) throw new Error("Produto não encontrado");
    return p;
  }),

  // Producer creates a new listing
  create: publicProcedure.input(createProductSchema).mutation(({ input }) => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const product: Product = {
      id,
      ...input,
      harvestDate: null,
      emoji: input.emoji ?? "🌱",
      cardBg: input.cardBg ?? "#E8F5E9",
      active: true,
      createdAt: now,
      updatedAt: now,
    };
    products.set(id, product);
    return product;
  }),

  // Producer updates daily stock / price — the most frequent write in the app
  updateAvailability: publicProcedure
    .input(
      z.object({
        id: z.string(),
        quantityAvailable: z.number().int().nonnegative(),
        priceCents: z.number().int().positive().optional(),
        harvestDate: z.string().optional(),
        active: z.boolean().optional(),
      }),
    )
    .mutation(({ input }) => {
      const p = products.get(input.id);
      if (!p) throw new Error("Produto não encontrado");
      p.quantityAvailable = input.quantityAvailable;
      if (input.priceCents !== undefined) p.priceCents = input.priceCents;
      if (input.harvestDate !== undefined) p.harvestDate = input.harvestDate;
      if (input.active !== undefined) p.active = input.active;
      p.updatedAt = new Date().toISOString();
      return p;
    }),

  // Soft-delete: deactivate listing
  toggleActive: publicProcedure.input(z.object({ id: z.string() })).mutation(({ input }) => {
    const p = products.get(input.id);
    if (!p) throw new Error("Produto não encontrado");
    p.active = !p.active;
    p.updatedAt = new Date().toISOString();
    return p;
  }),

  delete: publicProcedure.input(z.object({ id: z.string() })).mutation(({ input }) => {
    if (!products.delete(input.id)) throw new Error("Produto não encontrado");
    return { id: input.id };
  }),
});
