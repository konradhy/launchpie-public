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

export const Navbar = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const scrolled = useScrollTop();
  return (
    <div
      className={cn(
        "z-50 bg-background dark:bg-customBackgroundDark fixed top-0 flex items-center w-full p-6",
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
            <SignInButton mode="modal">
              <Button size="sm">Get {appName} Free</Button>
            </SignInButton>
          </>
        )}
        {isAuthenticated && (
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">Enter {`${appName}`}</Link>
            </Button>
            <UserButton afterSignOutUrl="/" />
          </>
        )}

        <ThemeToggle />
      </div>
    </div>
  );
};
