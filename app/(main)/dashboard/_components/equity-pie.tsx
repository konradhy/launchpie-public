"use client";
//further divide by category. to get a truly polished look
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Spinner } from "@/components/spinner";
import { ResponsivePieCanvas } from "@nivo/pie";

export const transformEquityPieData = (equityPie: any) => {
  if (!equityPie) return [];

  return equityPie.map((shareholder: any, index: number) => {
    const hue = (index * 360) / equityPie.length;
    return {
      id:
        `  ${shareholder?.name} - ${Math.round(shareholder?.equityPercentage)}% ` ||
        `unknown-${index}`,
      label: shareholder?.name || `Unknown`,
      value: Math.round(shareholder?.personalEquityValue) || 0,

      color: `hsl(${hue}, 70%, 50%)`,
    };
  });
};

const EquityPie = () => {
  const equityPie = useQuery(api.equityPie.equityPie);
  if (!equityPie) {
    return <Spinner />;
  }

  const transformedData = transformEquityPieData(equityPie);

  return (
    <ResponsivePieCanvas
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
      // @ts-expect-error
      defs={[
        {
          id: "dots",
          type: "patternDots",
          background: "inherit",
          color: "rgba(255, 255, 255, 0.3)",
          size: 4,
          padding: 1,
          stagger: true,
        },
        {
          id: "lines",
          type: "patternLines",
          background: "inherit",
          color: "rgba(255, 255, 255, 0.3)",
          rotation: -45,
          lineWidth: 6,
          spacing: 10,
        },
      ]}
      fill={[
        {
          match: {
            id: "ruby",
          },
          id: "dots",
        },
        {
          match: {
            id: "c",
          },
          id: "dots",
        },
        {
          match: {
            id: "go",
          },
          id: "dots",
        },
        {
          match: {
            id: "python",
          },
          id: "dots",
        },
        {
          match: {
            id: "scala",
          },
          id: "lines",
        },
        {
          match: {
            id: "lisp",
          },
          id: "lines",
        },
        {
          match: {
            id: "elixir",
          },
          id: "lines",
        },
        {
          match: {
            id: "javascript",
          },
          id: "lines",
        },
      ]}
      legends={[
        {
          anchor: "bottom",
          direction: "row",
          justify: false,
          translateX: 0,
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
