"use client";
import { ConvexError } from "convex/values";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import OnboardingHeader from "../onboarding-header";

import OnboardingProgress from "../onboarding-progress";


import {
  Form,
  FormControl,

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
import { Info } from "lucide-react";

const shareholderSchema = z.object({
  shareholders: z.array(
    z.object({
      firstName: z.string().min(1, "Please enter the shareholder's first name"),
      lastName: z.string().min(1, "Please enter the shareholder's last name"),
      dob: z.string().min(1, "Please enter the shareholder's date of birth"),
      address: z.string().min(1, "Please enter the shareholder's address"),
      isDirector: z.string(),
      phoneNumber: z
        .string()
        .min(1, "Please enter the shareholder's phone number"),
      email: z.string().email("Please enter a valid email address"),
      hourlyRate: z.coerce
        .number()
        .min(1, "Please enter an hourly rate greater than 0"),
    }),
  ),
});

export default function Onboarding04() {
  const create = useMutation(api.persons.createMultiple);
  const update = useMutation(api.companies.insertMultipleOfficers);
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get("companyId") as Id<"companies">;

  const amount = parseInt(searchParams.get("amount") || "1", 10);
  const defaultValues = {
    shareholders: Array.from({ length: amount }, () => ({
      firstName: "",
      lastName: "",
      dob: "",
      address: "",
      isDirector: "shareholder",
      phoneNumber: "",
      email: "",
      hourlyRate: 20,
    })),
  };

  const form = useForm({
    resolver: zodResolver(shareholderSchema),
    defaultValues: defaultValues,
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (data: z.infer<typeof shareholderSchema>) => {
    try {
      const { shareholders } = data;
      const persons = shareholders.map(
        ({
          firstName,
          lastName,
          dob,
          address,
          phoneNumber,
          email,
          hourlyRate,
        }) => ({
          firstName,
          lastName,
          dob,
          address,
          phoneNumber,
          email,
          hourlyRate,
        }),
      );

      const ids = (await create({ persons, companyId })) as Id<"persons">[];

      const companyOfficers = ids.map((personId, index) => {
        const shareholderType =
          shareholders[index].isDirector === "Shareholder"
            ? "Shareholder"
            : shareholders[index].isDirector === "Both"
              ? "Both"
              : "Invalid";

        return {
          personId,
          type: shareholderType,
        };
      });

      // Update company with the constructed officers data
      await update({ companyId, persons: companyOfficers });

      toast.success("Shareholder information saved!");
      router.push(`/onboarding-05?companyId=${companyId}`);
    } catch (error) {
      const errorMessage =
        error instanceof ConvexError ? error.message : "An error occurred";
      toast.error(errorMessage);
      console.error(error);
    }
  };
  return (
    <main className="bg-white dark:bg-slate-900">
      <div className="flex justify-center items-center min-h-screen">
        {/* Content */}

        <div className="w-full max-w-[90rem] mx-auto p-4">
          <OnboardingHeader />
          <OnboardingProgress step={4} />

          <h2 className="text-3xl text-slate-800 dark:text-slate-100 font-bold mb-6">
            Shareholder
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            {" "}
            Please fill in the details of the remaining shareholders of the
            company
          </p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {form.watch("shareholders").map((shareholder, index) => (
                  <div key={index} className="border-b pb-4 mb-4 space-y-3 ">
                    <h3 className="text-xl font-semibold mb-4">
                      {shareholder.firstName
                        ? `${shareholder.firstName}`
                        : `Shareholder ${index + 1}`}
                    </h3>

                    <div className="grid grid-cols-2 gap-2 ">
                      <FormField
                        name={`shareholders.${index}.firstName`}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter shareholder's first name"
                                disabled={isLoading}
                              />
                            </FormControl>
                            {fieldState.error && (
                              <FormMessage>
                                {fieldState.error.message}
                              </FormMessage>
                            )}
                          </FormItem>
                        )}
                      />

                      <FormField
                        name={`shareholders.${index}.lastName`}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter shareholder's Last name"
                                disabled={isLoading}
                              />
                            </FormControl>
                            {fieldState.error && (
                              <FormMessage>
                                {fieldState.error.message}
                              </FormMessage>
                            )}
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      name={`shareholders.${index}.dob`}
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="date"
                              disabled={isLoading}
                            />
                          </FormControl>
                          {fieldState.error && (
                            <FormMessage>
                              {fieldState.error.message}
                            </FormMessage>
                          )}
                        </FormItem>
                      )}
                    />

                    <FormField
                      name={`shareholders.${index}.address`}
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Enter address"
                              disabled={isLoading}
                            />
                          </FormControl>
                          {fieldState.error && (
                            <FormMessage>
                              {fieldState.error.message}
                            </FormMessage>
                          )}
                        </FormItem>
                      )}
                    />

                    <FormField
                      name={`shareholders.${index}.phoneNumber`}
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="tel"
                              placeholder="Enter phone number"
                              disabled={isLoading}
                            />
                          </FormControl>
                          {fieldState.error && (
                            <FormMessage>
                              {fieldState.error.message}
                            </FormMessage>
                          )}
                        </FormItem>
                      )}
                    />

                    <FormField
                      name={`shareholders.${index}.email`}
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="Enter email address"
                              disabled={isLoading}
                            />
                          </FormControl>
                          {fieldState.error && (
                            <FormMessage>
                              {fieldState.error.message}
                            </FormMessage>
                          )}
                        </FormItem>
                      )}
                    />
                    <FormField
                      name={`shareholders.${index}.hourlyRate`}
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
                      name={`shareholders.${index}.isDirector`}
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Is this shareholder also a director?
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              {...field}
                              className="flex flex-col gap-2"
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormItem>
                                <FormControl>
                                  <RadioGroupItem value="Both" />
                                </FormControl>
                                <FormLabel> Yes</FormLabel>
                              </FormItem>
                              <FormItem>
                                <FormControl>
                                  <RadioGroupItem value="Shareholder" />
                                </FormControl>
                                <FormLabel> No</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>
              <Button
                disabled={isLoading}
                type="submit"
                className="mt-4 bg-indigo-500 hover:bg-indigo-700 text-white py-2 px-4 rounded"
              >
                Save Shareholders
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </main>
  );
}
