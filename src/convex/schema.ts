import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User profiles synced from Clerk
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    isOnline: v.boolean(),
    lastSeen: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_online_status", ["isOnline"]),

  // Conversations (both one-on-one and group)
  conversations: defineTable({
    isGroup: v.boolean(),
    name: v.optional(v.string()), // For group chats
    participantIds: v.array(v.id("users")),
    createdAt: v.number(),
    lastMessageAt: v.optional(v.number()),
  })
    .index("by_participants", ["participantIds"])
    .index("by_last_message", ["lastMessageAt"]),

  // Messages in conversations
  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    isDeleted: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_conversation", ["conversationId", "createdAt"])
    .index("by_sender", ["senderId"]),

  // Message reactions
  reactions: defineTable({
    messageId: v.id("messages"),
    userId: v.id("users"),
    emoji: v.string(),
    createdAt: v.number(),
  })
    .index("by_message", ["messageId"])
    .index("by_user_and_message", ["userId", "messageId"]),

  // Typing indicators
  typingIndicators: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    expiresAt: v.number(),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_user_and_conversation", ["userId", "conversationId"])
    .index("by_expiration", ["expiresAt"]),

  // Read status for messages
  readStatus: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    lastReadMessageId: v.optional(v.id("messages")),
    lastReadAt: v.number(),
  })
    .index("by_user_and_conversation", ["userId", "conversationId"])
    .index("by_conversation", ["conversationId"]),
});
