import {
  internalAction,
  internalMutation,
  internalQuery,
} from "../_generated/server";
import { getAll } from "convex-helpers/server/relationships";
import { internal } from "../_generated/api";

import { Doc, Id } from "../_generated/dataModel";

import { ConvexError, v } from "convex/values";

import OpenAI from "openai";

//after some thought this is better than a partial of Tasks
interface GeneratedTask {
  title: string;
  description: string;
  dueDate: string;
  estimatedTime: number;
  assignees: Id<"persons">[];
  priority: "high" | "medium" | "low";
  taskState: "notStarted" | "inProgress" | "completed";
  category: string;
  notes: string;
  meetingAgendaFlag: boolean;
}

export const taskObjectPromptBuilder = (
  companyDetails: string,
  currentTasks: string,
  transcript: string,
) => {
  const systemMessage = `You are Quity. An AI that will review input from a user and generate a JSON Object representing tasks.
 Each task object will have the following fields:
1. title: The title of the task
2. description: A brief description of the task
3. dueDate: The due date of the task. This will be in the format YYYY-MM-DD
4. estimatedTime: The expected time to complete the task. Use your discretion. It should be a number
5. assignees: The persons responsible for the task. Here you'll use their assigneeId. This will be an array, even if one person. If confused, use jd7eahfvjmahspxfb2eeye5rvd6kv3gd
6. priority: The priority of the task. This can be high, medium or low
7. taskState: The status of the task. This can be notStarted, inProgress or completed
8. category: The category of the task
9. notes: Any additional notes about the task. Here I want you to consider existing tasks, and whether there is synergy, conflict or overlap with the new task. Also any useful information like key contacts, resources, or dependencies. Also make a note if the time line is close to someone's birthday or a holiday. If there are no useful notes just leave something generic like "No notes"
10. meetingAgendaFlag: A boolean flag indicating whether the task should be discussed in the next meeting. Note the camelCase for the field name. 
`;

  const userMessage = `Use this information to create the JSON object:${transcript}. 
Bear in mind the following for context. Here are some company details: ${companyDetails}.
Here are some recent tasks: ${currentTasks}. 


`;

  return { systemMessage, userMessage };
};

export const generateTaskObject = internalAction({
  args: {
    transcript: v.string(),
    companyId: v.id("companies"),
    id: v.id("records"),
  },
  handler: async (ctx, args) => {
    const companyDetails = await ctx.runQuery(
      internal.helpers.promptHelpers.getCompanyDetails,
      {
        companyId: args.companyId,
      },
    );

    const recentTasks = await ctx.runQuery(
      internal.helpers.promptHelpers.getRecentTasks,
      {
        companyId: args.companyId,
      },
    );

    if (!companyDetails || !recentTasks) {
      throw new ConvexError("No company details or recent tasks found");
    }

    const { systemMessage, userMessage } = taskObjectPromptBuilder(
      companyDetails,
      recentTasks,
      args.transcript,
    );

    try {
      const openai = new OpenAI();
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: systemMessage,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        model: "gpt-3.5-turbo-1106",
        response_format: { type: "json_object" },
        seed: 1993,
        top_p: 0.9,
      });

      const response = completion.choices[0].message.content;
      if (response) {
        const generatedTasks = JSON.parse(response);
        //should throw a runtime error if it doesn't fit the schema. Some graceful error handling right here is important to either retry the action, coerece it into fitting or to reflect the error in the database and to the user

        await ctx.runMutation(
          internal.helpers.promptHelpers.insertGeneratedTasks,
          {
            recordId: args.id,
            generatedTasks,
            companyId: args.companyId,
          },
        );
        console.log(generatedTasks);
      }

      return completion.choices[0].message.content;
    } catch (error) {
      console.log("An error has occured:", error);
    }
  },
});

export const insertGeneratedTasks = internalMutation({
  handler: async (
    ctx,
    args: {
      recordId: Id<"records">;
      generatedTasks: {
        tasks: GeneratedTask[];
      };
      companyId: Id<"companies">;
    },
  ) => {
    // Correctly access the tasks array within args.generatedTasks
    args.generatedTasks.tasks.map((task) => {
      ctx.db.insert("tasks", {
        ...task,
        userId: args.recordId,
        companyId: args.companyId,
        updatedAt: new Date().toISOString(),
        reviewStatus: "notFlagged",
        createdAt: new Date().toISOString(),
        updatedBy: args.recordId,
        isArchived: false,
      });
    });
  },
});
export const getCompanyDetails = internalQuery({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const company = await ctx.db.get(args.companyId);
    if (!company) {
      throw new ConvexError("No company found");
    }

    if (!company.shareholders) {
      throw new ConvexError({
        message: "No shareholders found",
        severity: "low",
      });
    }

    const shareholders = company.shareholders.map(
      (shareholder) => shareholder.personId,
    );
    let directors = [] as Id<"persons">[];
    if (company.directors) {
      directors = company.directors.map((director) => director.personId);
    }

    const associatedUsers = [...shareholders, ...directors];

    //make sure there are no duplicates in the array
    const uniqueAssociatedUsers = [...new Set(associatedUsers)];
    const usersDetails = await getAll(ctx.db, uniqueAssociatedUsers);

    const companyDetailsString = `
Company Name: ${company.companyName}
Company Activities: ${company.companyActivities}
${usersDetails
  .map(
    (user) => `
  Name: ${user?.firstName} ${user?.lastName}
  ID: ${user?._id}
  Role: ${user?.role}`,
  )
  .join("")}
`;

    return companyDetailsString;
  },
});

export const getRecentTasks = internalQuery({
  args: {
    companyId: v.id("companies"),
  },
  async handler(ctx, { companyId }) {
    const recentTasks = await ctx.db
      .query("tasks")
      .withIndex("by_company", (q) => q.eq("companyId", companyId))
      .filter((q) => q.neq(q.field("taskState"), "completed"))
      .order("desc")
      .take(30);

    const tasksDetailsString = recentTasks
      .map(
        (task) => `
Title: ${task.title || "No Title"}
Description: ${task.description}
Estimated Completion Time: ${task.estimatedTime} hours
Assignees: ${task.assignees.join(", ")}
Due Date: ${task.dueDate}
Creation Date: ${task.createdAt}
`,
      )
      .join("\n");

    return tasksDetailsString;
  },
});
