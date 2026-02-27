import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Set typing indicator
export const setTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const expiresAt = Date.now() + 3000; // 3 seconds

    // Check if typing indicator already exists
    const existing = await ctx.db
      .query("typingIndicators")
      .withIndex("by_user_and_conversation", (q) =>
        q.eq("userId", args.userId).eq("conversationId", args.conversationId),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { expiresAt });
    } else {
      await ctx.db.insert("typingIndicators", {
        conversationId: args.conversationId,
        userId: args.userId,
        expiresAt,
      });
    }
  },
});

// Get typing users in a conversation
export const getTypingUsers = query({
  args: {
    conversationId: v.id("conversations"),
    excludeUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const typingIndicators = await ctx.db
      .query("typingIndicators")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .collect();

    const validTypingIndicators = typingIndicators.filter(
      (indicator) =>
        indicator.expiresAt > now && indicator.userId !== args.excludeUserId,
    );

    const typingUsers = await Promise.all(
      validTypingIndicators.map((indicator) => ctx.db.get(indicator.userId)),
    );

    return typingUsers.filter((user) => user !== null);
  },
});

// Clean up expired typing indicators (runs periodically)
export const cleanupExpiredTypingIndicators = mutation({
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query("typingIndicators")
      .withIndex("by_expiration")
      .collect();

    const toDelete = expired.filter((indicator) => indicator.expiresAt <= now);

    for (const indicator of toDelete) {
      await ctx.db.delete(indicator._id);
    }
  },
});
