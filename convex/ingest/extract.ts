"use node";

import { internalAction, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

import { internal } from "../_generated/api";

var mammoth = require("mammoth");
import { Buffer } from "buffer";

export const extractTextFile = internalAction({
  //their fitchSingle
  args: {
    fileUrl: v.string(),
    id: v.id("files"),
    author: v.string(),
    summary: v.string(),
    title: v.string(),
    uploadedAt: v.string(),
    category: v.string(),
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const response = await fetch(args.fileUrl);
    if (!response.ok) {
      throw new Error("Failed to download file");
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;

    await ctx.runMutation(internal.files.chunker, {
      text: text,
      args: args,
    });

    return text;
  },
});

export const extractTextNote = internalAction({
  args: {
    content: v.string(),
    id: v.id("notes"),
    author: v.optional(v.array(v.string())),
    summary: v.string(),
    title: v.string(),
    uploadedAt: v.string(),
    category: v.string(),
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const extractedTexts = parseTextFromJSON(args.content);

    await ctx.runMutation(internal.notes.chunker, {
      text: extractedTexts.join("\n"),
      args: args,
    });

    console.log("extractTextNote", extractedTexts);
  },
});

function parseTextFromJSON(jsonString: string) {
  const parsedData = JSON.parse(jsonString);
  const texts: string[] = [];

  parsedData.forEach(
    (item: { content?: { type?: string; text?: string }[] }) => {
      if (item.content && item.content.length > 0) {
        item.content.forEach((contentItem) => {
          if (contentItem.type === "text" && contentItem.text) {
            texts.push(contentItem.text.trim());
          }
        });
      }
    },
  );

  return texts;
}

interface TaskArgs {
  title?: string;
  description?: string;
  dueDate?: string;
  estimatedTime?: number;
  taskState?: "notStarted" | "inProgress" | "completed";
  reviewStatus?: "notFlagged" | "flagged" | "approved";
  meetingAgendaFlag?: boolean;
  equityValue?: number;
  notes?: string;
  priority?: "low" | "medium" | "high";
  category?: string;
  assignees?: Id<"persons">[];
  actualTime?: number;
}

function generateTaskNarrative(taskArgs: TaskArgs): string {
  let narrative = "Task Details:\n";

  if (taskArgs.title) {
    narrative += `- Title: ${taskArgs.title}\n`;
  }
  if (taskArgs.description) {
    narrative += `- Description: ${taskArgs.description}\n`;
  }
  if (taskArgs.dueDate) {
    narrative += `- Due Date: ${taskArgs.dueDate}\n`;
  }
  if (taskArgs.estimatedTime !== undefined) {
    narrative += `- Estimated Time: ${taskArgs.estimatedTime} hours\n`;
  }
  if (taskArgs.taskState) {
    narrative += `- Task State. This is important. It's how we know if the task is done: ${taskArgs.taskState}\n`;
  }
  if (taskArgs.reviewStatus) {
    narrative += `- Review Status.: ${taskArgs.reviewStatus}\n`;
  }
  if (taskArgs.meetingAgendaFlag !== undefined) {
    narrative += `- Meeting Agenda Flag: ${taskArgs.meetingAgendaFlag ? "This should be included as an action point in the next meeting" : "No"}\n`;
  }
  if (taskArgs.equityValue !== undefined) {
    narrative += `- Equity Value: $${taskArgs.equityValue}\n`;
  }
  if (taskArgs.notes) {
    narrative += `- Notes: ${taskArgs.notes}\n`;
  }
  if (taskArgs.priority) {
    narrative += `- Priority: ${taskArgs.priority}\n`;
  }
  if (taskArgs.category) {
    narrative += `- Category: ${taskArgs.category}\n`;
  }
  if (taskArgs.assignees) {
    narrative += `- The following people are assigned to this task: ${taskArgs.assignees}\n`;
  }
  if (taskArgs.actualTime) {
    narrative += `- It took this many hours to complete the task: ${taskArgs.actualTime}\n`;
  }

  return narrative;
}

export const extractTextTask = internalAction({
  args: {
    args: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
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
      assignees: v.optional(v.array(v.id("persons"))),
      companyId: v.id("companies"),
      id: v.id("tasks"),
      actualTime: v.optional(v.number()),
    }),
  },
  handler: async (ctx, { args }) => {
    const taskNarrative = generateTaskNarrative(args);

    console.log("we re updating");
    await ctx.runMutation(internal.tasks.chunker, {
      text: taskNarrative,
      args: args,
    });

    return taskNarrative;
  },
});
