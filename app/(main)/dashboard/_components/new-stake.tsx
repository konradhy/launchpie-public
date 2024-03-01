"use client";

import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNewTask } from "@/hooks/use-new-task";

export const NewStake = () => {
  const company = useQuery(api.companies.getByUserId);
  const newTask = useNewTask();

  return (
    <div>
      {company ? (
        <Button onClick={() => newTask.onOpen(company._id)}>New Stake</Button>
      ) : (
        <Button>New Stake</Button>
      )}
    </div>
  );
};
