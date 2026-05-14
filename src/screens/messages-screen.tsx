import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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

type ConversationStatus = "online" | "offline" | "away";

type Conversation = {
  id: string;
  name: string;
  role: string;
  lastMessage: string;
  time: string;
  unread: number;
  initials: string;
  avatarBg: string;
  status: ConversationStatus;
  pinned?: boolean;
};

const CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    name: "João Silva",
    role: "Agricultor",
    lastMessage: "Posso separar mais 5 unidades de alface pra você!",
    time: "agora",
    unread: 2,
    initials: "JS",
    avatarBg: "#C8E6C9",
    status: "online",
    pinned: true,
  },
  {
    id: "2",
    name: "Antônio Lima",
    role: "Agricultor",
    lastMessage: "O melado está fresquinho, colhido ontem 🍯",
    time: "14:32",
    unread: 1,
    initials: "AL",
    avatarBg: "#DCEDC8",
    status: "online",
    pinned: true,
  },
  {
    id: "3",
    name: "Mulheres do Campo",
    role: "Cooperativa",
    lastMessage: "Tudo bem! Seu pedido saiu para entrega.",
    time: "11:05",
    unread: 0,
    initials: "MC",
    avatarBg: "#F0F4C3",
    status: "away",
  },
  {
    id: "4",
    name: "Maria Oliveira",
    role: "Agricultora",
    lastMessage: "Obrigada pela sua avaliação ⭐",
    time: "ontem",
    unread: 0,
    initials: "MO",
    avatarBg: "#FFE0B2",
    status: "offline",
  },
  {
    id: "5",
    name: "Pedro Santos",
    role: "Agricultor",
    lastMessage: "Tenho tomate orgânico disponível essa semana.",
    time: "seg",
    unread: 0,
    initials: "PS",
    avatarBg: "#E1BEE7",
    status: "offline",
  },
  {
    id: "6",
    name: "Lúcia Ferreira",
    role: "Agricultora",
    lastMessage: "Você: Pode me mandar o valor do frete?",
    time: "sex",
    unread: 0,
    initials: "LF",
    avatarBg: "#B2EBF2",
    status: "offline",
  },
];

// ─── Variants ─────────────────────────────────────────────────────────────────

const statusDotVariants = tv({
  base: "absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-surface",
  variants: {
    status: {
      online: "bg-success",
      away: "bg-warning",
      offline: "bg-border",
    },
  },
});

const filterChipVariants = tv({
  base: "rounded-full border px-4 py-1.5",
  variants: {
    active: {
      true: "border-[#3D7A24] bg-[#E8F5E2]",
      false: "border-border bg-surface",
    },
  },
  defaultVariants: { active: false },
});

// ─── Search Bar ───────────────────────────────────────────────────────────────

function SearchBar() {
  const [query, setQuery] = useState("");
  const colors = useThemeColors();

  return (
    <View className="mx-4 mb-3 flex-row items-center gap-2 rounded-xl bg-default px-3.5 py-2.5">
      <Ionicons name="search-outline" size={17} color={colors.muted} />
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar conversas..."
        placeholderTextColor={colors.muted}
        style={{ flex: 1, fontSize: 14, color: colors.foreground, padding: 0 }}
      />
      {query.length > 0 && (
        <TouchableOpacity onPress={() => setQuery("")} activeOpacity={0.7}>
          <Ionicons name="close-circle" size={17} color={colors.muted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Filter Chips ─────────────────────────────────────────────────────────────

const FILTERS = ["Todas", "Não lidas", "Agricultores", "Pedidos"] as const;
type Filter = (typeof FILTERS)[number];

function FilterChips({ active, onSelect }: { active: Filter; onSelect: (f: Filter) => void }) {
  return (
    <View className="mb-4 flex-row gap-2 px-4">
      {FILTERS.map((f) => (
        <TouchableOpacity
          key={f}
          onPress={() => onSelect(f)}
          activeOpacity={0.75}
          className={filterChipVariants({ active: active === f })}
        >
          <Typography
            variant="caption"
            style={{
              color: active === f ? BRAND.dark : undefined,
              fontWeight: active === f ? "700" : "500",
            }}
          >
            {f}
          </Typography>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Conversation Item ────────────────────────────────────────────────────────

function ConversationItem({ conversation, onPress }: { conversation: Conversation; onPress: () => void }) {
  const hasUnread = conversation.unread > 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center gap-3 border-b border-border bg-surface px-4 py-3.5"
    >
      {/* Avatar */}
      <View className="relative">
        <View
          className="h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: conversation.avatarBg }}
        >
          <Typography variant="bodyBold" style={{ color: BRAND.dark }}>
            {conversation.initials}
          </Typography>
        </View>
        <View className={statusDotVariants({ status: conversation.status })} />
      </View>

      {/* Content */}
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            {conversation.pinned && (
              <Ionicons name="pin" size={12} color={BRAND.mid} style={{ transform: [{ rotate: "45deg" }] }} />
            )}
            <Typography
              variant={hasUnread ? "smallBold" : "small"}
              style={{ color: hasUnread ? "#1A3A0A" : undefined }}
              truncate
            >
              {conversation.name}
            </Typography>
          </View>
          <Typography
            variant="caption"
            style={{
              color: hasUnread ? BRAND.mid : undefined,
              fontWeight: hasUnread ? "700" : "400",
            }}
          >
            {conversation.time}
          </Typography>
        </View>

        <Typography variant="caption" tone="muted" style={{ marginBottom: 1 }}>
          {conversation.role}
        </Typography>

        <View className="flex-row items-center justify-between gap-2">
          <Typography
            variant="caption"
            tone={hasUnread ? "default" : "muted"}
            truncate
            style={{
              flex: 1,
              fontWeight: hasUnread ? "600" : "400",
              color: hasUnread ? "#3A4A38" : undefined,
            }}
          >
            {conversation.lastMessage}
          </Typography>
          {hasUnread && (
            <View
              className="h-5 min-w-[20px] items-center justify-center rounded-full px-1.5"
              style={{ backgroundColor: BRAND.mid }}
            >
              <Typography variant="caption" style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 11 }}>
                {conversation.unread}
              </Typography>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <View className="bg-background px-4 py-2">
      <Typography
        variant="caption"
        tone="muted"
        style={{ fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.8 }}
      >
        {label}
      </Typography>
    </View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center gap-3 py-20">
      <View className="h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: BRAND.soft }}>
        <Ionicons name="chatbubbles-outline" size={36} color={BRAND.mid} />
      </View>
      <View className="items-center gap-1">
        <Typography variant="bodyBold" align="center">
          Nenhuma conversa ainda
        </Typography>
        <Typography variant="small" tone="muted" align="center" style={{ maxWidth: 240 }}>
          Suas conversas com agricultores aparecerão aqui.
        </Typography>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<Filter>("Todas");

  const pinned = CONVERSATIONS.filter((c) => c.pinned);
  const recent = CONVERSATIONS.filter((c) => !c.pinned);

  const filterConversations = (list: Conversation[]) => {
    if (activeFilter === "Não lidas") return list.filter((c) => c.unread > 0);
    if (activeFilter === "Agricultores") return list.filter((c) => c.role === "Agricultor" || c.role === "Agricultora");
    return list;
  };

  const filteredPinned = filterConversations(pinned);
  const filteredRecent = filterConversations(recent);
  const isEmpty = filteredPinned.length === 0 && filteredRecent.length === 0;

  return (
    <View className="flex-1 bg-background">
      {/* Fixed header — top safe area applied here */}
      <View style={{ paddingTop: insets.top }} className="border-b border-border bg-surface">
        <View className="mb-3 flex-row items-center justify-between px-4 pt-3">
          <Typography variant="h3">Mensagens</Typography>
          <TouchableOpacity className="h-9 w-9 items-center justify-center rounded-full bg-default" activeOpacity={0.7}>
            <Ionicons name="create-outline" size={20} color="#1A3A0A" />
          </TouchableOpacity>
        </View>
        <SearchBar />
        <FilterChips active={activeFilter} onSelect={setActiveFilter} />
      </View>

      {/* Scrollable content */}
      <StandardScrollView contentContainerClassName="pb-6">
        {isEmpty ? (
          <EmptyState />
        ) : (
          <>
            {filteredPinned.length > 0 && (
              <View>
                <SectionLabel label="Fixadas" />
                {filteredPinned.map((c) => (
                  <ConversationItem
                    key={c.id}
                    conversation={c}
                    onPress={() => router.push({ pathname: "/chat/[id]", params: { id: c.id } })}
                  />
                ))}
              </View>
            )}
            {filteredRecent.length > 0 && (
              <View>
                <SectionLabel label="Recentes" />
                {filteredRecent.map((c) => (
                  <ConversationItem
                    key={c.id}
                    conversation={c}
                    onPress={() => router.push({ pathname: "/chat/[id]", params: { id: c.id } })}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </StandardScrollView>
    </View>
  );
}
