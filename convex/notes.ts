import { ConvexError, v } from "convex/values";

import { mutation, query } from "./_generated/server";

import {
  validateNoteAccess,
  validateNoteAccessMutation,
  validateUserAndCompany,
  validateUserAndCompanyMutations,
} from "./helpers/utils";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";

export const archive = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const { identity, company } = await validateUserAndCompanyMutations(
      ctx,
      "Notes",
    );
    const existingNotes = await validateNoteAccessMutation(
      args.id,
      company,
      ctx,
    );
    const recursiveArchive = async (noteId: Id<"notes">) => {
      const children = await ctx.db
        .query("notes")
        .withIndex("by_user_parent", (q) =>
          q.eq("userId", identity.tokenIdentifier).eq("parentNote", noteId),
        )
        .collect();

      for (const child of children) {
        await ctx.db.patch(child._id, {
          isArchived: true,
        });

        await recursiveArchive(child._id);
      }
    };

    const note = await ctx.db.patch(args.id, {
      isArchived: true,
    });

    recursiveArchive(args.id);

    return note;
  },
});

//flag
export const getSidebar = query({
  args: {
    parentNote: v.optional(v.id("notes")),
  },
  handler: async (ctx, args) => {
    const { identity, company } = await validateUserAndCompany(ctx, "Notes");

    const userId = identity.subject;

    //replace userId with companyId

    const notes = await ctx.db
      .query("notes")
      .withIndex("by_user_parent", (q) =>
        q.eq("userId", userId).eq("parentNote", args.parentNote),
      )
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();

    return notes;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    parentNote: v.optional(v.id("notes")),
  },
  handler: async (ctx, args) => {
    const { identity, company } = await validateUserAndCompanyMutations(
      ctx,
      "CompanyInformation",
    );

    const note = await ctx.db.insert("notes", {
      title: args.title,
      parentNote: args.parentNote,
      userId: identity.tokenIdentifier,
      isArchived: false,
      isPublished: false,
      companyId: company._id,
    });

    return note;
  },
});

export const getById = query({
  args: { noteId: v.optional(v.id("notes")) },
  handler: async (ctx, args) => {
    const { identity, company } = await validateUserAndCompany(ctx, "Notes");

    if (!args.noteId) {
      throw new ConvexError({
        message: "Note not found",
        severity: "low",
      });
    }
    const note = await validateNoteAccess(args.noteId, company, ctx);

    if (!note) {
      throw new ConvexError({
        message: "Note not found",
        severity: "low",
      });
    }

    // if (note.isPublished || !note.isArchived) {
    //   throw new ConvexError({
    //     message: "Note not found",
    //     severity: "low",
    //   });
    // }

    return note;
  },
});

export const update = mutation({
  args: {
    id: v.id("notes"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
    editor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { identity, company } = await validateUserAndCompanyMutations(
      ctx,
      "Notes",
    );
    const existingNote = await validateNoteAccessMutation(
      args.id,
      company,
      ctx,
    );

    const userId = identity.tokenIdentifier;

    const { id, editor, ...rest } = args;
    //break

    const note = await ctx.db.patch(args.id, {
      ...rest,
    });

    return note;
  },
});

///// redundant?
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const generateImageUrl = mutation({
  args: { id: v.id("_storage") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const imageUrl = await ctx.storage.getUrl(args.id);

    return imageUrl;
  },
});
/////

//starts the embedding process
export const chunkNoteText = mutation({
  args: {
    id: v.id("notes"),
  },
  handler: async (ctx, { id }) => {
    const { identity, company } = await validateUserAndCompanyMutations(
      ctx,
      "Notes",
    );
    //grab the note

    const note = await ctx.db.get(id);

    if (!note) {
      throw new ConvexError({
        message: "Note not found",
        severity: "low",
      });
    }
    const content = note.content;

    if (!content || !note.title) {
      throw new ConvexError({
        message: "Note has no content or title",
        severity: "low",
      });
    }

    await ctx.scheduler.runAfter(0, internal.ingest.extract.extractTextNote, {
      content,
      id: note._id,
      author: note.editors,
      summary: "",
      title: note.title,
      uploadedAt: new Date().toISOString(),
      category: "note",
      companyId: company._id,
    });
  },
});

//Inefficient to two of these (the second one being in files).
//I can improve how we had notes file saving.

export const saveCoverImageStorageIds = mutation({
  args: {
    noteId: v.id("notes"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, { noteId, storageId }) => {
    const { company } = await validateUserAndCompanyMutations(ctx, "Notes");

    const note = await ctx.db.get(noteId);
    if (!note) {
      throw new ConvexError({
        message: "Note not found",
        severity: "low",
      });
    }

    if (note.companyId !== company._id) {
      throw new ConvexError({
        message: "Unauthorized to view this note. Company mismatch",
        severity: "low",
      });
    }

    const coverImage = await ctx.storage.getUrl(storageId);
    if (!coverImage) {
      throw new ConvexError({
        message: "File not found",
        severity: "low",
      });
    }

    await ctx.db.patch(noteId, {
      coverImage,
    });
  },
});

export const getTrash = query({
  handler: async (ctx) => {
    const { identity, company } = await validateUserAndCompany(ctx, "Notes");

    const notes = await ctx.db
      .query("notes")
      .withIndex("by_company", (q) => q.eq("companyId", company._id))
      .filter((q) => q.eq(q.field("isArchived"), true))
      .order("desc")
      .collect();

    return notes;
  },
});

//flag
export const restore = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const { identity, company } = await validateUserAndCompanyMutations(
      ctx,
      "Notes",
    );

    const existingNote = await validateNoteAccessMutation(
      args.id,
      company,
      ctx,
    );

    //replace with companyId
    const recursiveRestore = async (noteId: Id<"notes">) => {
      const children = await ctx.db
        .query("notes")
        .withIndex("by_user_parent", (q) =>
          q.eq("userId", identity.tokenIdentifier).eq("parentNote", noteId),
        )
        .collect();

      for (const child of children) {
        await ctx.db.patch(child._id, {
          isArchived: false,
        });

        await recursiveRestore(child._id);
      }
    };

    const options: Partial<Doc<"notes">> = {
      isArchived: false,
    };

    if (existingNote.parentNote) {
      const parent = await ctx.db.get(existingNote.parentNote);
      if (parent?.isArchived) {
        options.parentNote = undefined;
      }
    }

    const note = await ctx.db.patch(args.id, options);

    recursiveRestore(args.id);

    return note;
  },
});

export const remove = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const { identity, company } = await validateUserAndCompanyMutations(
      ctx,
      "Notes",
    );

    await validateNoteAccessMutation(args.id, company, ctx);

    await ctx.db.delete(args.id);

    return true;
  },
});

export const getSearch = query({
  handler: async (ctx) => {
    const { identity, company } = await validateUserAndCompany(ctx, "Notes");

    const notes = await ctx.db
      .query("notes")
      .withIndex("by_company", (q) => q.eq("companyId", company._id))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();

    return notes;
  },
});

export const removeIcon = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const { identity, company } = await validateUserAndCompanyMutations(
      ctx,
      "Notes",
    );

    await validateNoteAccessMutation(args.id, company, ctx);

    await ctx.db.patch(args.id, {
      icon: undefined,
    });

    return true;
  },
});

export const removeCoverImage = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const { identity, company } = await validateUserAndCompanyMutations(
      ctx,
      "Notes",
    );

    await validateNoteAccessMutation(args.id, company, ctx);

    await ctx.db.patch(args.id, {
      coverImage: undefined,
    });

    return true;
  },
});

export const searchNotes = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const { identity, company } = await validateUserAndCompany(ctx, "Notes");

    return await ctx.db
      .query("notes")
      .withSearchIndex("search_content", (q) =>
        q
          .search("content", args.query)
          .eq("companyId", company._id)
          .eq("isArchived", false),
      )
      .take(5);
  },
});
