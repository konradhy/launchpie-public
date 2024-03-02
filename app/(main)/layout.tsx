"use client";
import { Spinner } from "@/components/spinner";
import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";
import React from "react";
import { Navigation } from "./_components/navigation";

import { SearchCommand } from "@/components/search-command";
import { ModalProvider } from "@/components/providers/modal-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { EquityCardSkeleton } from "./dashboard/_components/equity-card-area";

//import { ModalProvider } from "@/components/providers/modal-provider";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-100 dark:bg-slate-800">
        {/* Side Navbar */}
        <div className="w-64 px-8 py-4 bg-white dark:bg-slate-600">
          <Skeleton className="h-12 mb-6" />
          <Skeleton className="h-8 mb-4" />
          <Skeleton className="h-8 mb-4" />
          <Skeleton className="h-8 mb-4" />
          <Skeleton className="h-8 mb-4" />
          <Skeleton className="h-8 mb-4" />
          <Skeleton className="h-8 mb-4" />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Top Navbar */}
          <div className="px-8 py-4 border-b">
            <Skeleton className="h-8 mb-4" />
            <Skeleton className="h-8 w-1/4" />
          </div>

          {/* Dashboard Content */}
          <div className="p-8">
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>

            {/* Tasks and Chart */}
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              <div className="flex-1">
                <Skeleton className="h-12 mb-4" />
                <Skeleton className="h-64" />
              </div>
              <div className="flex-1">
                <Skeleton className="h-12 mb-4" />
                <Skeleton className="h-64" />
              </div>
            </div>

            {/* Bottom Section */}
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <Skeleton className="h-12 mb-4" />
                <Skeleton className="h-48" />
              </div>
              <div className="flex-1">
                <Skeleton className="h-12 mb-4" />
                <Skeleton className="h-48" />
              </div>
            </div>
          </div>
        </div>
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
