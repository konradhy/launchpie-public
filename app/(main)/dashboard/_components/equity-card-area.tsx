"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import EquityCard from "./equity-card";
import { Spinner } from "@/components/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const EquityCardArea = () => {
  const equityData = useQuery(api.dashboard.equityCard.equityDetails);

  if (!equityData) {
    return (
      <div className="flex gap-8">
        <EquityCardSkeleton />
        <EquityCardSkeleton />
        <EquityCardSkeleton />
        <EquityCardSkeleton />
      </div>
    );
  }

  const entries = Object.entries(equityData || {});

  return (
    <ScrollArea className="overflow-x-auto">
      <div className="flex gap-8">
        {entries.map(([assigneeId, data], index) => (
          <div key={assigneeId}>
            <EquityCard
              key={index}
              firstName={data.firstName}
              lastName={data.lastName}
              totalEquity={data.totalEquityValue}
              tasks={data.tasks}
            />
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default EquityCardArea;

export const EquityCardSkeleton = () => {
  return (
    <Card className=" shadow rounded-lg overflow-hidden min-w-[350px] bg-background ">
      <CardHeader className="px-4 py-2 bg-slate-50 dark:bg-slate-800">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-100 truncate">
            Fair Market Value:{" "}
            <span>
              <Spinner />
            </span>
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <Skeleton className="w-[300px] h-10 rounded-lg dark:bg-slate-800" />
      </CardContent>
    </Card>
  );
};
