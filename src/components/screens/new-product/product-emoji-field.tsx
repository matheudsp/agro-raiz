import { Ionicons } from "@expo/vector-icons";
import { ScrollView, TouchableOpacity, View } from "react-native";

import { Typography } from "@/components/ui/typography";
import { useFieldContext } from "@/hooks/form/form-context";

const EMOJI_OPTIONS = ["🥬", "🍊", "🍯", "🫘", "🌿", "🌾", "🍅", "🥕", "🌽", "🥔", "🧅", "🧄"] as const;

const BRAND_MID = "#3D7A24";

export function ProductEmojiField() {
  const field = useFieldContext<string>();
  const selected = field.state.value;

  return (
    <View className="gap-3">
      <Typography variant="caption" tone="muted">
        Tire uma foto clara do seu produto.{"\n"}Mostre seu produto com carinho!
      </Typography>

      {/* Preview + camera */}
      <View className="flex-row gap-3">
        <View
          className="flex-1 items-center justify-center overflow-hidden rounded-2xl border border-border bg-default"
          style={{ height: 140 }}
        >
          <Typography style={{ fontSize: 72 }}>{selected}</Typography>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          className="flex-1 items-center justify-center gap-2 rounded-2xl border border-dashed border-[#3D7A24] bg-[#F8FFF6]"
          style={{ height: 140 }}
        >
          <View className="relative">
            <Ionicons name="camera-outline" size={38} color={BRAND_MID} />
            <View
              className="absolute -right-1 -bottom-1 h-5 w-5 items-center justify-center rounded-full"
              style={{ backgroundColor: BRAND_MID }}
            >
              <Ionicons name="add" size={14} color="#FFFFFF" />
            </View>
          </View>
          <Typography variant="smallBold" style={{ color: BRAND_MID }}>
            Tirar foto
          </Typography>
        </TouchableOpacity>
      </View>

      {/* Emoji strip */}
      <Typography variant="caption" tone="muted">
        Escolha um ícone para representar seu produto:
      </Typography>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {EMOJI_OPTIONS.map((emoji) => (
          <TouchableOpacity
            key={emoji}
            onPress={() => field.handleChange(emoji)}
            activeOpacity={0.8}
            className="h-14 w-14 items-center justify-center rounded-xl border"
            style={{
              borderColor: selected === emoji ? BRAND_MID : "#E0E7DC",
              backgroundColor: selected === emoji ? "#E8F5E2" : "#FFFFFF",
            }}
          >
            <Typography style={{ fontSize: 28 }}>{emoji}</Typography>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
