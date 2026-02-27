"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useUserSync } from "@/hooks/useUserSync";
import { formatShortTimestamp } from "@/utils/dateUtils";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ConversationItemSkeleton } from "./SkeletonLoaders";

export default function ConversationList() {
  const { currentUser } = useUserSync();
  const conversations = useQuery(
    api.conversations.getUserConversations,
    currentUser?._id ? { userId: currentUser._id } : "skip",
  );
  const unreadCounts = useQuery(
    api.readStatus.getAllUnreadCounts,
    currentUser?._id ? { userId: currentUser._id } : "skip",
  );

  const router = useRouter();
  const params = useParams();
  const selectedUserId = params?.user as string | undefined;

  if (!currentUser || !conversations) {
    return (
      <div className="flex flex-col">
        {[1, 2, 3, 4, 5].map((i) => (
          <ConversationItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p className="text-sm font-medium mb-2">No conversations yet</p>
        <p className="text-xs mt-2 mb-4">
          Search for users above to start chatting
        </p>
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-left">
          <p className="text-xs font-semibold text-primary mb-1">
            💡 Quick Tip
          </p>
          <p className="text-xs text-muted-foreground">
            Type a name or email in the search bar to find users and start a
            conversation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-y-auto">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation._id}
          conversation={conversation}
          currentUserId={currentUser._id}
          unreadCount={unreadCounts?.[conversation._id] || 0}
          isSelected={
            selectedUserId
              ? conversation.participantIds.includes(
                  selectedUserId as Id<"users">,
                )
              : false
          }
          onClick={() => {
            if (conversation.isGroup) {
              // For group chats, navigate using conversation ID
              router.push(`/chat/group/${conversation._id}`);
            } else {
              // For one-on-one chats, navigate using the other user's ID
              const otherUserId = conversation.participantIds.find(
                (id) => id !== currentUser._id,
              );
              if (otherUserId) {
                router.push(`/chat/${otherUserId}`);
              }
            }
          }}
        />
      ))}
    </div>
  );
}

interface ConversationItemProps {
  conversation: {
    _id: Id<"conversations">;
    _creationTime: number;
    isGroup: boolean;
    name?: string;
    participantIds: Id<"users">[];
    createdAt: number;
    lastMessageAt?: number;
  };
  currentUserId: Id<"users">;
  unreadCount: number;
  isSelected: boolean;
  onClick: () => void;
}

function ConversationItem({
  conversation,
  currentUserId,
  unreadCount,
  isSelected,
  onClick,
}: ConversationItemProps) {
  const conversationDetails = useQuery(
    api.conversations.getConversationDetails,
    {
      conversationId: conversation._id,
    },
  );
  const lastMessage = useQuery(api.messages.getLastMessage, {
    conversationId: conversation._id,
  });

  if (!conversationDetails) {
    return null;
  }

  const otherParticipant = conversationDetails.participants.find(
    (p) => p?._id !== currentUserId,
  );

  const displayName = conversation.isGroup
    ? conversation.name || "Group Chat"
    : otherParticipant?.name || "Unknown User";

  const displayImage = conversation.isGroup ? null : otherParticipant?.imageUrl;

  const lastMessagePreview = lastMessage
    ? lastMessage.isDeleted
      ? "This message was deleted"
      : lastMessage.content
    : "No messages yet";

  const timestamp = conversation.lastMessageAt || conversation.createdAt;

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-accent transition-colors border-b border-border ${
        isSelected ? "bg-accent" : ""
      }`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {displayImage ? (
          <img
            src={displayImage}
            alt={displayName}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg font-semibold text-primary">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        {/* Online indicator for one-on-one chats */}
        {!conversation.isGroup && otherParticipant?.isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-black" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold truncate text-sm">{displayName}</h3>
          <span className="text-xs text-muted-foreground shrink-0 ml-2">
            {formatShortTimestamp(timestamp)}
          </span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-muted-foreground truncate flex-1">
            {lastMessagePreview}
          </p>
          {unreadCount > 0 && (
            <span className="ml-2 shrink-0 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full min-w-5 text-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
