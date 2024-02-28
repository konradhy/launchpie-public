"use client";

import { use, useEffect, useState } from "react";
import { File } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/clerk-react";
import { Trash } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSearch } from "@/hooks/use-search";
import { api } from "@/convex/_generated/api";
import { on } from "events";
import { Id } from "@/convex/_generated/dataModel";

export const SearchCommand = () => {
  const { user } = useUser();
  const router = useRouter();
  //const documents = useQuery(api.documents.getSearch);
  const files = useQuery(api.files.getSearch);
  const archiveFile = useMutation(api.files.archive);
  const [isFileId, setIsFileId] = useState<Id<"files">>();

  const serveFile = useQuery(
    api.files.serveFile,
    isFileId !== undefined ? { id: isFileId } : "skip",
  );
  const [isMounted, setIsMounted] = useState(false);

  const toggle = useSearch((store) => store.toggle);
  const isOpen = useSearch((store) => store.isOpen);
  const onClose = useSearch((store) => store.onClose);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "d" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggle]);

  const onSelect = (id: string) => {
    router.push(`/documents/${id}`);
    onClose();
  };

  const onDelete = (id: Id<"files">) => {
    archiveFile({ id });
  };

  const onSelectFile = (id: Id<"files">) => {
    setIsFileId(id);
  };

  useEffect(() => {
    if (isFileId !== "" && serveFile !== undefined && serveFile !== null) {
      window.open(serveFile, "_blank");
      onClose();
    }
  }, [isFileId, serveFile, router, onClose]);

  if (!isMounted) {
    return null;
  }

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <CommandInput placeholder={`Search ${user?.fullName}'s workspace...`} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Uploaded Files">
          <TooltipProvider>
            <Tooltip>
              {files?.map((file, index) => (
                <CommandItem
                  key={file._id}
                  value={`${file._id}-${file.fileName}`}
                  title={file.fileName}
                  className="flex justify-between"
                >
                  <span
                    onClick={() => onSelectFile(file._id)}
                    className="truncate"
                  >
                    <TooltipTrigger id={file.fileName + index}>
                      {file.fileName}
                    </TooltipTrigger>
                  </span>
                  <div>
                    <Trash
                      onClick={() => onDelete(file._id)}
                      className=" h-2 w-2 hover:text-red-500"
                    />
                  </div>
                  <TooltipContent className="max-w-md break-words whitespace-normal">
                    {file.summary}
                  </TooltipContent>
                </CommandItem>
              ))}
            </Tooltip>
          </TooltipProvider>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
