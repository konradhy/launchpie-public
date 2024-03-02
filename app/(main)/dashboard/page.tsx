
import { Metadata } from "next";


import RecentStakes from "./_components/recent-stakes";
import { Search } from "./_components/search";

import { appName } from "@/lib/utils";

import CompanyDetailsCard from "./_components/_company-details/company-details";

import EquityPie from "./_components/equity-pie";
import { EquityBarchart } from "./_components/equity-barchart";
import EquityCardArea from "./_components/equity-card-area";
import { NewStake } from "./_components/new-stake";

export const metadata: Metadata = {
  title: `${appName} | Dashboard`,
  description: `${appName} brings a fresh approach to fair equity distribution and management.`,
};

export default function DashboardPage() {
  return (
    <>
      <div className=" flex-col md:flex   ">
        <div className="flex-1 space-y-4 p-8 pt-6 ">
          <div className="flex items-center justify-between space-y-2 ">
            <h2 className="text-3xl font-bold tracking-tight ">Dashboard</h2>

            <div className="flex items-center space-x-2">
              <div className="ml-auto flex items-center space-x-4">
                <Search />
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
