import { v } from "convex/values";
import { asyncMap } from "modern-async";
import OpenAI from "openai";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "../_generated/server";
import { paginate } from "../helpers";

//embedd all is only embeding documents that are named "documents" this should be considered during the refactorign to name this files.
//We'll also need similar functions for the notes and the tasks.
export const embedAll = internalAction({
  args: {},
  handler: async (ctx) => {
    await paginate(ctx, "files", 20, async (files) => {
      await ctx.runAction(internal.ingest.embed.embedList, {
        fileIds: files.map((file) => file._id),
      });
    });
  },
});

export const embedList = internalAction({
  args: {
    fileIds: v.array(v.id("files")),
  },
  handler: async (ctx, { fileIds }) => {
    const chunks = (
      await asyncMap(fileIds, (fileId) =>
        ctx.runQuery(internal.ingest.embed.chunksNeedingEmbedding, {
          fileId,
        }),
      )
    ).flat();

    const embeddings = await embedTexts(chunks.map((chunk) => chunk.text));
    await asyncMap(embeddings, async (embedding, i) => {
      const { _id: chunkId } = chunks[i];
      const { companyId } = chunks[i];
      await ctx.runMutation(internal.ingest.embed.addEmbedding, {
        chunkId,
        embedding,
        companyId,
      });
    });
  },
});

export const chunksNeedingEmbedding = internalQuery(
  async (ctx, { fileId }: { fileId: Id<"files"> }) => {
    const chunks = await ctx.db
      .query("chunks")
      .withIndex("byFileId", (q) => q.eq("fileId", fileId))
      .collect();
    return chunks.filter((chunk) => chunk.embeddingId === null);
  },
);

export const addEmbedding = internalMutation(
  async (
    ctx,
    {
      chunkId,
      embedding,
      companyId,
    }: {
      chunkId: Id<"chunks">;
      embedding: number[];
      companyId: Id<"companies">;
    },
  ) => {
    const embeddingId = await ctx.db.insert("embeddings", {
      embedding,
      chunkId,
      companyId,
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
