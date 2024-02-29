import { Doc, Id } from "../_generated/dataModel";
import { query } from "../_generated/server";
import { validateUserAndCompany } from "../helpers/utils";
import { getAll } from "convex-helpers/server/relationships";

export const equityDetails = query({
  handler: async (ctx) => {
    const { company } = await validateUserAndCompany(ctx, "CompanyInformation");

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_company", (q) => q.eq("companyId", company._id))
      .filter((q) => q.gt(q.field("equityValue"), 0))
      .order("desc")
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
        const personDetail = personsDetails.find(
          (person) => person._id === assigneeId,
        );

        assigneeTasksMap[assigneeId] = {
          tasks: [],
          totalEquityValue: 0,

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
