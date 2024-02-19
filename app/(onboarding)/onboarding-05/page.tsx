"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import OnboardingHeader from "../onboarding-header";
import OnboardingImage from "../onboarding-image";
import OnboardingProgress from "../onboarding-progress";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import { Button } from "@/components/ui/button";

export default function Onboarding04() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get("companyId") as Id<"companies">;
  const company = useQuery(api.companies.getById, { id: companyId });

  return (
    <main className="bg-white dark:bg-slate-900">
      <div className="relative flex">
        {/* Content */}
        <div className="w-full md:w-1/2">
          <div className="min-h-[100dvh] h-full flex flex-col after:flex-1">
            <div className="flex-1">
              <OnboardingHeader />
              <OnboardingProgress step={5} />
            </div>

            <div className="px-4 py-8">
              <div className="max-w-md mx-auto">
                <div className="text-center">
                  <svg
                    className="inline-flex w-16 h-16 fill-current mb-6"
                    viewBox="0 0 64 64"
                  >
                    <circle
                      className="text-emerald-100 dark:text-emerald-400/30"
                      cx="32"
                      cy="32"
                      r="32"
                    />
                    <path
                      className="text-emerald-500 dark:text-emerald-400"
                      d="m28.5 41-8-8 3-3 5 5 12-12 3 3z"
                    />
                  </svg>
                  <h1 className="text-3xl text-slate-800 dark:text-slate-100 font-bold mb-8">
                    Welcome! It&apos;s time to grow {`${company?.companyName}`}.
                    🙌
                  </h1>
                  <Button
                    className="bg-indigo-500 hover:bg-indigo-700 text-white py-2 px-4 rounded"
                    onClick={() => router.push("/dashboard")}
                  >
                    Go To Dashboard -&gt;
                  </Button>
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
