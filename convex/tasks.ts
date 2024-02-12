import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

//we have an issue here. Because we get companyId from the client, then anyone, once they know the company could create a task for that company.
//maybe we need to make a helper function. to handle the associated user/userid check


export const create = mutation({
  args: {
    title: v.optional(v.string()),
    description: v.string(),
    assignees: v.optional(v.array(v.string())),
    dueDate: v.optional(v.string()),
    estimatedTime: v.number(),
    taskState: v.optional(
      v.union(
        v.literal("notStarted"),
        v.literal("inProgress"),
        v.literal("completed"),
      ),
    ),
    reviewStatus: v.optional(
      v.union(
        v.literal("notFlagged"),
        v.literal("flagged"),
        v.literal("approved"),
      ),
    ),
    meetingAgendaFlag: v.optional(v.boolean()),
    equityValue: v.number(),
    notes: v.optional(v.string()),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    ),
    category: v.optional(v.string()),
    companyId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
         throw new ConvexError({
            message: "You must be logged in to get shareholder details.",
            severity: "low",
        });
    
    }
    const userId = identity.subject;

    const taskId = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      assignees: args.assignees || [userId],
      dueDate: args.dueDate || "No due date",
      estimatedTime: args.estimatedTime,
      taskState: args.taskState || "notStarted",
      reviewStatus: args.reviewStatus || "notFlagged",
      meetingAgendaFlag: args.meetingAgendaFlag || false,
      equityValue: args.equityValue,
      notes: args.notes,
      userId: userId,
      companyId: args.companyId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: userId,
      priority: args.priority || "low",
      category: args.category || "uncategorized",
      isArchived: false,
    });
    return taskId;
  },
});

export const getByCompanyId = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
         throw new ConvexError({
            message: "You must be logged in to get shareholder details.",
            severity: "low",
        });

  
    }
    //search for the company by the userId which is the identity.subject
    const company = await ctx.db
      .query("companies")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!company) {
      //search for the company via the associatedUsers
      //if not found then throw an error
      throw new ConvexError("Company not found. Did you delete your company?");
    }

    
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_company", (q) => q.eq("companyId", company._id))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .take(100); //do some type of pagination solution otherwise switch to collect/all
    return tasks;
  },
});
