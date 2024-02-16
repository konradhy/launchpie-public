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

const TaskCard = ({ title, dueDate, reviewStatus, badgeColor }) => (
  <div className="p-4 bg-primary/5 rounded-lg shadow-md flex items-center justify-between cursor-pointer hover:bg-primary/10 dark:bg-slate-800">
    <Avatar>
      <AvatarImage src="/placeholder-avatar.png" />
      <AvatarFallback>U</AvatarFallback>
    </Avatar>
    <div className="ml-4">
      <h3 className="text-lg font-semibold truncate">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{dueDate}</p>
    </div>
    <Badge
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeColor} text-white`}
    >
      {reviewStatus}
    </Badge>
  </div>
);

export default function Component() {
  const tasks = [
    {
      title: "Task 1: Complete user onboarding",
      dueDate: "Due in 3 days",
      reviewStatus: "New",
      badgeColor: "bg-green-500",
    },
    {
      title: "Task 2: Update billing information",
      dueDate: "Overdue by 2 days",
      reviewStatus: "Overdue",
      badgeColor: "bg-red-500",
    },
    {
      title: "Task 3: Review quarterly report",
      dueDate: "Due today",
      reviewStatus: "Urgent",
      badgeColor: "bg-blue-500",
    },
    {
      title: "Task 1: Complete user onboarding",
      dueDate: "Due in 3 days",
      reviewStatus: "New",
      badgeColor: "bg-green-500",
    },
    {
      title: "Task 2: Update billing information",
      dueDate: "Overdue by 2 days",
      reviewStatus: "Overdue",
      badgeColor: "bg-red-500",
    },
    {
      title: "Task 3: Review quarterly report",
      dueDate: "Due today",
      reviewStatus: "Urgent",
      badgeColor: "bg-blue-500",
    },
    {
      title: "Task 1: Complete user onboarding",
      dueDate: "Due in 3 days",
      reviewStatus: "New",
      badgeColor: "bg-green-500",
    },
    {
      title: "Task 2: Update billing information",
      dueDate: "Overdue by 2 days",
      reviewStatus: "Overdue",
      badgeColor: "bg-red-500",
    },
    {
      title: "Task 3: Review quarterly report",
      dueDate: "Due today",
      reviewStatus: "Urgent",
      badgeColor: "bg-blue-500",
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto col-span-3">
      <Card className="overflow-y-auto bg-gray-50 rounded-lg shadow-inner dark:bg-background">
        <CardHeader>
          <CardTitle>Current Stakes</CardTitle>
          <CardDescription>Stakes that need to be completed </CardDescription>
        </CardHeader>
        <ScrollArea className=" h-[120px] md:h-[345px] ">
          <CardContent className="grid gap-4">
            {tasks.map((task, index) => (
              <TaskCard key={index} {...task} />
            ))}
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
}
