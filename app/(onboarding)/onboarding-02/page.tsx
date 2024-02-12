"use client";

import OnboardingHeader from "../onboarding-header";
import OnboardingImage from "../onboarding-image";
import OnboardingProgress from "../onboarding-progress";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function Onboarding02() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [companyType, setCompanyType] = useState("individual");

  const handleOptionChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: string,
  ) => {
    setCompanyType(type);
  };

  const handleSubmit = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.preventDefault();
    const companyId = searchParams.get("companyId");
    router.push(`/onboarding-03?companyId=${companyId}&type=${companyType}`);
  };
  return (
    <main className="bg-white dark:bg-slate-900">
      <div className="relative flex">
        {/* Content */}
        <div className="w-full md:w-1/2">
          <div className="min-h-[100dvh] h-full flex flex-col after:flex-1">
            <div className="flex-1">
              <OnboardingHeader />
              <OnboardingProgress step={2} />
            </div>

            <div className="px-4 py-8">
              <div className="max-w-md mx-auto">
                <h1 className="text-3xl text-slate-800 dark:text-slate-100 font-bold mb-6">
                  Tell us about your company ✨
                </h1>
                {/* Form */}
                <form>
                  <div className="sm:flex space-y-3 sm:space-y-0 sm:space-x-4 mb-8">
                    <label className="flex-1 relative block cursor-pointer">
                      <input
                        type="radio"
                        name="radio-buttons"
                        className="peer sr-only"
                        checked={companyType === "individual"}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleOptionChange(e, "individual")
                        }
                      />
                      <div className="h-full text-center bg-white dark:bg-slate-800 px-4 py-6 rounded border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm duration-150 ease-in-out">
                        <svg
                          className="inline-flex w-10 h-10 shrink-0 fill-current mb-2"
                          viewBox="0 0 40 40"
                        >
                          <circle
                            className="text-indigo-100"
                            cx="20"
                            cy="20"
                            r="20"
                          />
                          <path
                            className="text-indigo-500"
                            d="m26.371 23.749-3.742-1.5a1 1 0 0 1-.629-.926v-.878A3.982 3.982 0 0 0 24 17v-1.828A4.087 4.087 0 0 0 20 11a4.087 4.087 0 0 0-4 4.172V17a3.982 3.982 0 0 0 2 3.445v.878a1 1 0 0 1-.629.928l-3.742 1.5a1 1 0 0 0-.629.926V27a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.323a1 1 0 0 0-.629-.928Z"
                          />
                        </svg>
                        <div className="font-medium text-slate-800 dark:text-slate-100 mb-1">
                          Individual
                        </div>
                        <div className="text-sm">
                          I am the only shareholder / director{" "}
                        </div>
                      </div>
                      <div
                        className="absolute inset-0 border-2 border-transparent peer-checked:border-indigo-400 dark:peer-checked:border-indigo-500 rounded pointer-events-none"
                        aria-hidden="true"
                      ></div>
                    </label>
                    <label className="flex-1 relative block cursor-pointer">
                      <input
                        type="radio"
                        name="radio-buttons"
                        className="peer sr-only"
                        checked={companyType === "organization"}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleOptionChange(e, "organization")
                        }
                      />
                      <div className="h-full text-center bg-white dark:bg-slate-800 px-4 py-6 rounded border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm duration-150 ease-in-out">
                        <svg
                          className="inline-flex w-10 h-10 shrink-0 fill-current mb-2"
                          viewBox="0 0 40 40"
                        >
                          <circle
                            className="text-indigo-100"
                            cx="20"
                            cy="20"
                            r="20"
                          />
                          <path
                            className="text-indigo-500"
                            d="m26.371 23.749-3.742-1.5a1 1 0 0 1-.629-.926v-.878A3.982 3.982 0 0 0 24 17v-1.828A4.087 4.087 0 0 0 20 11a4.087 4.087 0 0 0-4 4.172V17a3.982 3.982 0 0 0 2 3.445v.878a1 1 0 0 1-.629.928l-3.742 1.5a1 1 0 0 0-.629.926V27a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.323a1 1 0 0 0-.629-.928Z"
                          />
                          <circle
                            className="text-indigo-100"
                            cx="20"
                            cy="20"
                            r="20"
                          />
                          <path
                            className="text-indigo-300"
                            d="m30.377 22.749-3.709-1.5a1 1 0 0 1-.623-.926v-.878A3.989 3.989 0 0 0 28.027 16v-1.828c.047-2.257-1.728-4.124-3.964-4.172-2.236.048-4.011 1.915-3.964 4.172V16a3.989 3.989 0 0 0 1.982 3.445v.878a1 1 0 0 1-.623.928c-.906.266-1.626.557-2.159.872-.533.315-1.3 1.272-2.299 2.872 1.131.453 6.075-.546 6.072.682V28a2.99 2.99 0 0 1-.182 1h7.119A.996.996 0 0 0 31 28v-4.323a1 1 0 0 0-.623-.928Z"
                          />
                          <path
                            className="text-indigo-500"
                            d="m22.371 24.749-3.742-1.5a1 1 0 0 1-.629-.926v-.878A3.982 3.982 0 0 0 20 18v-1.828A4.087 4.087 0 0 0 16 12a4.087 4.087 0 0 0-4 4.172V18a3.982 3.982 0 0 0 2 3.445v.878a1 1 0 0 1-.629.928l-3.742 1.5a1 1 0 0 0-.629.926V28a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.323a1 1 0 0 0-.629-.928Z"
                          />
                        </svg>
                        <div className="font-medium text-slate-800 dark:text-slate-100 mb-1">
                          Organization
                        </div>
                        <div className="text-sm">
                          There are multiple shareholders and directors
                        </div>
                      </div>
                      <div
                        className="absolute inset-0 border-2 border-transparent peer-checked:border-indigo-400 dark:peer-checked:border-indigo-500 rounded pointer-events-none"
                        aria-hidden="true"
                      ></div>
                    </label>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSubmit}
                      className="bg-indigo-500 hover:bg-indigo-700 text-white  py-2 px-4 rounded"
                    >
                      Next
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <OnboardingImage />
      </div>
    </main>
  );
}
