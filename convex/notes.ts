import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import {
  validateUserAndCompany,
  validateUserAndCompanyMutations,
} from "./helpers/utils";

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
    const identity = await ctx.auth.getUserIdentity();

    if (!args.noteId) {
      return null;
    }
    const note = await ctx.db.get(args.noteId);

    if (!note) {
      return null;
    }

    if (note.isPublished && !note.isArchived) {
      return note;
    }

    if (!identity) {
      return;
    }

    const userId = identity.tokenIdentifier;
    const userEmail = identity.email;

    if (
      note.userId !== userId &&
      !note.editors?.includes(userEmail as string)
    ) {
      throw new Error("Unauthorized");
    }

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
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const userId = identity.tokenIdentifier;
    const userEmail = identity.email;

    const { id, editor, ...rest } = args;
    //break
    const existingNote = await ctx.db.get(args.id);

    if (!existingNote) {
      throw new Error("Not found");
    }

    if (
      existingNote.userId !== userId &&
      !existingNote.editors?.includes(userEmail as string)
    ) {
      throw new Error("Unauthorized");
    }

    const existingEditors = existingNote.editors || [];

    //Consider refactoring. Perhaps i should have a separate function that handles adding editors.
    //only the creators should have the power to add editors or permanently delete a document
    if (editor) {
      if (!existingEditors.includes(editor)) {
        existingEditors.push(editor);
        const updatedNote = await ctx.db.patch(id, {
          ...rest,
          editors: existingEditors,
        });

        return updatedNote;
      } else {
        throw new Error("Editor already has access");
      }
    }

    const note = await ctx.db.patch(args.id, {
      ...rest,
    });

    return note;
  },
});

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
