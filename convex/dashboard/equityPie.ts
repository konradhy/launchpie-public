import { ConvexError, v } from "convex/values";
import { query } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";

import { validateUserAndCompany } from "../helpers/utils";
import { getAll } from "convex-helpers/server/relationships";

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
      .filter((q) => q.gt(q.field("equityValue"), 0))
      .collect();

    const Ids = extractAssigneeIds(tasks) as Id<"persons">[];

    const details = await getAll(ctx.db, Ids);

    const nonNullDetails = details.filter(
      (detail): detail is NonNullable<typeof detail> => detail !== null,
    );

    const groupedTasks = await calculateEquityByAssignee(tasks, nonNullDetails);



    return groupedTasks;
  },
});

interface MonthlyEquityValue {
  x: string;
  y: number;
}

interface AssigneeEquityValue {
  id: string;
  data: MonthlyEquityValue[];
}

function formatMonth(month: string): string {
  const [year, monthIndex] = month.split("-").map((num) => parseInt(num, 10));
  const date = new Date(year, monthIndex - 1);
  const formatter = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  });
  return formatter.format(date);
}

function getLastTwelveMonths(): { value: string; name: string }[] {
  let months: { value: string; name: string }[] = [];
  let date = new Date();
  date.setDate(1);
  for (let i = 0; i < 12; i++) {
    const monthValue = date.toISOString().substring(0, 7);
    const monthName = formatMonth(monthValue);
    months.unshift({ value: monthValue, name: monthName });
    date.setMonth(date.getMonth() - 1);
  }
  return months;
}

async function calculateEquityByAssignee(
  tasks: Doc<"tasks">[],
  details: Doc<"persons">[],
): Promise<AssigneeEquityValue[]> {
  const lastTwelveMonths = getLastTwelveMonths();

  const assigneeNameMap: Record<string, string> = {};
  details.forEach((detail) => {
    assigneeNameMap[detail._id] = `${detail.firstName} ${detail.lastName}`;
  });

  const assigneeEquityMap: Record<string, Record<string, number>> = {};

  tasks.forEach((task) => {
    const taskMonthValue = task.updatedAt.slice(0, 7);
    const taskMonthName = formatMonth(taskMonthValue);
    task.assignees.forEach((assigneeId) => {
      const assigneeName = assigneeNameMap[assigneeId] || "Unknown Assignee";
      if (!assigneeEquityMap[assigneeName]) {
        assigneeEquityMap[assigneeName] = lastTwelveMonths.reduce(
          (acc, month) => {
            acc[month.name] = 0;
            return acc;
          },
          {} as Record<string, number>,
        );
      }
      if (assigneeEquityMap[assigneeName][taskMonthName] !== undefined) {
        assigneeEquityMap[assigneeName][taskMonthName] += task.equityValue;
      }
    });
  });

  function sortMonthsChronologically(
    a: { x: string; y: number },
    b: { x: string; y: number },
  ): number {
    const monthOrder: Record<string, number> = {
      January: 0,
      February: 1,
      March: 2,
      April: 3,
      May: 4,
      June: 5,
      July: 6,
      August: 7,
      September: 8,
      October: 9,
      November: 10,
      December: 11,
    };

    const yearMonthA = a.x.split(" ");
    const yearMonthB = b.x.split(" ");

    const yearA = parseInt(yearMonthA[1], 10);
    const yearB = parseInt(yearMonthB[1], 10);

    if (yearA !== yearB) {
      return yearA - yearB;
    }

    // If the years are the same, compare months using the monthOrder mapping
    const monthA = monthOrder[yearMonthA[0]];
    const monthB = monthOrder[yearMonthB[0]];

    return monthA - monthB;
  }

  // Transform into array for frontend
  const result: AssigneeEquityValue[] = Object.entries(assigneeEquityMap).map(
    ([assigneeName, monthlyValues]) => ({
      id: assigneeName,
      data: Object.entries(monthlyValues)
        .map(([monthName, value]) => ({
          x: monthName,
          y: value,
        }))
        .sort(sortMonthsChronologically),
    }),
  );

  return result;
}

function extractAssigneeIds(tasks: Doc<"tasks">[]): string[] {
  const allAssigneeIds: string[] = [];

  tasks.forEach((task) => {
    task.assignees.forEach((assigneeId) => {
      if (!allAssigneeIds.includes(assigneeId)) {
        allAssigneeIds.push(assigneeId);
      }
    });
  });

  return allAssigneeIds;
}
