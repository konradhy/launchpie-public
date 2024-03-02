"use client";

import Image from "next/image";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

import { ConvexError } from "convex/values";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const Error = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  const initAssociatedUser = useMutation(api.users.initializeAssociatedUser);
  const router = useRouter();
  const handleJoinCompany = async () => {
    try {
      await initAssociatedUser({});
      toast.success("You've successfully joined the company");
      router.refresh();
    } catch (error) {
      toast.error(
        "Error joining company. Please ensure that your project manager signed you up with the email you're using now",
      );
      console.log(error);
    }
  };
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  const errorMessage =
    error instanceof ConvexError
      ? (error.data as { message: string }).message
      : "Unexpected error occurred";

  return (
    <div className="h-screen flex flex-col items-center justify-center p-4">
      <Image src="/error.svg" height="300" width="300" alt="Error" />

      <h2 className="text-xl font-medium mt-6 mb-3">
        Something went wrong: {errorMessage}
      </h2>

      <div className="flex gap-4 mb-6">
        <Button
          onClick={() => reset()}
          className="bg-primary text-white hover:bg-primary-dark"
        >
          Try again
        </Button>
        <Button className="bg-transparent hover:bg-gray-100">
          <Link href="/">
            <span className="text-primary hover:underline">Go Home</span>
          </Link>
        </Button>
      </div>

      <div className="text-sm text-center p-4 rounded-lg shadow">
        <Button
          onClick={handleJoinCompany}
          className="bg-secondary text-white hover:bg-secondary-dark"
        >
          Click here if you were invited to a company
        </Button>
        <p className="mt-2 font-light">
          (make sure you are using the email set by your project manager!)
        </p>
      </div>
    </div>
  );
};

export default Error;
