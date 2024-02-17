"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";

import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

import { ConvexError } from "convex/values";

import OnboardingHeader from "../onboarding-header";
import OnboardingImage from "../onboarding-image";
import OnboardingProgress from "../onboarding-progress";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
import useStoreUserEffect from "@/hooks/use-store-user";

const formSchema = z.object({
  companyName: z
    .string()
    .min(2, { message: "Company name is too short" })
    .max(100, { message: "Company name is too long" }),
  email: z.string().email({ message: "Invalid email address" }),
  address: z
    .string()
    .min(3, { message: "Address is too short" })
    .max(300, { message: "Address is too long" }),
  phoneNumber: z
    .string()
    .min(3, { message: "Phone number is too short" })
    .max(20, { message: "Phone number is too long" }),
  industry: z
    .string()
    .min(2, { message: "Industry is too short" })
    .max(100, { message: "Industry is too long" }),
  companyActivities: z
    .string()
    .min(3, { message: "Must describe company activities" })
    .max(300, { message: "Company activities is too long" }),
});

export default function Onboarding01() {
  useStoreUserEffect();
  const router = useRouter();
  const create = useMutation(api.companies.create);
  //const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      email: "",
      address: "",
      phoneNumber: "",
      industry: "",
      companyActivities: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      console.log("Form data", data);
      const companyId = await create(data);
      toast.success(`${data.companyName} created!`, {
        description: "Your company has been created successfully",
      });

      router.push(`/onboarding-02?companyId=${companyId}`);
    } catch (error) {
      const errorMessage =
        error instanceof ConvexError ? error.message : "An error occurred";
      toast.error(errorMessage);
    }
  };

  const fieldPlaceholders = {
    companyName: "Convex Systems Inc",
    email: "support@convex.dev",
    address: "000 Market St, PMB 70005 San Francisco, CA 94110, USA",
    phoneNumber: "+1 415-123-4567",
    industry: "Data Processing, Hosting, and Related Services",
    companyActivities:
      "We aim to empower web developers to build fast, reliable, and dynamic apps without complex backend engineering or database administration",
  };

  return (
    <main className="bg-white dark:bg-slate-900">
      <div className="relative flex">
        <div className="w-full md:w-1/2">
          <div className="min-h-[100vh] h-full flex flex-col after:flex-1">
            <div className="flex-1">
              <OnboardingHeader />
              <OnboardingProgress step={1} />
            </div>

            <div className="px-4 py-8">
              <div className="max-w-md mx-auto">
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold">Company Information</h2>
                    <p className="text-gray-500 dark:text-gray-400">
                      Please fill out the form below with your company&apos;s
                      information.
                    </p>
                  </div>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                      <div className="space-y-4">
                        {/* Dynamically generated form fields */}
                        {Object.keys(formSchema.shape).map((fieldName) => (
                          <FormField
                            key={fieldName}
                            name={fieldName as keyof typeof formSchema.shape}
                            control={form.control}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  {fieldName.charAt(0).toUpperCase() +
                                    fieldName
                                      .slice(1)
                                      .replace(/([A-Z])/g, " $1")
                                      .trim()}
                                </FormLabel>
                                <FormControl>
                                  {fieldName === "companyActivities" ||
                                  fieldName === "address" ? (
                                    <Textarea
                                      {...field}
                                      disabled={isLoading}
                                      placeholder={
                                        fieldPlaceholders[
                                          fieldName as keyof typeof fieldPlaceholders
                                        ]
                                      }
                                    />
                                  ) : (
                                    <Input
                                      {...field}
                                      disabled={isLoading}
                                      type={
                                        fieldName === "email"
                                          ? "email"
                                          : fieldName === "phoneNumber"
                                            ? "tel"
                                            : "text"
                                      }
                                      placeholder={
                                        fieldPlaceholders[
                                          fieldName as keyof typeof fieldPlaceholders
                                        ]
                                      }
                                    />
                                  )}
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ))}
                        <div className="flex justify-end">
                          <Button className="bg-indigo-500 hover:bg-indigo-700 text-white  py-2 px-4 rounded">
                            Next
                          </Button>
                        </div>
                      </div>
                    </form>
                  </Form>
                </div>
              </div>
            </div>
          </div>
        </div>

        <OnboardingImage />
      </div>
    </main>
  );
}
