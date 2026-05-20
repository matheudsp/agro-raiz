import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";
import { tv } from "tailwind-variants";

import { Typography } from "@/components/ui/typography";
import { useFieldContext, useFieldError } from "@/hooks/form/form-context";

const BRAND = { dark: "#2D5A1B", mid: "#3D7A24" } as const;

export const UNITS = ["unid.", "kg", "g", "litro", "dúzia", "maço", "caixa"] as const;
export const PRODUCT_TAGS = ["Orgânico", "Artesanal", "Produção Local", "Agroecológico", "Sem Agrotóxico"] as const;

// ─── Unit Picker ──────────────────────────────────────────────────────────────

const unitChipVariants = tv({
  base: "items-center justify-center rounded-xl border px-4 py-2",
  variants: {
    selected: {
      true: "border-[#3D7A24] bg-[#E8F5E2]",
      false: "border-border bg-surface",
    },
  },
  defaultVariants: { selected: false },
});

export function ProductUnitField() {
  const field = useFieldContext<string>();
  const { isInvalid, errorMessage } = useFieldError();

  return (
    <View className="gap-1">
      <View className="flex-row flex-wrap gap-2">
        {UNITS.map((u) => (
          <TouchableOpacity
            key={u}
            onPress={() => field.handleChange(u)}
            activeOpacity={0.8}
            className={unitChipVariants({ selected: field.state.value === u })}
          >
            <Typography
              variant="caption"
              style={{
                color: field.state.value === u ? BRAND.dark : "#4A5E40",
                fontWeight: field.state.value === u ? "700" : "500",
              }}
            >
              {u}
            </Typography>
          </TouchableOpacity>
        ))}
      </View>
      {isInvalid && (
        <Typography variant="caption" style={{ color: "#EF4444", marginLeft: 4 }}>
          {errorMessage}
        </Typography>
      )}
    </View>
  );
}

// ─── Tags Picker ──────────────────────────────────────────────────────────────
// Tags are stored as a comma-separated string in the form ("Orgânico,Artesanal")
// and parsed back to string[] on submit — keeps TanStack Form happy with Zod.

const tagChipVariants = tv({
  base: "flex-row items-center gap-1.5 rounded-full border px-3 py-1.5",
  variants: {
    selected: {
      true: "border-[#3D7A24] bg-[#E8F5E2]",
      false: "border-border bg-surface",
    },
  },
  defaultVariants: { selected: false },
});

export function ProductTagsField() {
  const field = useFieldContext<string>();

  const active = field.state.value ? field.state.value.split(",").filter(Boolean) : [];

  const toggle = (tag: string) => {
    const next = active.includes(tag) ? active.filter((t) => t !== tag) : [...active, tag];
    field.handleChange(next.join(","));
  };

  return (
    <View className="flex-row flex-wrap gap-2">
      {PRODUCT_TAGS.map((tag) => {
        const selected = active.includes(tag);
        return (
          <TouchableOpacity
            key={tag}
            onPress={() => toggle(tag)}
            activeOpacity={0.8}
            className={tagChipVariants({ selected })}
          >
            <Ionicons name="leaf-outline" size={13} color={selected ? BRAND.mid : "#9CAA8E"} />
            <Typography
              variant="caption"
              style={{
                color: selected ? BRAND.dark : "#4A5E40",
                fontWeight: selected ? "700" : "500",
              }}
            >
              {tag}
            </Typography>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
