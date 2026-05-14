import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Mock Data ──────────────────────────────────────────────────────────────

const PRODUCT = {
  id: "1",
  name: "Alface Crespa Orgânica",
  category: "Hortaliças",
  price: "R$ 4,00",
  unit: "unidade",
  description:
    "Alface crespa cultivada com cuidado e sem o uso de agrotóxicos.\nFolhas macias, crocantes e cheias de sabor.\nPerfeita para uma alimentação saudável e equilibrada.",
  shortDescription:
    "Alface fresca, cultivada de forma orgânica e colhida no dia. Ideal para saladas e refeições saudáveis.",
  badge: "100% Orgânico",
  images: ["🥬", "🌿", "🍋", "🥗"],
  imageColors: ["#E8F5E9", "#F1F8E9", "#FFFDE7", "#E8F5E9"],
  details: [
    { icon: "leaf-outline", label: "Categoria", value: "Hortaliças" },
    { icon: "git-branch-outline", label: "Tipo", value: "Alface Crespa" },
    { icon: "calendar-outline", label: "Colheita", value: "06/05/2025" },
    { icon: "sync-circle-outline", label: "Produção", value: "Orgânica" },
    { icon: "cube-outline", label: "Quantidade disponível", value: "25 unidades" },
    { icon: "thermometer-outline", label: "Conservação", value: "Manter refrigerado" },
  ],
  producer: {
    name: "João Silva",
    type: "Agricultor Familiar",
    location: "Canavieira – PI",
    rating: 4.9,
    reviews: 128,
    avatar: "JS",
    avatarColor: "#C8E6C9",
  },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function TopBar({
  onBack,
  favorited,
  onFavorite,
  insetTop,
}: {
  onBack: () => void;
  favorited: boolean;
  onFavorite: () => void;
  insetTop: number;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        position: "absolute",
        top: insetTop,
        left: 0,
        right: 0,
        zIndex: 10,
      }}
    >
      <TouchableOpacity
        onPress={onBack}
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

      {/* Logo center */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            backgroundColor: "#2D5A1B",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 13 }}>🌱</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 2 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#1A3A0A" }}>agro</Text>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#3D7A24" }}>raiz</Text>
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

function ImageGallery({ images, colors }: { images: string[]; colors: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  const handleThumbPress = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    setActiveIndex(index);
  };

  return (
    <View style={{ height: 300 }}>
      {/* Main image scroller */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ height: 300 }}
      >
        {images.map((emoji, i) => (
          <View
            key={i}
            style={{
              width: SCREEN_WIDTH,
              height: 300,
              backgroundColor: colors[i] ?? "#E8F5E9",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 120 }}>{emoji}</Text>
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
        <Text style={{ fontSize: 12, fontWeight: "700", color: "#1A3A0A" }}>
          {activeIndex + 1}/{images.length}
        </Text>
      </View>

      {/* Thumbnails strip */}
      <View
        style={{
          position: "absolute",
          bottom: 12,
          left: 16,
          flexDirection: "row",
          gap: 8,
        }}
      >
        {images.map((emoji, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => handleThumbPress(i)}
            activeOpacity={0.8}
            style={{
              width: 58,
              height: 58,
              borderRadius: 10,
              backgroundColor: colors[i] ?? "#E8F5E9",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 2.5,
              borderColor: i === activeIndex ? "#3D7A24" : "rgba(255,255,255,0.7)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text style={{ fontSize: 26 }}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function CategoryBadge({ label }: { label: string }) {
  return (
    <View
      style={{
        alignSelf: "flex-start",
        backgroundColor: "#E8F5E2",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#C5DFB8",
        paddingHorizontal: 12,
        paddingVertical: 5,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: "600", color: "#2D5A1B" }}>{label}</Text>
    </View>
  );
}

function ProductHeader({ product }: { product: typeof PRODUCT }) {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 14, gap: 8 }}>
      <CategoryBadge label={product.category} />

      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <Text
          style={{
            flex: 1,
            fontSize: 24,
            fontWeight: "800",
            color: "#1A3A0A",
            lineHeight: 30,
          }}
        >
          {product.name}
        </Text>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 26, fontWeight: "800", color: "#2D5A1B" }}>{product.price}</Text>
          <Text style={{ fontSize: 12, color: "#6B7F5E", marginTop: -2 }}>/ {product.unit}</Text>
        </View>
      </View>

      <Text style={{ fontSize: 13, color: "#4A5E40", lineHeight: 20 }}>{product.shortDescription}</Text>

      {/* Organic badge */}
      <View
        style={{
          alignSelf: "flex-end",
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
          backgroundColor: "#E8F5E2",
          borderRadius: 8,
          paddingHorizontal: 10,
          paddingVertical: 5,
        }}
      >
        <Ionicons name="leaf" size={13} color="#3D7A24" />
        <Text style={{ fontSize: 12, fontWeight: "600", color: "#2D5A1B" }}>{product.badge}</Text>
      </View>
    </View>
  );
}

function ProducerCard({ producer }: { producer: typeof PRODUCT.producer }) {
  return (
    <View
      style={{
        marginHorizontal: 16,
        marginTop: 20,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#EEF3EA",
      }}
    >
      {/* Avatar */}
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: producer.avatarColor,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 2,
          borderColor: "#C5DFB8",
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "800", color: "#2D5A1B" }}>{producer.avatar}</Text>
      </View>

      {/* Info */}
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontSize: 16, fontWeight: "700", color: "#1A3A0A" }}>{producer.name}</Text>
        <Text style={{ fontSize: 12, color: "#6B7F5E" }}>{producer.type}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginTop: 1 }}>
          <Ionicons name="location-outline" size={11} color="#6B7F5E" />
          <Text style={{ fontSize: 12, color: "#6B7F5E" }}>{producer.location}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginTop: 1 }}>
          <Ionicons name="star" size={12} color="#F59E0B" />
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#1A3A0A" }}>{producer.rating}</Text>
          <Text style={{ fontSize: 12, color: "#9CAA8E" }}>({producer.reviews} avaliações)</Text>
        </View>
      </View>

      {/* CTA */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={{
          borderWidth: 1.5,
          borderColor: "#3D7A24",
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 8,
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: "700", color: "#3D7A24", textAlign: "center" }}>
          Ver perfil{"\n"}do vendedor
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function DetailRow({ icon, label, value, last }: { icon: string; label: string; value: string; last?: boolean }) {
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
        <Ionicons name={icon as any} size={16} color="#3D7A24" />
      </View>
      <Text style={{ flex: 1, fontSize: 13, color: "#4A5E40", marginLeft: 4 }}>{label}</Text>
      <Text style={{ fontSize: 13, fontWeight: "600", color: "#1A3A0A" }}>{value}</Text>
    </View>
  );
}

function ProductDetails({ details }: { details: typeof PRODUCT.details }) {
  return (
    <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
      <Text style={{ fontSize: 18, fontWeight: "800", color: "#1A3A0A", marginBottom: 12 }}>Detalhes do produto</Text>
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "#EEF3EA",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
          elevation: 1,
        }}
      >
        {details.map((d, i) => (
          <DetailRow key={d.label} icon={d.icon} label={d.label} value={d.value} last={i === details.length - 1} />
        ))}
      </View>
    </View>
  );
}

function Description({ text }: { text: string }) {
  return (
    <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
      <Text style={{ fontSize: 18, fontWeight: "800", color: "#1A3A0A", marginBottom: 8 }}>Descrição</Text>
      <Text style={{ fontSize: 14, color: "#4A5E40", lineHeight: 22 }}>{text}</Text>
    </View>
  );
}

function BottomBar({
  quantity,
  onDecrement,
  onIncrement,
  onAddToCart,
}: {
  quantity: number;
  onDecrement: () => void;
  onIncrement: () => void;
  onAddToCart: () => void;
}) {
  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#EEF3EA",
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 4,
        gap: 10,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        {/* Quantity selector */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
            backgroundColor: "#F0F4EC",
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 12,
          }}
        >
          <TouchableOpacity onPress={onDecrement} activeOpacity={0.7}>
            <Ionicons name="remove" size={20} color={quantity <= 1 ? "#9CAA8E" : "#2D5A1B"} />
          </TouchableOpacity>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#1A3A0A", minWidth: 20, textAlign: "center" }}>
            {quantity}
          </Text>
          <TouchableOpacity onPress={onIncrement} activeOpacity={0.7}>
            <Ionicons name="add" size={20} color="#2D5A1B" />
          </TouchableOpacity>
        </View>

        {/* Add to cart */}
        <TouchableOpacity
          onPress={onAddToCart}
          activeOpacity={0.85}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            backgroundColor: "#2D5A1B",
            borderRadius: 14,
            paddingVertical: 15,
          }}
        >
          <Ionicons name="cart-outline" size={20} color="#FFFFFF" />
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#FFFFFF" }}>Adicionar ao carrinho</Text>
        </TouchableOpacity>
      </View>

      {/* Trust line */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#E8F5E2",
          borderRadius: 10,
          paddingHorizontal: 14,
          paddingVertical: 8,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Ionicons name="shield-checkmark-outline" size={15} color="#3D7A24" />
          <Text style={{ fontSize: 12, fontWeight: "600", color: "#2D5A1B" }}>
            Compra segura diretamente de quem produz
          </Text>
        </View>
        <Ionicons name="leaf" size={14} color="#3D7A24" />
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export function ProductDetailScreen({ productId }: { productId: string }) {
  const insets = useSafeAreaInsets();
  const [favorited, setFavorited] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleDecrement = () => setQuantity((q) => Math.max(1, q - 1));
  const handleIncrement = () => setQuantity((q) => q + 1);

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F7F3" }}>
      {/* TopBar floats over the full-bleed gallery, top = insets.top so buttons
          clear the status bar on every device */}
      <TopBar
        insetTop={insets.top}
        onBack={() => router.back()}
        favorited={favorited}
        onFavorite={() => setFavorited((v) => !v)}
      />

      {/* Scrollable content — starts from y:0 so gallery is truly full-bleed */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <ImageGallery images={PRODUCT.images} colors={PRODUCT.imageColors} />
        <ProductHeader product={PRODUCT} />
        <ProducerCard producer={PRODUCT.producer} />
        <ProductDetails details={PRODUCT.details} />
        <Description text={PRODUCT.description} />
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Sticky bottom bar + home-indicator safe area */}
      <BottomBar
        quantity={quantity}
        onDecrement={handleDecrement}
        onIncrement={handleIncrement}
        onAddToCart={() => console.log("add to cart", quantity)}
      />
      <View style={{ height: insets.bottom, backgroundColor: "#FFFFFF" }} />
    </View>
  );
}
