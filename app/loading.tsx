import { Skeleton } from "@/components/ui/skeleton";

function Loading() {
  return (
    <div className="flex">
      <div className="w-60 space-y-2">
        <Skeleton className="h-12" /> {/* Top item */}
        <Skeleton className="h-8" /> {/* Subsequent items */}
        {/* Repeat for each sidebar item */}
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 space-y-4 p-4">
        {/* Header Skeleton */}
        <div className="flex justify-between">
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-10 w-1/4" />
        </div>

        {/* Tasks and Pie Chart Skeleton */}
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="col-span-2 h-56" /> {/* Tasks list */}
          <Skeleton className="h-56" /> {/* Pie chart */}
        </div>

        {/* Equity Growth Skeleton */}
        <Skeleton className="h-32" />

        {/* Company Detail Skeleton */}
        <div className="flex justify-between">
          <Skeleton className="h-20 w-1/2" />
          <Skeleton className="h-20 w-1/2" />
        </div>
      </div>
    </div>
  );
}

export default Loading;
