import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import EquityCard from "./equity-card";

const equityData = [
  {
    shareholderName: "John D.",
    totalEquity: "$45,231.89",
    lastContributionDate: "2023-09-15",
    tasks: [
      {
        name: "Design System Update",
        detail: "Finalizing the new color palette",
      },
      {
        name: "Design System Update",
        detail: "Finalizing the new color palette",
      },
      {
        name: "Design System Update",
        detail: "Finalizing the new color palette",
      },
    ],
  },
  {
    shareholderName: "John D.",
    totalEquity: "$45,231.89",
    lastContributionDate: "2023-09-15",
    tasks: [
      {
        name: "Design System Update",
        detail: "Finalizing the new color palette",
      },
      {
        name: "Design System Update",
        detail: "Finalizing the new color palette",
      },
      {
        name: "Design System Update",
        detail: "Finalizing the new color palette",
      },
    ],
  },
  {
    shareholderName: "John D.",
    totalEquity: "$45,231.89",
    lastContributionDate: "2023-09-15",
    tasks: [
      {
        name: "Design System Update",
        detail: "Finalizing the new color palette",
      },
      {
        name: "Design System Update",
        detail: "Finalizing the new color palette",
      },
      {
        name: "Design System Update",
        detail: "Finalizing the new color palette",
      },
    ],
  },
  {
    shareholderName: "John D.",
    totalEquity: "$45,231.89",
    lastContributionDate: "2023-09-15",
    tasks: [
      {
        name: "Design System Update",
        detail: "Finalizing the new color palette",
      },
      {
        name: "Design System Update",
        detail: "Finalizing the new color palette",
      },
      {
        name: "Design System Update",
        detail: "Finalizing the new color palette",
      },
    ],
  },
];
const EquityCardArea = () => {
  return (
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
  );
};

export default EquityCardArea;
