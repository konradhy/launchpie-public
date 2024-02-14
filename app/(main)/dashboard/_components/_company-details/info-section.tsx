import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PersonDetail } from "./person-detail";

export const InfoSection = ({ title, description, details }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="mb-4 cursor-pointer">
          <p className="text-sm text-gray-500">
            {title} <span className="text-indigo-400">(view)</span>
          </p>
          <p className="font-medium text-gray-700">{details.length}</p>
        </div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 p-6">
          {details.map((detail, index) => (
            <PersonDetail key={detail?._id} detail={detail} index={index} />
          ))}
          <Separator />
          <SheetFooter className="flex justify-end mt-4">
            <SheetClose asChild>
              <Button>Close</Button>
            </SheetClose>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
};
