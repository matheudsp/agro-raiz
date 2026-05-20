import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { Typography } from "@/components/ui/typography";

export function NewProductIncentiveBanner() {
  return (
    <View className="flex-row items-center gap-3 rounded-2xl border border-[#C5DFB8] bg-[#E8F5E2] p-4">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-[#2D5A1B]">
        <Ionicons name="leaf" size={20} color="#FFFFFF" />
      </View>
      <View className="flex-1">
        <Typography variant="smallBold" style={{ color: "#2D5A1B" }}>
          Valorize o que você produz.
        </Typography>
        <Typography variant="caption" style={{ color: "#4A5E40" }}>
          Conecte sua família ao seu município!
        </Typography>
      </View>
    </View>
  );
}
