//equity cards are ordered with yours first then the rest. The first equty card will have a 2xl shaddow. The others have a regular shadow
"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Doc } from "@/convex/_generated/dataModel";

const TaskCard = ({ task, detail }: { task: string; detail: string }) => {
  return (
    <div className="bg-primary/10 p-2 rounded-lg mb-2 last:mb-0 shadow-inner hover:bg-primary/20 dark:hover:bg-gray-700 cursor-pointer dark:bg-gray-800">
      <p className="text-sm font-semibold truncate">{task}</p>
      <p className="text-xs text-gray-500 truncate">{detail}</p>
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
            Equity:{" "}
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
            <TaskCard
              key={index}
              task={task.title || "loading"}
              detail={task.description}
            />
          ))}
        </CardContent>
      </ScrollArea>
    </Card>
  );
};

export default EquityCard;
