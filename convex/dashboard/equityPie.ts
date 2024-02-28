import { ConvexError, v } from "convex/values";
import { internalMutation, mutation, query } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";
import { internal } from "../_generated/api";
import { asyncMap } from "modern-async";
import { validateUserAndCompany } from "../helpers/utils";
import { getAll } from "convex-helpers/server/relationships";

interface MonthlyGroup {
  tasks: Doc<"tasks">[];
  totalEquity: number;
}

export const equityPie = query({
  handler: async (ctx) => {
    const { company } = await validateUserAndCompany(ctx, "CompanyInformation");

    if (!company.shareholders) {
      throw new ConvexError("No shareholders found");
    }

    const totalPieEquityValue = company.totalPieValue;

    const shareholderDetails = await Promise.all(
      company.shareholders
        .filter((shareholder) => shareholder.personId)
        .map(async (shareholder) => {
          const person = await ctx.db.get(shareholder.personId);
          if (!person) {
            return null;
          }

          const personalEquityValue = person.equity;

          const equityPercentage =
            totalPieEquityValue > 0
              ? (personalEquityValue / totalPieEquityValue) * 100
              : 0;

          return {
            shareholderId: shareholder.personId,
            name: person.firstName,
            equityPercentage: equityPercentage,
            personalEquityValue: personalEquityValue,
          };
        }),
    );

    const validShareholderDetails = shareholderDetails.filter(Boolean); // Simpler filter for non-null
    return validShareholderDetails;
  },
});

export const equityBarchart = query({
  handler: async (ctx) => {
    const { company } = await validateUserAndCompany(ctx, "CompanyInformation");

    // Calculate the date for 12 months ago
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
    const twelveMonthsAgoISOString = twelveMonthsAgo.toISOString();

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_company_and_date", (q) =>
        q
          .eq("companyId", company._id)
          .gte("updatedAt", twelveMonthsAgoISOString),
      )
      .collect();

    const groupedTasks = groupTasksByMonthAndCalculateEquity(tasks);

    return groupedTasks;
  },
});

function groupTasksByMonthAndCalculateEquity(tasks: Doc<"tasks">[]): {
  [key: string]: MonthlyGroup;
} {
  const groupedTasks: { [key: string]: MonthlyGroup } = {};

  tasks.forEach((task) => {
    // Extract YYYY-MM part from updatedAt
    const yearMonth = task.updatedAt.slice(0, 7);

    // Initialize the month group if it doesn't exist
    if (!groupedTasks[yearMonth]) {
      groupedTasks[yearMonth] = { tasks: [], totalEquity: 0 };
    }

    // Add the task to the month group
    groupedTasks[yearMonth].tasks.push(task);

    // Update the total equity for the month
    groupedTasks[yearMonth].totalEquity += task.equityValue;
  });

  return groupedTasks;
}
