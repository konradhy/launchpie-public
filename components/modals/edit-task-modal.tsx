"use client";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useEditTask } from "@/hooks/use-edit-task";
import { NewTaskForm } from "@/components/new-task-form";
import { Spinner } from "../spinner";
import { EditTaskForm } from "../edit-task-form";

export const EditTaskModal = () => {
  const editTask = useEditTask();
  console.log(editTask.task);

  return (
    <Dialog open={editTask.isOpen} onOpenChange={editTask.onClose}>
      <DialogContent>
        <DialogHeader className="border-b pb-3">
          <h2 className="text-lg font-medium">Edit Task</h2>
        </DialogHeader>
        <div className="flex items-center justify-between ">
          <div className="flex flex-col gap-y-1 w-full">
            {editTask.task ? (
              <EditTaskForm task={editTask.task} />
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
