import { ConvexError, v } from "convex/values";
import { internalMutation, mutation, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { internal } from "../_generated/api";
import { asyncMap } from "modern-async";
import { CharacterTextSplitter } from "langchain/text_splitter";
import {
  validateUserAndCompany,
  validateUserAndCompanyMutations,
} from "../helpers/utils";

export const fileChunker = internalMutation({
  args: {
    text: v.string(),
    args: v.object({
      fileUrl: v.string(),
      id: v.id("files"),
      author: v.string(),
      summary: v.string(),
      title: v.string(),
      uploadedAt: v.string(),
      category: v.string(),
      companyId: v.id("companies"),
    }),
  },
  handler: async (ctx, { text, args }) => {
    const splitter = new CharacterTextSplitter({
      chunkSize: 1536,
      chunkOverlap: 200,
    });

    const chunks = await splitter.createDocuments(
      [text],
      [
        {
          summary: args.summary,
          title: args.title,
          author: args.author,
          uploadedAt: args.uploadedAt,
          id: args.id,
          category: args.category,
        },
      ],

      {
        chunkHeader: `Document Title: ${args.title}  \n`,
        appendChunkOverlapHeader: true,
      },
    );

    await asyncMap(chunks, async (chunk: any) => {
      const chunkText = JSON.stringify(chunk);
      await ctx.db.insert("chunks", {
        fileId: args.id,
        text: chunkText,
        embeddingId: null,
        companyId: args.companyId,
      });
    });
  },
});

export const taskChunker = internalMutation({
  args: {
    text: v.string(),
    args: v.object({
      id: v.id("tasks"),
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
      actualTime: v.optional(v.number()),
      equityValue: v.optional(v.number()),
      notes: v.optional(v.string()),
      priority: v.optional(
        v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
      ),
      category: v.optional(v.string()),
      companyId: v.id("companies"),
    }),
  },
  handler: async (ctx, { text, args }) => {
    const latestVersion = await ctx.db.get(args.id);

    const hasChanged = latestVersion === null || latestVersion.text !== text;
    if (hasChanged) {
      await ctx.db.patch(args.id, { text });
      console.log(text);

      const splitter = new CharacterTextSplitter({
        chunkSize: 1536,
        chunkOverlap: 200,
      });

      const chunks = await splitter.createDocuments(
        [text],
        [
          {
            //summary: args.summary,
            title: args.title,
            assignees: args.assignees,
            dueDate: args.dueDate,
            id: args.id,
            category: args.category,
            priority: args.priority,
          },
        ],

        {
          chunkHeader: `This is a task: ${args.title}  \n`,
          appendChunkOverlapHeader: true,
        },
      );

      await asyncMap(chunks, async (chunk: any) => {
        const chunkText = JSON.stringify(chunk);
        await ctx.db.insert("chunks", {
          taskId: args.id,
          text: chunkText,
          embeddingId: null,
          companyId: args.companyId,
        });
      });
    }
  },
});

export const noteChunker = internalMutation({
  args: {
    text: v.string(),
    args: v.object({
      id: v.id("notes"),
      author: v.optional(v.array(v.string())),
      summary: v.string(),
      title: v.string(),
      uploadedAt: v.string(),
      category: v.string(),
      companyId: v.id("companies"),
      content: v.string(),
    }),
  },
  handler: async (ctx, { text, args }) => {
    const latestVersion = await ctx.db.get(args.id);

    const hasChanged = latestVersion === null || latestVersion.text !== text;
    if (hasChanged) {
      await ctx.db.patch(args.id, { text });

      const splitter = new CharacterTextSplitter({
        chunkSize: 1536,
        chunkOverlap: 200,
      });

      const chunks = await splitter.createDocuments(
        [text],
        [
          {
            summary: args.summary,
            title: args.title,
            author: args.author,
            uploadedAt: args.uploadedAt,
            id: args.id,
            category: args.category,
          },
        ],

        {
          chunkHeader: `This came from Notes. Title: ${args.title}  \n`,
          appendChunkOverlapHeader: true,
        },
      );

      await asyncMap(chunks, async (chunk: any) => {
        const chunkText = JSON.stringify(chunk);
        await ctx.db.insert("chunks", {
          noteId: args.id,
          text: chunkText,
          embeddingId: null,
          companyId: args.companyId,
        });
      });

      //in the future this should be decoupled from the chunker.

      await ctx.scheduler.runAfter(0, internal.ingest.embed.embedAll);
    }
  },
});
