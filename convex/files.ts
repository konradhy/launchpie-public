//After we refactor the code base so that launchpad lives alone we can leverage how we used to use Documents and just take their trash page. From there we'll be able to perma delete files and restore them
//refactor so that files are stored in a different table
import { ConvexError, v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { asyncMap } from "modern-async";
import {
  RecursiveCharacterTextSplitter,
  CharacterTextSplitter,
} from "langchain/text_splitter";
import { validateUserAndCompany } from "./helpers/utils";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    return await ctx.storage.generateUploadUrl();
  },
});

//rename to save file
//update to switch from storageID being a string to it being the proper id type
export const saveStorageIds = mutation({
  args: {
    uploaded: v.array(
      v.object({
        storageId: v.string(),
        fileName: v.string(),
      }),
    ),

    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const { identity } = await validateUserAndCompany(ctx, "Files");
    //configure to save multiple files

    const fileIds = await Promise.all(
      args.uploaded.map((file) =>
        ctx.db.insert("documents", {
          storageId: file.storageId,
          fileName: file.fileName,
          userId: identity.tokenIdentifier,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isArchived: false,
          isPublished: false,
          companyId: args.companyId,
        }),
      ),
    );

    const storageId = args.uploaded[0].storageId;
    //manual hack was used here for typing fix properly later
    const fileUrl = await ctx.storage.getUrl(storageId as Id<"_storage">);
    if (!fileUrl) {
      throw new ConvexError({
        message: "File not found",
        severity: "low",
      });
    }

    //call internal action, passing the files one at a time
    await ctx.scheduler.runAfter(0, internal.ingest.extract.extractText, {
      fileUrl: fileUrl,
      id: fileIds[0],
      author: identity.name || "",
      summary: "",
      title: args.uploaded[0].fileName,
      uploadedAt: new Date().toISOString(),
      category: "document",
    });
  },
});

export const getSearch = query({
  handler: async (ctx) => {
    const { company } = await validateUserAndCompany(ctx, "CompanyInformation");

    const companyFiles = await ctx.db
      .query("documents")
      .filter((q) => q.eq(q.field("companyId"), company._id))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .collect();

    return companyFiles;
  },
});

//this is done wrong. I should find the company using the companyId that's saved in the documents schema
//then use that to grab the company and check if the user is associated with the company
export const archive = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    await validateUserAndCompany(ctx, "Files");

    await ctx.db.patch(args.id, {
      isArchived: true,
    });
  },
});

//this is done wrong. I should grab the companyId that's saved in the file
//then use that to grab the company and check if the user is associated with the company
export const serveFile = query({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    await validateUserAndCompany(ctx, "CompanyInformation");

    const document = await ctx.db.get(args.id);

    //find the file with the storageId

    if (!document) {
      throw new ConvexError({
        message: "File not found",
        severity: "low",
      });
    }

    const url = await ctx.storage.getUrl(document.storageId as Id<"_storage">);

    return url;
  },
});

export const chunker = internalMutation({
  args: {
    text: v.string(),
    args: v.object({
      fileUrl: v.string(),
      id: v.id("documents"),
      author: v.string(),
      summary: v.string(),
      title: v.string(),
      uploadedAt: v.string(),
      category: v.string(),
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
        documentId: args.id,
        text: chunkText,
        embeddingId: null,
      });
    });
  },
});

export const saveChunks = internalMutation({
  args: {
    chunks: v.string(),
    id: v.id("documents"),
  },
  handler: async (ctx, { chunks, id }) => {
    console.log("chunks", chunks);
    await asyncMap(chunks, async (chunk: any) => {
      console.log("chunk", chunk);
      // await ctx.db.insert("chunks", {
      //   documentId: id,
      //   text: chunk ,
      //   embeddingId: null,
      // });
    });
  },
});

//the only thing that checks if you're authenticated in when you go to the dashboard is the upload files  search thing
