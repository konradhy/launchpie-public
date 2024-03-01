/*
To do
1. Add a bar chart and a pie chart. The bar chart will go where the compani details is now and will show monthly
 contributions. The pie chart will go to the bottom left or right with the company detials beside it will show the equity

 2. Grab the last 5 tasks by userId for each user and display it in the equty card. This Can be one call where we just grab the last 100 company tasks and filter it. Think through the process
 3. Load current stakes with the logged in users current tasks
 4. Set the min height and width of the imports so that they allign both vertically and horizontally during responsibe viewing
 5. Set up the search bar to open a new module that searches for anything in the database
 6. Wire up the newstake button. It should be it's own component that i just import


*/
// "use client";

import { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import RecentStakes from "./_components/recent-stakes";
import { Search } from "./_components/search";
import EquityCard from "./_components/equity-card";
import { appName } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import CompanyDetailsCard from "./_components/_company-details/company-details";
import { ConvexAiChat } from "@/app/aiChat";
import EquityPie from "./_components/equity-pie";
import { EquityBarchart } from "./_components/equity-barchart";
import EquityCardArea from "./_components/equity-card-area";
import { NewStake } from "./_components/new-stake";

export const metadata: Metadata = {
  title: `${appName} | Dashboard`,
  description: `${appName} brings a fresh approach to fair equity distribution and management.`,
};

export default function DashboardPage() {
  //i think i just pass the shareholderid here. Then i do everything else in the equity card
  //create a new component called equity card holder. This will be a use client that holds the equity card map

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
              <NewStake />
            </div>
          </div>

          <div className="space-y-4">
            <EquityCardArea />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <div className="col-span-4">
                <RecentStakes />
              </div>

              <div className="col-span-3 bg-primary/5 dark:bg-slate-800 overflow-y-auto  rounded-lg shadow-inner dark:bg-background">
                <div className="flex flex-col items-center justify-center pt-4 pb-2 h-[25rem]">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                    Launch Pie
                  </h2>
                  <EquityPie />
                </div>
              </div>
              <div className="col-span-4 dark:bg-slate-800 overflow-y-auto bg-primary/5 rounded-lg shadow-inner dark:bg-background">
                <EquityBarchart />
              </div>
              <div className="col-span-3">
                <CompanyDetailsCard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
