"use client";
//further divide by category. to get a truly polished look
//might be easier to have an outer pie chart just divided by
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Spinner } from "@/components/spinner";
import { ResponsivePieCanvas } from "@nivo/pie";

type EquityDetails = {
  [key: string]: {
    totalEquityValue: number;
    firstName: string;
    lastName: string;
  };
};

function transformEquityDetails(equityDetails: EquityDetails | undefined) {
  if (!equityDetails) return [];

  return Object.values(equityDetails).map((detail) => ({
    id: `${detail.firstName} ${detail.lastName.charAt(0)}.`, // Generates a random ID.
    label: detail.firstName,
    value: detail.totalEquityValue,
    color: `hsl(${Math.random() * 360}, 70%, 50%)`,
  }));
}

const EquityPie = () => {
  const equityDetails = useQuery(api.dashboard.equityCard.equityDetails);

  if (!equityDetails) {
    return <Spinner />;
  }

  const simplifiedEquityDetails = Object.entries(equityDetails).reduce(
    (acc, [key, { firstName, lastName, totalEquityValue }]) => {
      acc[key] = { firstName, lastName, totalEquityValue };
      return acc;
    },
    {} as {
      [key: string]: {
        firstName: string;
        lastName: string;
        totalEquityValue: number;
      };
    },
  );

  const transformedData = transformEquityDetails(simplifiedEquityDetails);


  return (
    <ResponsivePieCanvas
      valueFormat={(value) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value)
      }
      data={transformedData}
      margin={{ top: 10, right: 120, bottom: 50, left: 120 }}
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      colors={{ scheme: "paired" }}
      borderColor={{
        from: "color",
        modifiers: [["darker", 0.6]],
      }}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor={{ from: "color" }}
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: "color" }}
      arcLabelsSkipAngle={10}
      arcLabelsTextColor="#333333"
      theme={{
        tooltip: {
          container: {
            background: "#333333",
            color: "#ffffff",
          },
        },
      }}
      legends={[
        {
          anchor: "bottom",
          direction: "row",
          justify: false,

          translateY: 47,
          itemsSpacing: 15,
          itemWidth: 60,
          itemHeight: 14,
          itemTextColor: "#999",
          itemDirection: "left-to-right",
          itemOpacity: 1,
          symbolSize: 14,
          symbolShape: "circle",
        },
      ]}
    />
  );
};
export default EquityPie;
