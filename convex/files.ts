//refactor so that files trash works the same as notes trash/archve
//refactor so that files are stored in a different table
import { ConvexError, v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

import {
  validateUserAndCompany,
  validateUserAndCompanyMutations,
} from "./helpers/utils";

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
    const { identity } = await validateUserAndCompanyMutations(ctx, "Files");
    //configure to save multiple files
    //temporarily throw an error if it's not a docx. Maybe do it on frontend?

    //saves the files to the database
    const fileIds = await Promise.all(
      args.uploaded.map((file) =>
        ctx.db.insert("files", {
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

    //I need to iterate over the files, as it stands right now, the ChatBot will only be trained on the first file that you give it.
    const storageId = args.uploaded[0].storageId;

    //manual hack was used here for typing fix properly later, see earlier note
    const fileUrl = await ctx.storage.getUrl(storageId as Id<"_storage">);
    if (!fileUrl) {
      throw new ConvexError({
        message: "File not found",
        severity: "low",
      });
    }

    //call internal action, passing the files one at a time
    await ctx.scheduler.runAfter(0, internal.ingest.extract.extractTextFile, {
      fileUrl: fileUrl,
      id: fileIds[0],
      author: identity.name || "",
      summary: "",
      title: args.uploaded[0].fileName,
      uploadedAt: new Date().toISOString(),
      category: "file",
      companyId: args.companyId,
    });
  },
});

export const getSearch = query({
  handler: async (ctx) => {
    const { company } = await validateUserAndCompany(ctx, "CompanyInformation");

    const companyFiles = await ctx.db
      .query("files")
      .filter((q) => q.eq(q.field("companyId"), company._id))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .collect();

    return companyFiles;
  },
});

//this is done wrong. I should find the company using the companyId that's saved in the documents schema
//then use that to grab the company and check if the user is associated with the company
export const archive = mutation({
  args: { id: v.id("files") },
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
    id: v.id("files"),
  },
  handler: async (ctx, args) => {
    const { company } = await validateUserAndCompany(ctx, "CompanyInformation");
    const file = await ctx.db.get(args.id);

    //find the file with the storageId

    if (!file) {
      throw new ConvexError({
        message: "File not found",
        severity: "low",
      });
    }
    if (file.companyId !== company._id) {
      throw new ConvexError({
        message:
          "There is a mismatch between your company and the file's company",
        severity: "low",
      });
    }

    const url = await ctx.storage.getUrl(file.storageId as Id<"_storage">);

    return url;
  },
});

export const patchFileSummary = internalMutation({
  args: {
    id: v.id("files"),
    summary: v.string(),
  },
  handler: async (ctx, { id, summary }) => {
    await ctx.db.patch(id, {
      summary: summary,
    });
  },
});
