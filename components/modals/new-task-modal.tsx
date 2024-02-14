"use client";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useNewTask } from "@/hooks/use-new-task";
import { NewTaskForm } from "@/components/new-task-form";
import { Spinner } from "../spinner";

export const NewTaskModal = () => {
  const newTask = useNewTask();

  return (
    <Dialog open={newTask.isOpen} onOpenChange={newTask.onClose}>
      <DialogContent>
        <DialogHeader className="border-b pb-3">
          <h2 className="text-lg font-medium">New Task</h2>
        </DialogHeader>
        <div className="flex items-center justify-between ">
          <div className="flex flex-col gap-y-1 w-full">
            {newTask.companyId ? (
              <NewTaskForm companyId={newTask.companyId} />
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
