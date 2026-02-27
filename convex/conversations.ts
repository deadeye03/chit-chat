import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create or get existing one-on-one conversation
export const createOrGetConversation = mutation({
  args: {
    participantIds: v.array(v.id("users")),
    isGroup: v.optional(v.boolean()),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const isGroup = args.isGroup ?? false;

    if (!isGroup && args.participantIds.length !== 2) {
      throw new Error(
        "One-on-one conversation must have exactly 2 participants",
      );
    }

    // For one-on-one, check if conversation already exists
    if (!isGroup) {
      const existingConversations = await ctx.db
        .query("conversations")
        .collect();

      const existing = existingConversations.find((conv) => {
        if (conv.isGroup || conv.participantIds.length !== 2) return false;
        const sortedExisting = [...conv.participantIds].sort();
        const sortedNew = [...args.participantIds].sort();
        return sortedExisting.every((id, i) => id === sortedNew[i]);
      });

      if (existing) {
        return existing._id;
      }
    }

    // Create new conversation
    const conversationId = await ctx.db.insert("conversations", {
      isGroup,
      name: args.name,
      participantIds: args.participantIds,
      createdAt: Date.now(),
    });

    // Initialize read status for all participants
    for (const participantId of args.participantIds) {
      await ctx.db.insert("readStatus", {
        conversationId,
        userId: participantId,
        lastReadAt: Date.now(),
      });
    }

    return conversationId;
  },
});

// Get all conversations for a user
export const getUserConversations = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const conversations = await ctx.db.query("conversations").collect();

    const userConversations = conversations.filter((conv) =>
      conv.participantIds.includes(args.userId),
    );

    // Sort by last message time
    return userConversations.sort((a, b) => {
      const aTime = a.lastMessageAt ?? a.createdAt;
      const bTime = b.lastMessageAt ?? b.createdAt;
      return bTime - aTime;
    });
  },
});

// Get conversation details with participants
export const getConversationDetails = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return null;

    const participants = await Promise.all(
      conversation.participantIds.map((id) => ctx.db.get(id)),
    );

    return {
      ...conversation,
      participants: participants.filter((p) => p !== null),
    };
  },
});

// Update conversation's last message time
export const updateLastMessageTime = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: Date.now(),
    });
  },
});

// Get conversation by participants (for one-on-one)
export const getConversationByParticipants = query({
  args: {
    participantIds: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    if (args.participantIds.length !== 2) {
      return null;
    }

    const existingConversations = await ctx.db.query("conversations").collect();

    const existing = existingConversations.find((conv) => {
      if (conv.isGroup || conv.participantIds.length !== 2) return false;
      const sortedExisting = [...conv.participantIds].sort();
      const sortedNew = [...args.participantIds].sort();
      return sortedExisting.every((id, i) => id === sortedNew[i]);
    });

    return existing ?? null;
  },
});
