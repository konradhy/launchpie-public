/*
To do
1. Add a bar chart and a pie chart. The bar chart will go where the compani details is now and will show monthly
 contributions. The pie chart will go to the bottom left or right with the company detials beside it will show the equity

 2. Grab the last 5 tasks by userId for each user and display it in the equty card. This Can be one call where we just grab the last 100 company tasks and filter it. Think through the process
 3. Load current stakes with the logged in users current tasks


*/
// "use client";

import { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import RecentSales from "./_components/recent-stakes";
import { Search } from "./_components/search";
import EquityCard from "./_components/equity-card";
import { appName } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import CompanyDetailsCard from "./_components/_company-details/company-details";
import { ConvexAiChat } from "@/components/aiChat";

export const metadata: Metadata = {
  title: `${appName} | Dashboard`,
  description: `${appName} brings a fresh approach to fair equity distribution and management.`,
};

export default function DashboardPage() {
  const equityData = [
    {
      shareholderName: "Alice Smith",
      totalEquity: "$5,400",
      lastContributionDate: "2023-09-12",
      tasks: ["Design", "Development"],
    },
    {
      shareholderName: "Bob Johnson",
      totalEquity: "$3,200",
      lastContributionDate: "2023-09-10",
      tasks: ["Marketing", "Sales"],
    },
    {
      shareholderName: "Alice Smith",
      totalEquity: "$5,400",
      lastContributionDate: "2023-09-12",
      tasks: ["Design", "Development"],
    },
    {
      shareholderName: "Bob Johnson",
      totalEquity: "$3,200",
      lastContributionDate: "2023-09-10",
      tasks: ["Marketing", "Sales"],
    },
    {
      shareholderName: "Alice Smith",
      totalEquity: "$5,400",
      lastContributionDate: "2023-09-12",
      tasks: ["Design", "Development"],
    },
    {
      shareholderName: "Bob Johnson",
      totalEquity: "$3,200",
      lastContributionDate: "2023-09-10",
      tasks: ["Marketing", "Sales"],
    },
    {
      shareholderName: "Bob Johnson",
      totalEquity: "$3,200",
      lastContributionDate: "2023-09-10",
      tasks: ["Marketing", "Sales"],
    },
    {
      shareholderName: "Bob Johnson",
      totalEquity: "$3,200",
      lastContributionDate: "2023-09-10",
      tasks: ["Marketing", "Sales"],
    },
    {
      shareholderName: "Bob Johnson",
      totalEquity: "$3,200",
      lastContributionDate: "2023-09-10",
      tasks: ["Marketing", "Sales"],
    },
  ];

  return (
    <>
      <div className=" flex-col md:flex   ">
        <div className="flex-1 space-y-4 p-8 pt-6 ">
          <div className="flex items-center justify-between space-y-2 ">
            <h2 className="text-3xl font-bold tracking-tight ">Dashboard</h2>

            <div className="flex items-center space-x-2">
              <div className="ml-auto flex items-center space-x-4">
                <Search />
                {/*add search command. For everything, files, notes and task.
                A click triggers the modal. With the first input being in the search bar
                 */}
              </div>

              <Button>New Stake</Button>
            </div>
          </div>

          <div className="space-y-4">
            <ScrollArea className="overflow-x-auto">
              <div className="flex gap-8">
                {equityData.map((data, index) => (
                  <div key={index} className="">
                    <EquityCard key={index} />
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <div className="col-span-4">
                <CompanyDetailsCard />
              </div>

              <RecentSales />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
