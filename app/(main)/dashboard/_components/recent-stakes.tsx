"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  Card,
} from "@/components/ui/card";
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEditTask } from "@/hooks/use-edit-task";

import { Skeleton } from "@/components/ui/skeleton";
import { Doc } from "@/convex/_generated/dataModel";

interface TaskCardProps {
  task: Doc<"tasks">;
}


const priorityColorMap = {
  high: "bg-pink-700",
  medium: "bg-amber-600",
  low: "bg-lime-500",
};

const TaskCard = ({ task }: TaskCardProps) => {
  const editTask = useEditTask();
  return (
    <div
      onClick={() => editTask.onOpen(task)}
      className="p-4 bg-primary/5 rounded-lg shadow-md flex items-center justify-between cursor-pointer hover:bg-primary/10 dark:hover:bg-gray-700  dark:bg-slate-800"
    >
      <div className="flex flex-row">
        <Avatar>
          <AvatarImage src="/placeholder-avatar.png" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>

        <div className="ml-4">
          {" "}
          <h3 className="text-lg font-semibold truncate ">{task.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {task.dueDate}
          </p>
        </div>
      </div>

      <Badge
        className={`rounded-full text-xs font-semibold text-slate-50 ${priorityColorMap[task.priority]}`}
      >
        {task.priority}
      </Badge>
    </div>
  );
};

export default function Component() {
  const tasks = useQuery(api.dashboard.currentStakes.getCurrentStakes);

  if (!tasks) {
    return (
      <Card className=" bg-gray-50 rounded-lg shadow-inner dark:bg-background">
        <CardHeader>
          <CardTitle>Current Stakes</CardTitle>
          <CardDescription>Stakes that need to be completed </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Skeleton className="h-20 dark:bg-slate-800" />
          <Skeleton className="h-20 dark:bg-slate-800" />
          <Skeleton className="h-20 dark:bg-slate-800" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className=" bg-gray-50 rounded-lg shadow-inner dark:bg-background">
      <CardHeader>
        <CardTitle>Current Stakes</CardTitle>
        <CardDescription>Stakes that need to be completed </CardDescription>
      </CardHeader>
      <ScrollArea className=" h-[120px] md:h-[345px]  ">
        <CardContent className="grid gap-4">
          {tasks.map((task, index) => (
            <TaskCard key={index} task={task} />
          ))}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
