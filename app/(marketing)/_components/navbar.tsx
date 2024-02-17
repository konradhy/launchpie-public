"use client";
import { useConvexAuth } from "convex/react";

import { useScrollTop } from "@/hooks/use-scroll-top";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

import { SignInButton, UserButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/spinner";
import Link from "next/link";
import { appName } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const Navbar = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const scrolled = useScrollTop();
  const initAssociatedUser = useMutation(api.users.initializeAssociatedUser);
  const router = useRouter();

  const handleJoinCompany = async () => {
    try {
      await initAssociatedUser({});
      toast.success("You've successfully joined the company");
      router.push("/dashboard");
    } catch (error) {
      toast.error(
        "Error joining company. Please ensure that your project manager signed you up with the email you're using now",
      );
      console.log(error);
    }
  };
  return (
    <div
      className={cn(
        "z-50 bg-background dark:bg-[#1F1F1F] fixed top-0 flex items-center w-full p-6",
        scrolled && "border-b shadow-sm",
      )}
    >
      <Logo />
      <div className=" md:ml-auto md:justify-end justify-between w-full flex items-center gap-x-2">
        {isLoading && <Spinner />}

        {!isAuthenticated && !isLoading && (
          <>
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </SignInButton>
          </>
        )}
        {isAuthenticated && (
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">Enter {`${appName}`}</Link>
            </Button>
            <Link href={`/onboarding-01`}>
              <Button size="sm">Create New {appName} </Button>
            </Link>

            <Button
              onClick={handleJoinCompany}
              className="bg-secondary text-white"
              size="sm"
            >
              Join existing company
            </Button>
            <UserButton afterSignOutUrl="/" />
          </>
        )}

        <ThemeToggle />
      </div>
    </div>
  );
};
