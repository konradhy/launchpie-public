import { ConvexError, v } from "convex/values";

import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";

import {
  validateUserAndCompany,
  validateUserAndCompanyMutations,
} from "./helpers/utils";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";

export const generateMeetingAgenda = mutation({
  args: {
    instructions: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { identity, company } = await validateUserAndCompanyMutations(
      ctx,
      "MeetingAgenda",
    );

    await ctx.scheduler.runAfter(
      0,
      internal.helpers.promptHelpers.generateMeetingAgenda,
      {
        instructions: "I have no custom instructions at this time",
        companyId: company._id,
      },
    );
  },
});
export const getMeetingAgendaTasks = internalQuery({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, { companyId }) => {
    //grab task by index company id. Filter for tasks that are not completed and have the meeting agenda flag set to true

    const meetingTasks = await ctx.db
      .query("tasks")
      .withIndex("by_company", (q) => q.eq("companyId", companyId))
      .filter((q) => q.eq(q.field("meetingAgendaFlag"), true))
      .filter((q) => q.neq(q.field("taskState"), "completed"))
      .collect();

    console.log(meetingTasks);
    return meetingTasks;
  },
});

export const patchMeetingAgenda = internalMutation({
  args: {
    companyId: v.id("companies"),
    meetingAgenda: v.string(),
  },
  handler: async (ctx, { companyId, meetingAgenda }) => {
    console.log("patchMeetingAgenda");
    console.log(companyId, meetingAgenda);
    await ctx.db.patch(companyId, {
      meetingAgenda: meetingAgenda,
    });
  },
});

export const getMeetingAgenda = query({
  args: {},
  handler: async (ctx) => {
    const { identity, company } = await validateUserAndCompany(
      ctx,
      "MeetingAgenda",
    );

    const currentCompany = await ctx.db.get(company._id);
    return company.meetingAgenda;
  },
});
