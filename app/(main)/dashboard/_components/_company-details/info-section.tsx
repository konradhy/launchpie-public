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
import { Doc } from "@/convex/_generated/dataModel";
import { Spinner } from "@/components/spinner";

interface InfoSectionProps {
  title: string;
  description: string;
  details: Doc<"persons">[] | null;
}

export const InfoSection = ({
  title,
  description,
  details,
}: InfoSectionProps) => {
  if (!details) {
    return <Spinner />;
  }
  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="mb-4 cursor-pointer">
          <p className="text-sm text-gray-500 dark:text-slate-200">
            {title} <span className="text-indigo-400">(view)</span>
          </p>
          <p className="font-medium text-gray-700 dark:text-slate-400">
            {details.length}
          </p>
        </div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            {description}
            <p className="text-xs text-primary">click name to edit</p>
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 p-6 ">
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
