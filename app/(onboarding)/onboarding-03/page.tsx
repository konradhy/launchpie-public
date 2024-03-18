//reposition and rename the save buttons

"use client";
import { ConvexError } from "convex/values";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";

import { Info } from "lucide-react";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

import OnboardingHeader from "../onboarding-header";
import OnboardingImage from "../onboarding-image";
import OnboardingProgress from "../onboarding-progress";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";

const shareholderSchema = z.object({
  firstName: z.string().min(1, "Please enter the shareholder's first name"),
  lastName: z.string().min(1, "Please enter the shareholder's last name"),

  isDirector: z.string(),

  email: z.string().email("Please enter a valid email address"),
  amount: z.coerce.number().max(20, "Please enter a number between 0 and 20"),
  bind: z.boolean(),
  hourlyRate: z.coerce
    .number()
    .min(1, "Please enter an hourly rate greater than 0"),
});

export default function Onboarding03() {
  const create = useMutation(api.persons.create);
  const update = useMutation(api.companies.insertOfficer);

  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get("companyId") as Id<"companies">;
  const companyType = searchParams.get("type");

  const form = useForm({
    resolver: zodResolver(shareholderSchema),
    defaultValues: {
      firstName: "",
      lastName: "",

      isDirector: "shareholder",

      email: "",
      amount: 0,
      hourlyRate: 20,
      bind: false,
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (data: z.infer<typeof shareholderSchema>) => {
    try {
      let { isDirector, amount, bind, ...rest } = data;
      bind = true;
      const personId = await create({ ...rest, companyId, bind });

      //I just added await and didn't test it
      await update({ companyId, personId, type: isDirector });
      toast.success("Shareholder information saved!");

      if (companyType === "organization" && amount > 0) {
        router.push(`/onboarding-04?companyId=${companyId}&amount=${amount}`);
      } else {
        router.push(`/onboarding-05?companyId=${companyId}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof ConvexError ? error.message : "An error occurred";
      toast.error(errorMessage);
    }
  };

  return (
    <main className="bg-white dark:bg-slate-900">
      <div className="relative flex">
        <div className="w-full md:w-1/2">
          <div className="min-h-[100vh] h-full flex flex-col after:flex-1">
            <div className="flex-1">
              <OnboardingHeader />
              <OnboardingProgress step={3} />
            </div>

            <div className="px-4 py-8">
              <div className="max-w-md mx-auto">
                <h2 className="text-3xl text-slate-800 dark:text-slate-100 font-bold mb-6">
                  Primary Shareholder
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  {" "}
                  Please fill out the form below for the primary shareholder
                </p>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-2 md:space-y-4"
                  >
                    <div className="flex col-span-2 gap-2 w-auto justify-between ">
                      <FormField
                        name="firstName"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={isLoading}
                                placeholder="Enter shareholder's first name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="lastName"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={isLoading}
                                placeholder="Enter shareholder's Last name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      name="email"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={isLoading}
                              placeholder="Enter shareholder's email address"
                              type="email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="hourlyRate"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Hourly Rate
                            <TooltipProvider>
                              <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={(e) => e.preventDefault()}
                                    className="focus:outline-none"
                                  >
                                    <Info className="w-4 h-4 ml-1" />
                                  </button>
                                </TooltipTrigger>

                                <TooltipContent side="right">
                                  Enter the hourly rate you typically charge for
                                  your services. Use your market rate or the
                                  rate agreed upon with the startup. Ensure to
                                  input the rate in dollars per hour (e.g.
                                  $50.00). Defaults to 20.
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={isLoading}
                              placeholder="20.00"
                              type="number"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="isDirector"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Is this shareholder also a director?
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue="No"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="Both" />
                                </FormControl>
                                <FormLabel>Yes</FormLabel>
                              </FormItem>

                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="Shareholder" />
                                </FormControl>
                                <FormLabel>No</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bind"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border dark:border-zinc-600 p-3  shadow-sm">
                          <div className="flex-col items-center justify-center space-y-4">
                            <div className="space-y-2">
                              <FormLabel>Is this shareholder you?</FormLabel>
                              <FormDescription>
                                Switch on to bind this shareholder to your
                                account. This is{" "}
                                <span className="text-destructive">
                                  irreversible.
                                </span>
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </div>
                        </FormItem>
                      )}
                    />

                    {companyType === "organization" && (
                      <FormField
                        name="amount"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              How many other shareholders are there?
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={isLoading}
                                type="number"
                                min={0}
                                max={20}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    {/*button should be to the right*/}
                    <div className="flex justify-end">
                      <Button className="bg-indigo-500 hover:bg-indigo-700 text-white py-2 px-4 rounded mt-2">
                        Next
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </div>

        <OnboardingImage />
      </div>
    </main>
  );
}
