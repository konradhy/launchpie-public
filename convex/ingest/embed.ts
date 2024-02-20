import { ConvexError, v } from "convex/values";
import { asyncMap } from "modern-async";
import OpenAI from "openai";
import { internal } from "../_generated/api";
import { DataModel, Doc, Id, TableNames } from "../_generated/dataModel";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "../_generated/server";
import { paginate } from "../helpers";
import { GenericActionCtx, SystemTableNames } from "convex/server";

function getIdKey(entityType: string): string {
  return `${entityType.slice(0, -1)}Ids`; //is this needed? can't i just give the singluar for entities
}

async function paginateAndEmbed(
  ctx: GenericActionCtx<DataModel>,
  entityType: TableNames,
) {
  await paginate(ctx, entityType, 20, async (items) => {
    await ctx.runAction(internal.ingest.embed.embedList, {
      [`${getIdKey(entityType)}`]: items.map((item) => item._id),
    });
  });
}

async function embedEntities(
  ctx: GenericActionCtx<DataModel>,
  idKey: string,
  ids: string[],
) {
  let chunks: Doc<"chunks">[] = [];

  if (ids.length > 0) {
    chunks = (
      await asyncMap(ids, (id) =>
        ctx.runQuery(internal.ingest.embed.chunksNeedingEmbedding, {
          [idKey]: id,
        }),
      )
    ).flat();

    const embeddings = await embedTexts(chunks.map((chunk) => chunk.text));

    await asyncMap(embeddings, async (embedding, i) => {
      const chunk = chunks[i];

      await ctx.runMutation(internal.ingest.embed.deleteEmbeddings, {
        [idKey]: chunk[idKey as keyof typeof chunk],
      });
    });

    await asyncMap(embeddings, async (embedding, i) => {
      const chunk = chunks[i];

      await ctx.runMutation(internal.ingest.embed.deleteEmbeddings, {
        [idKey]: chunk[idKey as keyof typeof chunk],
      });

      await ctx.runMutation(internal.ingest.embed.addEmbedding, {
        chunkId: chunk._id,
        embedding,
        companyId: chunk.companyId,
        [idKey]: chunk[idKey as keyof typeof chunk],
      });
    });
  }
}

export const embedAll = internalAction({
  args: {},
  handler: async (ctx) => {
    const entities = ["tasks", "notes", "files"];
    for (const entity of entities) {
      await paginateAndEmbed(ctx, entity as TableNames);
    }
  },
});

//why aren't these mutations?
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

export async function embedTexts(texts: string[]) {
  if (texts.length === 0) return [];
  const openai = new OpenAI();
  const { data } = await openai.embeddings.create({
    input: texts,
    model: "text-embedding-ada-002",
  });
  return data.map(({ embedding }) => embedding);
}

type IndexName = "byFileId" | "byNoteId" | "byTaskId";
type FieldName = "fileId" | "noteId" | "taskId";

export const deleteEmbeddings = internalMutation({
  args: {
    fileId: v.optional(v.id("files")),
    noteId: v.optional(v.id("notes")),
    taskId: v.optional(v.id("tasks")),
  },
  handler: async (ctx, { fileId, noteId, taskId }) => {
    console.log(fileId, noteId, taskId);
    console.log("Deleting embeddings");

    async function processDeletion(
      idValue: Id<"notes"> | Id<"files"> | Id<"tasks">,
      indexName: IndexName,
      fieldName: FieldName,
    ) {
      const matches = await ctx.db
        .query("embeddings")
        .withIndex(indexName, (q) => q.eq(fieldName, idValue))
        .collect();

      for (const match of matches) {
        console.log("attempt here to delete embeddings");
        await ctx.db.delete(match._id);
      }

      const chunkMatches = await ctx.db
        .query("chunks")
        .withIndex(indexName, (q) => q.eq(fieldName, idValue))
        .filter((q) => q.neq(q.field("embeddingId"), null))
        .collect();

      for (const match of chunkMatches) {
        console.log("attempt here to delete chunks that are not embedded");
        await ctx.db.delete(match._id);
      }
    }

    try {
      if (fileId) await processDeletion(fileId, "byFileId", "fileId");
      if (noteId) await processDeletion(noteId, "byNoteId", "noteId");
      if (taskId) await processDeletion(taskId, "byTaskId", "taskId");

      console.log("All items deleted successfully");
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
