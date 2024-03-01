"use client";

import { ResponsiveLine } from "@nivo/line";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Spinner } from "@/components/spinner";

export const EquityBarchart = () => {
  const lineData = useQuery(api.dashboard.equityPie.equityBarchart);

  if (!lineData) {
    return <Spinner />;
  }
  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD", // Change to your preferred currency
    minimumFractionDigits: 0, // Optional: Adjust according to your needs
  });

  return (
    <div className=" p-4 rounded-lg shadow-inner ">
      <h1 className="font-semibold text-2xl">Equity Growth</h1>
      <p className=" text-gray-500 text-sm">
        A monthly view of equity value and individual shareholder efforts
      </p>
      <div className="h-[120px] md:h-[345px]">
        <ResponsiveLine
          data={lineData}
          curve="monotoneX"
          margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
          xScale={{ type: "point" }}
          yScale={{
            type: "linear",
            min: "auto",
            max: "auto",
            stacked: false,
            reverse: false,
          }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 20,

            legendPosition: "middle",
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            format: (value) => currencyFormatter.format(value),
            legendOffset: -10,
            legendPosition: "middle",
          }}
          lineWidth={4}
          pointSize={8}
          pointColor={{ theme: "background" }}
          pointBorderWidth={2}
          pointBorderColor={{ from: "serieColor" }}
          pointLabelYOffset={-12}
          useMesh={true}
          theme={{
            axis: {
              ticks: {
                text: {
                  fill: "#c39e90",
                },
              },
            },
            grid: {
              line: {
                stroke: "#555555",
              },
            },
            legends: {
              text: {
                fill: "#d66b6b", // Light text for legends
              },
            },
            tooltip: {
              container: {
                background: "#333333",
                color: "#ffffff",
              },
            },
          }}
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
