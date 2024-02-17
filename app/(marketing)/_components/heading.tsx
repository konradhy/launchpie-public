"use client";
import { Button } from "@/components/ui/button";
import { ArrowRightCircle } from "lucide-react";
import { appName } from "@/lib/utils";
import { useConvexAuth } from "convex/react";
import { Spinner } from "@/components/spinner";
import Link from "next/link";
import { SignInButton } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export const Heading = () => {
  const initAssociatedUser = useMutation(api.users.initializeAssociatedUser); // deserves it's own page, that you go to when users join existing companiesx
  const { isAuthenticated, isLoading } = useConvexAuth();
  return (
    <div className="max-w-3xl space-y-4 dark:text-amber-50">
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold">
        {appName}: Equity{" "}
        <span className="italic text-blue-500">Reimagined</span> for Startups
      </h1>
      <h2 className="text-base sm:text-xl md:text-2xl font-medium dark:text-amber-50">
        Automate Fair Share Distribution to Fuel Startup Success and Harmony
      </h2>
      {isLoading && (
        <div className="w-full flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      )}

      {isAuthenticated && !isLoading && (
        <div className="flex gap-4 items-center justify-center">
          <Button asChild>
            <Link href="/dashboard">
              Enter {`${appName}`}
              <ArrowRightCircle className="h-4 w-4 ml-2" />
            </Link>
          </Button>

          <Link href={`/onboarding-01`}>
            <span className="hover:text-secondary">Create New {appName} </span>
          </Link>
        </div>
      )}

      {!isAuthenticated && !isLoading && (
        <SignInButton mode="modal">
          <Button>
            Get {appName} Free
            <ArrowRightCircle className="h-4 w-4 ml-2" />
          </Button>
        </SignInButton>
      )}
    </div>
  );
};
