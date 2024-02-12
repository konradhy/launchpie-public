//After we refactor the code base so that launchpad lives alone we can leverage how we used to use Documents and just take their trash page. From there we'll be able to perma delete files and restore them
//refactor so that files are stored in a different table
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";


export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    return await ctx.storage.generateUploadUrl();
  },
});


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
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError({
        message: "You must be logged in to upload a file. Please log in and try again.",
        severity: "low",
      })
    }

    const existingCompany = await ctx.db.get(args.companyId);
    if (!existingCompany) {
      throw new ConvexError({
        message: "Company not found. Was the company deleted?",
        severity: "low",
      
      })
    }

    if (existingCompany.userId !== identity.subject) {
      throw new ConvexError({
        message: "Something went wrong.",
        severity: "low",
      
      });
    }

    const files = existingCompany.files || [];
    const newFiles = files.concat(
      args.uploaded.map((upload) => ({
        storageId: upload.storageId,
        userId: identity.subject,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        fileName: upload.fileName,
        isArchived: false,
        isPublished: false,
      })),
    );

    ctx.db.patch(args.companyId, {
      files: newFiles,
    });
  },
});


export const getSearch = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError({
        message: "You must be logged in to search for files.",
        severity: "low",
      });
    }

    const userId = identity.subject;

    const company = await ctx.db
      .query("companies")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!company) {
        throw new ConvexError({
            message: "We couldn't find the company you are looking for.",
            severity: "low",
        });
    }

    if (company.userId !== userId && !company.associatedUsers?.includes(userId)) {
      throw new ConvexError({
        message: "Something went wrong",
        severity: "low"
      });
    }

    const files = company.files?.filter((file) => !file.isArchived);

    return files;
  },
});

export const archive = mutation({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError({
        message: "You must be logged in to archive a file.",
        severity: "low",
        
      })
    }

    const userId = identity.subject;

    const company = await ctx.db
      .query("companies")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!company) {
        throw new ConvexError({
            message: "We couldn't find the company you are looking for.",
            severity: "low",
        });
    }

    //file must belong to the user or to an associated user
    if (company.userId !== userId && !company.associatedUsers?.includes(userId)) {
      throw new ConvexError({
        message: "Something went wrong",
        severity: "low"
      });
    }

    //find the file with the storageId
    const file = company.files?.find(
      (file) => file.storageId === args.storageId,
    );

    if (!file) {
        throw new ConvexError({
            message: "File not found. Was the file deleted?",
            severity: "low",
        });
    }

    //archive the file
    file.isArchived = true;

    //update the company
    ctx.db.patch(company._id, {
      files: company.files,
    });
  },
});

export const serveFile = query({
  args: {
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
    throw new ConvexError({
        message: "You must be logged in to view a file.",
        severity: "low",
    });
    }

    const userId = identity.subject;

    const company = await ctx.db
      .query("companies")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!company) {
        throw new ConvexError({
            message: "We couldn't find the company you are looking for.",
            severity: "low",
        });
    }

    //file must belong to the user or to an associated user
    if (company.userId !== userId && !company.associatedUsers?.includes(userId)) {
      throw new ConvexError({
        message: "Something went wrong",
        severity: "low"
      });
    }
    //find the file with the storageId
    const file = company.files?.find(
      (file) => file.storageId === args.storageId,
    );

    if (!file) {
      throw new Error("File not found");
    }

    const url = await ctx.storage.getUrl(file.storageId as Id<"_storage">);

    //generate the file url
    return url;
  },
});
