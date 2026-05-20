import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { tv } from "tailwind-variants";

import { StickyFooterFormScrollView } from "@/components/ui/screen-containers/sticky-footer-form-scroll-view";
import { Typography } from "@/components/ui/typography";
import { useRefreshOnFocus } from "@/hooks/use-refresh-on-focus";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useTRPC } from "@/lib/trpc";

import type { Message } from "../../server/trpc/routers/conversations";
import type { Order } from "../../server/trpc/routers/orders";
import type { Producer } from "../../server/trpc/routers/producers";

// ─── Brand tokens ─────────────────────────────────────────────────────────────

const BRAND = {
  dark: "#2D5A1B",
  mid: "#3D7A24",
  soft: "#E8F5E2",
} as const;

// TODO: replace with real auth session
const CURRENT_USER_ID = "buyer-1";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function formatOrderItems(order: Order): string {
  return order.items
    .map(
      (i) =>
        `${i.quantity}x ${i.productName} — ${(i.subtotal / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
    )
    .join("\n");
}

function formatOrderTotal(order: Order): string {
  return (order.totalCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

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

function TopBar({ producer }: { producer: Producer | undefined }) {
  return (
    <View className="flex-row items-center gap-3 border-b border-border bg-surface px-4 py-3">
      <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} className="mr-1">
        <Ionicons name="chevron-back" size={24} color="#1A3A0A" />
      </TouchableOpacity>

      {/* Avatar */}
      <View className="relative">
        <View
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: producer?.avatarBg ?? "#E8F5E2" }}
        >
          <Typography variant="smallBold" style={{ color: BRAND.dark }}>
            {producer?.initials ?? "?"}
          </Typography>
        </View>
        <View className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-surface bg-success" />
      </View>

      {/* Info */}
      <View className="flex-1">
        <Typography variant="smallBold" style={{ color: "#1A3A0A" }}>
          {producer?.name ?? "Carregando..."}
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

function ProductBubble({ productId, isMe }: { productId: string; isMe: boolean }) {
  const trpc = useTRPC();
  const { data: product } = useQuery(trpc.products.get.queryOptions({ id: productId }));

  if (!product) return null;

  return (
    <TouchableOpacity
      onPress={() => router.push({ pathname: "/product/[id]", params: { id: product.id } })}
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
          {(product.priceCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
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

function OrderBubble({ orderId, isMe }: { orderId: string; isMe: boolean }) {
  const trpc = useTRPC();
  const { data: order } = useQuery(trpc.orders.get.queryOptions({ id: orderId }));

  if (!order) return null;

  const STATUS_LABELS: Record<string, string> = {
    pendente: "Pendente",
    confirmado: "Confirmado",
    preparando: "Preparando",
    pronto: "Pronto",
    entregue: "Entregue",
    cancelado: "Cancelado",
  };

  return (
    <View
      className="overflow-hidden rounded-2xl border border-border bg-surface"
      style={{ width: 220, alignSelf: isMe ? "flex-end" : "flex-start" }}
    >
      <View className="flex-row items-center gap-2 px-3 py-2.5" style={{ backgroundColor: BRAND.soft }}>
        <Ionicons name="receipt-outline" size={15} color={BRAND.mid} />
        <Typography variant="caption" style={{ color: BRAND.dark, fontWeight: "700" }}>
          Pedido #{order.id.slice(0, 6)}
        </Typography>
        <View className="ml-auto rounded-full bg-success/20 px-2 py-0.5">
          <Typography variant="caption" style={{ color: "#1B5E20", fontWeight: "700" }}>
            {STATUS_LABELS[order.status] ?? order.status}
          </Typography>
        </View>
      </View>
      <View className="gap-1 px-3 py-2.5">
        <Typography variant="caption" tone="muted">
          {formatOrderItems(order)}
        </Typography>
        <Typography variant="caption" style={{ color: BRAND.dark, fontWeight: "700" }}>
          Total: {formatOrderTotal(order)}
        </Typography>
        <TouchableOpacity
          // onPress={() => router.push({ pathname: "/order/[id]", params: { id: order.id } })}
          activeOpacity={0.7}
        >
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
  const isMe = message.senderId === CURRENT_USER_ID;
  const side = isMe ? "me" : "them";

  return (
    <View className={`mb-1.5 px-4 ${isMe ? "items-end" : "items-start"}`}>
      {/* Text bubble */}
      {message.kind === "text" && (
        <View className={bubbleVariants({ from: side })}>
          <Typography variant="small" className={bubbleTextVariants({ from: side })} style={{ lineHeight: 20 }}>
            {message.text}
          </Typography>
        </View>
      )}

      {/* Product card */}
      {message.kind === "product" && (
        <View className={`gap-1.5 ${isMe ? "items-end" : "items-start"}`}>
          {message.text && (
            <View className={bubbleVariants({ from: side })}>
              <Typography variant="small" className={bubbleTextVariants({ from: side })} style={{ lineHeight: 20 }}>
                {message.text}
              </Typography>
            </View>
          )}
          {message.productId && <ProductBubble productId={message.productId} isMe={isMe} />}
        </View>
      )}

      {/* Order card */}
      {message.kind === "order" && (
        <View className={`gap-1.5 ${isMe ? "items-end" : "items-start"}`}>
          {message.text && (
            <View className={bubbleVariants({ from: side })}>
              <Typography variant="small" className={bubbleTextVariants({ from: side })} style={{ lineHeight: 20 }}>
                {message.text}
              </Typography>
            </View>
          )}
          {message.orderId && <OrderBubble orderId={message.orderId} isMe={isMe} />}
        </View>
      )}

      {/* Timestamp + read receipt */}
      <View className={`mt-0.5 flex-row items-center gap-1 ${isMe ? "flex-row-reverse" : ""}`}>
        <Typography variant="caption" tone="muted" style={{ fontSize: 10 }}>
          {formatTime(message.createdAt)}
        </Typography>
        {isMe && (
          <Ionicons
            name={message.readAt ? "checkmark-done" : "checkmark"}
            size={13}
            color={message.readAt ? BRAND.mid : "#9CAA8E"}
          />
        )}
      </View>
    </View>
  );
}

// ─── Messages Skeleton ────────────────────────────────────────────────────────

function MessagesSkeleton() {
  return (
    <View className="gap-4 px-4 pt-4">
      {[
        { isMe: false, width: "70%" },
        { isMe: true, width: "55%" },
        { isMe: false, width: "80%" },
        { isMe: false, width: "50%" },
        { isMe: true, width: "65%" },
      ].map((s, i) => (
        <View key={i} className={`${s.isMe ? "items-end" : "items-start"}`}>
          <View className="h-10 rounded-2xl bg-default opacity-60" style={{ width: s.width as any }} />
        </View>
      ))}
    </View>
  );
}

// ─── Chat Input ───────────────────────────────────────────────────────────────

function ChatInput({ onSend, isSending }: { onSend: (text: string) => void; isSending: boolean }) {
  const [text, setText] = useState("");
  const colors = useThemeColors();
  const inputRef = useRef<TextInput>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;
    onSend(trimmed);
    setText("");
  };

  const canSend = text.trim().length > 0 && !isSending;

  return (
    <View className="flex-row items-end gap-2 border-t border-border bg-surface px-3 py-3">
      <TouchableOpacity
        className="mb-0.5 h-9 w-9 items-center justify-center rounded-full bg-default"
        activeOpacity={0.7}
      >
        <Ionicons name="add" size={22} color="#1A3A0A" />
      </TouchableOpacity>

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
        <TouchableOpacity activeOpacity={0.7} className="mb-0.5">
          <Ionicons name="happy-outline" size={20} color={colors.muted} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={handleSend}
        activeOpacity={0.85}
        disabled={!canSend}
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
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const scrollRef = useRef<ScrollView>(null);

  // ── Queries ───────────────────────────────────────────────────────────────

  const messagesQueryOptions = trpc.conversations.messages.queryOptions({ conversationId });
  const { data: messages = [], isPending: messagesPending } = useQuery(messagesQueryOptions);

  // Derive producerId from the conversation list cached by MessagesScreen
  const { data: conversations = [] } = useQuery(trpc.conversations.list.queryOptions({ userId: CURRENT_USER_ID }));
  const conversation = conversations.find((c) => c.id === conversationId);
  const producerId = conversation?.producerId;

  const { data: producer } = useQuery(
    trpc.producers.get.queryOptions({ id: producerId ?? "" }, { enabled: !!producerId }),
  );

  // ── Refresh on focus ──────────────────────────────────────────────────────

  useRefreshOnFocus(messagesQueryOptions.queryKey);

  // ── Mark as read on mount ─────────────────────────────────────────────────

  const markReadMutation = useMutation(trpc.conversations.markRead.mutationOptions());

  useEffect(() => {
    markReadMutation.mutate({ conversationId, userId: CURRENT_USER_ID });
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // ── Send message mutation ─────────────────────────────────────────────────

  const sendMutation = useMutation(
    trpc.conversations.send.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(messagesQueryOptions);
        // Scroll to bottom after new message
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      },
    }),
  );

  // ── Scroll to bottom when messages load ───────────────────────────────────

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 50);
    }
  }, [messages.length]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSend = (text: string) => {
    sendMutation.mutate({
      conversationId,
      senderId: CURRENT_USER_ID,
      kind: "text",
      text,
    });
  };

  // ── Group messages by date ────────────────────────────────────────────────

  const dateLabel =
    messages.length > 0
      ? new Date(messages[0].createdAt).toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "2-digit",
          month: "long",
        })
      : "Hoje";

  return (
    <View className="flex-1 bg-background">
      {/* Fixed top bar — safe area applied here */}
      <View style={{ paddingTop: insets.top }} className="bg-surface">
        <TopBar producer={producer} />
      </View>

      {/* Body scrolls, footer sticks above keyboard */}
      <StickyFooterFormScrollView.Root>
        <StickyFooterFormScrollView.Body className="flex-1 bg-background px-0" contentContainerClassName="pt-2 pb-4">
          {messagesPending ? (
            <MessagesSkeleton />
          ) : (
            <>
              <DateSeparator label={dateLabel} />
              {messages.map((msg) => (
                <MessageRow key={msg.id} message={msg} />
              ))}
            </>
          )}
        </StickyFooterFormScrollView.Body>

        <StickyFooterFormScrollView.Footer stickToKeyboard>
          <ChatInput onSend={handleSend} isSending={sendMutation.isPending} />
          <View style={{ height: insets.bottom }} className="bg-surface" />
        </StickyFooterFormScrollView.Footer>
      </StickyFooterFormScrollView.Root>
    </View>
  );
}
