"use node";

import { internalAction, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
var mammoth = require("mammoth"); //because of the convex environment realities
import { Buffer } from "buffer";
import {
  generateTaskNarrative,
  parseTextFromJSON,
} from "../helpers/ingestHelpers";

export const extractTextFile = internalAction({
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

    await ctx.runMutation(internal.ingest.chunkers.fileChunker, {
      text: text,
      args: args,
    });

    //grab the first 1000 characters of the text

    const summary = text.substring(0, 1000);

    // This will output the first 1000 characters of the original string.

    await ctx.runAction(internal.helpers.promptHelpers.generateFileSummary, {
      transcript: summary,
      fileId: args.id,
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

    await ctx.runMutation(internal.ingest.chunkers.noteChunker, {
      text: extractedTexts.join("\n"),
      args: args,
    });
  },
});

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
    await ctx.runMutation(internal.ingest.chunkers.taskChunker, {
      text: taskNarrative,
      args: args,
    });

    return taskNarrative;
  },
});
