import { useLocalSearchParams } from "expo-router";

import { ChatScreen } from "@/screens/chat-screen";

export default function ConversaRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ChatScreen conversationId={id} />;
}
