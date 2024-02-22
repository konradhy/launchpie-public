"use client";

import { useQuery, useMutation } from "convex/react";
import { useParams } from "next/navigation";
import { MenuIcon } from "lucide-react";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import { Title } from "./title";
import { Banner } from "./banner";
import { Menu } from "./menu";
import { Publish } from "./publish";

interface NotesNavProps {
  isCollapsed: boolean;
  onResetWidth: () => void;
}

export const NotesNav = ({ isCollapsed, onResetWidth }: NotesNavProps) => {
  const params = useParams();
  const chunkNoteText = useMutation(api.notes.chunkNoteText);

  const note = useQuery(api.notes.getById, {
    noteId: params.noteId as Id<"notes">,
  });

  const onSave = async () => {
    console.log("save");
    await chunkNoteText({
      id: params.noteId as Id<"notes">,
    });
  };

  if (note === undefined) {
    return (
      <nav className="bg-background dark:bg-[#1F1F1F] px-3 py-2 w-full flex items-center justify-between">
        <Title.Skeleton />
        <div className="flex items-center gap-x-2">
          <Menu.Skeleton />
        </div>
      </nav>
    );
  }

  if (note === null) {
    return null;
  }

  return (
    <>
      <nav className="bg-background dark:bg-[#1F1F1F] px-3 py-2 w-full flex items-center gap-x-4">
        {isCollapsed && (
          <MenuIcon
            role="button"
            onClick={onResetWidth}
            className="h-6 w-6 text-muted-foreground"
          />
        )}
        <div className="flex items-center justify-between w-full">
          <Title initialData={note} />
          <div className="flex items-center gap-x-2">
            <button onClick={onSave}>Feed Quity</button>
            <Publish initialData={note} />
            <Menu noteId={note._id} />
          </div>
        </div>
      </nav>
      {note.isArchived && <Banner noteId={note._id} />}
    </>
  );
};
