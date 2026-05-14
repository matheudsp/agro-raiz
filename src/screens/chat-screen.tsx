import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { tv } from "tailwind-variants";

import { StickyFooterFormScrollView } from "@/components/ui/screen-containers/sticky-footer-form-scroll-view";
import { Typography } from "@/components/ui/typography";
import { useThemeColors } from "@/hooks/use-theme-colors";

// ─── Brand tokens ─────────────────────────────────────────────────────────────

const BRAND = {
  dark: "#2D5A1B",
  mid: "#3D7A24",
  soft: "#E8F5E2",
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

type MessageKind = "text" | "product" | "order";

type Message = {
  id: string;
  from: "me" | "them";
  kind: MessageKind;
  text?: string;
  time: string;
  read?: boolean;
  product?: { name: string; price: string; unit: string; emoji: string; cardBg: string };
  order?: { id: string; status: string; items: string };
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const PRODUCER = {
  name: "João Silva",
  role: "Agricultor Familiar",
  location: "Canavieira – PI",
  initials: "JS",
  avatarBg: "#C8E6C9",
  status: "online" as const,
  lastSeen: "agora",
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    from: "them",
    kind: "text",
    text: "Olá! Vi que você se interessou pela alface orgânica. Ainda tenho 25 unidades disponíveis 🥬",
    time: "14:10",
  },
  {
    id: "2",
    from: "me",
    kind: "text",
    text: "Oi João! Que ótimo. Qual o prazo de entrega para Canavieira?",
    time: "14:12",
    read: true,
  },
  {
    id: "3",
    from: "them",
    kind: "text",
    text: "Entrego amanhã cedo, antes das 8h. Fresquinha do dia! 😊",
    time: "14:13",
  },
  {
    id: "4",
    from: "them",
    kind: "product",
    text: "Esse é o produto que temos disponível:",
    time: "14:14",
    product: { name: "Alface Crespa Orgânica", price: "R$ 4,00", unit: "unid.", emoji: "🥬", cardBg: "#E8F5E9" },
  },
  {
    id: "5",
    from: "me",
    kind: "text",
    text: "Perfeito! Vou querer 5 unidades então.",
    time: "14:16",
    read: true,
  },
  {
    id: "6",
    from: "them",
    kind: "order",
    text: "Pedido confirmado! Aqui está o resumo:",
    time: "14:17",
    order: { id: "#2847", status: "Confirmado", items: "5x Alface Crespa Orgânica — R$ 20,00" },
  },
  {
    id: "7",
    from: "them",
    kind: "text",
    text: "Posso separar mais 5 unidades de alface pra você!",
    time: "14:20",
  },
];

const DATE_LABEL = "Hoje";

// ─── Variants ─────────────────────────────────────────────────────────────────

const bubbleVariants = tv({
  base: "max-w-[78%] rounded-2xl px-4 py-2.5",
  variants: {
    from: {
      me: "rounded-br-sm bg-[#2D5A1B]",
      them: "rounded-bl-sm bg-surface",
    },
  },
});

const bubbleTextVariants = tv({
  base: "",
  variants: {
    from: {
      me: "text-white",
      them: "",
    },
  },
});

// ─── Top Bar ──────────────────────────────────────────────────────────────────

function TopBar({ producer }: { producer: typeof PRODUCER }) {
  return (
    <View className="flex-row items-center gap-3 border-b border-border bg-surface px-4 py-3">
      <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} className="mr-1">
        <Ionicons name="chevron-back" size={24} color="#1A3A0A" />
      </TouchableOpacity>

      {/* Avatar */}
      <View className="relative">
        <View
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: producer.avatarBg }}
        >
          <Typography variant="smallBold" style={{ color: BRAND.dark }}>
            {producer.initials}
          </Typography>
        </View>
        <View className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-surface bg-success" />
      </View>

      {/* Info */}
      <View className="flex-1 gap-0">
        <Typography variant="smallBold" style={{ color: "#1A3A0A" }}>
          {producer.name}
        </Typography>
        <View className="flex-row items-center gap-1">
          <View className="h-1.5 w-1.5 rounded-full bg-success" />
          <Typography variant="caption" tone="muted">
            Online agora
          </Typography>
        </View>
      </View>

      {/* Actions */}
      <View className="flex-row items-center gap-1">
        <TouchableOpacity className="h-9 w-9 items-center justify-center rounded-full bg-default" activeOpacity={0.7}>
          <Ionicons name="call-outline" size={18} color="#1A3A0A" />
        </TouchableOpacity>
        <TouchableOpacity className="h-9 w-9 items-center justify-center rounded-full bg-default" activeOpacity={0.7}>
          <Ionicons name="ellipsis-horizontal" size={18} color="#1A3A0A" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Date Separator ───────────────────────────────────────────────────────────

function DateSeparator({ label }: { label: string }) {
  return (
    <View className="my-4 flex-row items-center gap-3 px-6">
      <View className="h-px flex-1 bg-border" />
      <Typography variant="caption" tone="muted" style={{ fontWeight: "600" }}>
        {label}
      </Typography>
      <View className="h-px flex-1 bg-border" />
    </View>
  );
}

// ─── Product Bubble ───────────────────────────────────────────────────────────

function ProductBubble({ product, from }: { product: NonNullable<Message["product"]>; from: "me" | "them" }) {
  const isMe = from === "me";
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      className="overflow-hidden rounded-2xl border border-border bg-surface"
      style={{ width: 220, alignSelf: isMe ? "flex-end" : "flex-start" }}
    >
      <View className="h-24 items-center justify-center" style={{ backgroundColor: product.cardBg }}>
        <Typography style={{ fontSize: 44 }}>{product.emoji}</Typography>
      </View>
      <View className="gap-0.5 p-3">
        <Typography variant="smallBold" style={{ color: "#1A3A0A" }}>
          {product.name}
        </Typography>
        <Typography variant="small" style={{ color: BRAND.dark, fontWeight: "800" }}>
          {product.price}
          <Typography variant="caption" tone="muted">
            {" "}
            / {product.unit}
          </Typography>
        </Typography>
        <TouchableOpacity
          className="mt-2 items-center rounded-xl py-2"
          style={{ backgroundColor: BRAND.dark }}
          activeOpacity={0.85}
        >
          <Typography variant="caption" style={{ color: "#fff", fontWeight: "700" }}>
            Ver produto
          </Typography>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// ─── Order Bubble ─────────────────────────────────────────────────────────────

function OrderBubble({ order, from }: { order: NonNullable<Message["order"]>; from: "me" | "them" }) {
  const isMe = from === "me";
  return (
    <View
      className="overflow-hidden rounded-2xl border border-border bg-surface"
      style={{ width: 220, alignSelf: isMe ? "flex-end" : "flex-start" }}
    >
      <View className="flex-row items-center gap-2 px-3 py-2.5" style={{ backgroundColor: BRAND.soft }}>
        <Ionicons name="receipt-outline" size={15} color={BRAND.mid} />
        <Typography variant="caption" style={{ color: BRAND.dark, fontWeight: "700" }}>
          Pedido {order.id}
        </Typography>
        <View className="ml-auto rounded-full bg-success/20 px-2 py-0.5">
          <Typography variant="caption" style={{ color: "#1B5E20", fontWeight: "700" }}>
            {order.status}
          </Typography>
        </View>
      </View>
      <View className="gap-1 px-3 py-2.5">
        <Typography variant="caption" tone="muted">
          {order.items}
        </Typography>
        <TouchableOpacity activeOpacity={0.7}>
          <Typography variant="caption" style={{ color: BRAND.mid, fontWeight: "600" }}>
            Ver detalhes →
          </Typography>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Message Row ──────────────────────────────────────────────────────────────

function MessageRow({ message }: { message: Message }) {
  const isMe = message.from === "me";

  return (
    <View className={`mb-1.5 px-4 ${isMe ? "items-end" : "items-start"}`}>
      {/* Optional text before special bubbles */}
      {message.text && message.kind === "text" && (
        <View className={bubbleVariants({ from: message.from })}>
          <Typography variant="small" className={bubbleTextVariants({ from: message.from })} style={{ lineHeight: 20 }}>
            {message.text}
          </Typography>
        </View>
      )}

      {message.kind === "product" && message.product && (
        <View className={`gap-1.5 ${isMe ? "items-end" : "items-start"}`}>
          {message.text && (
            <View className={bubbleVariants({ from: message.from })}>
              <Typography
                variant="small"
                className={bubbleTextVariants({ from: message.from })}
                style={{ lineHeight: 20 }}
              >
                {message.text}
              </Typography>
            </View>
          )}
          <ProductBubble product={message.product} from={message.from} />
        </View>
      )}

      {message.kind === "order" && message.order && (
        <View className={`gap-1.5 ${isMe ? "items-end" : "items-start"}`}>
          {message.text && (
            <View className={bubbleVariants({ from: message.from })}>
              <Typography
                variant="small"
                className={bubbleTextVariants({ from: message.from })}
                style={{ lineHeight: 20 }}
              >
                {message.text}
              </Typography>
            </View>
          )}
          <OrderBubble order={message.order} from={message.from} />
        </View>
      )}

      {/* Timestamp + read receipt */}
      <View className={`mt-0.5 flex-row items-center gap-1 ${isMe ? "flex-row-reverse" : ""}`}>
        <Typography variant="caption" tone="muted" style={{ fontSize: 10 }}>
          {message.time}
        </Typography>
        {isMe && (
          <Ionicons
            name={message.read ? "checkmark-done" : "checkmark"}
            size={13}
            color={message.read ? BRAND.mid : "#9CAA8E"}
          />
        )}
      </View>
    </View>
  );
}

// ─── Chat Input ───────────────────────────────────────────────────────────────

function ChatInput({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState("");
  const colors = useThemeColors();
  const inputRef = useRef<TextInput>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  const canSend = text.trim().length > 0;

  return (
    <View className="flex-row items-end gap-2 border-t border-border bg-surface px-3 py-3">
      {/* Attachment */}
      <TouchableOpacity
        className="mb-0.5 h-9 w-9 items-center justify-center rounded-full bg-default"
        activeOpacity={0.7}
      >
        <Ionicons name="add" size={22} color="#1A3A0A" />
      </TouchableOpacity>

      {/* Input field */}
      <View className="flex-1 flex-row items-end gap-2 rounded-2xl bg-default px-4 py-2.5">
        <TextInput
          ref={inputRef}
          value={text}
          onChangeText={setText}
          placeholder="Mensagem..."
          placeholderTextColor={colors.muted}
          multiline
          maxLength={500}
          style={{
            flex: 1,
            fontSize: 14,
            color: colors.foreground,
            padding: 0,
            maxHeight: 100,
            lineHeight: 20,
          }}
        />
        {/* Emoji shortcut */}
        <TouchableOpacity activeOpacity={0.7} className="mb-0.5">
          <Ionicons name="happy-outline" size={20} color={colors.muted} />
        </TouchableOpacity>
      </View>

      {/* Send / Mic toggle */}
      <TouchableOpacity
        onPress={handleSend}
        activeOpacity={0.85}
        className="mb-0.5 h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: canSend ? BRAND.dark : "#E8EDE4" }}
      >
        <Ionicons name={canSend ? "send" : "mic-outline"} size={18} color={canSend ? "#FFFFFF" : "#9CAA8E"} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function ChatScreen({ conversationId }: { conversationId: string }) {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);

  const handleSend = (text: string) => {
    const newMsg: Message = {
      id: String(Date.now()),
      from: "me",
      kind: "text",
      text,
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      read: false,
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  return (
    <View className="flex-1 bg-background">
      {/* Fixed top bar with safe area */}
      <View style={{ paddingTop: insets.top }} className="bg-surface">
        <TopBar producer={PRODUCER} />
      </View>

      {/* StickyFooterFormScrollView: body scrolls, footer sticks above keyboard */}
      <StickyFooterFormScrollView.Root>
        <StickyFooterFormScrollView.Body
          className="flex-1 bg-background px-0"
          contentContainerClassName="pt-2 pb-4"
          // Inverted would be ideal for chat but requires reversing the data array;
          // instead we scroll to end after each new message via ref if needed.
        >
          <DateSeparator label={DATE_LABEL} />
          {messages.map((msg) => (
            <MessageRow key={msg.id} message={msg} />
          ))}
        </StickyFooterFormScrollView.Body>

        <StickyFooterFormScrollView.Footer stickToKeyboard>
          <ChatInput onSend={handleSend} />
          <View style={{ height: insets.bottom }} className="bg-surface" />
        </StickyFooterFormScrollView.Footer>
      </StickyFooterFormScrollView.Root>
    </View>
  );
}
