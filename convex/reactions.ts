import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Toggle a reaction on a message
export const toggleReaction = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already reacted with this emoji
    const existing = await ctx.db
      .query("reactions")
      .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("emoji"), args.emoji),
        ),
      )
      .first();

    if (existing) {
      // Remove reaction
      await ctx.db.delete(existing._id);
      return null;
    } else {
      // Add reaction
      const reactionId = await ctx.db.insert("reactions", {
        messageId: args.messageId,
        userId: args.userId,
        emoji: args.emoji,
        createdAt: Date.now(),
      });
      return reactionId;
    }
  },
});

// Get reactions for a message
export const getMessageReactions = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
      .collect();

    // Group by emoji and count
    const reactionMap = new Map<
      string,
      { emoji: string; count: number; userIds: Array<string> }
    >();

    for (const reaction of reactions) {
      const existing = reactionMap.get(reaction.emoji);
      if (!existing) {
        reactionMap.set(reaction.emoji, {
          emoji: reaction.emoji,
          count: 1,
          userIds: [reaction.userId as string],
        });
      } else {
        existing.count++;
        existing.userIds.push(reaction.userId as string);
      }
    }

    return Array.from(reactionMap.values());
  },
});

// Get reactions for multiple messages (batch)
export const getMessagesReactions = query({
  args: { messageIds: v.array(v.id("messages")) },
  handler: async (ctx, args) => {
    const allReactions = await ctx.db.query("reactions").collect();

    const messageReactions: Record<
      string,
      Array<{ emoji: string; count: number; userIds: Array<string> }>
    > = {};

    // Initialize empty arrays for each message
    for (const messageId of args.messageIds) {
      messageReactions[messageId] = [];
    }

    // Group reactions by message and emoji
    const tempMaps = new Map<
      string,
      Map<string, { emoji: string; count: number; userIds: Array<string> }>
    >();

    for (const reaction of allReactions) {
      if (args.messageIds.includes(reaction.messageId)) {
        const msgId = reaction.messageId;

        if (!tempMaps.has(msgId)) {
          tempMaps.set(msgId, new Map());
        }

        const emojiMap = tempMaps.get(msgId)!;
        const existing = emojiMap.get(reaction.emoji);

        if (!existing) {
          emojiMap.set(reaction.emoji, {
            emoji: reaction.emoji,
            count: 1,
            userIds: [reaction.userId as string],
          });
        } else {
          existing.count++;
          existing.userIds.push(reaction.userId as string);
        }
      }
    }

    // Convert Maps to arrays
    for (const [msgId, emojiMap] of tempMaps.entries()) {
      messageReactions[msgId] = Array.from(emojiMap.values());
    }

    return messageReactions;
  },
});
