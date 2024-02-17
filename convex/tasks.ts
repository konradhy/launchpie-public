import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { validateUserAndCompany } from "./helpers/utils";

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
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const { user, identity, company } = await validateUserAndCompany(
      ctx,
      "CompanyInformation",
    );

    const taskId = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      assignees: args.assignees || [user.linkedPersonId || ""],
      dueDate: args.dueDate || "No due date",
      estimatedTime: args.estimatedTime,
      taskState: args.taskState || "notStarted",
      reviewStatus: args.reviewStatus || "notFlagged",
      meetingAgendaFlag: args.meetingAgendaFlag || false,
      equityValue: args.equityValue,
      notes: args.notes,
      userId: identity.tokenIdentifier,
      companyId: company._id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: identity.tokenIdentifier,
      priority: args.priority || "low",
      category: args.category || "uncategorized",
      isArchived: false,
    });
    return taskId;
  },
});

export const getByCompanyId = query({
  handler: async (ctx) => {
    const { company } = await validateUserAndCompany(ctx, "CompanyInformation");

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_company", (q) => q.eq("companyId", company._id))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .take(100); //do some type of pagination solution otherwise switch to collect/all
    return tasks;
  },
});

export const update = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    assignees: v.optional(v.array(v.string())),
    dueDate: v.optional(v.string()),
    estimatedTime: v.optional(v.number()),
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
    equityValue: v.optional(v.number()),
    notes: v.optional(v.string()),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    ),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { user, identity, company } = await validateUserAndCompany(
      ctx,
      "CompanyInformation",
    );

    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new ConvexError("Task not found");
    }
    if (task.userId !== identity.tokenIdentifier) {
      throw new ConvexError("Unauthorized");
    }
    if (task.companyId !== company._id) {
      throw new ConvexError(
        "There is a company mismatch. Please contact support",
      );
    }
    const updatedTask = await ctx.db.patch(args.taskId, {
      title: args.title,
      description: args.description,
      assignees: args.assignees,
      dueDate: args.dueDate,
      estimatedTime: args.estimatedTime,
      taskState: args.taskState,
      reviewStatus: args.reviewStatus,
      meetingAgendaFlag: args.meetingAgendaFlag,
      equityValue: args.equityValue,
      notes: args.notes,
      updatedAt: new Date().toISOString(),
      updatedBy: identity.tokenIdentifier,
      priority: args.priority,
      category: args.category,
    });

    return updatedTask;
  },
});
