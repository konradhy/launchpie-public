import { ConvexError, v } from "convex/values";

import { internalMutation, mutation, query } from "./_generated/server";
import { asyncMap } from "modern-async";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { validateUserAndCompanyMutations } from "./helpers/utils";
import { internal } from "./_generated/api";

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

    //check the stack to see how they handled the url, to make sure we were only doing it for one page at a time. I think i need to do a similar thing,
    //but with the document Id

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

//starts the embedding process
export const updateNoteText = mutation({
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
