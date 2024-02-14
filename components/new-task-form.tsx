"use client";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useNewTask } from "@/hooks/use-new-task";

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

//import { DatePicker } from "@/components/ui/datepicker"; // Assuming you have a DatePicker component

interface NewTaskFormProps {
  companyId: Id<"companies">;
}

const taskSchema = z.object({
  description: z.string().min(1, "Description is required"),
  assignees: z
    .array(z.string())
    .refine((value) => value.some((item) => item), {
      message: "You have to select at least one item.",
    })
    .optional(),
  dueDate: z.string().optional(),
  estimatedTime: z.coerce.number().min(1, "Estimated time is required"),
  taskState: z
    .union([
      z.literal("notStarted"),
      z.literal("inProgress"),
      z.literal("completed"),
    ])
    .optional(),
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
  companyId: z.string(),
  priority: z
    .union([z.literal("low"), z.literal("medium"), z.literal("high")])
    .optional(),
  category: z.string().optional(),
});

export const NewTaskForm = ({ companyId }: NewTaskFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const newTask = useNewTask();
  const shareHolders = useQuery(api.persons.getShareholdersByCompanyId, {
    companyId,
  });
  const createTask = useMutation(api.tasks.create);

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      assignees: [], //I think you need to make assignees optional and make sure it has no default value to auto pass user Id later in convex function

      estimatedTime: 1,
      taskState: "notStarted",
      reviewStatus: "notFlagged",
      meetingAgendaFlag: false,
      equityValue: 1,
      notes: "",
      companyId,
      priority: "low",
      category: "Uncategorized",
    },
  });
  console.log(shareHolders); // for some reason this seems too reactive. It's checking each time I click on anything in the form.

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (data: z.infer<typeof taskSchema>) => {
    try {
      await createTask(data);
      toast.success("Task successfully created");

      newTask.onClose();
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Task Description" {...field} />
              </FormControl>
              <FormDescription>Describe the task in detail.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="assignees"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Sidebar</FormLabel>
                <FormDescription>
                  Select the items you want to display in the sidebar.
                </FormDescription>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {shareHolders?.map((shareholder) => (
                  <FormField
                    key={shareholder?._id}
                    control={form.control}
                    name="assignees"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={shareholder?._id}
                          className="flex flex-row items-start space-x-3 space-y-0 "
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(
                                shareholder?._id as string,
                              )}
                              onCheckedChange={(checked) => {
                                const fieldValue = field.value || [];
                                return checked
                                  ? field.onChange([
                                      ...fieldValue,
                                      shareholder?._id,
                                    ])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== shareholder?._id,
                                      ),
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal  ">
                            {shareholder?.firstName}.{" "}
                            {shareholder?.lastName.charAt(0)}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="estimatedTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Time (hours)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormDescription>
                How many hours are expected to complete this task?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date</FormLabel>
              <FormControl>
                {/* <DatePicker {...field} /> */}
                <Input type="date" {...field} />
              </FormControl>
              <FormDescription>When is the task due?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Add additional fields for taskState, reviewStatus, meetingAgendaFlag, equityValue, notes following the same pattern */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-center hover:cursor-pointer t">
              <span className="text-gray-500 mr-2 ">Advanced</span>
              <CaretSortIcon className="h-4 w-4 text-gray-600" />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            {/* taskState*/}

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
            <div className="grid grid-cols-2 gap-4 justify-between rounded-lg border p-3 shadow-sm mb-4">
              <FormField
                control={form.control}
                name="taskState"
                render={({ field }) => (
                  <FormItem>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="m-3 ">
                        <Button variant="ghost">
                          <span className="text-md">
                            {(() => {
                              switch (field.value) {
                                case "completed":
                                  return "Completed";
                                case "inProgress":
                                  return "In Progress";
                                case "notStarted":
                                  return "Not Started";
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
                                <DropdownMenuRadioItem value="notStarted">
                                  {" "}
                                  Not Started{" "}
                                </DropdownMenuRadioItem>
                              </FormControl>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <DropdownMenuRadioItem value="inProgress">
                                  {" "}
                                  In Progress{" "}
                                </DropdownMenuRadioItem>
                              </FormControl>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <DropdownMenuRadioItem value="completed">
                                  {" "}
                                  Completed{" "}
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
            </div>
            <div className="grid grid-cols-2 gap-4 justify-between rounded-lg border p-3 shadow-sm mb-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="m-3 ">
                        <Button variant="ghost">
                          <span className="text-md">
                            {(() => {
                              switch (field.value) {
                                case "marketing":
                                  return "Marketing";
                                case "finance":
                                  return "Finance";
                                case "operations":
                                  return "Operations";
                                case "development":
                                  return "Development";
                                case "strategy":
                                  return "Strategy";
                                case "legal":
                                  return "Legal";
                                case "Uncategorized":
                                  return "Uncategorized";

                                default:
                                  return "Uncategorized";
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
                                <DropdownMenuRadioItem value="marketing">
                                  {" "}
                                  Marketing{" "}
                                </DropdownMenuRadioItem>
                              </FormControl>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <DropdownMenuRadioItem value="finance">
                                  {" "}
                                  Finance{" "}
                                </DropdownMenuRadioItem>
                              </FormControl>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <DropdownMenuRadioItem value="operations">
                                  {" "}
                                  Operations{" "}
                                </DropdownMenuRadioItem>
                              </FormControl>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <DropdownMenuRadioItem value="development">
                                  {" "}
                                  Development{" "}
                                </DropdownMenuRadioItem>
                              </FormControl>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <DropdownMenuRadioItem value="strategy">
                                  {" "}
                                  Strategy{" "}
                                </DropdownMenuRadioItem>
                              </FormControl>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <DropdownMenuRadioItem value="legal">
                                  {" "}
                                  Legal{" "}
                                </DropdownMenuRadioItem>
                              </FormControl>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <DropdownMenuRadioItem value="Uncategorized">
                                  {" "}
                                  Uncategorized{" "}
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
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="m-3 ">
                        <Button variant="ghost">
                          <span className="text-md">
                            {(() => {
                              switch (field.value) {
                                case "low":
                                  return "Low";
                                case "medium":
                                  return "Medium";
                                case "high":
                                  return "High";

                                default:
                                  return field.value;
                              }
                            })()}
                          </span>
                          <CaretSortIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent className="w-56" side="right">
                        <DropdownMenuLabel>Priority</DropdownMenuLabel>
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
                                <DropdownMenuRadioItem value="low">
                                  {" "}
                                  Low{" "}
                                </DropdownMenuRadioItem>
                              </FormControl>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <DropdownMenuRadioItem value="medium">
                                  {" "}
                                  Medium{" "}
                                </DropdownMenuRadioItem>
                              </FormControl>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <DropdownMenuRadioItem value="high">
                                  {" "}
                                  High{" "}
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
            </div>

            <FormField
              control={form.control}
              name="meetingAgendaFlag"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Include in Meeting Agenda</FormLabel>
                    <FormDescription>
                      Include as an agenda item for the next shareholder
                      meeting.
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
          </CollapsibleContent>
        </Collapsible>

        <Button type="submit">Create Task</Button>
      </form>
    </Form>
  );
};
