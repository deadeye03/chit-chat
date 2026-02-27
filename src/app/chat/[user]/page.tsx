"use client";

import React, { useEffect } from "react";
import ChatSection from "@/components/ChatDashboard/ChatSection";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUserSync } from "@/hooks/useUserSync";
import { Id } from "../../../../convex/_generated/dataModel";
import { Loader2 } from "lucide-react";

export default function ChatPage({
  params,
}: {
  params: Promise<{ user: string }>;
}) {
  const { currentUser } = useUserSync();
  const [user, setUser] = React.useState<string | null>(null);

  React.useEffect(() => {
    params.then(({ user }) => setUser(user));
  }, [params]);

  const createOrGetConversation = useMutation(
    api.conversations.createOrGetConversation,
  );
  const [conversationId, setConversationId] =
    React.useState<Id<"conversations"> | null>(null);

  // Create or get conversation
  useEffect(() => {
    if (currentUser && user) {
      createOrGetConversation({
        participantIds: [currentUser._id, user as Id<"users">],
      }).then((convId) => {
        setConversationId(convId);
      });
    }
  }, [currentUser, user, createOrGetConversation]);

  if (!currentUser || !user || !conversationId) {
    return (
      <div className="w-full dark:bg-neutral-900 dark:text-white bg-white text-black flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="w-full h-full dark:bg-neutral-900 dark:text-white bg-white text-black">
      <ChatSection
        recipientUserId={user as Id<"users">}
        conversationId={conversationId}
      />
    </div>
  );
}
