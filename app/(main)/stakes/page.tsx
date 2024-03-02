"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { Spinner } from "@/components/spinner";
import { Skeleton } from "@/components/ui/skeleton";

export default function TaskPage() {
  const tasks = useQuery(api.tasks.getByCompanyId);
  const assignees = tasks?.map((task) => task.assignees) as Id<"persons">[][];
  const assigneesNames = useQuery(api.persons.getPersonNamesByGroupedIds, {
    personGroups: assignees,
  });

  if (!tasks || !assigneesNames) {
    return (
      <div className="p-8">
        {/* Placeholder for title and subtitle */}
        <Skeleton className="h-6 w-1/2 mb-2" />
        <Skeleton className="h-4 w-1/3 mb-4" />

        {/* Placeholder for search and filter elements */}
        <div className="flex gap-4 mb-4">
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-10 w-1/6" />
          <Skeleton className="h-10 w-1/6" />
          <Skeleton className="h-10 w-1/6" />
        </div>

        {/* Placeholder for table headers */}
        <div className="flex justify-between items-center mb-2">
          <Skeleton className="h-4 w-full" />
        </div>

        {/* Placeholders for multiple table rows */}
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-2 mb-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}

        {/* Placeholder for pagination */}
        <div className="flex justify-end mt-4">
          <Skeleton className="h-12 w-1/4" />
        </div>
      </div>
    );
  }

  const tableData = tasks.map((task, index) => {
    return {
      title: task.title || "loading...",
      _id: task._id,
      status: task.taskState,
      priority: task.priority,
      label: task.title || "No title",
      dueDate: task.dueDate || "No due date",
      assignees: assigneesNames[index],
    };
  });
  return (
    <>
      <div className=" h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
            <p className="text-muted-foreground">
              Here&apos;s a list of your stakes
            </p>
          </div>
        </div>

        <DataTable data={tableData} columns={columns} />
      </div>
    </>
  );
}
