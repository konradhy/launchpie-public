"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import EquityCard from "./equity-card";
import { Spinner } from "@/components/spinner";

const EquityCardArea = () => {
  const equityData = useQuery(api.dashboard.equityCard.equityDetails);

  if (!equityData) {
    return <Spinner></Spinner>;
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
