"use node";
/*
1. User uploads file and we store in file server. We call an internal action called extractText, passing it the fileUrl
2. The extractText internal action fetches the file, extracts the text
3. We store the text in the vector database (Uthe has changed/latestversion configuration seen in the updateDocument function in the  convex-ai-chat repo willbe useful for when i'm doing notes. Instead of Url, we'll be passing the text along with the file id)
4. Switch to contextual chunk headers. Ask for guideance in a langchain discord
*/
import { internalAction, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

import { internal } from "../_generated/api";

var mammoth = require("mammoth");
import { Buffer } from "buffer";

export const extractText = internalAction({
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
