import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Mark conversation as read
export const markConversationAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    lastMessageId: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const readStatus = await ctx.db
      .query("readStatus")
      .withIndex("by_user_and_conversation", (q) =>
        q.eq("userId", args.userId).eq("conversationId", args.conversationId),
      )
      .first();

    if (readStatus) {
      await ctx.db.patch(readStatus._id, {
        lastReadMessageId: args.lastMessageId,
        lastReadAt: Date.now(),
      });
    } else {
      await ctx.db.insert("readStatus", {
        conversationId: args.conversationId,
        userId: args.userId,
        lastReadMessageId: args.lastMessageId,
        lastReadAt: Date.now(),
      });
    }
  },
});

// Get unread count for a conversation
export const getUnreadCount = query({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const readStatus = await ctx.db
      .query("readStatus")
      .withIndex("by_user_and_conversation", (q) =>
        q.eq("userId", args.userId).eq("conversationId", args.conversationId),
      )
      .first();

    const lastReadAt = readStatus?.lastReadAt ?? 0;

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .collect();

    const unreadMessages = messages.filter(
      (msg) => msg.createdAt > lastReadAt && msg.senderId !== args.userId,
    );

    return unreadMessages.length;
  },
});

// Get unread counts for all user's conversations
export const getAllUnreadCounts = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const conversations = await ctx.db.query("conversations").collect();
    const userConversations = conversations.filter((conv) =>
      conv.participantIds.includes(args.userId),
    );

    const unreadCounts: Record<string, number> = {};

    for (const conversation of userConversations) {
      const readStatus = await ctx.db
        .query("readStatus")
        .withIndex("by_user_and_conversation", (q) =>
          q.eq("userId", args.userId).eq("conversationId", conversation._id),
        )
        .first();

      const lastReadAt = readStatus?.lastReadAt ?? 0;

      const messages = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) =>
          q.eq("conversationId", conversation._id),
        )
        .collect();

      const unreadMessages = messages.filter(
        (msg) => msg.createdAt > lastReadAt && msg.senderId !== args.userId,
      );

      unreadCounts[conversation._id] = unreadMessages.length;
    }

    return unreadCounts;
  },
});
