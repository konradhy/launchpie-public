import { v, ConvexError } from "convex/values";
import { getAll } from "convex-helpers/server/relationships";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    dob: v.string(),
    address: v.string(),
    phoneNumber: v.string(),
    email: v.string(),
    hourlyRate: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        message: `You must be logged in to create ${args.firstName}.`,
        severity: "low",
      });
    }

    const person = await ctx.db.insert("persons", {
      firstName: args.firstName,
      lastName: args.lastName,
      hourlyRate: 1,
      role: "default",
      dob: args.dob,
      address: args.address,
      phoneNumber: args.phoneNumber,
      updatedAt: new Date().toISOString(),
      userId: identity.subject,
      email: args.email,
    });
    return person;
  },
});

export const createMultiple = mutation({
  args: {
    persons: v.array(
      v.object({
        firstName: v.string(),
        lastName: v.string(),
        dob: v.string(),
        address: v.string(),
        phoneNumber: v.string(),
        email: v.string(),
        hourlyRate: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError(`Not authenticated. Could not create persons`);
    }
    //review typescript
    const ids: any[] = [];

    await Promise.all(
      args.persons.map(async (person) => {
        const id = await ctx.db.insert("persons", {
          firstName: person.firstName,
          lastName: person.lastName,
          hourlyRate: 20,
          role: "default",
          dob: person.dob,
          address: person.address,
          phoneNumber: person.phoneNumber,
          updatedAt: new Date().toISOString(),
          userId: identity.subject,
          email: person.email,
        });

        ids.push(id);
      }),
    );

    return ids;
  },
});

//this is a problematic function. Because anyone who is logged in can get the details of any person. You'd just need to know their Id.
//We can fix this by adding a check to see if the persons is the shareholder of the same company
//To start we'd have to grab the companyDetails from the id of the logged in user
//We'd check to see if the Ids that are being searched up are Ids in the list of shareholders
//if it is then we can return true and continue with the function
export const getPersonsByIds = query({
  args: { personIds: v.array(v.id("persons")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError({
        message: "You must be logged in to get person details.",
        severity: "low",
      });
    }

    const details = await getAll(ctx.db, args.personIds);

    return details;
  },
});

export const getPersonNamesByGroupedIds = query({
  args: { personGroups: v.array(v.array(v.id("persons"))) },
  handler: async (ctx, args) => {
    // Process each group of person IDs to fetch their details and extract names
    const namesGroups = await Promise.all(
      args.personGroups.map(async (group) => {
        const details = await getAll(ctx.db, group);

        return details.map((person) => person?.firstName);
      }),
    );

    return namesGroups;
  },
});

//need security check same as above
export const update = mutation({
  args: {
    personId: v.id("persons"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    dob: v.optional(v.string()),
    address: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        message: "You must be logged in to update a person.",
        severity: "low",
      });
    }
    const { personId, ...rest } = args;
    const existingPerson = await ctx.db.get(args.personId);
    if (!existingPerson) {
      throw new ConvexError({
        message: "We couldn't find the person you are looking for.",
        severity: "low",
      });
    }

    const person = await ctx.db.patch(args.personId, {
      ...rest,
      updatedAt: new Date().toISOString(),
    });

    return person;
  },
});

export const getShareholdersByCompanyId = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError({
        message: "You must be logged in to get shareholder details.",
        severity: "low",
      });
    }

    const company = await ctx.db.get(args.companyId);
    if (!company) {
      throw new ConvexError(`No company found with id ${args.companyId}`);
    }

    if (!company.shareholders) {
      throw new ConvexError(
        `It appears ${company.companyName} has no shareholders.`,
      );
    }

    const shareholderIds = company.shareholders.map(
      (shareholder) => shareholder.personId,
    );
    const details = await getAll(ctx.db, shareholderIds);

    return details;
  },
});
