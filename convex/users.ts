import { v, ConvexError } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

export const store = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error(
        "Store user was called, however identification was not found.",
      );
    }

    //Did we already store this identity?
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (user !== null) {
      // If we've seen this identity before but the name or email has changed, patch the value. Follow this pattern for any other fields you want to keep in sync.

      if (user.name !== identity.name) {
        await ctx.db.patch(user._id, { name: identity.name });
      }
      if (user.email !== identity.email) {
        await ctx.db.patch(user._id, { email: identity.email });
      }
      return user._id;
    }
    // So I need to fix this up
    //I no longer use these calue
    return await ctx.db.insert("users", {
      name: identity.name!,
      tokenIdentifier: identity.tokenIdentifier,
      credits: 0,
      membership: "free",
      email: identity.email!,
    });
  },
});

//Used when the user has either (a) just created a company and checked yes this shareholder is me in the onbarding, (b) Click settings -> associated users -> this is me
//(c) just clicked the create new account button. I.e. creating an account for the first time. Maybe this is the same point as (a)

//It runs when you click the create new account button.
/*
By allowing



*/

export const initializeAssociatedUser = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error(
        "Store user was called, however identification was not found. Are you logged in?",
      );
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (user === null) {
      throw new ConvexError({
        message: "User not found",
        severity: "low",
      });
    }

    const person = await ctx.db
      .query("persons")
      .withIndex("by_email", (q) => q.eq("email", user.email))
      .unique();

    if (person === null) {
      throw new ConvexError({
        message:
          "there are no users that match your email. Ensure you log in with the email address set by the project manager.",
        severity: "low",
      });
    }

    await ctx.scheduler.runAfter(0, internal.users.bindUserToCompany, {
      companyId: person.companyId,
      userClerkId: identity.tokenIdentifier,
      personId: person._id,
    });
  },
});

export const bindUserToCompany = internalMutation({
  args: {
    companyId: v.id("companies"),
    userClerkId: v.string(),
    personId: v.optional(v.id("persons")),
  },
  handler: async (ctx, args) => {
    //find user by userClerkId

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.userClerkId))
      .unique();

    if (user === null) {
      throw new ConvexError({
        message: "User not found",
        severity: "low",
      });
    }
    //add companyId to user but only if it's empty
    if (!user.companyId !== undefined) {
      await ctx.db.patch(user._id, { companyId: args.companyId });
    }

    //add user id to the companies associated users. However, we check if the user is already associated with the company
    if (args.companyId) {
      const company = await ctx.db.get(args.companyId);
      if (company === null) {
        throw new ConvexError({
          message: "Company not found",
          severity: "low",
        });
      }
      //check if associatedUsers is empty
      if (company.associatedUsers === undefined) {
        company.associatedUsers = [];
      }

      //check if the user is already associated with the company
      if (!company.associatedUsers.includes(args.userClerkId)) {
        //add user Id to a companies associatedUser array
        company.associatedUsers.push(args.userClerkId);

        await ctx.db.patch(args.companyId, {
          associatedUsers: company.associatedUsers,
        });
      }
    }

    if (args.personId) {
      const person = await ctx.db.get(args.personId);
      if (person === null) {
        throw new ConvexError({
          message: "Person not found",
          severity: "low",
        });
      }
      //check if associatedUserr is empty
      if (!person.linkedUserId) {
        person.linkedUserId = user._id;
      }

      await ctx.db.patch(person._id, {
        linkedUserId: person.linkedUserId,
        companyId: args.companyId,
      });

      await ctx.db.patch(user._id, { linkedPersonId: person._id });
      return;
    }

    //search for person with your email
    const person = await ctx.db
      .query("persons")
      .withIndex("by_email", (q) => q.eq("email", user.email))
      .unique();
    if (person === null) {
      return;
    }
    //check if associatedUserr is empty
    if (!person.linkedUserId) {
      person.linkedUserId = args.userClerkId;
    }

    if (!person.companyId) {
      person.companyId = args.companyId;
    }
    await ctx.db.patch(person._id, {
      linkedUserId: person.linkedUserId,
      companyId: person.companyId,
    });

    await ctx.scheduler.runAfter(0, internal.users.bindUserToCompany, {
      companyId: args.companyId,
      userClerkId: args.userClerkId,
      personId: person._id,
    });
  },
});

/*
To do
1. Update the onboarding to have a field that asks if this is you? Give it it's own page, it's two buttons, with a warning that says this is not reversible. .
If they click yes, then we call the bindusertocopmpany mutation. If they click no, then we continue with the onboarding.

2. In the settings module add a div that has all the associated persons.
			- We show all the persons. If they have an associated person then there is a red remove button.
			- If there is an email but no associated then we say that it's pending and their's a tool tip explaining who must log in from where to claim the account
			- If there is no email and associated user then there is an input field
      - If you are the primary owner and your userId is not associated with anyone and the person has no email or associated user, then there is a button that says "this is me"


3.

*/
