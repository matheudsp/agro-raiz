import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { TouchableOpacity, View } from "react-native";

import { Typography } from "@/components/ui/typography";
import { formOptions, useAppForm } from "@/hooks/form/use-app-form";
import { type CreateProductFormValues, createProductSchema, parsePriceCents } from "@/schemas/product";

import type { Category } from "../../../../server/trpc/routers/categories";
import type { CreateProductInput } from "../../../../server/trpc/routers/products";
import { NewProductIncentiveBanner } from "./new-product-incentive-banner";
import { ProductCategoryField } from "./product-category-field";
import { ProductEmojiField } from "./product-emoji-field";
import { ProductTagsField, ProductUnitField } from "./product-pickers";

const BRAND = { dark: "#2D5A1B", mid: "#3D7A24" } as const;

function StepLabel({ n, label, optional }: { n: number; label: string; optional?: boolean }) {
  return (
    <View className="mb-2 flex-row items-center gap-1.5">
      <Typography variant="bodyBold" style={{ color: "#1A3A0A" }}>
        {n}. {label}
      </Typography>
      {optional && (
        <Typography variant="caption" tone="muted">
          (opcional)
        </Typography>
      )}
    </View>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────

export function CreateProductForm({
  categories,
  onSubmit,
}: {
  categories: Category[];
  onSubmit: (input: CreateProductInput) => Promise<unknown>;
}) {
  const formOpts = useMemo(
    () =>
      formOptions({
        defaultValues: {
          emoji: "🌱",
          name: "",
          categoryId: "",
          priceCentsRaw: "",
          unit: "",
          quantityAvailable: "",
          description: "",
          conservation: "",
          origin: "",
          tags: "",
        } as CreateProductFormValues,
        validators: {
          onSubmit: createProductSchema,
          onChange: createProductSchema,
        },
      }),
    [],
  );

  const form = useAppForm({
    ...formOpts,
    async onSubmit({ value, formApi }) {
      try {
        const category = categories.find((c) => c.id === value.categoryId);
        await onSubmit({
          emoji: value.emoji,
          name: value.name.trim(),
          categoryId: value.categoryId,
          categoryLabel: category?.label ?? "",
          priceCents: parsePriceCents(value.priceCentsRaw),
          unit: value.unit as any,
          quantityAvailable: parseInt(value.quantityAvailable),
          description: value.description?.trim() || value.name.trim(),
          shortDescription: value.name.trim(),
          tags: value.tags ? (value.tags.split(",").filter(Boolean) as any) : [],
          badge: value.tags?.split(",")[0] ?? "",
          conservation: value.conservation?.trim() || "Temperatura ambiente",
          cardBg: "#E8F5E9",
          producerId: "", // injected by the screen
        });
        formApi.reset();
      } catch {
        formApi.setErrorMap({
          onSubmit: {
            form: "Erro ao publicar. Verifique os campos e tente novamente.",
            fields: {},
          },
        });
      }
    },
  });

  return (
    <View className="gap-6 px-4">
      {/* Incentive banner */}
      <NewProductIncentiveBanner />

      {/* 1. Photo / Emoji */}
      <View>
        <StepLabel n={1} label="Foto do produto" />
        <form.AppField name="emoji">{() => <ProductEmojiField />}</form.AppField>
      </View>

      {/* 2 & 3. Name + Category side-by-side */}
      <View className="flex-row gap-3">
        <View className="flex-1">
          <StepLabel n={2} label="Nome" />
          <form.AppField name="name">
            {(field) => <field.TextField label="Nome" placeholder="Ex: Alface Crespa Orgânica" returnKeyType="next" />}
          </form.AppField>
        </View>
        <View className="flex-1">
          <StepLabel n={3} label="Categoria" />
          <form.AppField name="categoryId">{() => <ProductCategoryField categories={categories} />}</form.AppField>
        </View>
      </View>

      {/* 4 & 6. Price + Stock side-by-side */}
      <View className="flex-row gap-3">
        <View className="flex-1">
          <StepLabel n={4} label="Preço (R$)" />
          <form.AppField name="priceCentsRaw">
            {(field) => <field.TextField label="Preço (R$)" placeholder="0,00" keyboardType="decimal-pad" />}
          </form.AppField>
        </View>
        <View className="flex-1">
          <StepLabel n={6} label="Estoque" />
          <form.AppField name="quantityAvailable">
            {(field) => <field.TextField label="Estoque" placeholder="Ex: 20" keyboardType="numeric" />}
          </form.AppField>
        </View>
      </View>

      {/* 5. Unit */}
      <View>
        <StepLabel n={5} label="Unidade de medida" />
        <form.AppField name="unit">{() => <ProductUnitField />}</form.AppField>
      </View>

      {/* 7. Description */}
      <View>
        <StepLabel n={7} label="Descrição" optional />
        <form.AppField name="description">
          {(field) => (
            <field.TextField
              label="Descrição"
              placeholder="Fale sobre seu produto: como é produzido, benefícios, dicas de uso, etc."
              multiline
              numberOfLines={4}
            />
          )}
        </form.AppField>
      </View>

      {/* 8. Origin */}
      <View>
        <StepLabel n={8} label="Origem" optional />
        <View className="flex-row items-center gap-2">
          <View className="flex-1">
            <form.AppField name="origin">
              {(field) => <field.TextField label="Origem" placeholder="Ex: Sítio Boa Vista – Zona Rural" />}
            </form.AppField>
          </View>
          <TouchableOpacity activeOpacity={0.8} className="items-center gap-0.5" style={{ width: 60 }}>
            <Ionicons name="locate-outline" size={22} color={BRAND.mid} />
            <Typography
              variant="caption"
              style={{ color: BRAND.mid, fontWeight: "600", textAlign: "center", lineHeight: 13 }}
            >
              Minha{"\n"}localização
            </Typography>
          </TouchableOpacity>
        </View>
      </View>

      {/* 9. Tags */}
      <View>
        <StepLabel n={9} label="Características" optional />
        <form.AppField name="tags">{() => <ProductTagsField />}</form.AppField>
      </View>

      {/* 10. Conservation */}
      <View>
        <StepLabel n={10} label="Conservação" optional />
        <form.AppField name="conservation">
          {(field) => <field.TextField label="Conservação" placeholder="Ex: Manter refrigerado" />}
        </form.AppField>
      </View>

      {/* Form-level error */}
      <form.AppForm>
        <form.FormError />
      </form.AppForm>

      {/* Submit */}
      <form.AppForm>
        <form.SubmitButton label="Publicar produto" loadingLabel="Publicando..." />
      </form.AppForm>

      {/* Preview (passive) */}
      <TouchableOpacity
        activeOpacity={0.8}
        className="flex-row items-center justify-center gap-2 rounded-2xl border border-[#3D7A24] py-4"
      >
        <Ionicons name="eye-outline" size={20} color={BRAND.mid} />
        <Typography variant="bodyBold" style={{ color: BRAND.mid }}>
          Visualizar como ficará
        </Typography>
      </TouchableOpacity>
    </View>
  );
}
