import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";

import { Typography } from "@/components/ui/typography";
import { useFieldContext, useFieldError } from "@/hooks/form/form-context";

import type { Category } from "../../../../server/trpc/routers/categories";

const BRAND = { dark: "#2D5A1B", mid: "#3D7A24", soft: "#E8F5E2" } as const;

export function ProductCategoryField({ categories }: { categories: Category[] }) {
  const field = useFieldContext<string>();
  const { isInvalid, errorMessage } = useFieldError();
  const [open, setOpen] = useState(false);
  const selected = categories.find((c) => c.id === field.state.value);

  return (
    <View className="gap-1">
      <TouchableOpacity
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.8}
        className="flex-row items-center gap-2 rounded-2xl border bg-surface px-4 py-3.5"
        style={{ borderColor: isInvalid ? "#EF4444" : "#E0E7DC" }}
      >
        <Ionicons name={(selected?.icon ?? "leaf-outline") as any} size={18} color={selected ? BRAND.mid : "#9CAA8E"} />
        <Typography variant="small" style={{ flex: 1, color: selected ? "#1A3A0A" : "#9CAA8E" }}>
          {selected?.label ?? "Escolha uma categoria"}
        </Typography>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={18} color="#9CAA8E" />
      </TouchableOpacity>

      {isInvalid && (
        <Typography variant="caption" style={{ color: "#EF4444", marginLeft: 4 }}>
          {errorMessage}
        </Typography>
      )}

      {open && (
        <View className="mt-1 overflow-hidden rounded-2xl border border-border bg-surface">
          {categories.map((cat, i) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => {
                field.handleChange(cat.id);
                setOpen(false);
              }}
              activeOpacity={0.75}
              className={`flex-row items-center gap-3 px-4 py-3 ${
                i < categories.length - 1 ? "border-b border-border" : ""
              }`}
              style={{ backgroundColor: field.state.value === cat.id ? BRAND.soft : undefined }}
            >
              <Ionicons name={cat.icon as any} size={18} color={field.state.value === cat.id ? BRAND.mid : "#6B7F5E"} />
              <Typography
                variant="small"
                style={{
                  color: field.state.value === cat.id ? BRAND.dark : "#1A3A0A",
                  fontWeight: field.state.value === cat.id ? "700" : "400",
                }}
              >
                {cat.label}
              </Typography>
              {field.state.value === cat.id && (
                <Ionicons name="checkmark" size={16} color={BRAND.mid} style={{ marginLeft: "auto" }} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
