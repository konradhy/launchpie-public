import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogFooter,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Profile } from "./profile";

export const PersonDetail = ({ detail, index }) => {
  // Logic to handle the person detail, like extracting the equity or position
  // You can adapt this part based on the specific needs of shareholders and directors

  return (
    <div className="flex items-center justify-between">
      <Dialog>
        <DialogTrigger asChild>
          <span className="flex-grow mr-4 text-indigo-600 hover:text-indigo-800 cursor-pointer">
            {detail?.firstName}
          </span>
        </DialogTrigger>
        <DialogContent>
          {" "}
          <DialogHeader>
            <DialogTitle className="mb-2">
              Edit {detail?.firstName}&apos;s info{" "}
            </DialogTitle>

            <DialogDescription>
              Adjust the details for {detail?.firstName}. Equity is displayed
              for reference.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-gray-500 mt-2">
            Current equity: {detail.equity}%
          </p>
          <Separator />
          {detail && (
            <Profile
              initialData={{
                firstName: detail?.firstName,
                lastName: detail?.lastName,
                address: detail?.address,
                phoneNumber: detail?.phoneNumber,
                email: detail?.email,
                Id: detail?._id,
              }}
              index={index}
            />
          )}
        </DialogContent>
      </Dialog>
      <span className="whitespace-nowrap text-sm text-gray-500">
        {/* Display equity or position */}
      </span>
    </div>
  );
};
