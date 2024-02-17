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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
            <p className="text-primary dark:text-blue-400">
              click name to edit
            </p>
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 p-6 ">
          <TooltipProvider>
            {details.map((detail, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
              >
                <PersonDetail detail={detail} index={index} />

                {/* Conditional rendering based on linkedUserId and email */}
                {detail?.linkedUserId ? (
                  // Render a red "Unlink Users" for light mode and a lighter red for dark mode
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="cursor-pointer text-red-500 dark:text-red-400">
                        Linked User
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div>
                        This account is already bound to a user. If this was a
                        mistake please contact support.
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ) : detail?.email ? (
                  // Render an orange "Pending" for light mode and a lighter orange for dark mode
                  <Tooltip>
                    <TooltipTrigger>
                      <div className=" text-orange-500 dark:text-orange-400">
                        Pending
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div>
                        Invited users must log-in with the email attached to the
                        account.
                        <br />
                        To change the email, click the username and select
                        &#39;Edit Email&#39;.
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ) : null}
              </div>
            ))}
          </TooltipProvider>
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
