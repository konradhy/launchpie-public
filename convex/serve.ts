import { v } from "convex/values";
import { asyncMap } from "modern-async";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { embedTexts } from "./helpers/ingestHelpers";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const OPENAI_MODEL = "gpt-3.5-turbo"; // switch to gpt4 for presentation

export const answer = internalAction({
  args: {
    sessionId: v.string(),
    companyId: v.id("companies"),
  },
  handler: async (ctx, { sessionId, companyId }) => {
    const messages = await ctx.runQuery(internal.serve.getMessages, {
      sessionId,
    });
    const lastUserMessage = messages.at(-1)!.text;

    const [embedding] = await embedTexts([lastUserMessage]);

    // limit to only embeddings that have the right companyId
    const searchResults = await ctx.vectorSearch("embeddings", "byEmbedding", {
      vector: embedding,
      limit: 8,
      filter: (q) => q.eq("companyId", companyId),
    });

    const relevantDocuments = await ctx.runQuery(internal.serve.getChunks, {
      embeddingIds: searchResults.map(({ _id }) => _id),
    });


    const company = await ctx.runQuery(internal.companies.getByIdInternal, {
      id: companyId,
    });

    const groupedTasks = await ctx.runQuery(
      internal.dashboard.equityCard.internalEquityDetails,
      {
        id: companyId,
      },
    );
    const messageId = await ctx.runMutation(internal.serve.addBotMessage, {
      sessionId,
    });

    const mapGroupedTasksToString = (
      //@ts-ignore
      groupedTasks,
    ) =>
      Object.entries(groupedTasks)
        .map(
          //@ts-ignore
          ([key, { totalEquityValue, firstName, lastName }]) =>
            `Key: ${key}, Total EquityValue: ${totalEquityValue}, First Name: ${firstName}, Last Name: ${lastName}`,
        )
        .join("\n");

    const shareholderInfo = mapGroupedTasksToString(groupedTasks);

    try {
      const openai = new OpenAI();
      const stream = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        stream: true,
        messages: [
          {
            role: "system",
            content:
              "Answer the user question based on the provided documents. These documents will be from the tasks database, the upload database or the notes database. Check the heading to know which one.  " +
              "or report that the question cannot be answered based on " +
              "these documents. Keep the answer informative but brief, " +
              "do not enumerate all possibilities. " +
              `While answering the questions you should note the following. The company name is ${company?.companyName}, they are in ${company?.industry}, and engage in the following activities: ${company?.companyActivities}. Note the current, accurate shareholder information, that is their ID, their names and their current total equity value in dollars: ${shareholderInfo} `,
          },
          ...(relevantDocuments.map(({ text }) => ({
            role: "system",
            content: "Relevant document:\n\n" + text,
          })) as ChatCompletionMessageParam[]),
          ...(messages.map(({ isViewer, text }) => ({
            role: isViewer ? "user" : "assistant",
            content: text,
          })) as ChatCompletionMessageParam[]),
        ],
      });
      let text = "";
      for await (const { choices } of stream) {
        const replyDelta = choices[0].delta.content;
        if (typeof replyDelta === "string" && replyDelta.length > 0) {
          text += replyDelta;
          await ctx.runMutation(internal.serve.updateBotMessage, {
            messageId,
            text,
          });
        }
      }
    } catch (error: any) {
      await ctx.runMutation(internal.serve.updateBotMessage, {
        messageId,
        text: "I'm a bit confused. I can't respond right now. Please reach out to support at support@launchpie.com",
      });
      throw error;
    }
  },
});

export const getMessages = internalQuery(
  async (ctx, { sessionId }: { sessionId: string }) => {
    return await ctx.db
      .query("messages")
      .withIndex("bySessionId", (q) => q.eq("sessionId", sessionId))
      .collect();
  },
);

export const getChunks = internalQuery(
  async (ctx, { embeddingIds }: { embeddingIds: Id<"embeddings">[] }) => {
    return await asyncMap(
      embeddingIds,
      async (embeddingId) =>
        (await ctx.db
          .query("chunks")
          .withIndex("byEmbeddingId", (q) => q.eq("embeddingId", embeddingId))
          .unique())!,
    );
  },
);

export const addBotMessage = internalMutation(
  async (ctx, { sessionId }: { sessionId: string }) => {
    return await ctx.db.insert("messages", {
      isViewer: false,
      text: "",
      sessionId,
    });
  },
);

export const updateBotMessage = internalMutation(
  async (
    ctx,
    { messageId, text }: { messageId: Id<"messages">; text: string },
  ) => {
    await ctx.db.patch(messageId, { text });
  },
);
