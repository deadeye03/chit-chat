import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Sync or create user from Clerk
export const syncUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
      });
      return existingUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      isOnline: false,
      lastSeen: Date.now(),
    });

    return userId;
  },
});

// Get current user
export const getCurrentUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

// Get all users except current user
export const getAllUsers = query({
  args: { currentUserId: v.id("users") },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect();
    return users.filter((user) => user._id !== args.currentUserId);
  },
});

// Search users by name
export const searchUsers = query({
  args: {
    searchTerm: v.string(),
    currentUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect();
    const searchLower = args.searchTerm.toLowerCase();

    return users.filter(
      (user) =>
        user._id !== args.currentUserId &&
        (user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)),
    );
  },
});

// Update online status
export const updateOnlineStatus = mutation({
  args: {
    userId: v.id("users"),
    isOnline: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      isOnline: args.isOnline,
      lastSeen: Date.now(),
    });
  },
});
