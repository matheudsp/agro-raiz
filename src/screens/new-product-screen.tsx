import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CreateProductForm } from "@/components/screens/new-product/create-product-form";
import { NewProductHeader } from "@/components/screens/new-product/new-product-header";
import { FormScrollView } from "@/components/ui/screen-containers/form-scroll-view";
import { useTRPC } from "@/lib/trpc";

// TODO: replace with real auth session
const CURRENT_PRODUCER_ID = "1";

export function NewProductScreen() {
  const insets = useSafeAreaInsets();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // ── Queries ───────────────────────────────────────────────────────────────

  const { data: categories = [] } = useQuery(trpc.categories.list.queryOptions());

  // ── Mutations ─────────────────────────────────────────────────────────────

  const createMutation = useMutation(
    trpc.products.create.mutationOptions({
      onSuccess: (product) => {
        queryClient.invalidateQueries(trpc.products.featured.queryOptions());
        queryClient.invalidateQueries(trpc.products.list.queryOptions());
        router.replace({ pathname: "/product/[id]", params: { id: product.id } });
      },
    }),
  );

  return (
    <View className="flex-1 bg-background">
      {/* Fixed header with top safe area */}
      <View style={{ paddingTop: insets.top }}>
        <NewProductHeader />
      </View>

      {/* FormScrollView handles keyboard avoidance and safe areas */}
      <FormScrollView contentContainerClassName="gap-6 pb-10 pt-4">
        <CreateProductForm
          categories={categories}
          onSubmit={(input) => createMutation.mutateAsync({ ...input, producerId: CURRENT_PRODUCER_ID })}
        />
      </FormScrollView>
    </View>
  );
}
