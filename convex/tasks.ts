import { internalMutation, mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import {
  validateUserAndCompany,
  validateUserAndCompanyMutations,
} from "./helpers/utils";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { getAll } from "convex-helpers/server/relationships";

//get task by id
export const getTaskById = query({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const { company } = await validateUserAndCompany(ctx, "CompanyInformation");

    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new ConvexError("Task not found");
    }

    if (task.companyId !== company._id) {
      throw new ConvexError(
        "There is a company mismatch. Please contact support, while getting task by id",
      );
    }

    return task;
  },
});

export const create = mutation({
  args: {
    title: v.optional(v.string()),
    description: v.string(),
    assignees: v.optional(v.array(v.string())), //shouldn't be optional
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

    notes: v.optional(v.string()),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    ),
    category: v.optional(v.string()),
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const { user, identity, company } = await validateUserAndCompanyMutations(
      ctx,
      "CompanyInformation",
    );
    if (!user.linkedPersonId) {
      throw new ConvexError(
        "You must be associated with a person to create a task",
      );
    }

    const taskId = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      assignees:
        args.assignees && args.assignees.length > 0
          ? args.assignees.map((assignee) => assignee as Id<"persons">)
          : [user.linkedPersonId as Id<"persons">],
      dueDate: args.dueDate || "No due date",
      estimatedTime: args.estimatedTime,
      taskState: args.taskState || "notStarted",
      reviewStatus: args.reviewStatus || "notFlagged",
      meetingAgendaFlag: args.meetingAgendaFlag || false,
      equityValue: 0,
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

    await ctx.scheduler.runAfter(0, internal.ingest.extract.extractTextTask, {
      args: {
        ...args,
        id: taskId,
        assignees:
          args.assignees && args.assignees.length > 0
            ? args.assignees.map(
                (assignee: string) => assignee as Id<"persons">,
              )
            : [user.linkedPersonId as Id<"persons">],
      },
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
    // assignees: v.optional(v.array(v.string())), //commented out because on the frontend I have trouble populating the default value
    dueDate: v.optional(v.string()),
    estimatedTime: v.optional(v.any()), //change to number after debug
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
    const { identity, company } = await validateUserAndCompany(
      ctx,
      "CompanyInformation",
    );

    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new ConvexError("Task not found");
    }

    if (task.companyId !== company._id) {
      throw new ConvexError(
        "There is a company mismatch. Please contact support",
      );
    }

    const updatedTask = await ctx.db.patch(args.taskId, {
      title: args.title,
      description: args.description,
      // assignees: args.assignees,
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

    await ctx.scheduler.runAfter(0, internal.ingest.extract.extractTextTask, {
      args: {
        ...args,
        id: args.taskId,
        companyId: company._id,
      },
    });

    //delete stale embeddings and chunks

    return updatedTask;
  },
});

export const completeTask = mutation({
  args: {
    taskId: v.id("tasks"),
    taskState: v.literal("completed"),
    notes: v.optional(v.string()),
    actualTime: v.number(),
    meetingAgendaFlag: v.optional(v.boolean()),
    equityValue: v.optional(v.number()), // remove

    reviewStatus: v.optional(
      v.union(
        v.literal("notFlagged"),
        v.literal("flagged"),
        v.literal("approved"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const { identity, company } = await validateUserAndCompany(
      ctx,
      "CompanyInformation",
    );

    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new ConvexError("Task not found");
    }

    if (task.companyId !== company._id) {
      throw new ConvexError(
        "There is a company mismatch. Please contact support",
      );
    }

    const tv = await ctx.scheduler.runAfter(
      0,
      internal.tasks.calculateTheoreticalValue,
      {
        assignees: task.assignees,
        actualTime: args.actualTime,
        taskId: args.taskId,
        companyId: company._id,
        totalPieValue: company.totalPieValue,
      },
    );

    await ctx.db.patch(args.taskId, {
      taskState: args.taskState,
      updatedAt: new Date().toISOString(),
      updatedBy: identity.tokenIdentifier,
      notes: args.notes,
      actualTime: args.actualTime,
      meetingAgendaFlag: args.meetingAgendaFlag,
    });

    const updatedTask = await ctx.db.get(args.taskId);
    //equity value isn't being saved yet.
    if (!updatedTask) {
      throw new ConvexError("Task not found, even though it just updated");
    }
    const {
      _id,
      _creationTime,
      createdAt,
      isArchived,
      text,
      updatedAt,
      updatedBy,
      userId,
      ...rest
    } = updatedTask;

    // instead of passing in these args we grab the tasks full details from the db, that we we can pass max info.
    //also we don't need to check if there has been a change. If you ran from complete then it's done
    //We also need to delete the embeddings who's task id is the same as the task id being updated
    await ctx.scheduler.runAfter(0, internal.ingest.extract.extractTextTask, {
      args: {
        ...rest,

        id: args.taskId,
        companyId: company._id,
      },
    });
    console.log("Ran it and done the scheudler");
  },
});

//calculate the theoritical value of a task which is hr * actual time
//get the hr from the first person assigned to the task and multiply it by the actual time when the task is being completed
//this is an internal mutation called by the completeTask mutation

export const calculateTheoreticalValue = internalMutation({
  args: {
    assignees: v.array(v.id("persons")),
    actualTime: v.number(),
    taskId: v.id("tasks"),
    companyId: v.id("companies"),
    totalPieValue: v.number(),
  },
  handler: async (ctx, args) => {
    const assigneeDetails = await getAll(ctx.db, args.assignees);

    if (assigneeDetails.length === 0) {
      throw new Error("No assignees found");
    }

    let totalTheoreticalValue = 0;
    const timePerAssignee = args.actualTime / assigneeDetails.length;

    for (const assignee of assigneeDetails) {
      if (!assignee || assignee.hourlyRate === undefined) {
        // Handle the case where assignee is null or missing hourlyRate

        console.error(
          `Assignee: ${assignee?.firstName}- ${assignee?._id}  - is missing or lacks an hourly rate.`,
        );

        continue;
      }

      // Calculate the theoretical value for this assignee and add it to the total
      totalTheoreticalValue += assignee.hourlyRate * timePerAssignee;
    }

    await ctx.db.patch(args.taskId, {
      equityValue: totalTheoreticalValue,
    });

    //add the theoretical value to the company's total pie value. We already know the company's total pie value from the args

    await ctx.db.patch(args.companyId, {
      totalPieValue: args.totalPieValue + totalTheoreticalValue,
    });

    //update the tv to each assigness personal equity value. If there are multiple, then we divde the total by the number of assignees

    const tvPerAssignee = totalTheoreticalValue / assigneeDetails.length;
    await Promise.all(
      assigneeDetails.map(async (assignee) => {
        if (!assignee) {
          return;
        }

        await ctx.db.patch(assignee._id, {
          equity: assignee.equity + tvPerAssignee,
        });
      }),
    );
  },
});

export const patchTaskTitle = internalMutation({
  args: {
    taskId: v.id("tasks"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, {
      title: args.title,
    });
  },
});
