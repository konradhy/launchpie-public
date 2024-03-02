import { v, ConvexError } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const create = mutation({
  args: {
    companyName: v.string(),
    email: v.string(),
    address: v.string(),
    phoneNumber: v.string(),
    industry: v.string(),
    companyActivities: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        message: "You must be logged in to create a company.",
        severity: "low",
      });
    }

    //Because you can only have one company.
    const existingCompany = await ctx.db
      .query("companies")
      .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier))
      .first();

    if (existingCompany) {
      throw new ConvexError({
        message:
          "Users on your plan can only have one company. Please contact support to hear about our enterprise plans.",
        severity: "low",
      });
    }

    const company = await ctx.db.insert("companies", {
      companyName: args.companyName,
      email: args.email,
      address: args.address,
      phoneNumber: args.phoneNumber,
      industry: args.industry,
      companyActivities: args.companyActivities,
      updatedAt: new Date().toISOString(),
      userId: identity.tokenIdentifier,
      status: "pending",
      registered: "Pending",
      taxId: "Pending",
      riskMultiplier: 2,
      totalPieValue: 0,
    });

    return company;
  },
});

//Refactor this Also. This needs authorization. You must be an associated user to insert officers
export const insertOfficer = mutation({
  args: {
    companyId: v.id("companies"),
    personId: v.id("persons"),
    equity: v.optional(v.number()),
    title: v.optional(v.string()),
    type: v.string(),
    hourlyRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        message:
          "You must be logged in to update a company. Issue inserting officer",
        severity: "low",
      });
    }

    const currentCompany = await ctx.db.get(args.companyId);

    if (!currentCompany) {
      throw new ConvexError({
        message: `We couldn't find the right company. Issue inserting officer`,
        severity: "low",
      });
    }

    if (args.type === "Shareholder") {
      if (!currentCompany.shareholders) {
        currentCompany.shareholders = [];
      }
      //check if the personId already exists in the array
      const person = currentCompany.shareholders.find(
        (shareholder) => shareholder.personId === args.personId,
      );

      if (person) {
        person.equity = args.equity || 0;
        person.hourlyRate = args.hourlyRate || 20;
      } else {
        //if the person does not exist, add them to the array
        currentCompany.shareholders.push({
          personId: args.personId,
          equity: args.equity || 0,
          hourlyRate: args.hourlyRate || 20,
        });
      }
    }
    if (args.type === "Director") {
      if (!currentCompany.directors) {
        currentCompany.directors = [];
      }
      const person = currentCompany.directors.find(
        (director) => director.personId === args.personId,
      );
      if (person) {
        person.title = args.title || "default";
      } else {
        currentCompany.directors.push({
          personId: args.personId,
          title: args.title || "default",
        });
      }
    }

    if (args.type === "Both") {
      if (!currentCompany.shareholders) {
        currentCompany.shareholders = [];
      }
      if (!currentCompany.directors) {
        currentCompany.directors = [];
      }
      const person = currentCompany.shareholders.find(
        (shareholder) => shareholder.personId === args.personId,
      );
      if (person) {
        person.equity = args.equity || 0;
      } else {
        currentCompany.shareholders.push({
          personId: args.personId,
          equity: args.equity || 0,
          hourlyRate: args.hourlyRate || 20,
        });
      }
      const director = currentCompany.directors.find(
        (director) => director.personId === args.personId,
      );
      if (director) {
        director.title = args.title || "default";
      } else {
        currentCompany.directors.push({
          personId: args.personId,
          title: args.title || "default",
        });
      }
    }

    const company = await ctx.db.patch(args.companyId, currentCompany);

    return company;
  },
});

//update so that only associated users can insert officers
export const insertMultipleOfficers = mutation({
  args: {
    companyId: v.id("companies"),
    persons: v.array(
      v.object({
        personId: v.id("persons"),
        equity: v.optional(v.number()),
        title: v.optional(v.string()),
        type: v.optional(v.string()),
        hourlyRate: v.optional(v.number()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated. Could not update company.");
    }

    const currentCompany = await ctx.db.get(args.companyId);
    if (!currentCompany) {
      throw new Error("Company not found.");
    }

    if (!currentCompany.shareholders) {
      currentCompany.shareholders = [];
    }
    if (!currentCompany.directors) {
      currentCompany.directors = [];
    }

    args.persons.forEach((person) => {
      switch (person.type) {
        case "Shareholder":
          updateShareholder(currentCompany, person);
          break;
        case "Director":
          updateDirector(currentCompany, person);
          break;
        case "Both":
          updateShareholder(currentCompany, person);
          updateDirector(currentCompany, person);
          break;
        default:
          //maybe I should throw an error instead
          console.warn(
            `Unknown type for personId ${person.personId}: ${person.type}`,
          );
      }
    });

    const updatedCompany = await ctx.db.patch(args.companyId, {
      shareholders: currentCompany.shareholders,
      directors: currentCompany.directors,
    });

    return updatedCompany;

    //fix the typing for this function
    function updateShareholder(company: any, person: any) {
      const existingIndex = company.shareholders.findIndex(
        (shareholder: any) => shareholder.personId === person.personId,
      );
      if (existingIndex > -1) {
        company.shareholders[existingIndex].equity = person.equity || 0;
        company.shareholders[existingIndex].hourlyRate =
          person.hourlyRate || 20;
      } else {
        company.shareholders.push({
          personId: person.personId,
          equity: person.equity || 0,
          hourlyRate: person.hourlyRate || 20,
        });
      }
    }

    function updateDirector(company: any, person: any) {
      const existingIndex = company.directors.findIndex(
        (director: any) => director.personId === person.personId,
      );
      if (existingIndex > -1) {
        company.directors[existingIndex].title = person.title || "default";
      } else {
        company.directors.push({
          personId: person.personId,
          title: person.title || "default",
        });
      }
    }
  },
});

//why would you ever need this?
export const getById = query({
  args: {
    id: v.id("companies"),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError({
        message: "You must be logged in to view company details.",
        severity: "low",
      });
    }

    const userId = identity.tokenIdentifier;
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) {
      throw new ConvexError({
        message:
          "You must be logged in to view company details. We could find a user connect with this account.",
        severity: "low",
      });
    }
    if (!user.companyId) {
      throw new ConvexError({
        message:
          "You must be associated with a company to view company details.",
        severity: "low",
      });
    }

    const company = await ctx.db.get(args.id);
    if (!company) {
      throw new ConvexError({
        message: "We couldn't find the company you are looking for.",
        severity: "low",
      });
    }

    if (
      company.userId !== userId &&
      !company.associatedUsers?.includes(userId)
    ) {
      throw new ConvexError({
        message:
          "Something went wrong. Were you removed from the company? Please contact support.",
        severity: "low",
      });
    }

    return ctx.db.get(args.id);
  },
});

export const getByUserId = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError({
        message: "You must be logged in to search for files.",
        severity: "low",
      });
    }

    const userId = identity.tokenIdentifier;
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) {
      throw new Error("Unauthenticated call to mutation");
    }
    if (!user.companyId) {
      throw new ConvexError({
        message: "You must be associated with a company to search for files.",
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

    if (
      company.userId !== userId &&
      !company.associatedUsers?.includes(userId)
    ) {
      throw new ConvexError({
        message: "Something went wrong",
        severity: "low",
      });
    }

    return company;
  },
});

export const getByIdInternal = internalQuery({
  handler: async (ctx, { id }: { id: Id<"companies"> }) => {
    return await ctx.db.get(id);
  },
});
