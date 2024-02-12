"use client"
import { Spinner } from "@/components/spinner";
import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";
import React from "react";
import { Navigation } from "./_components/navigation";
import { Mail } from "./_components/navbar";
import { Mail as Mailing } from "lucide-react";

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
    <div className=" flex dark:bg-[#1F1F1F]  h-screen  ">
      <Navigation />
      <Mail 
        accounts={[
          {
            label: "Personal",
            email: "bob@gmail.com",
            icon: <Mailing />,
          },]}
        defaultLayout={[265, 440, 655]}
        defaultCollapsed={false}
        navCollapsedSize={5}
     
      
      />
      <main className="flex-1 overflow-y-auto">
 

        {/* <ModalProvider /> */}

        {children}
 
      </main>
    </div>
  );
};

export default MainLayout;
