"use client";

import React from "react";
import ChatSection from "@/components/ChatDashboard/ChatSection";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useUserSync } from "@/hooks/useUserSync";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Loader2 } from "lucide-react";

export default function GroupChatPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { currentUser } = useUserSync();
  const [conversationId, setConversationId] = React.useState<string | null>(
    null,
  );

  React.useEffect(() => {
    params.then(({ conversationId }) => setConversationId(conversationId));
  }, [params]);

  // Get conversation details to verify it's a group chat
  const conversation = useQuery(
    api.conversations.getConversationDetails,
    conversationId
      ? { conversationId: conversationId as Id<"conversations"> }
      : "skip",
  );

  if (!currentUser || !conversationId || !conversation) {
    return (
      <div className="w-full dark:bg-neutral-900 dark:text-white bg-white text-black flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="w-full h-full dark:bg-neutral-900 dark:text-white bg-white text-black">
      <ChatSection conversationId={conversationId as Id<"conversations">} />
    </div>
  );
}
