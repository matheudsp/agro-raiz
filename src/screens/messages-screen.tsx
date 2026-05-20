import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { tv } from "tailwind-variants";

import { StandardScrollView } from "@/components/ui/screen-containers/standard-scroll-view";
import { Typography } from "@/components/ui/typography";
import { useRefreshOnFocus } from "@/hooks/use-refresh-on-focus";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useTRPC } from "@/lib/trpc";

import type { Conversation } from "../../server/trpc/routers/conversations";
import type { Producer } from "../../server/trpc/routers/producers";

// ─── Brand tokens ─────────────────────────────────────────────────────────────

const BRAND = {
  dark: "#2D5A1B",
  mid: "#3D7A24",
  soft: "#E8F5E2",
} as const;

// TODO: replace with real auth session once auth is wired up
const CURRENT_USER_ID = "buyer-1";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "agora";
  if (diffMins < 60) return `${diffMins}min`;
  if (diffDays < 1) return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "ontem";
  if (diffDays < 7) return date.toLocaleDateString("pt-BR", { weekday: "short" });
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

// ─── Variants ─────────────────────────────────────────────────────────────────

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

// ─── Filter types ─────────────────────────────────────────────────────────────

const FILTERS = ["Todas", "Não lidas", "Recentes"] as const;
type Filter = (typeof FILTERS)[number];

// ─── Search Bar ───────────────────────────────────────────────────────────────

function SearchBar({ query, onChangeText }: { query: string; onChangeText: (t: string) => void }) {
  const colors = useThemeColors();

  return (
    <View className="mx-4 mb-3 flex-row items-center gap-2 rounded-xl bg-default px-3.5 py-2.5">
      <Ionicons name="search-outline" size={17} color={colors.muted} />
      <TextInput
        value={query}
        onChangeText={onChangeText}
        placeholder="Buscar conversas..."
        placeholderTextColor={colors.muted}
        style={{ flex: 1, fontSize: 14, color: colors.foreground, padding: 0 }}
      />
      {query.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText("")} activeOpacity={0.7}>
          <Ionicons name="close-circle" size={17} color={colors.muted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Filter Chips ─────────────────────────────────────────────────────────────

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

function ConversationItem({
  conversation,
  producer,
  onPress,
}: {
  conversation: Conversation;
  producer: Producer | undefined;
  onPress: () => void;
}) {
  const hasUnread = conversation.unreadCount > 0;

  // Derive display name and initials from producer if available
  const displayName = producer?.name ?? "Carregando...";
  const displayRole = producer?.type ?? "";
  const displayInitials = producer?.initials ?? "?";
  const avatarBg = producer?.avatarBg ?? "#E8F5E2";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center gap-3 border-b border-border bg-surface px-4 py-3.5"
    >
      {/* Avatar */}
      <View className="relative">
        <View className="h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: avatarBg }}>
          <Typography variant="bodyBold" style={{ color: BRAND.dark }}>
            {displayInitials}
          </Typography>
        </View>
        {/* Online dot — shows for producers with recent activity (< 5 min) */}
        {conversation.lastMessageAt && Date.now() - new Date(conversation.lastMessageAt).getTime() < 300_000 && (
          <View className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-surface bg-success" />
        )}
      </View>

      {/* Content */}
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center justify-between">
          <Typography
            variant={hasUnread ? "smallBold" : "small"}
            style={{ color: hasUnread ? "#1A3A0A" : undefined }}
            truncate
          >
            {displayName}
          </Typography>
          <Typography
            variant="caption"
            style={{
              color: hasUnread ? BRAND.mid : undefined,
              fontWeight: hasUnread ? "700" : "400",
            }}
          >
            {formatMessageTime(conversation.lastMessageAt)}
          </Typography>
        </View>

        {displayRole ? (
          <Typography variant="caption" tone="muted" style={{ marginBottom: 1 }}>
            {displayRole}
          </Typography>
        ) : null}

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
            {conversation.lastMessage || "Iniciar conversa"}
          </Typography>
          {hasUnread && (
            <View
              className="h-5 min-w-[20px] items-center justify-center rounded-full px-1.5"
              style={{ backgroundColor: BRAND.mid }}
            >
              <Typography variant="caption" style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 11 }}>
                {conversation.unreadCount}
              </Typography>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function ConversationSkeleton() {
  return (
    <View className="flex-row items-center gap-3 border-b border-border bg-surface px-4 py-3.5">
      <View className="h-14 w-14 rounded-full bg-default opacity-60" />
      <View className="flex-1 gap-2">
        <View className="h-4 w-2/3 rounded-lg bg-default opacity-60" />
        <View className="h-3 w-1/3 rounded-lg bg-default opacity-50" />
        <View className="h-3 w-3/4 rounded-lg bg-default opacity-40" />
      </View>
    </View>
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
    <View className="items-center justify-center gap-3 py-20">
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
  const trpc = useTRPC();

  const [activeFilter, setActiveFilter] = useState<Filter>("Todas");
  const [searchQuery, setSearchQuery] = useState("");

  // ── Queries ───────────────────────────────────────────────────────────────

  const conversationsQueryOptions = trpc.conversations.list.queryOptions({
    userId: CURRENT_USER_ID,
  });
  const { data: conversations = [], isPending } = useQuery(conversationsQueryOptions);

  // Fetch all producers so we can hydrate display info for each conversation
  const { data: producers = [] } = useQuery(trpc.producers.list.queryOptions());

  // ── Refresh on focus ──────────────────────────────────────────────────────

  useRefreshOnFocus(conversationsQueryOptions.queryKey);

  // ── Derived data ──────────────────────────────────────────────────────────

  const producersById = Object.fromEntries(producers.map((p) => [p.id, p])) as Record<string, Producer>;

  const applyFilter = (list: Conversation[]): Conversation[] => {
    switch (activeFilter) {
      case "Não lidas":
        return list.filter((c) => c.unreadCount > 0);
      case "Recentes":
        return [...list].sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt)).slice(0, 10);
      default:
        return list;
    }
  };

  const applySearch = (list: Conversation[]): Conversation[] => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((c) => {
      const producer = producersById[c.producerId];
      return producer?.name.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q);
    });
  };

  const filteredConversations = applySearch(applyFilter(conversations));

  // Split into unread-first (acts as "pinned") and rest
  const unread = filteredConversations.filter((c) => c.unreadCount > 0);
  const read = filteredConversations.filter((c) => c.unreadCount === 0);

  const isEmpty = !isPending && filteredConversations.length === 0;

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
        <SearchBar query={searchQuery} onChangeText={setSearchQuery} />
        <FilterChips active={activeFilter} onSelect={setActiveFilter} />
      </View>

      {/* Scrollable content */}
      <StandardScrollView contentContainerClassName="pb-6">
        {/* Loading skeleton */}
        {isPending && (
          <>
            {[1, 2, 3, 4].map((i) => (
              <ConversationSkeleton key={i} />
            ))}
          </>
        )}

        {/* Empty state */}
        {isEmpty && <EmptyState />}

        {/* Não lidas / com conteúdo */}
        {!isPending && unread.length > 0 && (
          <View>
            <SectionLabel label="Não lidas" />
            {unread.map((c) => (
              <ConversationItem
                key={c.id}
                conversation={c}
                producer={producersById[c.producerId]}
                onPress={() => router.push({ pathname: "/chat/[id]", params: { id: c.id } })}
              />
            ))}
          </View>
        )}

        {!isPending && read.length > 0 && (
          <View>
            {unread.length > 0 && <SectionLabel label="Lidas" />}
            {read.map((c) => (
              <ConversationItem
                key={c.id}
                conversation={c}
                producer={producersById[c.producerId]}
                onPress={() => router.push({ pathname: "/chat/[id]", params: { id: c.id } })}
              />
            ))}
          </View>
        )}
      </StandardScrollView>
    </View>
  );
}
