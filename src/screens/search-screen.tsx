import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { tv } from "tailwind-variants";

import { StandardScrollView } from "@/components/ui/screen-containers/standard-scroll-view";
import { Typography } from "@/components/ui/typography";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useTRPC } from "@/lib/trpc";

import type { Category } from "../../server/trpc/routers/categories";
import type { Product } from "../../server/trpc/routers/products";

// ─── Brand tokens ─────────────────────────────────────────────────────────────

const BRAND = {
  dark: "#2D5A1B",
  mid: "#3D7A24",
  soft: "#E8F5E2",
} as const;

// ─── Static data (editorial, not from API) ────────────────────────────────────

const TRENDING = [
  "Alface orgânica",
  "Melado de cana",
  "Feijão carioca",
  "Tomate cereja",
  "Macaxeira",
  "Coentro",
] as const;

const SORT_OPTIONS = ["Relevância", "Menor preço", "Maior avaliação", "Mais recentes"] as const;
type SortOption = (typeof SORT_OPTIONS)[number];

// ─── Tag display config (client-only) ─────────────────────────────────────────

const PRODUCT_TAG_CONFIG: Record<string, { bg: string; color: string; icon: string }> = {
  Orgânico: { bg: "#E8F5E9", color: "#2E7D32", icon: "leaf" },
  Artesanal: { bg: "#FFF3E0", color: "#E65100", icon: "person" },
  "Produção Local": { bg: "#F3E5F5", color: "#6A1B9A", icon: "home" },
  Agroecológico: { bg: "#E8F5E9", color: "#1B5E20", icon: "leaf" },
  "Sem Agrotóxico": { bg: "#F1F8E9", color: "#33691E", icon: "leaf" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function sortProducts(products: Product[], sortBy: SortOption): Product[] {
  switch (sortBy) {
    case "Menor preço":
      return [...products].sort((a, b) => a.priceCents - b.priceCents);
    case "Maior avaliação":
      return [...products]; // ratings come from producers; sort kept stable for now
    case "Mais recentes":
      return [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    default:
      return products;
  }
}

// ─── Variants ─────────────────────────────────────────────────────────────────

const sortChipVariants = tv({
  base: "rounded-full border px-3.5 py-1.5",
  variants: {
    active: {
      true: "border-[#3D7A24] bg-[#E8F5E2]",
      false: "border-border bg-surface",
    },
  },
  defaultVariants: { active: false },
});

// ─── Search Input ─────────────────────────────────────────────────────────────

function SearchInput({
  query,
  onChangeText,
  onClear,
  onFocus,
  onSubmit,
  focused,
}: {
  query: string;
  onChangeText: (t: string) => void;
  onClear: () => void;
  onFocus: () => void;
  onSubmit: () => void;
  focused: boolean;
}) {
  const colors = useThemeColors();

  return (
    <View className="flex-row items-center gap-2.5 border-b border-border bg-surface px-4 py-3">
      <View className="flex-1 flex-row items-center gap-2 rounded-xl bg-default px-3.5 py-2.5">
        <Ionicons name="search-outline" size={17} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onSubmitEditing={onSubmit}
          placeholder="Buscar produtos, produtores..."
          placeholderTextColor={colors.muted}
          returnKeyType="search"
          autoCorrect={false}
          style={{ flex: 1, fontSize: 14, color: colors.foreground, padding: 0 }}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={onClear} activeOpacity={0.7}>
            <Ionicons name="close-circle" size={17} color={colors.muted} />
          </TouchableOpacity>
        )}
      </View>
      {focused && (
        <TouchableOpacity onPress={onClear} activeOpacity={0.7}>
          <Typography variant="small" style={{ color: BRAND.mid, fontWeight: "600" }}>
            Cancelar
          </Typography>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <Typography variant="smallBold" className="mb-3 px-4" style={{ color: "#1A3A0A" }}>
      {label}
    </Typography>
  );
}

// ─── Recent Searches ──────────────────────────────────────────────────────────

function RecentSearches({
  searches,
  onSelect,
  onClearAll,
}: {
  searches: string[];
  onSelect: (q: string) => void;
  onClearAll: () => void;
}) {
  const colors = useThemeColors();

  if (searches.length === 0) return null;

  return (
    <View className="mt-5 gap-3">
      <View className="flex-row items-center justify-between px-4">
        <SectionLabel label="Buscas recentes" />
        <TouchableOpacity onPress={onClearAll} activeOpacity={0.7}>
          <Typography variant="caption" style={{ color: BRAND.mid, fontWeight: "600" }}>
            Limpar
          </Typography>
        </TouchableOpacity>
      </View>
      <View className="border-y border-border bg-surface">
        {searches.map((search, i) => (
          <TouchableOpacity
            key={search}
            onPress={() => onSelect(search)}
            activeOpacity={0.7}
            className={`flex-row items-center gap-3 px-4 py-3.5 ${i < searches.length - 1 ? "border-b border-border" : ""}`}
          >
            <Ionicons name="time-outline" size={18} color={colors.muted} />
            <Typography variant="small" style={{ flex: 1 }}>
              {search}
            </Typography>
            <Ionicons
              name="arrow-up-outline"
              size={16}
              color={colors.muted}
              style={{ transform: [{ rotate: "45deg" }] }}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Trending ─────────────────────────────────────────────────────────────────

function TrendingSearches({ onSelect }: { onSelect: (q: string) => void }) {
  return (
    <View className="mt-6 gap-3">
      <View className="px-4">
        <SectionLabel label="Em alta na sua região" />
      </View>
      <View className="flex-row flex-wrap gap-2 px-4">
        {TRENDING.map((term) => (
          <TouchableOpacity
            key={term}
            onPress={() => onSelect(term)}
            activeOpacity={0.75}
            className="flex-row items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-2"
          >
            <Ionicons name="trending-up-outline" size={14} color={BRAND.mid} />
            <Typography variant="caption" style={{ fontWeight: "600" }}>
              {term}
            </Typography>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Category Grid — data from API ───────────────────────────────────────────

function CategoryGrid({
  categories,
  onSelect,
}: {
  categories: Category[];
  onSelect: (categoryId: string, label: string) => void;
}) {
  return (
    <View className="mt-6 gap-3">
      <View className="px-4">
        <SectionLabel label="Explorar categorias" />
      </View>
      <View className="flex-row flex-wrap gap-3 px-4">
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => onSelect(cat.id, cat.label)}
            activeOpacity={0.8}
            className="w-[47%] flex-row items-center gap-3 rounded-2xl border border-border bg-surface px-3.5 py-3"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 1,
            }}
          >
            <View
              className="h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: cat.color + "22" }}
            >
              <Ionicons name={cat.icon as any} size={20} color={cat.color} />
            </View>
            <Typography variant="small" style={{ flex: 1, fontWeight: "600", color: "#1A3A0A" }}>
              {cat.label}
            </Typography>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Category Grid Skeleton ───────────────────────────────────────────────────

function CategoryGridSkeleton() {
  return (
    <View className="mt-6 gap-3">
      <View className="mx-4 h-5 w-40 rounded-lg bg-default opacity-60" />
      <View className="flex-row flex-wrap gap-3 px-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <View key={i} className="h-14 w-[47%] rounded-2xl bg-default opacity-50" />
        ))}
      </View>
    </View>
  );
}

// ─── Sort Bar ─────────────────────────────────────────────────────────────────

function SortBar({
  active,
  onSelect,
  total,
  isPending,
}: {
  active: SortOption;
  onSelect: (s: SortOption) => void;
  total: number;
  isPending: boolean;
}) {
  return (
    <View className="gap-2 border-b border-border pt-3 pb-1">
      <View className="flex-row items-center justify-between px-4">
        <Typography variant="caption" tone="muted">
          {isPending ? (
            "Buscando..."
          ) : (
            <>
              <Typography variant="caption" style={{ fontWeight: "700", color: "#1A3A0A" }}>
                {total}
              </Typography>{" "}
              resultados encontrados
            </>
          )}
        </Typography>
        <TouchableOpacity className="flex-row items-center gap-1" activeOpacity={0.7}>
          <Ionicons name="options-outline" size={15} color={BRAND.mid} />
          <Typography variant="caption" style={{ color: BRAND.mid, fontWeight: "600" }}>
            Filtros
          </Typography>
        </TouchableOpacity>
      </View>
      <View className="flex-row gap-2 px-4 pb-2">
        {SORT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt}
            onPress={() => onSelect(opt)}
            activeOpacity={0.75}
            className={sortChipVariants({ active: active === opt })}
          >
            <Typography
              variant="caption"
              style={{
                color: active === opt ? BRAND.dark : undefined,
                fontWeight: active === opt ? "700" : "500",
              }}
            >
              {opt}
            </Typography>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Result Card ──────────────────────────────────────────────────────────────

function ResultCard({ product }: { product: Product }) {
  const [favorited, setFavorited] = useState(false);
  const primaryTag = product.tags[0] ?? "";
  const tag = PRODUCT_TAG_CONFIG[primaryTag] ?? { bg: "#F5F5F5", color: "#666", icon: "pricetag" };

  return (
    <TouchableOpacity
      onPress={() => router.push({ pathname: "/product/[id]", params: { id: product.id } })}
      activeOpacity={0.85}
      className="flex-row items-center gap-3 border-b border-border bg-surface px-4 py-3"
    >
      {/* Image */}
      <View
        className="h-[72px] w-[72px] shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: product.cardBg }}
      >
        <Typography style={{ fontSize: 36 }}>{product.emoji}</Typography>
      </View>

      {/* Info */}
      <View className="flex-1 gap-0.5">
        <Typography variant="smallBold" numberOfLines={1} style={{ color: "#1A3A0A" }}>
          {product.name}
        </Typography>

        <View className="flex-row items-center gap-1">
          <Ionicons name="person-outline" size={11} color="#6B7F5E" />
          <Typography variant="caption" tone="muted" truncate>
            {product.categoryLabel}
          </Typography>
        </View>

        <View className="mt-1 flex-row items-center justify-between">
          {primaryTag ? (
            <View className="flex-row items-center gap-1 rounded-md px-2 py-0.5" style={{ backgroundColor: tag.bg }}>
              <Ionicons name={tag.icon as any} size={10} color={tag.color} />
              <Typography variant="caption" style={{ color: tag.color, fontWeight: "600" }}>
                {primaryTag}
              </Typography>
            </View>
          ) : (
            <View />
          )}
          <Typography variant="smallBold" style={{ color: BRAND.dark }}>
            {formatPrice(product.priceCents)}
            <Typography variant="caption" tone="muted">
              {" "}
              / {product.unit}
            </Typography>
          </Typography>
        </View>
      </View>

      {/* Favorite */}
      <TouchableOpacity
        onPress={() => setFavorited((v) => !v)}
        className="h-8 w-8 items-center justify-center rounded-full bg-default"
        activeOpacity={0.7}
      >
        <Ionicons name={favorited ? "heart" : "heart-outline"} size={17} color={favorited ? "#EF4444" : "#9CAA8E"} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// ─── Results skeleton ─────────────────────────────────────────────────────────

function ResultsSkeleton() {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} className="flex-row items-center gap-3 border-b border-border bg-surface px-4 py-3">
          <View className="h-[72px] w-[72px] rounded-xl bg-default opacity-60" />
          <View className="flex-1 gap-2">
            <View className="h-4 w-3/4 rounded-lg bg-default opacity-60" />
            <View className="h-3 w-1/2 rounded-lg bg-default opacity-50" />
            <View className="h-3 w-1/3 rounded-lg bg-default opacity-40" />
          </View>
        </View>
      ))}
    </>
  );
}

// ─── Empty Results ────────────────────────────────────────────────────────────

function EmptyResults({ query }: { query: string }) {
  return (
    <View className="items-center gap-3 px-8 py-20">
      <View className="h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: BRAND.soft }}>
        <Ionicons name="search-outline" size={36} color={BRAND.mid} />
      </View>
      <View className="items-center gap-1">
        <Typography variant="bodyBold" align="center">
          Nenhum resultado para "{query}"
        </Typography>
        <Typography variant="small" tone="muted" align="center">
          Tente buscar por outro produto ou agricultor da sua região.
        </Typography>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function SearchScreen() {
  const insets = useSafeAreaInsets();
  const trpc = useTRPC();

  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("Relevância");

  // Recent searches are kept in local state for the MVP
  // (in a future iteration these can be persisted with AsyncStorage)
  const [recentSearches, setRecentSearches] = useState<string[]>(["Alface crespa", "Frutas da estação"]);

  const showResults = submitted && query.length > 0;

  // ── Queries ───────────────────────────────────────────────────────────────

  const categoriesQueryOptions = trpc.categories.list.queryOptions();
  const { data: categories = [], isPending: categoriesPending } = useQuery(categoriesQueryOptions);

  // Products search — only fires when there is an active search term
  const searchQueryOptions = trpc.products.list.queryOptions(
    { search: query, activeOnly: true },
    { enabled: showResults },
  );
  const { data: rawResults = [], isPending: searchPending } = useQuery(searchQueryOptions);

  // ── Derived data ──────────────────────────────────────────────────────────

  const sortedResults = sortProducts(rawResults, sortBy);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSelect = (term: string) => {
    setQuery(term);
    setSubmitted(true);
    setFocused(false);
    setRecentSearches((prev) => [term, ...prev.filter((s) => s !== term)].slice(0, 5));
  };

  const handleSubmit = () => {
    if (!query.trim()) return;
    setSubmitted(true);
    setFocused(false);
    setRecentSearches((prev) => [query, ...prev.filter((s) => s !== query)].slice(0, 5));
  };

  const handleClear = () => {
    setQuery("");
    setSubmitted(false);
    setFocused(false);
  };

  const handleCategorySelect = (categoryId: string, label: string) => {
    setQuery(label);
    setSubmitted(true);
    setFocused(false);
  };

  return (
    <View className="flex-1 bg-background">
      {/* Fixed search bar — top safe area applied here */}
      <View style={{ paddingTop: insets.top }} className="bg-surface">
        <SearchInput
          query={query}
          onChangeText={(t) => {
            setQuery(t);
            setSubmitted(false);
          }}
          onClear={handleClear}
          onFocus={() => setFocused(true)}
          onSubmit={handleSubmit}
          focused={focused}
        />
      </View>

      {/* Scrollable content */}
      <StandardScrollView contentContainerClassName="pb-6" keyboardShouldPersistTaps="handled">
        {/* ── Results state ── */}
        {showResults && (
          <>
            <SortBar active={sortBy} onSelect={setSortBy} total={sortedResults.length} isPending={searchPending} />
            {searchPending ? (
              <ResultsSkeleton />
            ) : sortedResults.length > 0 ? (
              sortedResults.map((r) => <ResultCard key={r.id} product={r} />)
            ) : (
              <EmptyResults query={query} />
            )}
          </>
        )}

        {/* ── Discovery state ── */}
        {!showResults && (
          <>
            <RecentSearches
              searches={recentSearches}
              onSelect={handleSelect}
              onClearAll={() => setRecentSearches([])}
            />
            <TrendingSearches onSelect={handleSelect} />
            {categoriesPending ? (
              <CategoryGridSkeleton />
            ) : (
              <CategoryGrid categories={categories} onSelect={handleCategorySelect} />
            )}
          </>
        )}
      </StandardScrollView>
    </View>
  );
}
