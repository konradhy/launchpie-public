import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { query } from "./_generated/server";
import { internal } from "./_generated/api";
import { validateUserAndCompanyMutations } from "./helpers/utils";

export const list = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("bySessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();
  },
});

export const send = mutation({
  args: {
    message: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, { message, sessionId }) => {
    console.log("send message");
    const identity = await ctx.auth.getUserIdentity();
    console.log("identity", identity);
    const { company } = await validateUserAndCompanyMutations(ctx, "Files");

    await ctx.db.insert("messages", {
      isViewer: true,
      text: message,
      sessionId,
    });
    await ctx.scheduler.runAfter(0, internal.serve.answer, {
      sessionId,
      companyId: company._id,
    });
  },
});

export const clear = mutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("bySessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();
    await Promise.all(messages.map((message) => ctx.db.delete(message._id)));
  },
});
