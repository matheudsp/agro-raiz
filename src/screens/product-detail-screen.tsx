import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, ScrollView, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Typography } from "@/components/ui/typography";
import { useRefreshOnFocus } from "@/hooks/use-refresh-on-focus";
import { useTRPC } from "@/lib/trpc";

import type { Producer } from "../../server/trpc/routers/producers";
import type { Product } from "../../server/trpc/routers/products";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Brand tokens ─────────────────────────────────────────────────────────────

const BRAND = {
  dark: "#2D5A1B",
  mid: "#3D7A24",
  soft: "#E8F5E2",
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

// ─── Derived data helpers ─────────────────────────────────────────────────────

type DetailRow = { icon: string; label: string; value: string };

function buildDetailRows(product: Product): DetailRow[] {
  const rows: DetailRow[] = [
    { icon: "leaf-outline", label: "Categoria", value: product.categoryLabel },
    { icon: "cube-outline", label: "Quantidade disponível", value: `${product.quantityAvailable} ${product.unit}` },
    { icon: "thermometer-outline", label: "Conservação", value: product.conservation },
  ];
  if (product.harvestDate) {
    rows.splice(2, 0, {
      icon: "calendar-outline",
      label: "Colheita",
      value: formatDate(product.harvestDate),
    });
  }
  return rows;
}

function buildGallerySlides(product: Product) {
  // In production replace bg variants with real image URLs
  return [
    { emoji: product.emoji, bg: product.cardBg },
    { emoji: product.emoji, bg: product.cardBg + "CC" },
    { emoji: product.emoji, bg: product.cardBg + "99" },
    { emoji: product.emoji, bg: product.cardBg + "66" },
  ];
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function FullScreenSkeleton({ insetTop }: { insetTop: number }) {
  return (
    <View className="flex-1 bg-background">
      <View style={{ height: 300 }} className="bg-default opacity-60" />
      <View style={{ paddingTop: insetTop + 56 }} />
      <View className="mx-4 mt-4 gap-3">
        <View className="h-5 w-24 rounded-lg bg-default opacity-60" />
        <View className="h-8 w-64 rounded-lg bg-default opacity-60" />
        <View className="h-4 w-full rounded-lg bg-default opacity-50" />
        <View className="h-4 w-3/4 rounded-lg bg-default opacity-50" />
      </View>
    </View>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────

function TopBar({ insetTop, favorited, onFavorite }: { insetTop: number; favorited: boolean; onFavorite: () => void }) {
  return (
    <View
      style={{
        position: "absolute",
        top: insetTop,
        left: 0,
        right: 0,
        zIndex: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        activeOpacity={0.8}
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: "rgba(255,255,255,0.92)",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.12,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Ionicons name="chevron-back" size={22} color="#1A3A0A" />
      </TouchableOpacity>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            backgroundColor: BRAND.dark,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography style={{ fontSize: 13 }}>🌱</Typography>
        </View>
        <View style={{ flexDirection: "row", alignItems: "baseline" }}>
          <Typography variant="smallBold" style={{ color: "#1A3A0A" }}>
            agro
          </Typography>
          <Typography variant="smallBold" style={{ color: BRAND.mid }}>
            raiz
          </Typography>
        </View>
      </View>

      <TouchableOpacity
        onPress={onFavorite}
        activeOpacity={0.8}
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: "rgba(255,255,255,0.92)",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.12,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Ionicons name={favorited ? "heart" : "heart-outline"} size={20} color={favorited ? "#EF4444" : "#1A3A0A"} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Image Gallery ────────────────────────────────────────────────────────────

function ImageGallery({ slides }: { slides: { emoji: string; bg: string }[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH));
  };

  const handleThumbPress = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    setActiveIndex(index);
  };

  return (
    <View style={{ height: 300 }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ height: 300 }}
      >
        {slides.map((slide, i) => (
          <View
            key={i}
            style={{
              width: SCREEN_WIDTH,
              height: 300,
              backgroundColor: slide.bg,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography style={{ fontSize: 120 }}>{slide.emoji}</Typography>
          </View>
        ))}
      </ScrollView>

      {/* Counter badge */}
      <View
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          backgroundColor: "rgba(255,255,255,0.88)",
          borderRadius: 8,
          paddingHorizontal: 10,
          paddingVertical: 4,
        }}
      >
        <Typography variant="caption" style={{ fontWeight: "700", color: "#1A3A0A" }}>
          {activeIndex + 1}/{slides.length}
        </Typography>
      </View>

      {/* Thumbnails */}
      <View style={{ position: "absolute", bottom: 12, left: 16, flexDirection: "row", gap: 8 }}>
        {slides.map((slide, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => handleThumbPress(i)}
            activeOpacity={0.8}
            style={{
              width: 58,
              height: 58,
              borderRadius: 10,
              backgroundColor: slide.bg,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 2.5,
              borderColor: i === activeIndex ? BRAND.mid : "rgba(255,255,255,0.7)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Typography style={{ fontSize: 26 }}>{slide.emoji}</Typography>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Product Header ───────────────────────────────────────────────────────────

function ProductHeader({ product }: { product: Product }) {
  return (
    <View className="gap-2 px-4 pt-3.5">
      <View className="self-start rounded-lg border border-[#C5DFB8] bg-[#E8F5E2] px-3 py-1">
        <Typography variant="caption" style={{ color: BRAND.dark, fontWeight: "600" }}>
          {product.categoryLabel}
        </Typography>
      </View>

      <View className="flex-row items-start justify-between gap-3">
        <Typography variant="h2" style={{ flex: 1, color: "#1A3A0A", lineHeight: 30 }}>
          {product.name}
        </Typography>
        <View className="items-end">
          <Typography variant="h2" style={{ color: BRAND.dark }}>
            {formatPrice(product.priceCents)}
          </Typography>
          <Typography variant="caption" tone="muted">
            / {product.unit}
          </Typography>
        </View>
      </View>

      <Typography variant="small" style={{ color: "#4A5E40", lineHeight: 20 }}>
        {product.shortDescription}
      </Typography>

      {product.badge ? (
        <View className="flex-row items-center gap-1.5 self-end rounded-lg bg-[#E8F5E2] px-2.5 py-1">
          <Ionicons name="leaf" size={13} color={BRAND.mid} />
          <Typography variant="caption" style={{ color: BRAND.dark, fontWeight: "600" }}>
            {product.badge}
          </Typography>
        </View>
      ) : null}
    </View>
  );
}

// ─── Producer Card ────────────────────────────────────────────────────────────

function ProducerCard({ producer }: { producer: Producer }) {
  return (
    <View
      className="mx-4 mt-5 flex-row items-center gap-3 rounded-2xl border border-[#EEF3EA] bg-surface p-3.5"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View
        className="h-16 w-16 items-center justify-center rounded-full border-2 border-[#C5DFB8]"
        style={{ backgroundColor: producer.avatarBg }}
      >
        <Typography variant="h4" style={{ color: BRAND.dark }}>
          {producer.initials}
        </Typography>
      </View>

      <View className="flex-1 gap-0.5">
        <Typography variant="bodyBold" style={{ color: "#1A3A0A" }}>
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
        {producer.rating > 0 && (
          <View className="mt-0.5 flex-row items-center gap-1">
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Typography variant="caption" style={{ fontWeight: "700", color: "#1A3A0A" }}>
              {producer.rating}
            </Typography>
            <Typography variant="caption" tone="muted">
              ({producer.reviewCount} avaliações)
            </Typography>
          </View>
        )}
      </View>

      <TouchableOpacity
        // onPress={() => router.push({ pathname: "/produtor/[id]", params: { id: producer.id } })}
        activeOpacity={0.8}
        className="rounded-xl border-[1.5px] border-[#3D7A24] px-3 py-2"
      >
        <Typography variant="caption" style={{ color: BRAND.mid, fontWeight: "700", textAlign: "center" }}>
          Ver perfil{"\n"}do vendedor
        </Typography>
      </TouchableOpacity>
    </View>
  );
}

// ─── Product Details table ────────────────────────────────────────────────────

function DetailRowItem({ icon, label, value, last }: DetailRow & { last?: boolean }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 13,
        paddingHorizontal: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: "#EEF3EA",
      }}
    >
      <View style={{ width: 28, alignItems: "center" }}>
        <Ionicons name={icon as any} size={16} color={BRAND.mid} />
      </View>
      <Typography variant="small" style={{ flex: 1, color: "#4A5E40", marginLeft: 4 }}>
        {label}
      </Typography>
      <Typography variant="small" style={{ fontWeight: "600", color: "#1A3A0A" }}>
        {value}
      </Typography>
    </View>
  );
}

function ProductDetails({ rows }: { rows: DetailRow[] }) {
  return (
    <View className="mt-6 px-4">
      <Typography variant="h4" style={{ marginBottom: 12 }}>
        Detalhes do produto
      </Typography>
      <View
        className="overflow-hidden rounded-2xl border border-[#EEF3EA] bg-surface"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
          elevation: 1,
        }}
      >
        {rows.map((row, i) => (
          <DetailRowItem key={row.label} {...row} last={i === rows.length - 1} />
        ))}
      </View>
    </View>
  );
}

// ─── Description ─────────────────────────────────────────────────────────────

function Description({ text }: { text: string }) {
  return (
    <View className="mt-6 px-4">
      <Typography variant="h4" style={{ marginBottom: 8 }}>
        Descrição
      </Typography>
      <Typography variant="small" style={{ color: "#4A5E40", lineHeight: 22 }}>
        {text}
      </Typography>
    </View>
  );
}

// ─── Bottom Bar ───────────────────────────────────────────────────────────────

function BottomBar({
  product,
  quantity,
  onDecrement,
  onIncrement,
  onAddToCart,
}: {
  product: Product;
  quantity: number;
  onDecrement: () => void;
  onIncrement: () => void;
  onAddToCart: () => void;
}) {
  const outOfStock = product.quantityAvailable === 0;

  return (
    <View className="gap-2.5 border-t border-[#EEF3EA] bg-surface px-4 pt-3 pb-1">
      <View className="flex-row items-center gap-3">
        {/* Quantity stepper */}
        <View className="flex-row items-center gap-4 rounded-xl bg-default px-3.5 py-3">
          <TouchableOpacity onPress={onDecrement} activeOpacity={0.7}>
            <Ionicons name="remove" size={20} color={quantity <= 1 ? "#9CAA8E" : BRAND.dark} />
          </TouchableOpacity>
          <Typography variant="bodyBold" style={{ color: "#1A3A0A", minWidth: 20, textAlign: "center" }}>
            {quantity}
          </Typography>
          <TouchableOpacity onPress={onIncrement} activeOpacity={0.7} disabled={quantity >= product.quantityAvailable}>
            <Ionicons name="add" size={20} color={quantity >= product.quantityAvailable ? "#9CAA8E" : BRAND.dark} />
          </TouchableOpacity>
        </View>

        {/* Add to cart */}
        <TouchableOpacity
          onPress={onAddToCart}
          activeOpacity={0.85}
          disabled={outOfStock}
          className="flex-1 flex-row items-center justify-center gap-2.5 rounded-2xl py-4"
          style={{ backgroundColor: outOfStock ? "#9CAA8E" : BRAND.dark }}
        >
          <Ionicons name="cart-outline" size={20} color="#FFFFFF" />
          <Typography variant="smallBold" style={{ color: "#FFFFFF" }}>
            {outOfStock ? "Esgotado" : "Adicionar ao carrinho"}
          </Typography>
        </TouchableOpacity>
      </View>

      {/* Trust strip */}
      <View className="flex-row items-center justify-between rounded-xl bg-[#E8F5E2] px-3.5 py-2">
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="shield-checkmark-outline" size={15} color={BRAND.mid} />
          <Typography variant="caption" style={{ color: BRAND.dark, fontWeight: "600" }}>
            Compra segura diretamente de quem produz
          </Typography>
        </View>
        <Ionicons name="leaf" size={14} color={BRAND.mid} />
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function ProductDetailScreen({ productId }: { productId: string }) {
  const insets = useSafeAreaInsets();
  const trpc = useTRPC();

  const [favorited, setFavorited] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // ── Queries ───────────────────────────────────────────────────────────────

  const productQueryOptions = trpc.products.get.queryOptions({ id: productId });
  const { data: product, isPending: productPending } = useQuery(productQueryOptions);

  // Producer is fetched only after the product resolves (enabled guard)
  const producerQueryOptions = trpc.producers.get.queryOptions(
    { id: product?.producerId ?? "" },
    { enabled: !!product?.producerId },
  );
  const { data: producer, isPending: producerPending } = useQuery(producerQueryOptions);

  // ── Refresh on focus ──────────────────────────────────────────────────────

  useRefreshOnFocus(trpc.products.pathKey());

  // ── Derived data ──────────────────────────────────────────────────────────

  const slides = product ? buildGallerySlides(product) : [];
  const detailRows = product ? buildDetailRows(product) : [];

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleDecrement = () => setQuantity((q) => Math.max(1, q - 1));
  const handleIncrement = () => setQuantity((q) => Math.min(product?.quantityAvailable ?? 99, q + 1));
  const handleAddToCart = () => {
    if (!product) return;
    // TODO: wire to orders.create mutation once cart flow is ready
    console.log("add to cart", { productId: product.id, quantity });
  };

  // ── Loading / error states ────────────────────────────────────────────────

  if (productPending) {
    return <FullScreenSkeleton insetTop={insets.top} />;
  }

  if (!product) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-background">
        <Ionicons name="alert-circle-outline" size={48} color="#9CAA8E" />
        <Typography variant="bodyBold" tone="muted">
          Produto não encontrado
        </Typography>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} className="mt-2">
          <Typography variant="small" style={{ color: BRAND.mid, fontWeight: "600" }}>
            Voltar
          </Typography>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F7F3" }}>
      {/* Floating TopBar — top = insets.top clears the status bar */}
      <TopBar insetTop={insets.top} favorited={favorited} onFavorite={() => setFavorited((v) => !v)} />

      {/* Full-bleed scroll — gallery starts at y:0, TopBar floats above */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <ImageGallery slides={slides} />
        <ProductHeader product={product} />

        {/* Producer row — inline skeleton while loading */}
        {producerPending ? (
          <View className="mx-4 mt-5 h-24 rounded-2xl bg-default opacity-60" />
        ) : producer ? (
          <ProducerCard producer={producer} />
        ) : null}

        <ProductDetails rows={detailRows} />
        <Description text={product.description} />
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Sticky bottom bar */}
      <BottomBar
        product={product}
        quantity={quantity}
        onDecrement={handleDecrement}
        onIncrement={handleIncrement}
        onAddToCart={handleAddToCart}
      />
      <View style={{ height: insets.bottom, backgroundColor: "#FFFFFF" }} />
    </View>
  );
}
