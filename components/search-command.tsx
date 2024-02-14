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
  const [isDocumentId, setIsDocumentId] = useState<Id<"documents">>();

  const serveFile = useQuery(
    api.files.serveFile,
    isDocumentId !== undefined ? { id: isDocumentId } : "skip",
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

  const onDelete = (id: Id<"documents">) => {
    archiveFile({ id });
  };

  const onSelectFile = (id: Id<"documents">) => {
    setIsDocumentId(id);
  };

  useEffect(() => {
    if (isDocumentId !== "" && serveFile !== undefined && serveFile !== null) {
      window.open(serveFile, "_blank");
      onClose();
    }
  }, [isDocumentId, serveFile, router, onClose]);

  if (!isMounted) {
    return null;
  }

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <CommandInput placeholder={`Search ${user?.fullName}'s workspace...`} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {/* <CommandGroup heading="Notes">
          {documents?.map((document) => (
            <CommandItem
              key={document._id}
              value={`${document._id}-${document.title}`}
              title={document.title}
              onSelect={() => onSelect(document._id)}
            >
              {document.icon ? (
                <p className="mr-2 text-[18px]">{document.icon}</p>
              ) : (
                <File className="mr-2 h-4 w-4" />
              )}
              <span>{document.title}</span>
            </CommandItem>
          ))}
        </CommandGroup> */}

        <CommandGroup heading="Uploaded Files">
          {files?.map((document) => (
            <CommandItem
              key={document._id}
              value={`${document._id}-${document.fileName}`}
              title={document.fileName}
              className="flex justify-between"
            >
              <span
                onClick={() => onSelectFile(document._id)}
                className="truncate"
              >
                {document.fileName}
              </span>
              <div>
                <Trash
                  onClick={() => onDelete(document._id)}
                  className=" h-2 w-2 hover:text-red-500"
                />
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
