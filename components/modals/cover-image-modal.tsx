"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useParams } from "next/navigation";

import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useCoverImage } from "@/hooks/use-cover-image";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { UploadDropzone, UploadFileResponse } from "@xixixao/uploadstuff/react";
import { toast } from "sonner";

export const CoverImageModal = () => {
  const params = useParams();
  const update = useMutation(api.notes.update);
  const coverImage = useCoverImage();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveStorageId = useMutation(api.notes.saveCoverImageStorageIds);




  const saveAfterUpload = async (uploaded: UploadFileResponse[]) => {
    try {



      await saveStorageId({
        noteId: params.noteId as Id<"notes">,
        storageId: (uploaded[0].response as any).storageId 

      
        });



      toast.success("File uploaded successfully");
      coverImage.onClose();
    } catch (e) {
      toast.error("Error uploading file");
    }
  };



  return (
    <Dialog open={coverImage.isOpen} onOpenChange={coverImage.onClose}>
      <DialogContent>
        <DialogHeader>
          <h2 className="text-center text-lg font-semibold">Cover Image</h2>
        </DialogHeader>
         <UploadDropzone
      uploadUrl={generateUploadUrl}
      fileTypes={{
        "application/pdf": [".pdf"],
        "image/*": [".png", ".gif", ".jpeg", ".jpg"],
      }}
      onUploadComplete={saveAfterUpload}
      onUploadError={(error: unknown) => {
 
        alert(`ERROR! ${error}`);
      }}
    />

   

      </DialogContent>
    </Dialog>
  );
};
