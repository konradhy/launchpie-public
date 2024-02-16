//equity cards are ordered with yours first then the rest. The first equty card will have a 2xl shaddow. The others have a regular shadow
"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { ScrollArea } from "@/components/ui/scroll-area";

const TaskCard = ({ task, detail }) => {
  return (
    <div className="bg-primary/10 p-2 rounded-lg mb-2 last:mb-0 shadow-inner hover:bg-primary/20 cursor-pointer dark:bg-gray-800">
      <p className="text-sm font-semibold truncate">{task}</p>
      <p className="text-xs text-gray-500 truncate">{detail}</p>
    </div>
  );
};

const EquityCard = ({
  shareholderName = "John D.",
  totalEquity = "$45,231.89",
  lastContributionDate = "2023-09-15",
  tasks = [
    {
      name: "Design System Update",
      detail: "Finalizing the new color palette",
    },
    {
      name: "Design System Update",
      detail: "Finalizing the new color palette",
    },
    {
      name: "Design System Update",
      detail: "Finalizing the new color palette",
    },
  ],
}) => {
  return (
    <Card className=" shadow rounded-lg overflow-hidden min-w-[350px] bg-background ">
      <CardHeader className="px-4 py-2 bg-slate-50 dark:bg-slate-800">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-100 truncate">
            Equity: <span>{totalEquity}</span>
          </span>
          <span className="text-xs text-gray-400">{shareholderName}</span>
        </div>
      </CardHeader>
      <ScrollArea className="h-20">
        <CardContent className="p-3">
          {tasks.map((task, index) => (
            <TaskCard key={index} task={task.name} detail={task.detail} />
          ))}
        </CardContent>
      </ScrollArea>
    </Card>
  );
};

export default EquityCard;
