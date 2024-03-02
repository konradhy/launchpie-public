import { ConvexError, v } from "convex/values";

import { Id, TableNames } from "../_generated/dataModel";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
} from "../_generated/server";

import {
  embedEntities,
  paginateAndEmbed,
  processDeletion,
} from "../helpers/ingestHelpers";

export const embedAll = internalAction({
  args: {},
  handler: async (ctx) => {
    const entities = ["tasks", "notes", "files"];
    for (const entity of entities) {
      await paginateAndEmbed(ctx, entity as TableNames);
    }
  },
});


//Can't stay like this, localize to imbedding only your own companyId
export const embedAllTemp = action({
  args: {
  
  },
  handler: async (ctx) => {
    const entities = ["tasks", "notes", "files"];
    for (const entity of entities) {
      await paginateAndEmbed(ctx, entity as TableNames);
    }
  },
});

export const embedList = internalAction({
  args: {
    fileIds: v.optional(v.array(v.id("files"))),
    noteIds: v.optional(v.array(v.id("notes"))),
    taskIds: v.optional(v.array(v.id("tasks"))),
  },
  handler: async (ctx, { fileIds, noteIds, taskIds }) => {
    if (fileIds) {
      await embedEntities(ctx, "fileId", fileIds);
    }
    if (noteIds) {
      await embedEntities(ctx, "noteId", noteIds);
    }
    if (taskIds) {
      await embedEntities(ctx, "taskId", taskIds);
    }
  },
});

export const chunksNeedingEmbedding = internalQuery(
  async (
    ctx,
    {
      fileId,
      noteId,
      taskId,
    }: { fileId?: Id<"files">; noteId?: Id<"notes">; taskId?: Id<"tasks"> },
  ) => {
    if (fileId) {
      const chunks = await ctx.db
        .query("chunks")
        .withIndex("byFileId", (q) => q.eq("fileId", fileId))
        .collect();
      return chunks.filter((chunk) => chunk.embeddingId === null);
    }
    if (noteId) {
      const chunks = await ctx.db
        .query("chunks")
        .withIndex("byNoteId", (q) => q.eq("noteId", noteId))
        .collect();
      return chunks.filter((chunk) => chunk.embeddingId === null);
    }

    if (taskId) {
      const chunks = await ctx.db
        .query("chunks")
        .withIndex("byTaskId", (q) => q.eq("taskId", taskId))
        .collect();
      return chunks.filter((chunk) => chunk.embeddingId === null);
    }
    throw new Error("fileId, taskId or noteId must be provided");
  },
);

export const addEmbedding = internalMutation(
  async (
    ctx,
    {
      chunkId,
      embedding,
      companyId,
      noteId,
      taskId,
      fileId,
    }: {
      chunkId: Id<"chunks">;
      embedding: number[];
      companyId: Id<"companies">;
      noteId?: Id<"notes">;
      taskId?: Id<"tasks">;
      fileId?: Id<"files">;
    },
  ) => {
    const embeddingId = await ctx.db.insert("embeddings", {
      embedding,
      chunkId,
      companyId,
      noteId,
      taskId,
      fileId,
    });
    await ctx.db.patch(chunkId, { embeddingId });
  },
);

export const deleteEmbeddings = internalMutation({
  args: {
    fileId: v.optional(v.id("files")),
    noteId: v.optional(v.id("notes")),
    taskId: v.optional(v.id("tasks")),
  },
  handler: async (ctx, { fileId, noteId, taskId }) => {


    try {
      if (fileId) await processDeletion(fileId, "byFileId", "fileId", ctx);
      if (noteId) await processDeletion(noteId, "byNoteId", "noteId", ctx);
      if (taskId) await processDeletion(taskId, "byTaskId", "taskId", ctx);


    } catch (error) {
      throw new ConvexError({
        message: "Failed to delete embeddings",
        severity: "low",
      });
    }

    if (!fileId && !noteId && !taskId) {
      throw new ConvexError(
        "At least one of fileId, noteId, or taskId must be provided",
      );
    }
  },
});
