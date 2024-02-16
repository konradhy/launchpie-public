import { v, ConvexError } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

export const store = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error(
        "Store user was called, however identification was not found.",
      );
    }

    //Did we already store this identity?
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (user !== null) {
      // If we've seen this identity before but the name or email has changed, patch the value. Follow this pattern for any other fields you want to keep in sync.

      if (user.name !== identity.name) {
        await ctx.db.patch(user._id, { name: identity.name });
      }
      if (user.email !== identity.email) {
        await ctx.db.patch(user._id, { email: identity.email });
      }
      return user._id;
    }
    // So I need to fix this up
    //I no longer use these calue
    return await ctx.db.insert("users", {
      name: identity.name!,
      tokenIdentifier: identity.tokenIdentifier,
      credits: 0,
      membership: "free",
      email: identity.email!,
    });
  },
});

export const addCompanyId = internalMutation({
  args: {
    companyId: v.id("companies"),
    userClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    //find user by userClerkId

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.userClerkId))
      .unique();

    if (user === null) {
      throw new ConvexError({
        message: "User not found",
        severity: "low",
      });
    }
    //add companyId to user
    await ctx.db.patch(user._id, { companyId: args.companyId });
  },
});
