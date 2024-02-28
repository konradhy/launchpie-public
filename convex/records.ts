import { v } from "convex/values";

import { mutation } from "./_generated/server";

import { validateUserAndCompanyMutations } from "./helpers/utils";
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
    const { user, identity, company } = await validateUserAndCompanyMutations(
      ctx,
      "Records",
    );

    let fileUrl = (await ctx.storage.getUrl(storageId)) as string;
    if (!user.linkedPersonId) {
      throw new Error("User must be linked to a person to create a record");
    }

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
      companyId: company._id,
      defaultAssignee: user.linkedPersonId,
    });
    return recordId;
  },
});
