import { ConvexError, v } from "convex/values";

import { mutation, query } from "./_generated/server";

import {
  validateUserAndCompany,
  validateUserAndCompanyMutations,
} from "./helpers/utils";
import { internal } from "./_generated/api";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await validateUserAndCompanyMutations(ctx, "Records");

    return await ctx.storage.generateUploadUrl();
  },
});

export const createRecord = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, { storageId }) => {
    const { identity, company } = await validateUserAndCompanyMutations(
      ctx,
      "Records",
    );

    // let fileUrl = (await ctx.storage.getUrl(storageId)) as string;
    let fileUrl = (await ctx.storage.getUrl(
      "kg28zy3j5sp6kyt575k2vzcm056kzhph",
    )) as string;

    const recordId = await ctx.db.insert("records", {
      userId: identity.tokenIdentifier,
      audioFileId: storageId,
      audioFileUrl: fileUrl,
      generatingTranscript: true,
      generatingTitle: true,
      generatingActionItems: true,
      companyId: company._id,
    });
    await ctx.scheduler.runAfter(0, internal.whisper.chat, {
      fileUrl,
      id: recordId,
    });
    return recordId;
  },
});
