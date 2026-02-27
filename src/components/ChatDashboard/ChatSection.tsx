"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, ChevronDown, Trash2, ArrowLeft } from "lucide-react";
import { useUserSync } from "@/hooks/useUserSync";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { formatTimestamp } from "@/utils/dateUtils";
import MessageReactions from "./MessageReactions";
import TypingIndicator from "./TypingIndicator";
import { useRouter } from "next/navigation";

interface ChatSectionProps {
  recipientUserId?: Id<"users">;
  conversationId?: Id<"conversations">;
}

const ChatSection = ({ recipientUserId, conversationId }: ChatSectionProps) => {
  const { currentUser } = useUserSync();
  const [message, setMessage] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);
  const router = useRouter();

  // Get or create conversation
  const conversation = useQuery(
    api.conversations.getConversationDetails,
    conversationId ? { conversationId } : "skip",
  );

  // Get messages
  const messages = useQuery(
    api.messages.getMessages,
    conversationId ? { conversationId } : "skip",
  );

  // Get recipient user info
  const recipientUser = useQuery(
    api.users.getCurrentUser,
    recipientUserId && conversation
      ? {
          clerkId:
            conversation.participants.find((p) => p?._id === recipientUserId)
              ?.clerkId || "",
        }
      : "skip",
  );

  // Get typing users
  const typingUsers = useQuery(
    api.typing.getTypingUsers,
    conversationId && currentUser
      ? { conversationId, excludeUserId: currentUser._id }
      : "skip",
  );

  // Get reactions for all messages
  const messageReactions = useQuery(
    api.reactions.getMessagesReactions,
    messages ? { messageIds: messages.map((m) => m._id) } : "skip",
  );

  // Mutations
  const sendMessageMutation = useMutation(api.messages.sendMessage);
  const deleteMessageMutation = useMutation(api.messages.deleteMessage);
  const setTypingMutation = useMutation(api.typing.setTyping);
  const markAsReadMutation = useMutation(api.readStatus.markConversationAsRead);

  // Auto-scroll logic
  const scrollToBottom = (force = false) => {
    if (!messagesContainerRef.current) return;

    const container = messagesContainerRef.current;
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      100;

    if (force || isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setShowScrollButton(false);
    } else {
      setShowScrollButton(true);
    }
  };

  // Handle scroll detection
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;

    const container = messagesContainerRef.current;
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      100;

    setShowScrollButton(
      (!isNearBottom && messages && messages.length > 0) || false,
    );
    lastScrollTop.current = container.scrollTop;
  };

  // Scroll when new messages arrive
  useEffect(() => {
    if (messages && messages.length > 0) {
      const timer = setTimeout(() => scrollToBottom(), 100);
      return () => clearTimeout(timer);
    }
  }, [messages?.length]);

  // Mark as read when conversation opens or new messages arrive
  useEffect(() => {
    if (conversationId && currentUser && messages && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      void markAsReadMutation({
        conversationId,
        userId: currentUser._id,
        lastMessageId: lastMessage._id,
      });
    }
  }, [conversationId, currentUser, messages?.length, markAsReadMutation]);

  // Typing indicator
  useEffect(() => {
    if (message && conversationId && currentUser) {
      void setTypingMutation({
        conversationId,
        userId: currentUser._id,
      });
    }
  }, [message, conversationId, currentUser, setTypingMutation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !conversationId || !currentUser) return;

    try {
      await sendMessageMutation({
        conversationId,
        senderId: currentUser._id,
        content: message.trim(),
      });
      setMessage("");
      scrollToBottom(true);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleDeleteMessage = async (messageId: Id<"messages">) => {
    if (!currentUser) return;
    try {
      await deleteMessageMutation({
        messageId,
        userId: currentUser._id,
      });
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  // Empty state
  if (!conversation) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-semibold">Welcome to ChitChat</p>
          <p className="text-sm mt-2">
            Select a conversation or search for users to start chatting
          </p>
        </div>
      </div>
    );
  }

  const isGroupChat = conversation.isGroup;
  const otherParticipant = !isGroupChat
    ? conversation.participants.find((p) => p?._id === recipientUserId)
    : null;

  // Display info for header
  const displayName = isGroupChat
    ? conversation.name || "Group Chat"
    : otherParticipant?.name || "Unknown User";

  const displayImage = isGroupChat ? null : otherParticipant?.imageUrl;

  const displayStatus = isGroupChat
    ? `${conversation.participants.length} members`
    : otherParticipant?.isOnline
      ? "Online"
      : "Offline";

  return (
    <div className="flex flex-col h-full min-h-screen[calc(100vh-4rem)] ">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border  shrink-0">
        {/* Mobile back button */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          onClick={() => router.push("/chat")}
        >
          <ArrowLeft className="size-5" />
        </Button>

        {/* User info */}
        <div className="relative">
          {displayImage ? (
            <img
              src={displayImage}
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-semibold text-primary">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {!isGroupChat && otherParticipant?.isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-neutral-900" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">{displayName}</h3>
          <p className="text-xs text-muted-foreground">{displayStatus}</p>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {!messages || messages.length === 0 ? (
          <div className="text-center text-muted-foreground mt-8">
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-2">
              Send a message to start the conversation
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOwnMessage = msg.senderId === currentUser?._id;
            const showTimestamp =
              index === 0 ||
              msg.createdAt - messages[index - 1].createdAt > 300000; // 5 minutes

            return (
              <div key={msg._id}>
                {showTimestamp && (
                  <div className="text-center text-xs text-muted-foreground my-4">
                    {formatTimestamp(msg.createdAt)}
                  </div>
                )}
                <div
                  className={`flex gap-2 ${isOwnMessage ? "justify-end" : "justify-start"}`}
                >
                  {!isOwnMessage && (
                    <div className="shrink-0">
                      {msg.sender?.imageUrl ? (
                        <img
                          src={msg.sender.imageUrl}
                          alt={msg.sender.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-semibold text-primary">
                            {msg.sender?.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  <div
                    className={`flex flex-col max-w-[70%] ${isOwnMessage ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`group relative px-4 py-2 rounded-2xl ${
                        isOwnMessage
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted rounded-bl-sm"
                      }`}
                    >
                      {msg.isDeleted ? (
                        <p className="italic text-sm opacity-70 dark:text-black">
                          This message was deleted
                        </p>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap wrap-break-word text-black">
                          {msg.content}
                        </p>
                      )}
                      {isOwnMessage && !msg.isDeleted && (
                        <button
                          onClick={() => handleDeleteMessage(msg._id)}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-black/10 rounded"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      )}
                    </div>
                    {!msg.isDeleted && currentUser && (
                      <div className="mt-1">
                        <MessageReactions
                          messageId={msg._id}
                          reactions={messageReactions?.[msg._id] || []}
                          currentUserId={currentUser._id}
                          isOwnMessage={isOwnMessage}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {typingUsers && typingUsers.length > 0 && (
        <TypingIndicator typingUsers={typingUsers} />
      )}

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <div className="absolute bottom-24 right-8">
          <Button
            size="icon"
            variant="outline"
            onClick={() => scrollToBottom(true)}
            className="rounded-full shadow-lg"
          >
            <ChevronDown className="size-5" />
          </Button>
        </div>
      )}

      {/* Input Box at Bottom */}
      <div className="border-t p-4 dark:bg-accent-foreground  shrink-0">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 text-black dark:text-white"
          />
          <Button type="submit" size="icon" disabled={!message.trim()}>
            <Send className="size-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatSection;
