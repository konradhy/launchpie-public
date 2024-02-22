import { DataModel, Doc, Id } from "../_generated/dataModel";
import {
  GenericQueryCtx,
  UserIdentity,
  GenericMutationCtx,
  GenericActionCtx,
} from "convex/server";
import { ConvexError, GenericId, v } from "convex/values";
import { Auth } from "convex/server";

enum ErrorMessage {
  Files = "You must be logged in to access files.",
  Notes = "You must be logged in to access notes.",
  CompanyInformation = "You must be logged in to access company information.",
  Records = "You must be logged in to access recordings.",
}

export async function validateUserAndCompany(
  ctx: GenericQueryCtx<DataModel>,
  errorContext: keyof typeof ErrorMessage,
): Promise<{
  user: Doc<"users">;
  company: Doc<"companies">;
  identity: UserIdentity;
}> {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError({
      message: ErrorMessage[errorContext],
      severity: "low",
    });
  }

  const userId = identity.tokenIdentifier;
  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q: any) => q.eq("tokenIdentifier", userId))
    .unique();

  if (!user) {
    throw new Error("Unauthenticated call to mutation");
  }
  if (!user.companyId) {
    throw new ConvexError({
      message: "You must be associated with a company to perform this action",
      severity: "low",
    });
  }

  const company = await ctx.db.get(user.companyId);
  if (!company) {
    throw new ConvexError({
      message: "We couldn't find the company you are looking for.",
      severity: "low",
    });
  }

  if (company.userId !== userId && !company.associatedUsers?.includes(userId)) {
    throw new ConvexError({
      message: "You do not have permission to perform this action.",
      severity: "low",
    });
  }

  return { user, company, identity };
}

export async function validateUserAndCompanyMutations(
  ctx: GenericMutationCtx<DataModel>,
  errorContext: keyof typeof ErrorMessage,
): Promise<{
  user: Doc<"users">;
  company: Doc<"companies">;
  identity: UserIdentity;
}> {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError({
      message: ErrorMessage[errorContext],
      severity: "low",
    });
  }

  const userId = identity.tokenIdentifier;
  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q: any) => q.eq("tokenIdentifier", userId))
    .unique();

  if (!user) {
    throw new Error("Unauthenticated call to mutation");
  }
  if (!user.companyId) {
    throw new ConvexError({
      message: "You must be associated with a company to perform this action",
      severity: "low",
    });
  }

  const company = await ctx.db.get(user.companyId);
  if (!company) {
    throw new ConvexError({
      message: "We couldn't find the company you are looking for.",
      severity: "low",
    });
  }

  if (company.userId !== userId && !company.associatedUsers?.includes(userId)) {
    throw new ConvexError({
      message: "You do not have permission to perform this action.",
      severity: "low",
    });
  }

  return { user, company, identity };
}

async function getUserId(ctx: { auth: Auth }) {
  const authInfo = await ctx.auth.getUserIdentity();
  return authInfo?.tokenIdentifier;
}

//actions can't access the db. i'd need to schedule a runQuery
export async function validateUserAndCompanyActions(
  ctx: GenericActionCtx<DataModel>,
  errorContext: keyof typeof ErrorMessage,
): Promise<{
  identity: UserIdentity;
}> {
  //does identiyy work in actions?
  const identity = await ctx.auth.getUserIdentity();
  console.log("testing to see if identity works in actions: ");
  console.log(identity);

  if (!identity) {
    throw new ConvexError({
      message: ErrorMessage[errorContext],
      severity: "low",
    });
  }

  return { identity };
}

export async function validateNoteAccessMutation(
  id: Id<"notes">,
  company: Doc<"companies">,
  ctx: GenericMutationCtx<DataModel>,
) {
  const note = await ctx.db.get(id);
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
  return note;
}

export async function validateNoteAccess(
  id: Id<"notes">,
  company: Doc<"companies">,
  ctx: GenericQueryCtx<DataModel>,
) {
  const note = await ctx.db.get(id);
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
  return note;
}
