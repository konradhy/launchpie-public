import Link from "next/link";
import { UploadDropzone, UploadFileResponse } from "@xixixao/uploadstuff/react";
import "@xixixao/uploadstuff/react/styles.css";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useFileUpload } from "@/hooks/use-file-upload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const FileUploadModal = () => {
  const fileUpload = useFileUpload();
  const data = useQuery(api.companies.getByUserId);

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveStorageId = useMutation(api.files.saveStorageIds);

  const saveAfterUpload = async (uploaded: UploadFileResponse[]) => {
    try {
      if (!data?._id) return;

      const isDocx = await saveStorageId({
        companyId: data._id,
        uploaded: uploaded.map((response) => ({
          storageId: (response as any).response.storageId,
          fileName: (response as UploadFileResponse).name,
        })),
      });
      if (isDocx) {
        toast.success("File uploaded successfully");
        fileUpload.onClose();
      }

      toast.warning(
        "File uploaded. However Quity is only able to read docx files! Quity won't be able to read this file.",
      );
      fileUpload.onClose();
    } catch (e) {
      toast.error("Error uploading file");
    }
  };

  return (
    <Dialog open={fileUpload.isOpen} onOpenChange={fileUpload.onClose}>
      <DialogContent>
        <DialogHeader>
          <h2 className="text-xl font-semibold">Upload file</h2>
        </DialogHeader>
        <DialogDescription>
          <p className="text-sm text-gray-600">
            Upload a file to your workspace:
          </p>
        </DialogDescription>
        <UploadDropzone
          uploadUrl={generateUploadUrl}
          fileTypes={{
            "application/pdf": [".pdf"],
            "image/*": [".png", ".gif", ".jpeg", ".jpg"],
            "application/msword": [".doc"],

            "	application/vnd.openxmlformats-officedocument.wordprocessingml.document":
              [".docx"],

            "text/html": [".html", ".htm"],
            "application/vnd.ms-powerpoint": [".ppt"],
            "application/vnd.openxmlformats-officedocument.presentationml.presentation":
              [".pptx"],
            "application/vnd.ms-excel": [".xls"],
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
              [".xlsx"],
            "application/rtf": [".rtf"],
            "text/plain": [".txt"],
            "text/csv": [".csv"],
            "application/vnd.oasis.opendocument.presentation": [".odp"],
            "application/vnd.oasis.opendocument.spreadsheet": [".ods"],
            "application/vnd.oasis.opendocument.text": [".odt"],
          }}
          subtitle="AI will process these files to improve its understanding of your business"
          multiple
          onUploadBegin={(fileName: string) => {}}
          onUploadComplete={saveAfterUpload}
          onUploadError={(error: unknown) => {
            // Do something with the error.
            alert(`ERROR! ${error}`);
          }}
        />

        <div className="text-sm text-gray-600 flex justify-between">
          <span>Supported formats: CSV, DOC, PPT, XLS, PDF</span>
          <span>Maximum size: 25MB</span>
        </div>

        <div className="flex items-center space-x-2">
          <HelpCircleIcon className="w-5 h-5 text-gray-400" />
          <Link className="text-sm underline" href="#">
            Help Center
          </Link>
        </div>
        <div className="flex justify-end space-x-4">
          <Button onClick={fileUpload.onClose} variant="outline">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

function HelpCircleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

