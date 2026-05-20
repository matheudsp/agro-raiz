import { z } from "zod";

export const createProductSchema = z.object({
  emoji: z.string().min(1),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  categoryId: z.string().min(1, "Escolha uma categoria"),
  priceCentsRaw: z
    .string()
    .min(1, "Preço obrigatório")
    .refine((v) => parseFloat(v.replace(",", ".")) > 0, "Preço deve ser maior que zero"),
  unit: z.string().min(1, "Escolha uma unidade de medida"),
  quantityAvailable: z
    .string()
    .min(1, "Quantidade obrigatória")
    .refine((v) => parseInt(v) > 0, "Deve ser maior que zero"),
  description: z.string().max(300).optional(),
  conservation: z.string().optional(),
  origin: z.string().optional(),
  tags: z.string().optional(), // comma-separated, parsed on submit
});

export type CreateProductFormValues = z.infer<typeof createProductSchema>;

/** "4,00" | "4.00" | "4"  →  integer cents */
export function parsePriceCents(raw: string): number {
  const n = parseFloat(raw.replace(",", "."));
  return isNaN(n) ? 0 : Math.round(n * 100);
}
