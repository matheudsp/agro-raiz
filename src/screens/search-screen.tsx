import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { tv } from "tailwind-variants";

import { StandardScrollView } from "@/components/ui/screen-containers/standard-scroll-view";
import { Typography } from "@/components/ui/typography";
import { useThemeColors } from "@/hooks/use-theme-colors";

// ─── Brand tokens ─────────────────────────────────────────────────────────────

const BRAND = {
  dark: "#2D5A1B",
  mid: "#3D7A24",
  soft: "#E8F5E2",
} as const;

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "vegetables", label: "Hortaliças", icon: "leaf-outline", bg: "#E8F5E9", color: "#2E7D32" },
  { id: "fruits", label: "Frutas", icon: "nutrition-outline", bg: "#FFF9C4", color: "#F57F17" },
  { id: "organic", label: "Orgânicos", icon: "flower-outline", bg: "#F3E5F5", color: "#6A1B9A" },
  { id: "grains", label: "Grãos e Cereais", icon: "cube-outline", bg: "#EFEBE9", color: "#4E342E" },
  { id: "dairy", label: "Laticínios", icon: "water-outline", bg: "#E3F2FD", color: "#1565C0" },
  { id: "artisanal", label: "Artesanal", icon: "ribbon-outline", bg: "#FFF3E0", color: "#E65100" },
  { id: "roots", label: "Raízes e Tubérculos", icon: "git-branch-outline", bg: "#FBE9E7", color: "#BF360C" },
  { id: "producers", label: "Produtores", icon: "people-outline", bg: "#E8F5E2", color: "#2D5A1B" },
] as const;

const TRENDING = [
  "Alface orgânica",
  "Melado de cana",
  "Feijão carioca",
  "Tomate cereja",
  "Macaxeira",
  "Coentro",
] as const;

const RECENT_SEARCHES = ["Alface crespa", "Frutas da estação", "João Silva"] as const;

type ProductTag = "Orgânico" | "Artesanal" | "Produção Local";

const RESULTS: {
  id: string;
  name: string;
  producer: string;
  price: string;
  unit: string;
  tag: ProductTag;
  emoji: string;
  cardBg: string;
  rating: number;
}[] = [
  {
    id: "1",
    name: "Alface Crespa Orgânica",
    producer: "João Silva",
    price: "R$ 4,00",
    unit: "unid.",
    tag: "Orgânico",
    emoji: "🥬",
    cardBg: "#E8F5E9",
    rating: 4.9,
  },
  {
    id: "2",
    name: "Frutas da Estação",
    producer: "Antônio Lima",
    price: "R$ 6,00",
    unit: "kg",
    tag: "Orgânico",
    emoji: "🍊",
    cardBg: "#FFF9C4",
    rating: 4.8,
  },
  {
    id: "3",
    name: "Melado de Cana",
    producer: "Mulheres do Campo",
    price: "R$ 10,00",
    unit: "unid.",
    tag: "Artesanal",
    emoji: "🍯",
    cardBg: "#FFF3E0",
    rating: 4.9,
  },
  {
    id: "4",
    name: "Feijão e Farinha",
    producer: "Maria Oliveira",
    price: "R$ 8,00",
    unit: "kg",
    tag: "Produção Local",
    emoji: "🫘",
    cardBg: "#EFEBE9",
    rating: 4.7,
  },
  {
    id: "5",
    name: "Tomate Orgânico",
    producer: "Pedro Santos",
    price: "R$ 5,00",
    unit: "kg",
    tag: "Orgânico",
    emoji: "🍅",
    cardBg: "#FFEBEE",
    rating: 4.6,
  },
  {
    id: "6",
    name: "Macaxeira Fresca",
    producer: "Lúcia Ferreira",
    price: "R$ 3,50",
    unit: "kg",
    tag: "Produção Local",
    emoji: "🥔",
    cardBg: "#FFF8E1",
    rating: 4.8,
  },
];

const PRODUCT_TAG_CONFIG: Record<ProductTag, { bg: string; color: string; icon: string }> = {
  Orgânico: { bg: "#E8F5E9", color: "#2E7D32", icon: "leaf" },
  Artesanal: { bg: "#FFF3E0", color: "#E65100", icon: "person" },
  "Produção Local": { bg: "#F3E5F5", color: "#6A1B9A", icon: "home" },
};

const SORT_OPTIONS = ["Relevância", "Menor preço", "Maior avaliação", "Mais recentes"] as const;
type SortOption = (typeof SORT_OPTIONS)[number];

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
  focused,
}: {
  query: string;
  onChangeText: (t: string) => void;
  onClear: () => void;
  onFocus: () => void;
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

function RecentSearches({ onSelect, onClearAll }: { onSelect: (q: string) => void; onClearAll: () => void }) {
  const colors = useThemeColors();

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
        {RECENT_SEARCHES.map((search, i) => (
          <TouchableOpacity
            key={search}
            onPress={() => onSelect(search)}
            activeOpacity={0.7}
            className={`flex-row items-center gap-3 px-4 py-3.5 ${i < RECENT_SEARCHES.length - 1 ? "border-b border-border" : ""}`}
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

// ─── Category Grid ────────────────────────────────────────────────────────────

function CategoryGrid({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <View className="mt-6 gap-3">
      <View className="px-4">
        <SectionLabel label="Explorar categorias" />
      </View>
      <View className="flex-row flex-wrap gap-3 px-4">
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => onSelect(cat.id)}
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
            <View className="h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: cat.bg }}>
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

// ─── Sort Bar ─────────────────────────────────────────────────────────────────

function SortBar({
  active,
  onSelect,
  total,
}: {
  active: SortOption;
  onSelect: (s: SortOption) => void;
  total: number;
}) {
  return (
    <View className="gap-2 border-b border-border pt-3 pb-1">
      <View className="flex-row items-center justify-between px-4">
        <Typography variant="caption" tone="muted">
          <Typography variant="caption" style={{ fontWeight: "700", color: "#1A3A0A" }}>
            {total}
          </Typography>{" "}
          resultados encontrados
        </Typography>
        <TouchableOpacity className="flex-row items-center gap-1" activeOpacity={0.7}>
          <Ionicons name="options-outline" size={15} color={BRAND.mid} />
          <Typography variant="caption" style={{ color: BRAND.mid, fontWeight: "600" }}>
            Filtros
          </Typography>
        </TouchableOpacity>
      </View>
      <View
        className="flex-row gap-2 px-4 pb-2"
        // horizontal scroll workaround without extra ScrollView import
      >
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

function ResultCard({ result }: { result: (typeof RESULTS)[number] }) {
  const [favorited, setFavorited] = useState(false);
  const tag = PRODUCT_TAG_CONFIG[result.tag];

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      className="flex-row items-center gap-3 border-b border-border bg-surface px-4 py-3"
    >
      {/* Image */}
      <View
        className="h-[72px] w-[72px] shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: result.cardBg }}
      >
        <Typography style={{ fontSize: 36 }}>{result.emoji}</Typography>
      </View>

      {/* Info */}
      <View className="flex-1 gap-0.5">
        <Typography variant="smallBold" numberOfLines={1} style={{ color: "#1A3A0A" }}>
          {result.name}
        </Typography>

        <View className="flex-row items-center gap-1">
          <Ionicons name="person-outline" size={11} color="#6B7F5E" />
          <Typography variant="caption" tone="muted" truncate>
            {result.producer}
          </Typography>
        </View>

        <View className="mt-0.5 flex-row items-center gap-1">
          <Ionicons name="star" size={11} color="#F59E0B" />
          <Typography variant="caption" style={{ fontWeight: "700", color: "#1A3A0A" }}>
            {result.rating}
          </Typography>
        </View>

        <View className="mt-1 flex-row items-center justify-between">
          <View className="flex-row items-center gap-1 rounded-md px-2 py-0.5" style={{ backgroundColor: tag.bg }}>
            <Ionicons name={tag.icon as any} size={10} color={tag.color} />
            <Typography variant="caption" style={{ color: tag.color, fontWeight: "600" }}>
              {result.tag}
            </Typography>
          </View>
          <Typography variant="smallBold" style={{ color: BRAND.dark }}>
            {result.price}
            <Typography variant="caption" tone="muted">
              {" "}
              / {result.unit}
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
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("Relevância");

  const isSearching = query.length > 0;
  const showResults = submitted && isSearching;

  const filteredResults = showResults
    ? RESULTS.filter(
        (r) =>
          r.name.toLowerCase().includes(query.toLowerCase()) || r.producer.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  const handleSelect = (term: string) => {
    setQuery(term);
    setSubmitted(true);
    setFocused(false);
  };

  const handleClear = () => {
    setQuery("");
    setSubmitted(false);
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
          focused={focused}
        />
      </View>

      {/* Scrollable content */}
      <StandardScrollView contentContainerClassName="pb-6" keyboardShouldPersistTaps="handled">
        {showResults && (
          <>
            <SortBar active={sortBy} onSelect={setSortBy} total={filteredResults.length} />
            {filteredResults.length > 0 ? (
              filteredResults.map((r) => <ResultCard key={r.id} result={r} />)
            ) : (
              <EmptyResults query={query} />
            )}
          </>
        )}

        {!showResults && (
          <>
            <RecentSearches onSelect={handleSelect} onClearAll={() => {}} />
            <TrendingSearches onSelect={handleSelect} />
            <CategoryGrid onSelect={(id) => console.log("category:", id)} />
          </>
        )}
      </StandardScrollView>
    </View>
  );
}
