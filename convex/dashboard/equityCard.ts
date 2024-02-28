// in equityCard.ts I will call with no args and
/*
1. grab all the persons associated with the company
2. Calculate their total equity value. This is done by doing an aggregate on all their tasks 
3. Grab the last ten tasks by userId, returning their title and their description


*/

import { Doc, Id } from "../_generated/dataModel";
import { query } from "../_generated/server";
import { validateUserAndCompany } from "../helpers/utils";
import { getAll } from "convex-helpers/server/relationships";

export const equityCards = query({
  handler: async (ctx) => {
    const { company } = await validateUserAndCompany(ctx, "CompanyInformation");

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_company", (q) => q.eq("companyId", company._id))
      .filter((q) => q.gt(q.field("equityValue"), 0))
      .collect();

    const Ids = extractAssigneeIds(tasks) as Id<"persons">[];

    const details = await getAll(ctx.db, Ids);

    const filteredDetails = details.filter(
      (detail) => detail !== null,
    ) as Doc<"persons">[];

    const groupedTasks = groupTasksByAssignee(tasks, filteredDetails);

    return groupedTasks;
  },
});

// Adjust the function signature to accept the details (persons' information)
function groupTasksByAssignee(
  tasks: Doc<"tasks">[],
  personsDetails: Doc<"persons">[],
) {
  const assigneeTasksMap: {
    [key: string]: {
      tasks: Doc<"tasks">[];
      totalEquityValue: number;
      firstName: string;
      lastName: string;
    };
  } = {};

  tasks.forEach((task) => {
    task.assignees.forEach((assigneeId) => {
      if (!assigneeTasksMap[assigneeId]) {
        // Find the person's details using assigneeId
        const personDetail = personsDetails.find(
          (person) => person._id === assigneeId,
        );
        // Initialize the map entry with person's name and a zero totalEquityValue
        assigneeTasksMap[assigneeId] = {
          tasks: [],
          totalEquityValue: 0,
          // If the person is found, use their name; otherwise, use placeholders
          firstName: personDetail ? personDetail.firstName : "Unknown",
          lastName: personDetail ? personDetail.lastName : "Person",
        };
      }

      assigneeTasksMap[assigneeId].tasks.push(task);
      assigneeTasksMap[assigneeId].totalEquityValue += task.equityValue;
    });
  });

  return assigneeTasksMap;
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
