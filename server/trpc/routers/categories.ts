import { publicProcedure, router } from "../init";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Category = {
  id: string;
  label: string;
  slug: string;
  icon: string;
  color: string;
};

// ─── Static data (categories don't change at runtime) ─────────────────────────

const CATEGORIES: Category[] = [
  { id: "1", label: "Hortaliças", slug: "hortalicas", icon: "leaf-outline", color: "#2E7D32" },
  { id: "2", label: "Frutas", slug: "frutas", icon: "nutrition-outline", color: "#F57F17" },
  { id: "3", label: "Orgânicos", slug: "organicos", icon: "flower-outline", color: "#6A1B9A" },
  { id: "4", label: "Grãos e Cereais", slug: "graos", icon: "cube-outline", color: "#4E342E" },
  { id: "5", label: "Laticínios", slug: "laticinios", icon: "water-outline", color: "#1565C0" },
  { id: "6", label: "Artesanal", slug: "artesanal", icon: "ribbon-outline", color: "#E65100" },
  { id: "7", label: "Raízes e Tubérculos", slug: "raizes", icon: "git-branch-outline", color: "#BF360C" },
  { id: "8", label: "Temperos e Ervas", slug: "temperos", icon: "sparkles-outline", color: "#558B2F" },
];

// ─── Router ───────────────────────────────────────────────────────────────────

export const categoriesRouter = router({
  list: publicProcedure.query(() => CATEGORIES),
});
