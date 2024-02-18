"use client";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CaretSortIcon } from "@radix-ui/react-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "./ui/textarea";

import { useCompleteTask } from "@/hooks/use-complete-task";

//import { DatePicker } from "@/components/ui/datepicker"; // Assuming you have a DatePicker component

interface CompleteTaskFormProps {
  task: Doc<"tasks">;
}

const taskSchema = z.object({
  taskState: z.boolean(), //if true then we just pass completed
  reviewStatus: z
    .union([
      z.literal("notFlagged"),
      z.literal("flagged"),
      z.literal("approved"),
    ])
    .optional(),
  meetingAgendaFlag: z.boolean().optional(),
  equityValue: z.number().min(1, "Equity value is required"),
  notes: z.string().optional(),
  actualTime: z.coerce.number().min(1, "Estimated time is required"),
});

export const CompleteTaskForm = ({ task }: CompleteTaskFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const completeTask = useCompleteTask();
  const companyId = task.companyId;
  const taskId = task._id;

  const shareHolders = useQuery(
    api.persons.getShareholdersByCompanyId,
    task !== undefined ? { companyId } : "skip",
  );
  const markTaskComplete = useMutation(api.tasks.completeTask);

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      reviewStatus: task.reviewStatus,
      meetingAgendaFlag: task.meetingAgendaFlag,
      notes: task.notes,

      equityValue: task.equityValue,
    },
  });

  const isLoading = form.formState.isSubmitting;
  console.log(taskId);

  const onSubmit = async (data: z.infer<typeof taskSchema>) => {
    if (taskId === undefined) {
      console.log("Task Id is undefined");
      return;
    }
    try {
      if (!data.taskState) {
        console.log("Task is not completed");
        toast.message("You have not completed the task so nothing was saved");
        completeTask.onClose();
        return;
      }
      let { taskState, ...rest } = data;

      await markTaskComplete({ ...rest, taskId, taskState: "completed" });
      toast.success("Task successfully Completed! Well done");

      completeTask.onClose();
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred");
    }
  };

  const onDebugSubmit = async () => {
    const debugData = form.getValues(); // Or define mock data here
    await onSubmit(debugData);
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="actualTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel> Hours Spent</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormDescription>
                How many hours (rounded up) Did it take to complete the task?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className=" mb-4">
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Share additional notes and comments about the task here"
                    className="resize-none justify-between rounded-lg border  shadow-sm"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="taskState"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Was this tasked completed?</FormLabel>
                <FormDescription>
                  Check On to complete calculate it&apos;s value
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reviewStatus"
          render={({ field }) => (
            <FormItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="m-3 ">
                  <Button variant="ghost">
                    <span className="text-md">
                      {(() => {
                        switch (field.value) {
                          case "notFlagged":
                            return "Not Flagged";
                          case "approved":
                            return "Approved";
                          case "flagged":
                            return "Flagged";
                          default:
                            return field.value;
                        }
                      })()}
                    </span>
                    <CaretSortIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56" side="right">
                  <DropdownMenuLabel>Current Progress</DropdownMenuLabel>
                  <DropdownMenuSeparator className="border-t border-indigo-400 " />
                  <FormControl>
                    <DropdownMenuRadioGroup
                      {...field}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <DropdownMenuRadioItem value="notFlagged">
                            {" "}
                            Not Flagged{" "}
                          </DropdownMenuRadioItem>
                        </FormControl>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <DropdownMenuRadioItem value="flagged">
                            {" "}
                            Flag{" "}
                          </DropdownMenuRadioItem>
                        </FormControl>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <DropdownMenuRadioItem value="approved">
                            {" "}
                            Approve{" "}
                          </DropdownMenuRadioItem>
                        </FormControl>
                      </FormItem>
                    </DropdownMenuRadioGroup>
                  </FormControl>
                </DropdownMenuContent>
              </DropdownMenu>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="meetingAgendaFlag"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Include in Meeting Agenda</FormLabel>
                <FormDescription>
                  Include as an agenda item for the next shareholder meeting.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* <Button onClick={onDebugSubmit}>Edit Task</Button> */}
        <Button type="submit">Complete Task</Button>
      </form>
    </Form>
  );
};
