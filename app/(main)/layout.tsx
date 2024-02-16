"use client";
import { Spinner } from "@/components/spinner";
import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";
import React from "react";
import { Navigation } from "./_components/navigation";
import { Mail } from "./_components/navbar";
import { Mail as Mailing } from "lucide-react";
import { SearchCommand } from "@/components/search-command";
import { ModalProvider } from "@/components/providers/modal-provider";

//import { ModalProvider } from "@/components/providers/modal-provider";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return redirect("/");
  }
  return (
    <div className=" flex dark:bg-slate-800  h-screen  bg-slate-200 ">
      <Navigation />
      <SearchCommand />
      <ModalProvider />

      <main className="flex-1 overflow-y-auto bg-slate-100 shadow-inner dark:bg-slate-600 ">
        {/* <ModalProvider /> */}

        {children}
      </main>
    </div>
  );
};

export default MainLayout;
