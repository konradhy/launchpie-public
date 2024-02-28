"use client";

import { ResponsiveLine } from "@nivo/line";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Spinner } from "@/components/spinner";
import { Doc } from "@/convex/_generated/dataModel";

export const EquityBarchart = () => {
  const lineData = useQuery(api.dashboard.equityPie.equityBarchart);

  if (!lineData) {
    return <Spinner />;
  }

  //this seems really important to get right
  //@ts-ignore
  const assigneeLines = transformDataForAssigneeEquity(lineData);

  return (
    <div className=" p-4 rounded-lg shadow-inner ">
      <h1 className="font-semibold text-2xl">Equity Growth</h1>
      <p className=" text-gray-500 text-sm">
        A monthly view of cumulative equity value and individual shareholder
        efforts
      </p>
      <div className="h-[120px] md:h-[345px]">
        <ResponsiveLine
          data={assigneeLines}
          margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
          xScale={{ type: "point" }}
          yScale={{
            type: "linear",
            min: "auto",
            max: "auto",
            stacked: true,
            reverse: false,
          }}
          yFormat=" >-.2f"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Month",
            legendOffset: 36,
            legendPosition: "middle",
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "value",
            legendOffset: -40,
            legendPosition: "middle",
          }}
          pointSize={10}
          pointColor={{ theme: "background" }}
          pointBorderWidth={2}
          pointBorderColor={{ from: "serieColor" }}
          pointLabelYOffset={-12}
          useMesh={true}
          legends={[
            {
              anchor: "bottom-right",
              direction: "column",
              justify: false,
              translateX: 100,
              translateY: 0,
              itemsSpacing: 0,
              itemDirection: "left-to-right",
              itemWidth: 80,
              itemHeight: 20,
              itemOpacity: 0.75,
              symbolSize: 12,
              symbolShape: "circle",
              symbolBorderColor: "rgba(0, 0, 0, .5)",
              effects: [
                {
                  on: "hover",
                  style: {
                    itemBackground: "rgba(0, 0, 0, .03)",
                    itemOpacity: 1,
                  },
                },
              ],
            },
          ]}
        />
      </div>
    </div>
  );
};

type GroupedTasks = {
  [key: string]: {
    tasks: Array<{
      title?: string;
      description: string;
      assignees: string[]; // Assuming this is an array of personIds
      dueDate: string;
      estimatedTime: number;
      actualTime?: number;
      taskState: "notStarted" | "inProgress" | "completed";
      reviewStatus: "notFlagged" | "flagged" | "approved";
      meetingAgendaFlag: boolean;
      equityValue: number | 0;
      notes?: string;
      userId: string;
      companyId: string; // Assuming this requires a string or specific ID format
      createdAt: string;
      updatedAt: string;
      updatedBy: string;
      category: string;
      priority: "low" | "medium" | "high";
      isArchived: boolean;
    }>;
  };
};

export const transformDataForAssigneeEquity = (
  groupedTasks: GroupedTasks,
): Array<{
  id: string;
  data: Array<{ x: string; y: number }>;
}> => {
  const assigneeLines: {
    [assigneeId: string]: { id: string; data: Array<{ x: string; y: number }> };
  } = {};

  // Create a sorted list of all months from the keys in groupedTasks
  const allMonths: string[] = Object.keys(groupedTasks).sort();

  // Initialize assignee lines with zero values for all months
  Object.keys(groupedTasks).forEach((monthYear) => {
    groupedTasks[monthYear].tasks.forEach((task) => {
      task.assignees.forEach((assigneeId) => {
        if (!assigneeLines[assigneeId]) {
          assigneeLines[assigneeId] = {
            id: assigneeId,
            data: allMonths.map((month) => ({ x: month, y: 0 })),
          };
        }
        const dataIndex = assigneeLines[assigneeId].data.findIndex(
          (dataPoint) => dataPoint.x === monthYear,
        );
        if (dataIndex !== -1) {
          assigneeLines[assigneeId].data[dataIndex].y += task.equityValue;
        }
      });
    });
  });

  // Round the y values for all assignees and all months
  Object.values(assigneeLines).forEach((assigneeLine) => {
    assigneeLine.data.forEach((dataPoint) => {
      dataPoint.y = Math.round(dataPoint.y * 100) / 100; // Rounds to two decimal places
    });
  });

  return Object.values(assigneeLines);
};
