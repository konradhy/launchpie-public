
"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useEditTask } from "@/hooks/use-edit-task";

const TaskCard = ({ task }: { task: Doc<"tasks"> }) => {
  const editTask = useEditTask();
  return (
    <div
      onClick={() => editTask.onOpen(task)}
      className="max-w-[25rem] bg-primary/10 p-2 rounded-lg mb-2 last:mb-0 shadow-inner hover:bg-primary/20 dark:hover:bg-gray-700 cursor-pointer dark:bg-gray-800"
    >
      <p className="text-sm font-semibold truncate">
        {task.title || "loading..."}
      </p>
      <p className="text-xs text-gray-500 truncate">
        {task.description || "loading..."}
      </p>
    </div>
  );
};

interface EquityCardProps {
  firstName: string;
  lastName: string;
  totalEquity: number;
  tasks: Doc<"tasks">[];
}

const EquityCard = ({
  firstName,
  lastName,
  totalEquity,
  tasks,
}: EquityCardProps) => {
  return (
    <Card className=" shadow rounded-lg overflow-hidden min-w-[350px] bg-background ">
      <CardHeader className="px-4 py-2 bg-slate-50 dark:bg-slate-800">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-100 truncate">
            Fair Market Value:{" "}
            <span>
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(totalEquity)}
            </span>
          </span>
          <span className="text-xs text-gray-400">
            {firstName} {lastName.charAt(0)}.
          </span>
        </div>
      </CardHeader>
      <ScrollArea className="h-20">
        <CardContent className="p-3">
          {tasks.map((task, index) => (
            <TaskCard key={index} task={task} />
          ))}
        </CardContent>
      </ScrollArea>
    </Card>
  );
};

export default EquityCard;
