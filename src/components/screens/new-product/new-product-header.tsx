import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { TouchableOpacity, View } from "react-native";

import { Typography } from "@/components/ui/typography";

export function NewProductHeader() {
  return (
    <View className="flex-row items-center justify-between bg-[#2D5A1B] px-4 py-3">
      <View className="flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <View className="h-9 w-9 items-center justify-center rounded-full bg-white/20">
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
        <View>
          <Typography variant="h4" style={{ color: "#FFFFFF" }}>
            Novo produto
          </Typography>
          <Typography variant="caption" style={{ color: "rgba(255,255,255,0.75)" }}>
            Marketplace da Agricultura Familiar
          </Typography>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        className="flex-row items-center gap-1.5 rounded-full border border-white/40 px-3 py-1.5"
      >
        <Ionicons name="help-circle-outline" size={18} color="#FFFFFF" />
        <Typography variant="caption" style={{ color: "#FFFFFF", fontWeight: "600" }}>
          Ajuda
        </Typography>
      </TouchableOpacity>
    </View>
  );
}
