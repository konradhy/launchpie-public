"use client";

import Image from "next/image";
import Link from "next/link";

import { ConvexError } from "convex/values";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const Error = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  const errorMessage =
    error instanceof ConvexError
      ? (error.data as { message: string }).message
      : "Unexpected error occurred";
  return (
    <div className="h-screen flex flex-col items-center justify-center space-y-4">
      <Image
        src="/error.svg"
        height="300"
        width="300"
        alt="Error"
        className="dark:hidden"
      />
      <Image
        src="/error.svg"
        height="300"
        width="300"
        alt="Error"
        className="hidden dark:block"
      />
      <h2 className="text-xl font-medium">
        Something went wrong: {errorMessage}
      </h2>
      <div className="flex gap-2">
        <Button onClick={() => reset()}>Try again</Button>
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default Error;
