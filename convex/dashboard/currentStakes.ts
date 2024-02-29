//grab the tasks with your Id
//Filter out the completed

import { Doc, Id } from "../_generated/dataModel";
import { query } from "../_generated/server";
import { validateUserAndCompany } from "../helpers/utils";

export const getCurrentStakes = query({
  handler: async (ctx) => {
    const { user, company } = await validateUserAndCompany(
      ctx,
      "CompanyInformation",
    );

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_company", (q) => q.eq("companyId", company._id))
      .filter((q) => q.neq(q.field("taskState"), "completed"))
      .collect();

    const filteredTasks = tasks.filter((task) =>
      task.assignees.includes(user?.linkedPersonId!),
    );

    //only include the tasks where the assignee is user.linkedPersonId

    return filteredTasks.slice(0, 10);
  },
});
