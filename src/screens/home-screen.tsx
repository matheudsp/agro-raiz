import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { tv } from "tailwind-variants";

import { StandardScrollView } from "@/components/ui/screen-containers/standard-scroll-view";
import { Typography } from "@/components/ui/typography";
import { useRefreshOnFocus } from "@/hooks/use-refresh-on-focus";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useTRPC } from "@/lib/trpc";

import type { Category } from "../../server/trpc/routers/categories";
import type { Producer } from "../../server/trpc/routers/producers";
import type { Product } from "../../server/trpc/routers/products";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Brand tokens ─────────────────────────────────────────────────────────────

const BRAND = {
  dark: "#2D5A1B",
  mid: "#3D7A24",
  soft: "#E8F5E2",
} as const;

// ─── Static hero slides (editorial, not from API) ─────────────────────────────

const HERO_SLIDES = [
  {
    id: "1",
    title: "Do campo para\nsua mesa!",
    subtitle: "Produtos frescos da agricultura familiar da nossa região.",
    cta: "Comprar agora",
    bg: "#2D5A1B",
    accent: "#3D7A24",
  },
  {
    id: "2",
    title: "Direto do\nprodutor!",
    subtitle: "Apoie quem cultiva com cuidado e dedicação.",
    cta: "Ver produtores",
    bg: "#1A4A2E",
    accent: "#2E7A4E",
  },
  {
    id: "3",
    title: "Orgânicos\nde verdade!",
    subtitle: "Sem agrotóxicos, sem intermediários.",
    cta: "Explorar",
    bg: "#3A4A1A",
    accent: "#5A7A2E",
  },
] as const;

// ─── Tag display config (client-only, drives badges) ─────────────────────────

const PRODUCT_TAG_CONFIG: Record<string, { bg: string; color: string; icon: string }> = {
  Orgânico: { bg: "#E8F5E9", color: "#2E7D32", icon: "leaf" },
  Artesanal: { bg: "#FFF3E0", color: "#E65100", icon: "person" },
  "Produção Local": { bg: "#F3E5F5", color: "#6A1B9A", icon: "home" },
  Agroecológico: { bg: "#E8F5E9", color: "#1B5E20", icon: "leaf" },
  "Sem Agrotóxico": { bg: "#F1F8E9", color: "#33691E", icon: "leaf" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Converts priceCents integer to a localised R$ string. */
function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ─── Variants ─────────────────────────────────────────────────────────────────

const categoryButtonVariants = tv({
  base: "flex-1 items-center justify-center gap-1.5 rounded-xl border px-1 py-3",
  variants: {
    selected: {
      true: "border-[#3D7A24] bg-[#E8F5E2]",
      false: "border-border bg-surface",
    },
  },
  defaultVariants: { selected: false },
});

const paginationDotVariants = tv({
  base: "h-[7px] rounded-full",
  variants: {
    active: {
      true: "w-5 bg-[#3D7A24]",
      false: "w-[7px] bg-[#C8D9C0]",
    },
  },
  defaultVariants: { active: false },
});

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CardSkeleton({ width, height }: { width: number; height: number }) {
  return <View style={{ width, height }} className="rounded-2xl bg-default opacity-60" />;
}

function HorizontalSkeletons({ cardWidth, cardHeight }: { cardWidth: number; cardHeight: number }) {
  return (
    <View className="flex-row gap-3 px-4">
      {[1, 2, 3].map((i) => (
        <CardSkeleton key={i} width={cardWidth} height={cardHeight} />
      ))}
    </View>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function AgroRaizLogo() {
  return (
    <View className="flex-row items-center gap-2">
      <View
        className="h-[38px] w-[38px] items-center justify-center rounded-[10px]"
        style={{ backgroundColor: BRAND.dark }}
      >
        <Typography>🌱</Typography>
      </View>
      <View className="flex-row items-baseline">
        <Typography variant="h4" className="tracking-tight" style={{ color: "#1A3A0A" }}>
          agro
        </Typography>
        <Typography variant="h4" className="tracking-tight" style={{ color: BRAND.mid }}>
          raiz
        </Typography>
      </View>
    </View>
  );
}

function Header({ location }: { location: string }) {
  return (
    <View className="flex-row items-center justify-between bg-surface px-4 py-3">
      <AgroRaizLogo />
      <View className="flex-row items-center gap-3">
        <TouchableOpacity className="flex-row items-center gap-1" activeOpacity={0.7}>
          <Ionicons name="location-outline" size={14} color={BRAND.mid} />
          <Typography variant="smallBold" style={{ color: "#1A3A0A" }}>
            {location}
          </Typography>
          <Ionicons name="chevron-down" size={13} color="#1A3A0A" />
        </TouchableOpacity>
        <TouchableOpacity className="h-9 w-9 items-center justify-center rounded-full bg-default" activeOpacity={0.7}>
          <Ionicons name="notifications-outline" size={20} color="#1A3A0A" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Search Bar ───────────────────────────────────────────────────────────────

function SearchBar() {
  const [query, setQuery] = useState("");
  const colors = useThemeColors();

  return (
    <View className="flex-row items-center gap-2.5 border-b border-border bg-surface px-4 py-2.5">
      <View className="flex-1 flex-row items-center gap-2 rounded-xl bg-default px-3.5 py-2.5">
        <Ionicons name="search-outline" size={17} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar produtos, produtores..."
          placeholderTextColor={colors.muted}
          returnKeyType="search"
          onSubmitEditing={() => router.push({ pathname: "/search", params: { q: query } })}
          style={{ flex: 1, fontSize: 14, color: colors.foreground, padding: 0 }}
        />
      </View>
      <TouchableOpacity
        className="h-[46px] w-[46px] items-center justify-center rounded-xl"
        style={{ backgroundColor: BRAND.dark }}
        activeOpacity={0.85}
      >
        <Ionicons name="options-outline" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

// ─── Hero Carousel ────────────────────────────────────────────────────────────

function HeroCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const slideWidth = SCREEN_WIDTH - 32;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setActiveSlide(Math.round(e.nativeEvent.contentOffset.x / slideWidth));
  };

  return (
    <View className="px-4 pt-4">
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={slideWidth}
        decelerationRate="fast"
        style={{ borderRadius: 16, overflow: "hidden" }}
      >
        {HERO_SLIDES.map((slide) => (
          <View
            key={slide.id}
            style={{
              width: slideWidth,
              height: 180,
              backgroundColor: slide.bg,
              flexDirection: "row",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <View className="flex-1 justify-center gap-2 p-5">
              <Typography variant="h2" style={{ color: "#FFFFFF", lineHeight: 28 }}>
                {slide.title}
              </Typography>
              <Typography variant="caption" style={{ color: "rgba(255,255,255,0.8)", lineHeight: 17 }}>
                {slide.subtitle}
              </Typography>
              <TouchableOpacity
                className="mt-1 self-start rounded-lg px-4 py-2"
                style={{ backgroundColor: "#FFFFFF" }}
                activeOpacity={0.85}
              >
                <Typography variant="smallBold" style={{ color: slide.bg }}>
                  {slide.cta}
                </Typography>
              </TouchableOpacity>
            </View>
            <View className="w-[110px] items-center justify-center" style={{ backgroundColor: slide.accent }}>
              <Typography style={{ fontSize: 64 }}>🥦</Typography>
            </View>
          </View>
        ))}
      </ScrollView>

      <View className="mt-2.5 flex-row justify-center gap-1.5">
        {HERO_SLIDES.map((_, i) => (
          <View key={i} className={paginationDotVariants({ active: i === activeSlide })} />
        ))}
      </View>
    </View>
  );
}

// ─── Categories ───────────────────────────────────────────────────────────────

function CategoriesGrid({
  categories,
  selectedId,
  onSelect,
}: {
  categories: Category[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const all = [{ id: "all", label: "Todos os\nprodutos", icon: "apps-outline", slug: "all", color: "" }, ...categories];

  return (
    <View className="mt-5 flex-row flex-wrap gap-2.5 px-4">
      {all.map((cat) => {
        const isSelected = selectedId === cat.id;
        return (
          <TouchableOpacity
            key={cat.id}
            onPress={() => onSelect(cat.id)}
            activeOpacity={0.8}
            className={categoryButtonVariants({ selected: isSelected })}
          >
            <Ionicons name={cat.icon as any} size={24} color={isSelected ? BRAND.mid : "#6B7F5E"} />
            <Typography
              variant="caption"
              align="center"
              style={{
                color: isSelected ? BRAND.dark : "#4A5E40",
                fontWeight: isSelected ? "700" : "500",
                lineHeight: 14,
              }}
            >
              {cat.label}
            </Typography>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title, onPressAll }: { title: string; onPressAll: () => void }) {
  return (
    <View className="mt-6 mb-3 flex-row items-center justify-between px-4">
      <Typography variant="h4">{title}</Typography>
      <TouchableOpacity onPress={onPressAll} activeOpacity={0.7}>
        <Typography variant="small" style={{ color: BRAND.mid, fontWeight: "600" }}>
          Ver todos
        </Typography>
      </TouchableOpacity>
    </View>
  );
}

// ─── Producer Card ────────────────────────────────────────────────────────────

function ProducerCard({ producer }: { producer: Producer }) {
  return (
    <TouchableOpacity
      // onPress={() => router.push({ pathname: "/produtor/[id]", params: { id: producer.id } })}
      activeOpacity={0.85}
      className="w-[200px] overflow-hidden rounded-2xl border border-border bg-surface"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <View className="h-[110px] items-center justify-center" style={{ backgroundColor: producer.avatarBg }}>
        <View
          className="h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: "rgba(45,90,27,0.15)" }}
        >
          <Typography variant="h4" style={{ color: BRAND.dark }}>
            {producer.initials}
          </Typography>
        </View>
      </View>
      <View className="gap-0.5 p-3">
        <Typography variant="smallBold" truncate>
          {producer.name}
        </Typography>
        <Typography variant="caption" tone="muted">
          {producer.type}
        </Typography>
        <View className="mt-0.5 flex-row items-center gap-1">
          <Ionicons name="location-outline" size={11} color="#6B7F5E" />
          <Typography variant="caption" tone="muted">
            {producer.location}
          </Typography>
        </View>
        <View className="mt-1 flex-row items-center gap-1">
          <Ionicons name="star" size={12} color="#F59E0B" />
          <Typography variant="caption" style={{ fontWeight: "700", color: "#1A3A0A" }}>
            {producer.rating > 0 ? producer.rating : "Novo"}
          </Typography>
          {producer.reviewCount > 0 && (
            <Typography variant="caption" tone="muted">
              ({producer.reviewCount})
            </Typography>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: Product }) {
  const [favorited, setFavorited] = useState(false);
  const primaryTag = product.tags[0] ?? "";
  const tag = PRODUCT_TAG_CONFIG[primaryTag] ?? { bg: "#F5F5F5", color: "#666", icon: "pricetag" };

  return (
    <TouchableOpacity
      onPress={() => router.push({ pathname: "/product/[id]", params: { id: product.id } })}
      activeOpacity={0.85}
      className="w-[158px] overflow-hidden rounded-2xl border border-border bg-surface"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <View className="h-[120px] items-center justify-center" style={{ backgroundColor: product.cardBg }}>
        <Typography style={{ fontSize: 52 }}>{product.emoji}</Typography>
        <TouchableOpacity
          onPress={() => setFavorited((v) => !v)}
          className="absolute top-2 right-2 h-[30px] w-[30px] items-center justify-center rounded-full bg-surface"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 2,
          }}
          activeOpacity={0.7}
        >
          <Ionicons name={favorited ? "heart" : "heart-outline"} size={16} color={favorited ? "#EF4444" : "#9CAA8E"} />
        </TouchableOpacity>
      </View>
      <View className="gap-0.5 p-2.5">
        <Typography variant="small" numberOfLines={2} style={{ color: "#1A3A0A", fontWeight: "700", lineHeight: 17 }}>
          {product.name}
        </Typography>
        <Typography variant="small" style={{ color: BRAND.dark, fontWeight: "800", marginTop: 2 }}>
          {formatPrice(product.priceCents)}{" "}
          <Typography variant="caption" tone="muted">
            / {product.unit}
          </Typography>
        </Typography>
        {primaryTag ? (
          <View
            className="mt-1.5 flex-row items-center gap-1 self-start rounded-md px-2 py-0.5"
            style={{ backgroundColor: tag.bg }}
          >
            <Ionicons name={tag.icon as any} size={11} color={tag.color} />
            <Typography variant="caption" style={{ color: tag.color, fontWeight: "600" }}>
              {primaryTag}
            </Typography>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

// ─── Trust Banner ─────────────────────────────────────────────────────────────

function TrustBanner() {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      className="mx-4 mt-5 flex-row items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      <View className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: BRAND.soft }}>
        <Ionicons name="shield-checkmark-outline" size={22} color={BRAND.mid} />
      </View>
      <View className="flex-1 gap-0.5">
        <Typography variant="smallBold">Compra segura e apoio local</Typography>
        <Typography variant="caption" tone="muted" style={{ lineHeight: 16 }}>
          Seus dados protegidos e dinheiro que fortalece a agricultura familiar da nossa região.
        </Typography>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#9CAA8E" />
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const trpc = useTRPC();

  const [selectedCategoryId, setSelectedCategoryId] = useState("all");

  // ── Queries — mirror the tasks-screen pattern exactly ─────────────────────

  const categoriesQueryOptions = trpc.categories.list.queryOptions();
  const featuredProducersQueryOptions = trpc.producers.featured.queryOptions();
  const featuredProductsQueryOptions = trpc.products.featured.queryOptions();

  const filteredProductsQueryOptions = trpc.products.list.queryOptions(
    selectedCategoryId === "all" ? {} : { categoryId: selectedCategoryId },
  );

  const { data: categories = [] } = useQuery(categoriesQueryOptions);
  const { data: featuredProducers = [], isPending: producersPending } = useQuery(featuredProducersQueryOptions);
  const { data: featuredProducts = [], isPending: featuredPending } = useQuery(featuredProductsQueryOptions);
  const { data: filteredProducts = [], isPending: filteredPending } = useQuery(filteredProductsQueryOptions);

  // ── Refresh on focus (same pattern as tasks-screen) ───────────────────────

  useRefreshOnFocus(trpc.producers.featured.pathKey());
  useRefreshOnFocus(trpc.products.featured.pathKey());

  // ── Derived display data ──────────────────────────────────────────────────

  const displayedProducts = selectedCategoryId === "all" ? featuredProducts : filteredProducts;
  const productsPending = selectedCategoryId === "all" ? featuredPending : filteredPending;

  return (
    <View className="flex-1 bg-background">
      {/* Fixed header — top safe area applied here */}
      <View style={{ paddingTop: insets.top }} className="bg-surface">
        <Header location="Canavieira – PI" />
        <SearchBar />
      </View>

      {/* Scrollable content */}
      <StandardScrollView contentContainerClassName="pb-6">
        {/* Hero carousel — static, always visible */}
        <HeroCarousel />

        {/* Categories */}
        <CategoriesGrid categories={categories} selectedId={selectedCategoryId} onSelect={setSelectedCategoryId} />

        {/* Produtores em destaque */}
        <SectionHeader title="Produtores em destaque" onPressAll={() => router.push("/search")} />
        {producersPending ? (
          <HorizontalSkeletons cardWidth={200} cardHeight={190} />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          >
            {featuredProducers.map((p) => (
              <ProducerCard key={p.id} producer={p} />
            ))}
          </ScrollView>
        )}

        {/* Produtos em destaque */}
        <SectionHeader title="Produtos em destaque" onPressAll={() => router.push("/search")} />
        {productsPending ? (
          <HorizontalSkeletons cardWidth={158} cardHeight={220} />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          >
            {displayedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </ScrollView>
        )}

        <TrustBanner />
      </StandardScrollView>
    </View>
  );
}
