import { paginate } from "../helpers/utils";
import { GenericActionCtx, GenericMutationCtx } from "convex/server";
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

//embedAll
export function getIdKey(entityType: string): string {
  return `${entityType.slice(0, -1)}Ids`; //is this needed? can't i just give the singluar for entities
}

export async function paginateAndEmbed(
  ctx: GenericActionCtx<DataModel>,
  entityType: TableNames,
) {
  await paginate(ctx, entityType, 20, async (items) => {
    await ctx.runAction(internal.ingest.embed.embedList, {
      [`${getIdKey(entityType)}`]: items.map((item) => item._id),
    });
  });
}
//embedList

export async function embedEntities(
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

export async function embedTexts(texts: string[]) {
  if (texts.length === 0) return [];
  const openai = new OpenAI();
  const { data } = await openai.embeddings.create({
    input: texts,
    model: "text-embedding-ada-002",
  });
  return data.map(({ embedding }) => embedding);
}

//deleteEmbeddings
type IndexName = "byFileId" | "byNoteId" | "byTaskId";
type FieldName = "fileId" | "noteId" | "taskId";

export async function processDeletion(
  idValue: Id<"notes"> | Id<"files"> | Id<"tasks">,
  indexName: IndexName,
  fieldName: FieldName,
  ctx: GenericMutationCtx<DataModel>,
) {
  const matches = await ctx.db
    .query("embeddings")
    .withIndex(indexName, (q) => q.eq(fieldName, idValue))
    .collect();

  for (const match of matches) {

    await ctx.db.delete(match._id);
  }

  const chunkMatches = await ctx.db
    .query("chunks")
    .withIndex(indexName, (q) => q.eq(fieldName, idValue))
    .filter((q) => q.neq(q.field("embeddingId"), null))
    .collect();

  for (const match of chunkMatches) {
  
    await ctx.db.delete(match._id);
  }
}

//extractors
//task extractor
export function generateTaskNarrative(taskArgs: Partial<Doc<"tasks">>): string {
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

//note extractor
export function parseTextFromJSON(jsonString: string) {
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
