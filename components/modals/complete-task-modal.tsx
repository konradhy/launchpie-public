"use client";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useCompleteTask } from "@/hooks/use-complete-task";

import { Spinner } from "../spinner";
import { CompleteTaskForm } from "../complete-task-form";

export const CompleteTaskModal = () => {
  const completeTask = useCompleteTask();

  return (
    <Dialog open={completeTask.isOpen} onOpenChange={completeTask.onClose}>
      <DialogContent>
        <DialogHeader className="border-b pb-3">
          <h2 className="text-lg font-medium">Complete Stake</h2>
        </DialogHeader>
        <div className="flex items-center justify-between ">
          <div className="flex flex-col gap-y-1 w-full">
            {completeTask.task ? (
              <CompleteTaskForm task={completeTask.task} />
            ) : (
              <div className="flex justify-center items-center h-full">
                <Spinner />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
